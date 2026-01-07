export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role: string;
          content: string;
          search_results: Json | null;
          search_images: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          role: string;
          content: string;
          search_results?: Json | null;
          search_images?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          role?: string;
          content?: string;
          search_results?: Json | null;
          search_images?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey";
            columns: ["chat_id"];
            referencedRelation: "chats";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

export interface SearchResultJson {
  title: string;
  url: string;
  snippet: string;
  thumbnail?: string;
}

export interface SearchImageJson {
  url: string;
  title: string;
  source: string;
  thumbnail?: string;
}

// Helper types
export type Chat = Database["public"]["Tables"]["chats"]["Row"];
export type ChatInsert = Database["public"]["Tables"]["chats"]["Insert"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
