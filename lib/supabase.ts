import { createClient } from "@supabase/supabase-js";

// These should be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Memory {
  id: string;
  user_id: string;
  timestamp: string;
  transcript: string;
  emotion: string;
  summary: string;
  audio_url?: string;
  video_snapshot_url?: string;
  location?: string;
  tags?: string[];
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  overall_mood: string;
  key_themes: string[];
  highlights: string[];
  emotion_breakdown: Record<string, number>;
  ai_insight: string;
  memories_count: number;
  created_at: string;
}

// Helper functions
export async function saveMemory(memory: Omit<Memory, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("memories")
    .insert([memory])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMemoriesByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", `${date}T00:00:00`)
    .lte("timestamp", `${date}T23:59:59`)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getDailySummary(userId: string, date: string) {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows found
  return data;
}

export async function saveDailySummary(
  summary: Omit<DailySummary, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("daily_summaries")
    .upsert([summary])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMemoryCountByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { count, error } = await supabase
    .from("memories")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("timestamp", `${startDate}T00:00:00`)
    .lte("timestamp", `${endDate}T23:59:59`);

  if (error) throw error;
  return count || 0;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  messages: ConversationMessage[];
  created_at: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Save conversation
export async function saveConversation(conversation: {
  user_id: string;
  started_at: string;
  ended_at?: string;
  messages: ConversationMessage[];
}) {
  const { data, error } = await supabase
    .from("conversations")
    .insert([conversation])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get conversations by user
export async function getConversationsByUser(userId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
