import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { userMessage, conversationHistory } = await request.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Build conversation context
    const messages: any[] = [
      {
        role: "system",
        content: `You are EchoMind, a thoughtful and empathetic AI companion that helps people reflect on their emotions and experiences.

Your role:
- Listen actively and respond with empathy
- Ask follow-up questions to help users explore their feelings
- Provide gentle insights and perspective
- Keep responses conversational and warm (2-3 sentences)
- Remember the conversation context
- Be supportive without being prescriptive

Respond naturally as if you're having a caring conversation with a friend.`
      }
    ];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: userMessage
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: messages,
      temperature: 0.8,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0].message.content || "I'm here to listen. Please continue.";

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Conversation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}
