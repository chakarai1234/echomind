-- EchoMind Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transcript TEXT NOT NULL,
  emotion TEXT NOT NULL,
  summary TEXT NOT NULL,
  audio_url TEXT,
  video_snapshot_url TEXT,
  location TEXT,
  tags TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  overall_mood TEXT NOT NULL,
  key_themes TEXT[] NOT NULL DEFAULT '{}',
  highlights TEXT[] NOT NULL DEFAULT '{}',
  emotion_breakdown JSONB NOT NULL DEFAULT '{}',
  ai_insight TEXT NOT NULL,
  memories_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_user_timestamp ON memories(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memories_emotion ON memories(emotion);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for memories table
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations for authenticated users)
-- You should customize these based on your auth requirements
CREATE POLICY "Enable read access for all users" ON memories FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON memories FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON memories FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON daily_summaries FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON daily_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON daily_summaries FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON daily_summaries FOR DELETE USING (true);
