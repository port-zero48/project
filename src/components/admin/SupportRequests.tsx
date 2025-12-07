import { useState, useEffect, useRef } from 'react';
import { Message } from '../../types';
import { MessageSquare, Clock, User, Send, CheckCircle, Loader, FileIcon, X, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchSupportMessages, sendMessage, markMessagesRead, subscribeToMessages, uploadFile, createFileAttachment, deleteMessage, deleteUserHistory } from '../../services/chat';
import { supabase } from '../../services/auth';

interface UserWithMessages {
  userId: string;
  email: string;
  messages: Message[];
  unreadCount: number;
}

export default function SupportRequests() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithMessages | null>(null);
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRequests();

    // Subscribe to support message changes for real-time updates
    const subscription = subscribeToMessages('support', {
      onInsert: (newMsg) => {
        console.log('📨 Admin: New message received:', { id: newMsg.id, senderId: newMsg.sender_id, receiverId: newMsg.receiver_id, isRead: newMsg.is_read });
        
        // When a new message arrives, update the selected user's chat if they're the sender
        if (selectedUser) {
          const messageUserId = newMsg.sender_id === currentAdmin?.id ? newMsg.receiver_id : newMsg.sender_id;
          if (messageUserId === selectedUser.userId) {
            // Update selected user with new message
            const enrichedMsg: Message = {
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
            };

            setSelectedUser(prev => {
              if (prev) {
                return {
                  ...prev,
                  messages: [...prev.messages, enrichedMsg]
                };
              }
              return prev;
            });
            autoScrollRef.current = true;
            
            // Auto-mark incoming user messages as read so checkmarks turn blue on both sides
            if (newMsg.sender_id !== currentAdmin?.id && newMsg.is_read === false) {
              console.log('⏳ Marking received user message as read:', newMsg.id);
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
          }
        }

        // Also update users list
        setUsers(prev => {
          const updated = [...prev];
          const messageUserId = newMsg.sender_id === currentAdmin?.id ? newMsg.receiver_id : newMsg.sender_id;
          const userIdx = updated.findIndex(u => u.userId === messageUserId);
          
          if (userIdx >= 0) {
            const movedUser = updated[userIdx];
            movedUser.messages.push({
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
            });
            updated.splice(userIdx, 1); // Remove from current position
            updated.unshift(movedUser); // Add to top
          }
          return updated;
        });
      },
      onUpdate: (updatedMsg) => {
        console.log('🔵 Admin: Message updated:', { id: updatedMsg.id, isRead: updatedMsg.is_read });
        
        // When a message is updated (e.g., marked as read or attachments added), update it
        // Update the users list
        setUsers(prev => {
          return prev.map(u => {
            return {
              ...u,
              messages: u.messages.map(m => {
                if (m.id === updatedMsg.id) {
                  console.log('✓ Updated message in users list:', m.id);
                  return {
                    ...m,
                    isRead: !!updatedMsg.is_read,
                    attachments: (updatedMsg.file_attachments || []).map((att: any) => ({
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
              })
            };
          });
        });
        
        // Also update the selected user if one is open
        if (selectedUser) {
          setSelectedUser(prev => {
            if (prev) {
              return {
                ...prev,
                messages: prev.messages.map(m => {
                  if (m.id === updatedMsg.id) {
                    console.log('✓ Updated message in selected user:', m.id);
                    return {
                      ...m,
                      isRead: !!updatedMsg.is_read,
                      attachments: (updatedMsg.file_attachments || []).map((att: any) => ({
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
                })
              };
            }
            return prev;
          });
          autoScrollRef.current = true;
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [selectedUser?.userId, currentAdmin?.id]);

  // Subscribe to file attachment changes for real-time file uploads
  useEffect(() => {
    const fileChannel = supabase.channel('file_attachments_changes');
    
    fileChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'file_attachments'
      },
      async (payload) => {
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

        if (message && selectedUser) {
          const messageUserId = message.sender_id === currentAdmin?.id ? message.receiver_id : message.sender_id;
          
          if (messageUserId === selectedUser.userId) {
            // Update the message with attachments
            setSelectedUser(prev => {
              if (prev) {
                return {
                  ...prev,
                  messages: prev.messages.map(m => {
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
                  })
                };
              }
              return prev;
            });
            autoScrollRef.current = true;
          }
        }
      }
    );

    fileChannel.subscribe();

    return () => {
      fileChannel.unsubscribe();
    };
  }, [selectedUser?.userId, currentAdmin?.id]);

  useEffect(() => {
    if (autoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      autoScrollRef.current = false;
    }
  }, [selectedUser?.messages]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const allMessages = await fetchSupportMessages();
      
      // Fetch ALL regular users (not admins)
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'user');  // Only fetch regular users, exclude admins

      // Create a map of all users
      const userMap = new Map<string, UserWithMessages>();
      
      // Initialize map with ALL users (empty messages initially)
      for (const user of usersData || []) {
        userMap.set(user.id, {
          userId: user.id,
          email: user.email,
          messages: [],
          unreadCount: 0
        });
      }

      // Now populate messages for users that have any
      for (const msg of allMessages) {
        const senderIsRegularUser = userMap.has(msg.senderId);
        const receiverIsRegularUser = userMap.has(msg.receiverId as string);

        // Pick the user id to group by (either sender or receiver)
        let userId: string | null = null;
        if (senderIsRegularUser) userId = msg.senderId;
        else if (receiverIsRegularUser) userId = msg.receiverId as string;

        // Skip messages that don't involve a regular user
        if (!userId) continue;

        const userData = userMap.get(userId)!;

        // Normalize timestamp to Date
        const normalizedMsg = {
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp as any)
        } as Message;

        userData.messages.push(normalizedMsg);

        // If the message was sent by the user and addressed to the admin (receiver is null or not a regular user), count as unread
        if (senderIsRegularUser && (!msg.receiverId || !userMap.has(msg.receiverId as string))) {
          userData.unreadCount++;
        }
      }

      // Sort users: unread first, then by latest message, then by email
      const usersArray = Array.from(userMap.values()).sort((a, b) => {
        // Unread users first
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        
        // Then by latest message timestamp
        const aLatest = a.messages[a.messages.length - 1]?.timestamp || new Date(0);
        const bLatest = b.messages[b.messages.length - 1]?.timestamp || new Date(0);
        const timeComparison = bLatest.getTime() - aLatest.getTime();
        if (timeComparison !== 0) return timeComparison;
        
        // Finally by email for consistency
        return a.email.localeCompare(b.email);
      });

      setUsers(usersArray);
      // Don't auto-select a user - let admin click first
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (userItem: UserWithMessages) => {
    setSelectedUser(userItem);
    setSelectedFiles([]);
    if (!currentAdmin) return;
    try {
      // Mark messages FROM this user TO admin as read
      console.log('Marking messages as read for user:', userItem.userId);
      const result = await markMessagesRead(userItem.userId, currentAdmin.id);
      console.log('Mark messages result:', result);
      
      // Update local state to mark only user's messages (not admin's) as read
      setUsers(prev => prev.map(u => {
        if (u.userId !== userItem.userId) return u;
        return {
          ...u,
          unreadCount: 0,
          messages: u.messages.map(m => {
            // Only mark as read if it was sent by the user (not by admin)
            if (m.senderId === userItem.userId) {
              return { ...m, isRead: true };
            }
            return m;
          })
        };
      }));
      
      // Also update the selected user state
      setSelectedUser(prev => {
        if (prev) {
          return {
            ...prev,
            messages: prev.messages.map(m => {
              if (m.senderId === userItem.userId) {
                return { ...m, isRead: true };
              }
              return m;
            })
          };
        }
        return prev;
      });
      
      console.log('✓ User messages marked as read');
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendResponse = async () => {
    if ((!response.trim() && selectedFiles.length === 0) || !selectedUser || !currentAdmin) return;
    
    try {
      setSending(true);

      // First, send the text message
      const messageContent = response.trim() || (selectedFiles.length > 0 ? `[${selectedFiles.length} file(s) attached]` : '');
      console.log('Admin sending message:', { to: selectedUser?.userId, from: currentAdmin?.id, content: messageContent });
      
      const sentMsg = await sendMessage(currentAdmin.id, messageContent, 'support', selectedUser.userId);
      
      // Then upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            // Upload file using service layer
            const fileData = await uploadFile(file, currentAdmin.id);
            
            // Create file attachment record using service layer
            await createFileAttachment(
              sentMsg.id,
              fileData.fileName,
              fileData.fileType,
              fileData.fileSize,
              fileData.fileUrl
            );
          } catch (err) {
            console.error('Error uploading file:', err);
            alert(`Failed to upload file: ${(err as any)?.message || 'Unknown error'}`);
          }
        }
      }

      setResponse('');
      setSelectedFiles([]);
      
      // Reload messages
      await fetchRequests();
      autoScrollRef.current = true;
    } catch (err) {
      console.error('Error sending response:', err);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        if (selectedUser) {
          setSelectedUser(prev => {
            if (prev) {
              return {
                ...prev,
                messages: prev.messages.filter(m => m.id !== messageId)
              };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Error deleting message:', err);
        alert('Failed to delete message');
      }
    }
  };

  const handleDeleteUserHistory = async (userId: string, userEmail: string) => {
    if (window.confirm(`Are you sure you want to delete all messages and files from ${userEmail}? This cannot be undone.`)) {
      try {
        await deleteUserHistory(userId);
        setUsers(prev => prev.filter(u => u.userId !== userId));
        setSelectedUser(null);
      } catch (err) {
        console.error('Error deleting user history:', err);
        alert('Failed to delete user history');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'unread') return u.unreadCount > 0;
    return true;
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Support Chat</h2>
          <p className="text-slate-400">View and respond to user support messages</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'resolved')}
            className="bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-slate-400 text-sm">Users</div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold text-yellow-400">{users.reduce((sum, u) => sum + u.messages.length, 0)}</div>
              <div className="text-slate-400 text-sm">Total Messages</div>
            </div>
          </div>
        </div>
        <div className="bg-green-500/10 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-400">{users.reduce((sum, u) => sum + u.unreadCount, 0)}</div>
              <div className="text-slate-400 text-sm">Unread</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
          {loading ? (
            <div className="text-center py-12">
              <Loader className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400">No users to display</div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredUsers.map(userItem => (
                <div
                  key={userItem.userId}
                  className={`bg-slate-700/30 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-all duration-200 border ${
                    selectedUser?.userId === userItem.userId
                      ? 'border-blue-500 bg-slate-700/50'
                      : 'border-slate-600/50'
                  } ${userItem.messages.length === 0 ? 'opacity-60' : ''}`}
                  onClick={() => handleSelectUser(userItem)}
                  title={userItem.messages.length === 0 ? 'No messages yet - click to start a conversation' : ''}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate text-sm">{userItem.email}</p>
                        <p className="text-slate-400 text-xs">
                          {userItem.messages.length === 0 ? (
                            <span className="italic">No messages yet</span>
                          ) : (
                            `${userItem.messages.length} message${userItem.messages.length !== 1 ? 's' : ''}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      {userItem.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {userItem.unreadCount}
                        </span>
                      )}
                      {userItem.messages.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUserHistory(userItem.userId, userItem.email);
                          }}
                          className="text-gray-400 hover:text-red-400 transition-colors p-1"
                          title="Delete all messages from this user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 bg-slate-700/30 rounded-lg p-6 flex flex-col h-[600px]">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedUser.email}</h3>
                    <p className="text-slate-400 text-sm">{selectedUser.messages.length} messages</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6">
                {selectedUser.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                    <MessageSquare className="h-12 w-12 text-slate-500" />
                    <div className="text-center">
                      <p className="font-medium mb-1">No messages yet</p>
                      <p className="text-sm text-slate-500">Start a conversation with {selectedUser.email} by sending a message below</p>
                    </div>
                  </div>
                ) : (
                  selectedUser.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentAdmin?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[70%] ${
                          msg.senderId === currentAdmin?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-600 text-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold opacity-80">
                            {msg.senderId === currentAdmin?.id ? 'Support' : 'User'}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs opacity-75">
                              {msg.timestamp instanceof Date
                                ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(msg.timestamp as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            </span>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{msg.content}</p>
                        
                        {/* File attachments with inline preview for images */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 mt-2 border-t border-opacity-30 border-current pt-2">
                            {msg.attachments.map((file, idx) => {
                              const isImage = file.fileType.startsWith('image/');
                              return (
                                <div key={idx}>
                                  {isImage ? (
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block hover:opacity-80 transition-opacity"
                                    >
                                      <img
                                        src={file.fileUrl}
                                        alt={file.fileName}
                                        className="max-w-[200px] max-h-[200px] rounded-lg cursor-pointer"
                                        title={`${file.fileName} (${(file.fileSize / 1024).toFixed(1)}KB)`}
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      download={file.fileName}
                                      className="flex items-center space-x-2 text-xs hover:underline opacity-90 hover:opacity-100 transition-opacity"
                                      title={`Download ${file.fileName} (${(file.fileSize / 1024).toFixed(1)}KB)`}
                                    >
                                      <FileIcon className="h-3 w-3" />
                                      <span>{file.fileName}</span>
                                      <span className="opacity-75">({(file.fileSize / 1024).toFixed(1)}KB)</span>
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Read status indicator for admin messages */}
                        {msg.senderId === currentAdmin?.id && (
                          <div className="mt-2 text-xs flex items-center justify-end">
                            <span className={`font-bold transition-colors ${msg.isRead ? 'text-blue-300' : 'text-gray-300'}`}>
                              {msg.isRead ? '✓✓' : '✓'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="space-y-3 pt-4 border-t border-slate-600">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response..."
                  rows={3}
                  disabled={sending}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />

                {/* File list */}
                {selectedFiles.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate">{file.name}</span>
                          <span className="text-xs text-slate-500 flex-shrink-0">({(file.size / 1024).toFixed(1)}KB)</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      multiple
                      disabled={sending}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                      title="Add files"
                    >
                      <FileIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      disabled={sending}
                      className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSendResponse}
                      disabled={((!response.trim() && selectedFiles.length === 0) || sending)}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      {sending ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a User</h3>
              <p className="text-slate-400">Choose a user from the list to view and respond to messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}