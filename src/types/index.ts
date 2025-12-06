export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  accountBalance: number;
  investmentBalance: number;
  status: 'active' | 'suspended' | 'banned';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
  type: 'trading' | 'support' | 'dm';
  userName: string;
  senderEmail?: string;
  isRead?: boolean;
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}