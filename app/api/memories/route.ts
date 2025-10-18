import { NextRequest, NextResponse } from "next/server";
import { saveMemory, getMemoriesByDate, supabase } from "@/lib/supabase";
import { generateMemoryEmbedding } from "@/lib/openai";
import { format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, emotion, userId, location, tags } = body;

    if (!transcript || !emotion || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate embedding for semantic search
    const embedding = await generateMemoryEmbedding(transcript);

    // Create summary (first 100 chars or intelligent summary)
    const summary =
      transcript.length > 100
        ? transcript.substring(0, 97) + "..."
        : transcript;

    const memory = await saveMemory({
      user_id: userId,
      timestamp: new Date().toISOString(),
      transcript,
      emotion,
      summary,
      location,
      tags,
      embedding,
    });

    // Invalidate today's daily summary to trigger regeneration
    const today = format(new Date(), "yyyy-MM-dd");
    try {
      await supabase
        .from("daily_summaries")
        .delete()
        .eq("user_id", userId)
        .eq("date", today);

      console.log(`Invalidated daily summary for ${userId} on ${today}`);
    } catch (summaryError) {
      console.warn("Failed to invalidate daily summary:", summaryError);
      // Don't fail the request if summary invalidation fails
    }

    return NextResponse.json({ success: true, memory });
  } catch (error: any) {
    console.error("Error saving memory:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save memory" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const recentEmotions = searchParams.get("recentEmotions");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // If requesting recent emotions only
    if (recentEmotions === "true") {
      const { data, error } = await supabase
        .from("memories")
        .select("emotion")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Extract unique emotions (most recent first)
      const emotions = Array.from(new Set(data?.map(m => m.emotion) || []));
      return NextResponse.json({ emotions });
    }

    // Original behavior - get memories by date
    if (!date) {
      return NextResponse.json(
        { error: "Missing date" },
        { status: 400 }
      );
    }

    const memories = await getMemoriesByDate(userId, date);
    return NextResponse.json({ memories });
  } catch (error: any) {
    console.error("Error fetching memories:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch memories" },
      { status: 500 }
    );
  }
}
