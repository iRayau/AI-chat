import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserChats, createChat, generateChatTitle } from "@/lib/supabase/queries";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// GET /api/chats - Get all chats for the current user
export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ chats: [], configured: false });
    }

    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await getUserChats(session.user.id);
    return NextResponse.json({ chats, configured: true });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured", configured: false },
        { status: 503 }
      );
    }

    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, firstMessage } = await req.json();
    const chatTitle = title || generateChatTitle(firstMessage || "New Chat");

    const chat = await createChat(session.user.id, chatTitle);
    
    if (!chat) {
      return NextResponse.json(
        { error: "Failed to create chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
