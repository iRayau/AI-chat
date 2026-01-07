import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChatById, updateChatTitle, deleteChat } from "@/lib/supabase/queries";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

// GET /api/chats/[chatId] - Get a specific chat
export async function GET(req: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const session = await auth();
    const { chatId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chat = await getChatById(chatId, session.user.id);
    
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// PATCH /api/chats/[chatId] - Update a chat
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const session = await auth();
    const { chatId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    const success = await updateChatTitle(chatId, session.user.id, title);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[chatId] - Delete a chat
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const session = await auth();
    const { chatId } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const success = await deleteChat(chatId, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete chat" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
