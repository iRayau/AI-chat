export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  searchResults?: SearchResult[];
  searchImages?: SearchImage[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  thumbnail?: string;
}

export interface SearchImage {
  url: string;
  title: string;
  source: string;
  thumbnail?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isSearchMode: boolean;
}

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isSearchMode: boolean;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface ChatResponse {
  message: string;
  searchResults?: SearchResult[];
}

export interface StreamingState {
  isStreaming: boolean;
  currentMessageId: string | null;
}
