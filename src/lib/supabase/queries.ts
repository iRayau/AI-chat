import { createServerClient, isSupabaseConfigured } from "./client";
import type { Chat, Message, Json } from "./types";

// ============ CHAT OPERATIONS ============

export async function createChat(
  userId: string,
  title: string
): Promise<Chat | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping createChat");
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user_id: userId,
      title: title,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }

  return data;
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping getUserChats");
    return [];
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return data || [];
}

export async function getChatById(
  chatId: string,
  userId: string
): Promise<Chat | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping getChatById");
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching chat:", error);
    return null;
  }

  return data;
}

export async function updateChatTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping updateChatTitle");
    return false;
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("chats")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", chatId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating chat title:", error);
    return false;
  }

  return true;
}

export async function deleteChat(
  chatId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping deleteChat");
    return false;
  }

  const supabase = createServerClient();

  // First delete all messages in the chat
  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", userId);

  if (messagesError) {
    console.error("Error deleting messages:", messagesError);
    return false;
  }

  // Then delete the chat
  const { error: chatError } = await supabase
    .from("chats")
    .delete()
    .eq("id", chatId)
    .eq("user_id", userId);

  if (chatError) {
    console.error("Error deleting chat:", chatError);
    return false;
  }

  return true;
}

// ============ MESSAGE OPERATIONS ============

interface AddMessageParams {
  chat_id: string;
  user_id: string;
  role: string;
  content: string;
  search_results?: Json | null;
  search_images?: Json | null;
}

export async function addMessage(
  message: AddMessageParams
): Promise<Message | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping addMessage");
    return null;
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: message.chat_id,
      user_id: message.user_id,
      role: message.role,
      content: message.content,
      search_results: message.search_results || null,
      search_images: message.search_images || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding message:", error);
    return null;
  }

  // Update the chat's updated_at timestamp
  await supabase
    .from("chats")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", message.chat_id);

  return data;
}

export async function getChatMessages(
  chatId: string,
  userId: string
): Promise<Message[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping getChatMessages");
    return [];
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export async function updateMessage(
  messageId: string,
  userId: string,
  updates: {
    content?: string;
    search_results?: Json | null;
    search_images?: Json | null;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured, skipping updateMessage");
    return false;
  }

  const supabase = createServerClient();

  const { error } = await supabase
    .from("messages")
    .update(updates)
    .eq("id", messageId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating message:", error);
    return false;
  }

  return true;
}

// ============ UTILITY FUNCTIONS ============

export function generateChatTitle(firstMessage: string): string {
  const maxLength = 50;
  const cleaned = firstMessage.trim().replace(/\n/g, " ");

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return cleaned.substring(0, maxLength).trim() + "...";
}
