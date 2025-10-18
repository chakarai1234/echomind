# 🏗️ EchoMind Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                      (Next.js App Router)                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼────┐            ┌────▼────┐            ┌────▼────┐
    │ Capture │            │Timeline │            │ Summary │
    │  Panel  │            │  View   │            │  View   │
    └────┬────┘            └────┬────┘            └────┬────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────▼────┐            ┌────▼────┐            ┌───▼────┐
    │   API   │            │   API   │            │  API   │
    │Transcribe│          │Memories │            │Summary │
    └────┬────┘            └────┬────┘            └───┬────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────▼────┐            ┌────▼────┐            ┌───▼────┐
    │ OpenAI  │            │Supabase │            │ OpenAI │
    │ Whisper │            │PostgreSQL│           │ GPT-4  │
    └─────────┘            └─────────┘            └────────┘
```

## Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── Logo + Title
│   └── Navigation Tabs
│       ├── Capture
│       ├── Timeline
│       └── Summary
│
├── CapturePanel (activeView === "capture")
│   ├── WebcamCapture
│   │   └── Video Element
│   ├── Recording Controls
│   │   ├── Timer Display
│   │   ├── Start/Stop Button
│   │   └── Webcam Toggle
│   ├── EmotionDisplay
│   │   ├── Animated Icon
│   │   ├── Emotion Label
│   │   └── Recent Emotions
│   └── Transcript Display
│       └── Live Text Output
│
├── Timeline (activeView === "timeline")
│   ├── Header
│   │   └── Date Display
│   ├── Memory Cards (map)
│   │   ├── Timeline Dot
│   │   ├── Emotion Icon
│   │   ├── Timestamp
│   │   ├── Location
│   │   ├── Transcript
│   │   └── Tags
│   └── Load More Button
│
└── DailySummary (activeView === "summary")
    ├── Header
    │   ├── Date Display
    │   └── Export Button
    ├── Stats Grid
    │   ├── Memories Count
    │   ├── Top Emotion
    │   ├── Positivity Trend
    │   └── Energy Level
    ├── AI Insight Card
    │   └── Generated Text
    ├── Two Column Layout
    │   ├── Highlights List
    │   └── Emotion Breakdown Chart
    └── Key Themes Tags
```

## Data Flow Diagrams

### 1. Recording & Transcription Flow

```
User clicks "Start Recording"
    │
    ├─→ navigator.mediaDevices.getUserMedia()
    │       │
    │       └─→ MediaStream obtained
    │               │
    │               └─→ MediaRecorder created
    │                       │
User speaks ───────────────┘
    │
    ├─→ Audio chunks collected
    │
User clicks "Stop Recording"
    │
    └─→ mediaRecorder.stop()
            │
            └─→ ondataavailable event
                    │
                    └─→ Create Blob from chunks
                            │
                            └─→ POST /api/transcribe
                                    │
                                    ├─→ OpenAI Whisper API
                                    │       │
                                    │       └─→ Transcript text
                                    │
                                    └─→ OpenAI GPT-3.5 API
                                            │
                                            └─→ Emotion string
                                                    │
                                                    └─→ Return to client
                                                            │
                                                            └─→ Update UI
                                                                    │
                                                                    └─→ POST /api/memories
                                                                            │
                                                                            └─→ Save to Supabase
```

### 2. Timeline Loading Flow

```
User clicks "Timeline" tab
    │
    └─→ setActiveView("timeline")
            │
            └─→ Timeline component mounts
                    │
                    └─→ useEffect or direct call
                            │
                            └─→ GET /api/memories?userId=X&date=YYYY-MM-DD
                                    │
                                    └─→ Supabase query
                                            │
                                            └─→ SELECT * FROM memories WHERE...
                                                    │
                                                    └─→ Return memories array
                                                            │
                                                            └─→ Map over memories
                                                                    │
                                                                    └─→ Render with Framer Motion
```

### 3. Summary Generation Flow

```
User clicks "Summary" tab
    │
    └─→ setActiveView("summary")
            │
            └─→ DailySummary component mounts
                    │
                    └─→ GET /api/summary?userId=X&date=YYYY-MM-DD
                            │
                            ├─→ Check Supabase for existing summary
                            │       │
                            │       └─→ If found: return immediately
                            │
                            └─→ If not found: generate new
                                    │
                                    ├─→ Fetch all memories for date
                                    │       │
                                    │       └─→ SELECT * FROM memories WHERE date = X
                                    │
                                    └─→ Send to OpenAI GPT-4
                                            │
                                            └─→ Analyze emotions, themes, insights
                                                    │
                                                    └─→ Return JSON summary
                                                            │
                                                            └─→ Save to daily_summaries table
                                                                    │
                                                                    └─→ Return to client
                                                                            │
                                                                            └─→ Render dashboard
```

