import { NextRequest, NextResponse } from "next/server";
import { getMemoryCountByDateRange } from "@/lib/supabase";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Get today's count
    const todayStart = format(startOfDay(now), "yyyy-MM-dd");
    const todayEnd = format(endOfDay(now), "yyyy-MM-dd");
    const todayCount = await getMemoryCountByDateRange(userId, todayStart, todayEnd);

    // Get this week's count (starting from Monday)
    const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekCount = await getMemoryCountByDateRange(userId, weekStart, weekEnd);

    return NextResponse.json({
      today: todayCount,
      week: weekCount,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
