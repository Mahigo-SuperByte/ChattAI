export interface AIBot {
  id: string;
  name: string;
  model: string;
  color: string;
  provider: string;
  avatarLetter: string;
  roleTitle: string;
  personality: string;
  systemPrompt: string;
  status: 'online' | 'idle' | 'dnd';
  customStatus?: string;
  bio: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // 'user' or bot id
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string; // 'user' or bot id
  senderName: string;
  senderColor?: string;
  isBot: boolean;
  model?: string;
  content: string;
  timestamp: string;
  replyTo?: {
    id: string;
    senderName: string;
    content: string;
  };
  reactions: MessageReaction[];
  isStreaming?: boolean;
}

export interface DiscordChannel {
  id: string;
  name: string;
  topic: string;
  category: string;
  type: 'text' | 'voice';
  unreadCount?: number;
  icon?: string;
}
