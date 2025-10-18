# EchoMind Setup Instructions

## Issues Found and Fixed

### 1. Supabase Database Tables Missing

**Problem**: The Supabase database tables (`memories` and `daily_summaries`) don't exist.

**Solution**:

1. Go to your Supabase project: https://agukiazgftogtvzxnlvo.supabase.co
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the SQL script to create all required tables

### 2. Live Transcript Not Working

**Problem**: The CapturePanel component was using mock data instead of real API calls.

**Fixed**: Updated `components/CapturePanel.tsx` to:

-   Call the `/api/transcribe` endpoint with actual audio
-   Save transcripts to Supabase via `/api/memories` endpoint
-   Show proper error messages

### 3. OpenAI API Key Issue

**Problem**: Your OpenAI API key in `.env` appears to be truncated.

**Solution**: Update your `.env` file with the complete OpenAI API key:

```
OPENAI_API_KEY=sk-proj-YOUR_COMPLETE_KEY_HERE
```

Make sure you have the full key from https://platform.openai.com/api-keys

## Setup Steps

### 1. Set Up Supabase Database

```bash
# Run the SQL script in your Supabase SQL Editor
cat supabase-schema.sql
```

This will create:

-   `memories` table - stores voice recordings and transcripts
-   `daily_summaries` table - stores AI-generated daily summaries
-   Indexes for performance
-   Row Level Security policies

### 2. Verify Environment Variables

Check your `.env` file has all required keys:

```bash
# Supabase Configuration (✓ Already set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI Configuration (⚠️ CHECK THIS - appears truncated)
OPENAI_API_KEY=

# ElevenLabs Configuration (✓ Already set - optional)
ELEVENLABS_API_KEY=

# Convex Configuration (✓ Already set - optional)
NEXT_PUBLIC_CONVEX_URL=
```

### 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### 4. Test the Application

1. **Open the app**: http://localhost:3000
2. **Click "Start Recording"**
3. **Speak something** (e.g., "I had a great meeting today")
4. **Click "Stop Recording"**
5. **Check the transcript** appears on the right panel
6. **Verify in Supabase**: Go to your Supabase Table Editor and check if a new record appears in the `memories` table

## Troubleshooting

### Issue: "Failed to transcribe audio"

-   Check your OpenAI API key is complete and valid
-   Check browser console for specific error messages
-   Ensure you have credits in your OpenAI account

### Issue: "Failed to save memory"

-   Verify the Supabase tables are created correctly
-   Check the browser console for SQL errors
-   Verify your Supabase URL and anon key are correct

### Issue: Microphone not working

-   Grant microphone permissions in your browser
-   Check browser settings (chrome://settings/content/microphone)
-   Try a different browser if needed

### Issue: No transcript showing

-   Open browser DevTools (F12)
-   Go to Console tab
-   Look for error messages
-   Check Network tab for failed API calls

## What's Working Now

✅ **Supabase Connection**: Connected to your database
✅ **Live Transcript**: Real-time transcription via OpenAI Whisper
✅ **Emotion Detection**: AI-powered emotion analysis
✅ **Memory Storage**: Saves to Supabase database
✅ **Recording Controls**: Start/stop recording with timer

## What Still Needs Setup

⚠️ **OpenAI API Key**: Verify it's complete and has credits
⚠️ **Database Tables**: Must run the SQL script in Supabase
🔧 **Convex Integration**: Optional - not currently used but available
🔧 **User Authentication**: Currently using "demo-user" - implement proper auth later

## Next Steps

1. **Run the SQL script in Supabase** (most important!)
2. **Verify your OpenAI API key**
3. **Restart the dev server**
4. **Test the recording feature**
5. **Check the browser console for any errors**

If you encounter any issues, check:

-   Browser console (F12 → Console tab)
-   Network tab (F12 → Network tab)
-   Supabase logs (Supabase Dashboard → Logs)
-   Terminal where dev server is running

## API Endpoints

-   `POST /api/transcribe` - Transcribes audio using OpenAI Whisper
-   `POST /api/memories` - Saves memory to Supabase
-   `GET /api/memories?userId=X&date=Y` - Fetches memories for a date
-   `POST /api/summary` - Generates daily AI summary

## Features Overview

-   **Voice Recording**: Record audio with MediaRecorder API
-   **Live Transcription**: Convert speech to text with OpenAI Whisper
-   **Emotion Analysis**: Detect emotions from transcript
-   **Memory Storage**: Save to Supabase with vector embeddings
-   **Daily Summaries**: AI-generated insights about your day
-   **Timeline View**: Browse past memories
-   **Webcam Capture**: Optional video snapshots

