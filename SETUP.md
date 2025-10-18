# 🚀 EchoMind Setup Guide

## Complete Setup Instructions

### Step 1: Install Dependencies

```bash
cd echomind
npm install
```

This will install all required packages including:
- Next.js 15 & React 19
- TailwindCSS & PostCSS
- Framer Motion
- Supabase client
- OpenAI SDK
- TypeScript & type definitions

### Step 2: Set Up Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be ready (~2 minutes)

2. **Get Your Credentials**
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public` key
   - Save these for the next step

3. **Create Database Tables**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run this SQL:

```sql
-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

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

-- Create indexes for performance
CREATE INDEX memories_user_timestamp_idx ON memories(user_id, timestamp DESC);
CREATE INDEX memories_emotion_idx ON memories(emotion);
CREATE INDEX daily_summaries_user_date_idx ON daily_summaries(user_id, date DESC);
CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops);

-- Add updated_at trigger for memories
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Set Up OpenAI

1. **Get OpenAI API Key**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys section
   - Create new secret key
   - Copy the key (you won't see it again!)

2. **Add Credits (if needed)**
   - Go to Billing
   - Add payment method
   - OpenAI charges per usage (~$0.10 for MVP demo)

### Step 4: Configure Environment Variables

1. **Create `.env.local` file**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** with your credentials:
   ```env
   # Supabase (required)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # OpenAI (required)
   OPENAI_API_KEY=sk-your-openai-key-here

   # Optional: ElevenLabs for advanced voice features
   ELEVENLABS_API_KEY=your-elevenlabs-key

   # Optional: Convex for real-time updates
   NEXT_PUBLIC_CONVEX_URL=https://your-convex.cloud
   ```

### Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Testing the MVP

### Test Flow:

1. **Navigate to Capture Tab**
   - Allow microphone and camera permissions
   - You should see your webcam feed

2. **Record Your First Memory**
   - Click "Start Recording"
   - Speak for 10-30 seconds (e.g., "I just had a great meeting with my team. Everyone was excited about the new features we're building!")
   - Click "Stop Recording"
   - Wait for transcription (~2-5 seconds)

3. **View the Timeline**
   - Click the "Timeline" tab
   - See your memory displayed with emotion icon
   - Notice the beautiful animations

4. **Generate Daily Summary**
   - Record 2-3 more memories
   - Click "Summary" tab
   - Wait for AI to generate insights (~5-10 seconds)

## 🔧 Common Issues & Solutions

### Issue: "Microphone access denied"
**Solution**:
- Chrome: Click the lock icon in URL bar → Site settings → Allow microphone
- Firefox: Click shield icon → Permissions → Allow microphone
- Safari: Safari → Settings → Websites → Microphone → Allow

### Issue: "Camera not working"
**Solution**:
- Ensure no other app is using the camera
- Restart your browser
- Try a different browser (Chrome recommended)

### Issue: "OpenAI API error"
**Solution**:
- Verify API key is correct (no extra spaces)
- Check you have credits in OpenAI billing
- Ensure the key has proper permissions

### Issue: "Supabase connection failed"
**Solution**:
- Double-check URL format: `https://xxx.supabase.co`
- Verify anon key (not the service role key!)
- Ensure tables are created correctly

### Issue: "Build errors with TypeScript"
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Click Deploy

3. **Test Production Build Locally**
   ```bash
   npm run build
   npm run start
   ```

## 🎨 Customization Tips

### Change Branding
- Edit `app/layout.tsx` for title and description
- Update colors in `tailwind.config.ts`
- Modify header in `app/page.tsx`

### Add More Emotions
1. Edit `components/EmotionDisplay.tsx`
2. Add to `emotionConfig` object
3. Update OpenAI prompt in `lib/openai.ts`

### Modify AI Behavior
- Edit prompts in `lib/openai.ts`
- Adjust temperature for more/less creativity
- Change model to `gpt-3.5-turbo` for lower cost

## 📊 Cost Estimates

For MVP demo (4 recordings):
- OpenAI Whisper: ~$0.02 (transcription)
- OpenAI GPT-4: ~$0.05 (summarization)
- OpenAI Embeddings: ~$0.001 (vector search)
- Supabase: Free tier
- **Total: ~$0.07 per demo**

## ✅ Pre-Demo Checklist

- [ ] All dependencies installed
- [ ] Supabase tables created
- [ ] Environment variables configured
- [ ] Microphone permission granted
- [ ] Camera permission granted
- [ ] Dev server running smoothly
- [ ] Recorded and tested 2-3 memories
- [ ] Generated a daily summary
- [ ] Tested on target demo browser
- [ ] Prepared demo script

## 🎬 Demo Script

1. **Intro (30 sec)**
   - "This is EchoMind - your AI memory journal that remembers your day better than you do"

2. **Capture Demo (1 min)**
   - Show webcam + recording interface
   - Record a 20-second memory
   - Show instant transcription + emotion

3. **Timeline (30 sec)**
   - Navigate to timeline
   - Show beautiful memory cards
   - Point out emotion icons and timestamps

4. **AI Summary (1 min)**
   - Show generated summary
   - Highlight emotion breakdown chart
   - Read AI insight aloud

5. **Closing (30 sec)**
   - Mention tech stack
   - Emphasize novelty: multimodal + AI
   - "Your memories, remembered perfectly"

---

Need help? Check the main [README.md](./README.md) or create an issue on GitHub!
