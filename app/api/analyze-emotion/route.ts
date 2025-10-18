import { NextRequest, NextResponse } from "next/server";
import { analyzeEmotionFromText } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const emotion = await analyzeEmotionFromText(text);

    return NextResponse.json({
      emotion,
    });
  } catch (error: any) {
    console.error("Emotion analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze emotion" },
      { status: 500 }
    );
  }
}
