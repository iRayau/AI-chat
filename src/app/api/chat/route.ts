import { OpenAI } from "openai";
import { NextResponse } from "next/server";

export const runtime = "edge";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const { messages, isSearchMode } = await req.json();

    const openai = getOpenAIClient();

    if (!openai) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    const systemMessage = isSearchMode
      ? {
          role: "system" as const,
          content: `You are a helpful AI assistant with access to search results. When search results are provided, use them to give accurate, up-to-date information. Always cite your sources when using search results. Format your responses clearly with headings and bullet points when appropriate.`,
        }
      : {
          role: "system" as const,
          content: `You are AI Chat, a helpful and knowledgeable AI assistant. You provide clear, accurate, and thoughtful responses. You can help with a wide range of tasks including coding, writing, analysis, math, and general knowledge. Format your responses clearly and use code blocks when appropriate.`,
        };

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [systemMessage, ...messages],
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
