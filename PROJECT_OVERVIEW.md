# 🎯 EchoMind - Project Overview

## 📋 Quick Summary

**EchoMind** is a real-time multimodal memory journal that uses AI to capture and understand your daily experiences through voice, emotion, and context.

**Status**: ✅ MVP Complete - Ready for Demo
**Build Time**: ~2 hours
**Demo Time**: 3-4 minutes

## 🎨 Visual Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Capture    │  │   Timeline   │  │   Summary    │ │
│  │   Panel      │  │    View      │  │    View      │ │
│  │              │  │              │  │              │ │
│  │  🎤 + 📹    │  │  📊 Cards    │  │  🧠 AI       │ │
│  │  Recording   │  │  Emotions    │  │  Insights    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕️  API Routes
┌─────────────────────────────────────────────────────────┐
│                  BACKEND SERVICES                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   OpenAI     │  │   Supabase   │  │   Convex     │ │
│  │              │  │              │  │              │ │
│  │  Whisper 🎙  │  │  PostgreSQL  │  │  Real-time   │ │
│  │  GPT-4 🧠    │  │  Storage 💾  │  │  Sync ⚡     │ │
│  │  Embeddings  │  │  Vector DB   │  │  (Optional)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🗂️ File Structure

```
echomind/
│
├── 📱 app/                    # Next.js App Router
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Main page with tab navigation
│   ├── globals.css           # Global styles + animations
│   │
│   └── 🔌 api/               # API Routes
│       ├── transcribe/       # Voice → Text + Emotion
│       ├── memories/         # CRUD for memories
│       └── summary/          # Daily AI summary
│
├── 🎨 components/            # React Components
│   ├── CapturePanel.tsx     # Main recording interface
│   ├── WebcamCapture.tsx    # Live video feed
│   ├── EmotionDisplay.tsx   # Animated emotion icons
│   ├── Timeline.tsx         # Memory timeline view
│   └── DailySummary.tsx     # AI insights dashboard
│
├── 📚 lib/                   # Utility Libraries
│   ├── supabase.ts          # Database client + helpers
│   └── openai.ts            # AI integration functions
│
├── ⚙️ Configuration Files
│   ├── package.json         # Dependencies
│   ├── tsconfig.json        # TypeScript config
│   ├── tailwind.config.ts   # Styling config
│   ├── next.config.ts       # Next.js config
│   └── .env.example         # Environment template
│
└── 📖 Documentation
    ├── README.md            # Complete documentation
    ├── SETUP.md             # Step-by-step setup
    └── PROJECT_OVERVIEW.md  # This file
```

## 🔄 Data Flow

### 1. Recording Flow
```
User speaks → MediaRecorder API → Audio Blob
                                      ↓
                            POST /api/transcribe
                                      ↓
                              OpenAI Whisper
                                      ↓
                        Transcript + Emotion Detection
                                      ↓
                            POST /api/memories
                                      ↓
                          Supabase (with embedding)
```

### 2. Timeline Flow
```
User opens Timeline → GET /api/memories?date=X
                              ↓
                      Supabase Query
                              ↓
                    Filter by date, sort DESC
                              ↓
                      Return memories array
                              ↓
                  Render with Framer Motion
```

### 3. Summary Flow
```
User clicks Summary → GET /api/summary?date=X
                              ↓
                      Check existing summary
                              ↓
                    If not exists: fetch memories
                              ↓
                      Send to GPT-4 with prompt
                              ↓
                    Parse JSON response
                              ↓
                    Save to daily_summaries
                              ↓
                    Return summary object
```

## 🎯 Core Features Implementation

### ✅ Completed Features

1. **Voice Recording** - `components/CapturePanel.tsx:45`
   - MediaRecorder API integration
   - Real-time duration tracking
   - Audio blob generation

2. **Webcam Capture** - `components/WebcamCapture.tsx:15`
   - getUserMedia API
   - Live video feed
   - Recording indicator overlay

3. **Emotion Detection** - `components/EmotionDisplay.tsx:10`
   - 8 emotion categories
   - Animated icons with Framer Motion
   - Color-coded visualization

4. **AI Transcription** - `app/api/transcribe/route.ts:10`
   - OpenAI Whisper integration
   - Emotion analysis from text
   - Error handling

5. **Memory Storage** - `lib/supabase.ts:35`
   - Supabase PostgreSQL
   - Vector embeddings
   - Full CRUD operations

6. **Timeline View** - `components/Timeline.tsx:40`
   - Chronological display
   - Smooth animations
   - Emotion icons and tags

7. **Daily Summary** - `components/DailySummary.tsx:15`
   - GPT-4 powered insights
   - Emotion breakdown charts
   - Key themes extraction

## 📊 Database Schema

