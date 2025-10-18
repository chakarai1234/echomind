import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export interface SummarizationRequest {
  memories: Array<{
    transcript: string;
    emotion: string;
    timestamp: string;
  }>;
  date: string;
}

export async function generateDailySummary(request: SummarizationRequest) {
  const memoriesText = request.memories
    .map(
      (m, i) =>
        `${i + 1}. [${m.timestamp}] (Emotion: ${m.emotion})\n${m.transcript}`
    )
    .join("\n\n");

  const prompt = `You are an AI memory assistant analyzing a user's daily journal entries. Based on the following memories from ${request.date}, create a thoughtful daily summary.

Memories:
${memoriesText}

Please analyze these memories and provide:
1. Overall mood assessment
2. Key themes (max 3)
3. Top highlights (max 3)
4. Emotion breakdown (percentages for each emotion mentioned)
5. A personalized insight about the day (2-3 sentences)

Format your response as JSON with the following structure:
{
  "overallMood": "string",
  "keyThemes": ["string"],
  "highlights": ["string"],
  "emotionBreakdown": {"emotion": percentage},
  "aiInsight": "string"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a thoughtful AI assistant that helps people understand their emotions and daily experiences through journal analysis.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export async function generateMemoryEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

export async function analyzeEmotionFromText(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an emotion detection AI. Analyze the text and respond with ONE word only from: happy, excited, neutral, sad, grateful, energetic, peaceful, inspired",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    return completion.choices[0].message.content?.trim().toLowerCase() || "neutral";
  } catch (error) {
    console.error("Error analyzing emotion:", error);
    return "neutral";
  }
}
