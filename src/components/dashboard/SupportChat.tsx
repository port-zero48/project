import { useState, useEffect, useRef } from 'react';
import { Send, HelpCircle, Paperclip, X, Loader, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Message, FileAttachment } from '../../types';
import { fetchSupportMessages, sendMessage, uploadFile, createFileAttachment, subscribeToMessages, deleteMessage, markMessagesRead } from '../../services/chat';
import { supabase } from '../../services/auth';

export default function SupportChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to real-time INSERT and UPDATE events so ticks update live
    const subscription = subscribeToMessages('support', {
      onInsert: (newMsg) => {
        console.log('📨 New message received:', { id: newMsg.id, senderId: newMsg.sender_id, receiverId: newMsg.receiver_id, isRead: newMsg.is_read });
        
        // Add the message to local state
        setMessages(prev => [...prev, {
          id: newMsg.id,
          senderId: newMsg.sender_id,
          receiverId: newMsg.receiver_id,
          content: newMsg.content,
          timestamp: new Date(newMsg.created_at),
          type: 'support' as const,
          userName: '',
          isRead: !!newMsg.is_read,
          attachments: (newMsg.file_attachments || []).map((att: any) => ({
            id: att.id,
            messageId: att.message_id,
            fileName: att.file_name,
            fileType: att.file_type,
            fileSize: att.file_size,
            fileUrl: att.file_url,
            createdAt: new Date(att.created_at)
          }))
        }]);
        
        // Auto-mark incoming admin messages as read so checkmarks turn blue on both sides
        if (user && newMsg.sender_id !== user.id && newMsg.is_read === false) {
          console.log('⏳ Marking received admin message as read:', newMsg.id);
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMsg.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error marking message as read:', error);
              } else {
                console.log('✅ Message marked as read - onUpdate will fire on both sides');
              }
            });
        }
      },
      onUpdate: (updated) => {
        console.log('🔵 Message updated:', { id: updated.id, isRead: updated.is_read });
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, isRead: !!updated.is_read } : m));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Subscribe to file attachment changes for real-time file uploads
  useEffect(() => {
    const fileChannel = supabase.channel('file_attachments_user');
    
    fileChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'file_attachments'
      },
      async (payload: any) => {
        // Fetch the message with the new attachment
        const { data: message } = await supabase
          .from('messages')
          .select(`
            id,
            sender_id,
            receiver_id,
            content,
            message_type,
            created_at,
            is_read,
            file_attachments (
              id,
              message_id,
              file_name,
              file_type,
              file_size,
              file_url,
              created_at
            )
          `)
          .eq('id', payload.new.message_id)
          .eq('message_type', 'support')
          .single();

        if (message && user) {
          // Update the message with attachments
          setMessages(prev => {
            return prev.map(m => {
              if (m.id === message.id) {
                return {
                  ...m,
                  attachments: (message.file_attachments || []).map((att: any) => ({
                    id: att.id,
                    messageId: att.message_id,
                    fileName: att.file_name,
                    fileType: att.file_type,
                    fileSize: att.file_size,
                    fileUrl: att.file_url,
                    createdAt: new Date(att.created_at)
                  }))
                };
              }
              return m;
            });
          });
        }
      }
    );

    fileChannel.subscribe();

    return () => {
      fileChannel.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Loading support messages...');
      const data = await fetchSupportMessages();
      console.log('Messages loaded:', data);
      
      if (user) {
        // For regular users: show only messages they're involved in
        // For admins: don't show their own messages in the user chat
        const filteredMessages = data.filter(msg => {
          // Include messages where user is sender or receiver
          const isInvolved = msg.senderId === user.id || msg.receiverId === user.id;
          // Exclude messages where both sender and receiver are the same (admin to self)
          const notSelfMessage = msg.senderId !== msg.receiverId;
          return isInvolved && notSelfMessage;
        });

        // Enrich with sender label and isRead
        const enrichedMessages = filteredMessages.map((msg) => ({
          ...msg,
          senderEmail: msg.senderId === user.id ? user.email : 'Support',
          isRead: !!msg.isRead
        }));
        
        console.log('Enriched messages:', enrichedMessages);
        setMessages(enrichedMessages);

        // Mark messages FROM admin TO user as read
        // Admin sends messages with sender_id=admin, receiver_id=user
        // But we also get messages where user sent to admin with sender_id=user, receiver_id=null or admin
        // We need to mark ONLY messages from admin (where sender_id != user_id AND receiver_id = user_id OR receiver_id = null)
        try {
          console.log(`Looking for unread messages FROM admin TO user (${user.id})`);
          
          // First, let's check ALL messages for this user to see the structure
          const { data: allMsgs } = await supabase
            .from('messages')
            .select('id, sender_id, receiver_id, is_read, content')
            .eq('message_type', 'support')
            .limit(10);
          
          console.log('Sample messages in DB:', allMsgs);
          
          // Now fetch unread messages - try multiple queries to find them
          // Query 1: Messages where receiver_id = user.id (direct messages to user)
          const { data: directMessages, error: error1 } = await supabase
            .from('messages')
            .select('id, sender_id, receiver_id, is_read')
            .eq('message_type', 'support')
            .eq('receiver_id', user.id)
            .eq('is_read', false);

          console.log('Direct messages (receiver_id = user):', { count: directMessages?.length || 0, messages: directMessages });

          // Query 2: Messages where sender_id != user.id (from other people)
          const { data: fromOthers, error: error2 } = await supabase
            .from('messages')
            .select('id, sender_id, receiver_id, is_read')
            .eq('message_type', 'support')
            .neq('sender_id', user.id)
            .eq('is_read', false);

          console.log('Messages from others:', { count: fromOthers?.length || 0, messages: fromOthers });

          // Combine: messages FROM others TO this user that are unread
          let adminMessages = directMessages?.filter(m => m.sender_id !== user.id) || [];
          
          console.log('Final admin messages to mark:', { count: adminMessages.length, messages: adminMessages });

          if (adminMessages && adminMessages.length > 0) {
            const messageIds = adminMessages.map(m => m.id);
            console.log('Updating messages to read:', messageIds);
            
            const { error: updateError, data: updateData } = await supabase
              .from('messages')
              .update({ is_read: true })
              .in('id', messageIds)
              .select();

            if (updateError) {
              console.error('❌ Error updating messages:', updateError);
            } else {
              console.log('✅ Marked messages as read:', { count: updateData?.length, ids: messageIds });
              
              // Update local state to show the messages are now read
              setMessages(prev => prev.map(msg => {
                if (msg.senderId !== user.id && !msg.isRead && messageIds.includes(msg.id)) {
                  console.log('✓ Updating message state:', msg.id);
                  return { ...msg, isRead: true };
                }
                return msg;
              }));
            }
          } else {
            console.log('No unread admin messages to mark');
          }
        } catch (err) {
          console.error('Error marking messages as read:', err);
        }
      }
      setError(null);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || !user) return;

    try {
      // Send text message (or placeholder if only file)
      const messageContent = message.trim() || (selectedFile ? '[File attached]' : '');
      const sentMsg = await sendMessage(user.id, messageContent, 'support');
      
      // If there's a file, upload it
      if (selectedFile) {
        setUploading(true);
        const fileData = await uploadFile(selectedFile, user.id);
        await createFileAttachment(
          sentMsg.id,
          fileData.fileName,
          fileData.fileType,
          fileData.fileSize,
          fileData.fileUrl
        );
        setSelectedFile(null);
      }

      setMessage('');
      await loadMessages();
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } catch (err) {
        console.error('Error deleting message:', err);
        alert('Failed to delete message');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading && <div className="text-center py-4"><Loader /></div>}
        
        {!loading && messages.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No messages yet. Ask us anything!
          </div>
        )}
        
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-lg p-3 ${msg.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                {msg.content && <div className="text-sm">{msg.content}</div>}
                
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2">
                    {msg.attachments.map(att => (
                      <div key={att.id} className="flex items-center">
                        <Paperclip className="w-4 h-4 mr-2" />
                        <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          {att.fileName}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                  <span>{msg.senderId === user?.id ? 'You' : 'Support'}</span>
                  <span>{msg.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-white p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex">
          <input 
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <Paperclip className="w-4 h-4 text-gray-500" />
          </button>
          
          <button 
            type="submit"
            disabled={uploading}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
          >
            {uploading ? <Loader className="w-4 h-4 animate-spin" /> : 'Send'}
          </button>
        </form>
        
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}