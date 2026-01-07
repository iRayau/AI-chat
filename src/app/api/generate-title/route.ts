import { NextResponse } from "next/server";
import OpenAI from "openai";

// Create OpenAI client with error handling for missing API key
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();

    if (!openai) {
      // Return a fallback title if OpenAI is not configured
      return NextResponse.json({ title: "New Chat" });
    }

    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a title generator. Generate a very short, concise title (maximum 5 words) for a chat conversation based on the user's first message. 
Rules:
- Maximum 5 words
- No quotes or punctuation at the end
- Be descriptive but brief
- Use title case
- Don't include words like "Help", "Question", "Chat" unless very relevant
- Focus on the main topic or intent

Examples:
- "How do I make pasta?" → "Pasta Recipe Guide"
- "What's the weather like in Paris?" → "Paris Weather"
- "Explain quantum computing to me" → "Quantum Computing Basics"
- "Write a poem about love" → "Love Poem"
- "Debug my JavaScript code" → "JavaScript Debugging"`,
        },
        {
          role: "user",
          content: `Generate a short title for this message: "${message}"`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    const title =
      response.choices[0]?.message?.content?.trim() || "New Chat";

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    // Return a fallback title on error
    return NextResponse.json({ title: "New Chat" });
  }
}