## API Route Architecture

### `/api/transcribe`

```typescript
POST /api/transcribe
    │
    ├─→ Input: FormData with audio file
    │
    ├─→ Process:
    │   ├─→ Extract audio file from FormData
    │   ├─→ Call OpenAI Whisper API
    │   ├─→ Get transcript text
    │   ├─→ Call OpenAI GPT-3.5 for emotion
    │   └─→ Return { transcript, emotion }
    │
    └─→ Output: { transcript: string, emotion: string }
```

### `/api/memories`

```typescript
POST /api/memories
    │
    ├─→ Input: { transcript, emotion, userId, location?, tags? }
    │
    ├─→ Process:
    │   ├─→ Generate embedding via OpenAI
    │   ├─→ Create summary (first 100 chars)
    │   ├─→ Insert into Supabase
    │   └─→ Return saved memory object
    │
    └─→ Output: { success: boolean, memory: Memory }

GET /api/memories
    │
    ├─→ Input: Query params { userId, date }
    │
    ├─→ Process:
    │   ├─→ Query Supabase by userId and date
    │   ├─→ Order by timestamp DESC
    │   └─→ Return array
    │
    └─→ Output: { memories: Memory[] }
```

### `/api/summary`

```typescript
GET /api/summary
    │
    ├─→ Input: Query params { userId, date }
    │
    ├─→ Process:
    │   ├─→ Check if summary exists in DB
    │   ├─→ If yes: return immediately
    │   ├─→ If no:
    │   │   ├─→ Fetch all memories for date
    │   │   ├─→ Send to GPT-4 with prompt
    │   │   ├─→ Parse JSON response
    │   │   └─→ Save to daily_summaries
    │   └─→ Return summary
    │
    └─→ Output: { summary: DailySummary }
```

## Database Schema

### Table: `memories`

```sql
┌──────────────────────┬──────────────────┬──────────────────────┐
│ Column               │ Type             │ Description          │
├──────────────────────┼──────────────────┼──────────────────────┤
│ id                   │ UUID             │ Primary key          │
│ user_id              │ TEXT             │ User identifier      │
│ timestamp            │ TIMESTAMPTZ      │ When recorded        │
│ transcript           │ TEXT             │ Full transcript      │
│ emotion              │ TEXT             │ Detected emotion     │
│ summary              │ TEXT             │ Short summary        │
│ audio_url            │ TEXT             │ Storage URL          │
│ video_snapshot_url   │ TEXT             │ Snapshot URL         │
│ location             │ TEXT             │ Optional location    │
│ tags                 │ TEXT[]           │ User tags            │
│ embedding            │ VECTOR(1536)     │ For semantic search  │
│ created_at           │ TIMESTAMPTZ      │ Auto-generated       │
│ updated_at           │ TIMESTAMPTZ      │ Auto-updated         │
└──────────────────────┴──────────────────┴──────────────────────┘

Indexes:
- memories_user_timestamp_idx: (user_id, timestamp DESC)
- memories_emotion_idx: (emotion)
- memories_embedding_idx: USING ivfflat (embedding)
```

### Table: `daily_summaries`

```sql
┌──────────────────────┬──────────────────┬──────────────────────┐
│ Column               │ Type             │ Description          │
├──────────────────────┼──────────────────┼──────────────────────┤
│ id                   │ UUID             │ Primary key          │
│ user_id              │ TEXT             │ User identifier      │
│ date                 │ DATE             │ Summary date         │
│ overall_mood         │ TEXT             │ General mood         │
│ key_themes           │ TEXT[]           │ Main themes          │
│ highlights           │ TEXT[]           │ Key moments          │
│ emotion_breakdown    │ JSONB            │ Emotion %ages        │
│ ai_insight           │ TEXT             │ GPT-4 analysis       │
│ memories_count       │ INTEGER          │ Total memories       │
│ created_at           │ TIMESTAMPTZ      │ Auto-generated       │
└──────────────────────┴──────────────────┴──────────────────────┘

Indexes:
- daily_summaries_user_date_idx: (user_id, date DESC)

Constraints:
- UNIQUE(user_id, date): One summary per user per day
```

## State Management

### Component State (useState)

