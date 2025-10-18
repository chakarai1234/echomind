import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Use OpenAI Whisper for transcription
    // For ElevenLabs, you would use their API instead
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    // Analyze emotion from transcription
    const emotionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an emotion detection AI. Analyze the text and respond with ONE word only from: happy, excited, neutral, sad, grateful, energetic, peaceful, inspired",
        },
        {
          role: "user",
          content: transcription.text,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const emotion = emotionResponse.choices[0].message.content?.trim().toLowerCase() || "neutral";

    return NextResponse.json({
      transcript: transcription.text,
      emotion: emotion,
    });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
