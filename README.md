# 🧩 EchoMind - Real-Time Multimodal Memory Journal

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css" />
</div>

## 🌟 Overview

**EchoMind** is an innovative AI-powered memory journal that captures your speech, webcam emotion, and context to build a personalized "memory graph" of your day. Unlike traditional journaling apps, EchoMind uses multimodal AI to understand not just what you say, but how you feel when you say it.

### ✨ Key Features

- 🎤 **Voice Recording** - Capture your thoughts hands-free with real-time transcription
- 📹 **Webcam Emotion Detection** - Visual feedback showing your emotional state during recording
- 💭 **AI-Powered Transcription** - Powered by OpenAI Whisper for accurate speech-to-text
- 😊 **Emotion Analysis** - Automatic emotion detection from voice tone and text sentiment
- 📊 **Timeline View** - Beautiful chronological display of your daily memories
- 🧠 **Daily AI Summary** - Get personalized insights about your day with emotion breakdowns
- 🎨 **Beautiful UI** - Smooth animations with Framer Motion and modern design
- ☁️ **Cloud Storage** - All memories securely stored in Supabase with vector embeddings
- 🔍 **Semantic Search** - Find memories by meaning, not just keywords

## 🎯 Why It Wins

1. **Novelty**: Combines voice, text, and emotion → human-like memory understanding
2. **Feasible MVP**: Can demo 3-4 voice clips/day with full transcription and emotion analysis
3. **Wow Factor**: "Your AI remembers your day better than you do"
4. **Technical Excellence**: Modern stack with Next.js 15, React 19, and cutting-edge AI APIs
5. **User Experience**: Intuitive interface that makes journaling feel effortless

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key

### Installation

1. **Clone and Install**
   ```bash
   cd echomind
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   ```

3. **Set Up Supabase Database**

   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Create memories table
   CREATE TABLE memories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     timestamp TIMESTAMPTZ NOT NULL,
     transcript TEXT NOT NULL,
     emotion TEXT NOT NULL,
     summary TEXT NOT NULL,
     audio_url TEXT,
     video_snapshot_url TEXT,
     location TEXT,
     tags TEXT[],
     embedding VECTOR(1536),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     updated_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Create daily summaries table
   CREATE TABLE daily_summaries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id TEXT NOT NULL,
     date DATE NOT NULL,
     overall_mood TEXT NOT NULL,
     key_themes TEXT[],
     highlights TEXT[],
     emotion_breakdown JSONB,
     ai_insight TEXT NOT NULL,
     memories_count INTEGER NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, date)
   );

   -- Create indexes
   CREATE INDEX memories_user_timestamp_idx ON memories(user_id, timestamp DESC);
   CREATE INDEX memories_emotion_idx ON memories(emotion);
   CREATE INDEX daily_summaries_user_date_idx ON daily_summaries(user_id, date DESC);

   -- Enable vector extension for semantic search
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops);
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
echomind/
├── app/
│   ├── api/
│   │   ├── transcribe/      # Voice transcription endpoint
│   │   ├── memories/         # CRUD operations for memories
│   │   └── summary/          # Daily summary generation
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page with navigation
│   └── globals.css          # Global styles
├── components/
│   ├── CapturePanel.tsx     # Recording interface
│   ├── WebcamCapture.tsx    # Webcam feed component
│   ├── EmotionDisplay.tsx   # Emotion visualization
│   ├── Timeline.tsx         # Memory timeline view
│   └── DailySummary.tsx     # AI-generated summary view
├── lib/
│   ├── supabase.ts          # Supabase client & helpers
│   └── openai.ts            # OpenAI integration
└── public/                  # Static assets
```

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library

### Backend & AI
- **OpenAI Whisper** - Speech-to-text transcription
- **OpenAI GPT-4** - Daily summarization and insights
- **OpenAI Embeddings** - Vector embeddings for semantic search
- **Supabase** - PostgreSQL database with real-time features

## 🔑 Features Breakdown

### 1. Capture Panel
- Real-time voice recording with visual feedback
- Live webcam feed with emotion indicators
- Recording timer and controls
- Instant transcription display

### 2. Timeline View
- Chronological display of all memories
- Emotion icons and color coding
- Time stamps and location tags
- Expandable memory cards

### 3. Daily Summary
- AI-generated insights about your day
- Emotion distribution charts
- Key themes and highlights
- Exportable reports

## 🛠️ API Endpoints

### POST `/api/transcribe`
Transcribe audio to text and detect emotion
```typescript
// Request: multipart/form-data with audio file
// Response: { transcript: string, emotion: string }
```

### POST `/api/memories`
Save a new memory
```typescript
// Request: { transcript, emotion, userId, location?, tags? }
// Response: { success: boolean, memory: Memory }
```

### GET `/api/memories?userId=X&date=YYYY-MM-DD`
Get memories for a specific date
```typescript
// Response: { memories: Memory[] }
```

### GET `/api/summary?userId=X&date=YYYY-MM-DD`
Get or generate daily summary
```typescript
// Response: { summary: DailySummary }
```

## 🎯 MVP Demo Flow

1. **Capture** - Record 3-4 short voice clips (30-60 seconds each)
2. **Review** - Check transcriptions and emotion detection accuracy
3. **Timeline** - Browse your memories in a beautiful timeline
4. **Summary** - Generate and view AI-powered daily insights

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables on Vercel
Add all variables from `.env.example` in your Vercel project settings.

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Use Supabase Row Level Security (RLS) for production
- Implement proper authentication before deploying
- Store audio files securely with signed URLs

## 🎨 Customization

### Change Color Scheme
Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Add More Emotions
Edit `components/EmotionDisplay.tsx` and add to `emotionConfig`.

### Modify AI Prompts
Edit `lib/openai.ts` to customize summarization style.

## 🐛 Troubleshooting

### "Microphone not detected"
- Check browser permissions
- Ensure HTTPS or localhost
- Try a different browser

### "Transcription failed"
- Verify OpenAI API key is valid
- Check API quota and billing
- Ensure audio format is supported

### "Supabase connection error"
- Verify URL and anon key
- Check database tables are created
- Ensure network connectivity

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Voice analysis for tone detection
- [ ] Photo attachment support
- [ ] Weekly/monthly reports
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Offline mode with sync
- [ ] Custom emotion categories
- [ ] Memory search and filtering
- [ ] Data export (JSON, PDF)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for hackathons, learning, or personal projects!

## 🙏 Acknowledgments

- OpenAI for Whisper and GPT-4
- Supabase for the amazing backend
- Vercel for Next.js and hosting
- The open-source community

---

**Built with ❤️ for the Cursor Hackathon**

Remember: *"Your AI remembers your day better than you do"*