```typescript
// CapturePanel.tsx
interface RecordingState {
  isRecording: boolean;      // Currently recording?
  isPaused: boolean;         // Paused state
  duration: number;          // Seconds elapsed
  transcript: string;        // Live transcript
  emotion: string;           // Detected emotion
}

// Timeline.tsx
interface Memory {
  id: string;
  timestamp: Date;
  transcript: string;
  emotion: string;
  summary: string;
  location?: string;
}

// DailySummary.tsx
interface Summary {
  date: Date;
  overallMood: string;
  keyThemes: string[];
  highlights: string[];
  emotionBreakdown: Record<string, number>;
  aiInsight: string;
  memoriesCount: number;
  topEmotion: string;
}
```

### Global State (None Currently)

The app uses local component state for simplicity. For production, consider:
- React Context for user authentication
- Zustand for cross-component state
- SWR or React Query for data fetching

## Animation Strategy

### Page Transitions (Framer Motion)

```typescript
// Fade in on mount
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}

// Staggered children
variants={{
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}}
```

### Component Animations

1. **Recording Indicator**: Pulsing red dot
2. **Emotion Icon**: Scale + rotate on change
3. **Timeline Cards**: Slide up on scroll
4. **Charts**: Animated bar widths
5. **Buttons**: Hover scale + shadow

## Security Considerations

### Current Implementation

```
✅ Environment variables for API keys
✅ TypeScript for type safety
✅ Error handling in API routes
✅ Input validation on forms
```

### Before Production

```
⚠️ Add user authentication (Supabase Auth)
⚠️ Enable Row Level Security (RLS)
⚠️ Add rate limiting to APIs
⚠️ Sanitize user inputs
⚠️ Add CORS configuration
⚠️ Implement request validation
⚠️ Add API key rotation
⚠️ Set up monitoring/logging
```

## Performance Optimizations

### Current

1. **Code Splitting**: Next.js automatic
2. **Image Optimization**: Next.js Image component
3. **CSS**: Tailwind purges unused styles
4. **API Routes**: Efficient Supabase queries

### Future

1. **Caching**: Redis for summaries
2. **CDN**: Static assets via Vercel Edge
3. **Lazy Loading**: Dynamic imports for heavy components
4. **Streaming**: Stream transcription results
5. **Worker Threads**: Offload embeddings

## Scalability Plan

### Phase 1: MVP (Current)
- Single region
- Supabase free tier
- Vercel hobby plan
- **Capacity**: ~100 users

### Phase 2: Growth
- Multi-region Supabase
- Vercel Pro plan
- Redis caching
- **Capacity**: ~10,000 users

### Phase 3: Scale
- Dedicated Supabase
- Multiple edge functions
- CDN for media
- **Capacity**: ~100,000 users

### Phase 4: Enterprise
- Custom infrastructure
- Multiple AI providers
- Global CDN
- **Capacity**: Millions of users

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  US West     │  │   US East    │  │   Europe     │ │
│  │  CDN Node    │  │   CDN Node   │  │   CDN Node   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Next.js Application Server                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SSR + API Routes + Edge Functions               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   OpenAI    │  │  Supabase   │  │   Vercel    │
│   APIs      │  │  Database   │  │   Storage   │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Technology Decisions

### Why Next.js?
- ✅ Full-stack framework
- ✅ API routes built-in
- ✅ Excellent TypeScript support
- ✅ Automatic code splitting
- ✅ Great developer experience

### Why Supabase?
- ✅ PostgreSQL (reliable, proven)
- ✅ Real-time subscriptions
- ✅ Built-in authentication
- ✅ File storage included
- ✅ Vector extensions (pgvector)

### Why OpenAI?
- ✅ Best-in-class Whisper transcription
- ✅ GPT-4 for quality summaries
- ✅ Embeddings for semantic search
- ✅ Well-documented APIs
- ✅ Reasonable pricing

### Why Framer Motion?
- ✅ Declarative animations
- ✅ Great React integration
- ✅ Performance optimized
- ✅ Gesture support
- ✅ Layout animations

### Why TailwindCSS?
- ✅ Rapid development
- ✅ Consistent design system
- ✅ Purges unused CSS
- ✅ Great with Next.js
- ✅ Responsive by default

---

## Summary

EchoMind's architecture is:
- **Modular**: Clear separation of concerns
- **Scalable**: Can grow from MVP to enterprise
- **Maintainable**: TypeScript + clean code
- **Performant**: Optimized at every layer
- **Secure**: Built with security in mind

The design prioritizes:
1. **Developer Experience**: Easy to understand and modify
2. **User Experience**: Fast, smooth, intuitive
3. **Reliability**: Error handling and fallbacks
4. **Extensibility**: Easy to add new features

---

**Architecture Version**: 1.0.0
**Last Updated**: October 18, 2025
