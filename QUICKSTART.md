# ⚡ EchoMind - 5-Minute Quickstart

Get EchoMind running in 5 minutes! Perfect for demos and testing.

## 🎯 Prerequisites Checklist

Before starting, have these ready:
- [ ] Node.js 18+ installed
- [ ] Supabase account (free at [supabase.com](https://supabase.com))
- [ ] OpenAI API key (from [platform.openai.com](https://platform.openai.com))
- [ ] Microphone and camera access
- [ ] Modern browser (Chrome recommended)

## ⏱️ 5-Minute Setup

### Minute 1: Environment Setup

```bash
# You're already in the echomind directory
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
OPENAI_API_KEY=sk-your_key_here
```

### Minute 2: Install Dependencies

```bash
# Already done! (npm install was run)
# If needed: npm install
```

### Minute 3: Supabase Setup

1. Go to your Supabase project
2. Click "SQL Editor"
3. Create new query
4. Copy and paste this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

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

CREATE INDEX memories_user_timestamp_idx ON memories(user_id, timestamp DESC);
CREATE INDEX memories_emotion_idx ON memories(emotion);
CREATE INDEX daily_summaries_user_date_idx ON daily_summaries(user_id, date DESC);
CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops);
```

5. Click "RUN" - should complete in ~2 seconds

### Minute 4: Start Development Server

```bash
npm run dev
```

Wait for: `✓ Ready in 2s` or similar message

### Minute 5: Test the App!

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Allow" for microphone and camera
3. Click "Start Recording"
4. Speak for 10 seconds
5. Click "Stop Recording"
6. Watch the magic happen! ✨

## 🎬 Demo Test Script

### Test 1: Basic Recording (30 seconds)
```
Recording: "Today was a great day. I finished the EchoMind project and I'm really excited about how it turned out. The team worked really well together."

Expected:
✅ Transcript appears
✅ Emotion detected (likely "happy" or "excited")
✅ Memory saved to database
```

### Test 2: Timeline View (15 seconds)
```
1. Click "Timeline" tab
2. Verify your memory appears
3. Check emotion icon matches
4. Confirm timestamp is correct
```

### Test 3: Multiple Memories (60 seconds)
```
Record 2 more memories:

Memory 2: "Just had lunch. Feeling pretty neutral about the afternoon ahead. Going to work on some documentation."

Memory 3: "Finished everything for today! Really proud of what we accomplished. Can't wait to show this off tomorrow!"

Expected:
✅ 3 total memories in timeline
✅ Different emotions detected
✅ Chronological order
```

### Test 4: Daily Summary (30 seconds)
```
1. Click "Summary" tab
2. Wait 5-10 seconds for AI generation
3. Verify:
   ✅ Overall mood shown
   ✅ Emotion breakdown chart
   ✅ Key highlights listed
   ✅ AI insight paragraph
```

## 🐛 Quick Troubleshooting

### "Cannot read property of undefined"
**Fix**: Check `.env.local` has all required variables with no typos

### "Microphone not found"
**Fix**:
- Chrome: Click 🔒 in URL bar → Site settings → Allow microphone
- Try restarting browser

### "OpenAI API error"
**Fix**:
- Verify API key is correct
- Check you have credits at platform.openai.com/account/usage
- Ensure no extra spaces in `.env.local`

### "Supabase connection failed"
**Fix**:
- Double-check URL format: `https://xxx.supabase.co`
- Verify you're using the `anon` key, not `service_role`
- Confirm tables were created successfully

### "Camera shows black screen"
**Fix**:
- Close other apps using camera (Zoom, Skype, etc.)
- Try different browser
- Check system camera permissions

## 🎯 Production Checklist

Before deploying to production:

- [ ] Add proper authentication (Supabase Auth)
- [ ] Enable Row Level Security (RLS) on Supabase tables
- [ ] Set up proper error logging
- [ ] Add rate limiting to API routes
- [ ] Configure CORS if needed
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Create backup strategy for database
- [ ] Test on multiple browsers
- [ ] Optimize bundle size
- [ ] Add loading states everywhere

## 📊 Performance Benchmarks

Expected performance on localhost:

| Operation | Time | Notes |
|-----------|------|-------|
| Page Load | <2s | First visit |
| Recording Start | <1s | Browser permission |
| Transcription | 2-5s | Depends on audio length |
| Timeline Load | <1s | With 10 memories |
| Summary Generation | 5-15s | First time only (cached after) |

## 💡 Pro Tips

1. **Faster Development**: Use mock data in components during styling
2. **Debugging**: Open browser DevTools → Network tab to see API calls
3. **Testing**: Use shorter audio clips (10-15s) for faster iteration
4. **Styling**: Modify `tailwind.config.ts` for custom colors
5. **Demo**: Prepare 3-4 pre-written scripts to speak naturally

## 🎤 Sample Recording Scripts

Use these for consistent demo testing:

**Happy/Excited**:
> "Just finished an amazing feature! The AI integration works perfectly and the animations are so smooth. I'm really proud of how this turned out!"

**Neutral**:
> "Working on documentation now. Need to write the setup guide and make sure everything is clear for new users. Pretty straightforward task."

**Grateful**:
> "Taking a moment to appreciate everyone who helped with this project. The support from the team has been incredible and I couldn't have done this without them."

**Energetic**:
> "Coffee break time! Feeling super energized and ready to tackle the next challenge. Let's keep this momentum going!"

## 🚀 Next Steps

Once basic setup works:

1. **Read** `README.md` for full feature documentation
2. **Explore** `PROJECT_OVERVIEW.md` for architecture details
3. **Review** `SETUP.md` for deployment instructions
4. **Customize** colors and branding in `tailwind.config.ts`
5. **Extend** with new emotion categories or features

## 📞 Need Help?

- **Quick Fix**: Check the troubleshooting section above
- **GitHub Issues**: Report bugs or request features
- **Documentation**: README.md has comprehensive info
- **Community**: Join discussions on the project repo

---

**You're all set! Start building memories with EchoMind!** 🧩✨

Time to demo: **~2 minutes** after completing setup
