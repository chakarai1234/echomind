import { NextRequest, NextResponse } from "next/server";
import { getMemoriesByDate, saveDailySummary, getDailySummary } from "@/lib/supabase";
import { generateDailySummary } from "@/lib/openai";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const forceRegenerate = searchParams.get("regenerate") === "true";

    if (!userId || !date) {
      return NextResponse.json(
        { error: "Missing userId or date" },
        { status: 400 }
      );
    }

    // First, get the memories for this date
    const memories = await getMemoriesByDate(userId, date);

    // Check if there are any memories
    if (!memories || memories.length === 0) {
      return NextResponse.json({
        summary: null,
        message: "No memories found for this date"
      }, { status: 200 });
    }

    // Check if summary already exists and we're not forcing regeneration
    let summary = await getDailySummary(userId, date);

    // Regenerate if: no summary exists, force regenerate requested, or memory count doesn't match
    const shouldRegenerate = !summary || forceRegenerate || (summary.memories_count !== memories.length);

    if (shouldRegenerate) {
      console.log(`Regenerating summary for ${date}. Reason: ${!summary ? 'No existing summary' : forceRegenerate ? 'Force regenerate' : 'Memory count mismatch'}`);
      console.log(`Current memories: ${memories.length}, Cached count: ${summary?.memories_count || 0}`);

      const summaryData = await generateDailySummary({
        memories: memories.map((m) => ({
          transcript: m.transcript,
          emotion: m.emotion,
          timestamp: new Date(m.timestamp).toLocaleTimeString(),
        })),
        date,
      });

      summary = await saveDailySummary({
        user_id: userId,
        date,
        overall_mood: summaryData.overallMood,
        key_themes: summaryData.keyThemes,
        highlights: summaryData.highlights,
        emotion_breakdown: summaryData.emotionBreakdown,
        ai_insight: summaryData.aiInsight,
        memories_count: memories.length,
      });

      console.log(`Summary regenerated successfully with ${memories.length} memories`);
    } else {
      console.log(`Using cached summary for ${date} with ${summary.memories_count} memories`);
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Error generating summary:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to generate summary";
    if (error.message?.includes("OpenAI")) {
      errorMessage = "AI service error. Please check your API key configuration.";
    } else if (error.message?.includes("Supabase") || error.code) {
      errorMessage = "Database connection error. Please check your Supabase configuration.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
