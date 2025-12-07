 
import { supabase } from './auth';

 
// Fetch support messages for current user (excluding their own messages if admin)
export const fetchSupportMessages = async () => {
  try {
    const { data, error } = await supabase
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
      .eq('message_type', 'support')
      .order('created_at', { ascending: true });

    if (error) throw error;

    console.log('Fetched support messages:', data);

      return data?.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
        isRead: !!msg.is_read,
      type: 'support' as const,
      userName: '',
      senderEmail: '',
      attachments: (msg.file_attachments || []).map((att: any) => ({
        id: att.id,
        messageId: att.message_id,
        fileName: att.file_name,
        fileType: att.file_type,
        fileSize: att.file_size,
        fileUrl: att.file_url,
        createdAt: new Date(att.created_at)
      }))
    })) || [];
  } catch (err) {
    console.error('Error fetching support messages:', err);
    throw err;
  }
};

// Mark messages as read where sender = userId and receiver = adminId
export const markMessagesRead = async (userId: string, adminId: string) => {
  try {
    console.log(`Marking messages read: userId=${userId}, adminId=${adminId}`);
    
    // Mark messages sent by the user to the admin as read.
    // Some support messages may have `receiver_id` = null (meaning sent to admin),
    // so update rows where receiver_id = adminId OR receiver_id IS NULL.
    const { error, data } = await supabase
      .from('messages')
      .update({ is_read: true })
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${adminId}),and(sender_id.eq.${userId},receiver_id.is.null)`
      )
      .eq('message_type', 'support')
      .select();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    
    console.log(`✓ Marked ${data?.length || 0} messages as read`);
    return true;
  } catch (err) {
    console.error('Error marking messages read:', err);
    return false;
  }
};

// Fetch direct messages between two users
export const fetchDirectMessages = async (userId: string, otherUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        receiver_id,
        content,
        message_type,
        created_at,
        file_attachments (*)
      `)
      .eq('message_type', 'dm')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data?.map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      type: 'dm' as const,
      userName: '', // Will be filled by component
      attachments: msg.file_attachments || []
    })) || [];
  } catch (err) {
    console.error('Error fetching direct messages:', err);
    throw err;
  }
};

// Send message
export const sendMessage = async (
  senderId: string,
  content: string,
  messageType: 'support' | 'trading' | 'dm',
  receiverId?: string
) => {
  try {
    console.log('📤 Sending message:', { senderId, receiverId, messageType, hasReceiverParam: !!receiverId });
    
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId || null,
          content,
          message_type: messageType
        }
      ])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Message sent:', { id: data.id, sender_id: data.sender_id, receiver_id: data.receiver_id });
    return data;
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
};

// Upload file to storage
export const uploadFile = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileUrl: publicUrl.publicUrl
    };
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
};

// Create file attachment
// Create file attachment
export const createFileAttachment = async (
  messageId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  fileUrl: string
) => {
  try {
    const { data, error } = await supabase
      .from('file_attachments')
      .insert([
        {
          message_id: messageId,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          file_url: fileUrl
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating file attachment:', err);
    throw err;
  }
};

// Subscribe to new messages in real-time
export const subscribeToMessages = (
  messageType: string,
  handlers: { onInsert?: (message: any) => void; onUpdate?: (message: any) => void; } 
) => {
  const channel = supabase.channel(`messages:${messageType}`);

  if (handlers.onInsert) {
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `message_type=eq.${messageType}`
      },
      (payload) => {
        handlers.onInsert && handlers.onInsert(payload.new);
      }
    );
  }

  if (handlers.onUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `message_type=eq.${messageType}`
      },
      (payload) => {
        handlers.onUpdate && handlers.onUpdate(payload.new);
      }
    );
  }

  const subscription = channel.subscribe();
  return subscription;
};

// Delete a single message and its attachments
export const deleteMessage = async (messageId: string) => {
  try {
    // Delete associated file attachments first
    const { data: attachments } = await supabase
      .from('file_attachments')
      .select('file_url')
      .eq('message_id', messageId);

    // Delete files from storage
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.file_url) {
          const fileName = attachment.file_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('chat-files')
              .remove([fileName]);
          }
        }
      }
    }

    // Delete file attachments from database
    await supabase
      .from('file_attachments')
      .delete()
      .eq('message_id', messageId);

    // Delete the message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting message:', err);
    throw err;
  }
};

// Delete all messages and files from a specific user
export const deleteUserHistory = async (userId: string) => {
  try {
    // Fetch all support messages from this user
    const { data: messages } = await supabase
      .from('messages')
      .select('id, file_attachments(file_url)')
      .eq('sender_id', userId)
      .eq('message_type', 'support');

    if (messages && messages.length > 0) {
      // Delete files from storage
      for (const message of messages) {
        const attachments = message.file_attachments as any[];
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            if (attachment.file_url) {
              const fileName = attachment.file_url.split('/').pop();
              if (fileName) {
                await supabase.storage
                  .from('chat-files')
                  .remove([fileName]);
              }
            }
          }
        }
      }

      // Delete all file attachments from this user's messages
      const messageIds = messages.map(m => m.id);
      await supabase
        .from('file_attachments')
        .delete()
        .in('message_id', messageIds);

      // Delete all messages from this user
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', userId)
        .eq('message_type', 'support');

      if (error) throw error;
    }

    return true;
  } catch (err) {
    console.error('Error deleting user history:', err);
    throw err;
  }
};