### `memories` table
```sql
id              UUID PRIMARY KEY
user_id         TEXT NOT NULL
timestamp       TIMESTAMPTZ NOT NULL
transcript      TEXT NOT NULL
emotion         TEXT NOT NULL
summary         TEXT NOT NULL
audio_url       TEXT (optional)
location        TEXT (optional)
tags            TEXT[] (optional)
embedding       VECTOR(1536) for semantic search
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `daily_summaries` table
```sql
id                  UUID PRIMARY KEY
user_id             TEXT NOT NULL
date                DATE NOT NULL
overall_mood        TEXT NOT NULL
key_themes          TEXT[]
highlights          TEXT[]
emotion_breakdown   JSONB
ai_insight          TEXT NOT NULL
memories_count      INTEGER NOT NULL
created_at          TIMESTAMPTZ

UNIQUE(user_id, date)
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎬 Demo Script (3 minutes)

**0:00 - 0:30** - Introduction
- "EchoMind is an AI memory journal that captures voice, emotion, and context"
- Show homepage with 3 tabs

**0:30 - 1:30** - Live Recording
- Navigate to Capture tab
- Show webcam feed
- Start recording, speak for 20 seconds
- Stop and show instant transcription + emotion

**1:30 - 2:00** - Timeline View
- Switch to Timeline tab
- Show memory card with emotion icon
- Point out timestamp and transcript

**2:00 - 2:45** - AI Summary
- Switch to Summary tab
- Show emotion breakdown chart
- Read AI insight aloud
- Show key themes

**2:45 - 3:00** - Closing
- "Your AI remembers your day better than you do"
- Mention tech stack (Next.js, OpenAI, Supabase)

## 💰 Cost Analysis

### MVP Demo (4 recordings)
- OpenAI Whisper: $0.006/min × 2min = **$0.012**
- OpenAI GPT-4: $0.03/1K tokens × 1.5K = **$0.045**
- OpenAI Embeddings: $0.0001/1K × 4K = **$0.0004**
- Supabase: **Free tier**
- Hosting: **Free (Vercel)**

**Total per demo: ~$0.06**

### Production (100 users/day)
- Transcription: ~$12/day
- Summarization: ~$45/day
- Storage: ~$5/day
- **Total: ~$62/day or ~$1,860/month**

## 🏆 Why This Wins

### 1. **Novelty** (30 points)
- ✅ Multimodal: Voice + Video + Emotion
- ✅ AI-powered memory understanding
- ✅ Semantic search with embeddings
- ✅ Real-time transcription

### 2. **Technical Excellence** (30 points)
- ✅ Modern stack (Next.js 15, React 18, TypeScript)
- ✅ Clean architecture (API routes, components, utils)
- ✅ Proper error handling
- ✅ Scalable database design
- ✅ Vector embeddings for semantic search

### 3. **User Experience** (20 points)
- ✅ Beautiful UI with Framer Motion
- ✅ Intuitive 3-tab navigation
- ✅ Real-time feedback
- ✅ Smooth animations

### 4. **Feasibility** (20 points)
- ✅ Working MVP in 2 hours
- ✅ Can demo in 3-4 minutes
- ✅ Low cost per demo (~$0.06)
- ✅ Easy to set up

## 🔮 Future Enhancements

### Phase 2 (Week 1-2)
- [ ] User authentication (Supabase Auth)
- [ ] Mobile responsive design
- [ ] Audio file storage (Supabase Storage)
- [ ] Search functionality

### Phase 3 (Week 3-4)
- [ ] Weekly/monthly summaries
- [ ] Emotion trends over time
- [ ] Export to PDF/JSON
- [ ] Memory sharing

### Phase 4 (Month 2)
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Custom emotion categories
- [ ] Voice analysis (pitch, tone, pace)

## 🛠️ Tech Stack Details

### Frontend
- **Next.js 15.1** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript 5** - Type safety
- **TailwindCSS 3.4** - Styling
- **Framer Motion 11** - Animations
- **Lucide React** - Icons
- **date-fns** - Date formatting

### Backend
- **OpenAI Whisper** - Speech-to-text (accuracy: ~95%)
- **OpenAI GPT-4** - Summarization (context: 128K tokens)
- **OpenAI Embeddings** - Vector search (1536 dimensions)
- **Supabase** - PostgreSQL + Storage + Auth
- **Convex** - Real-time sync (optional)

### DevOps
- **Vercel** - Hosting (recommended)
- **GitHub** - Version control
- **npm** - Package management

## ⚠️ Known Limitations

1. **Browser Support**: Requires modern browser with MediaRecorder API
2. **Mobile**: Camera/mic may require specific permissions
3. **Offline**: Requires internet for AI processing
4. **Language**: Currently English only (expandable)
5. **Cost**: Scales linearly with usage

## 📞 Support & Contact

- **GitHub Issues**: For bugs and feature requests
- **Email**: [your-email]
- **Documentation**: See README.md and SETUP.md

---

**Built for Cursor Hackathon 2025**

*Remember: "Your AI remembers your day better than you do"* ✨
