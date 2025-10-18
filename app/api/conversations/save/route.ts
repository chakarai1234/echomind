import { NextRequest, NextResponse } from "next/server";
import { saveConversation } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId, startedAt, endedAt, messages } = await request.json();

    if (!userId || !startedAt || !messages) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const conversation = await saveConversation({
      user_id: userId,
      started_at: startedAt,
      ended_at: endedAt,
      messages
    });

    return NextResponse.json({
      success: true,
      conversation
    });
  } catch (error: any) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save conversation" },
      { status: 500 }
    );
  }
}
