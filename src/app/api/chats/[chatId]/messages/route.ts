import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChatMessages, addMessage, getChatById } from "@/lib/supabase/queries";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

// GET /api/chats/[chatId]/messages - Get all messages for a chat
export async function GET(req: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ messages: [], configured: false });
    }

    const session = await auth();
    const { chatId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify chat belongs to user
    const chat = await getChatById(chatId, session.user.id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const messages = await getChatMessages(chatId, session.user.id);
    return NextResponse.json({ messages, configured: true });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/chats/[chatId]/messages - Add a message to a chat
export async function POST(req: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured", configured: false },
        { status: 503 }
      );
    }

    const session = await auth();
    const { chatId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify chat belongs to user
    const chat = await getChatById(chatId, session.user.id);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const { role, content, searchResults, searchImages } = await req.json();

    const message = await addMessage({
      chat_id: chatId,
      user_id: session.user.id,
      role,
      content,
      search_results: searchResults || null,
      search_images: searchImages || null,
    });
    
    if (!message) {
      return NextResponse.json(
        { error: "Failed to add message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
