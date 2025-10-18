"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Sparkles,
  TrendingUp,
  Heart,
  Zap,
  Brain,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface SummaryData {
  date: string;
  overall_mood: string;
  key_themes: string[];
  highlights: string[];
  emotion_breakdown: Record<string, number>;
  ai_insight: string;
  memories_count: number;
}

export default function DailySummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async (regenerate: boolean = false, isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      if (regenerate) setIsRegenerating(true);

      const today = format(new Date(), "yyyy-MM-dd");
      const url = `/api/summary?userId=demo-user&date=${today}${regenerate ? "&regenerate=true" : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Check if there's a message indicating no memories
      if (!data.summary && data.message) {
        console.log(data.message);
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error("Error fetching summary:", err);
      setError(err.message || "Failed to load summary. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch once when component mounts
    fetchSummary();
  }, []);

  const getTopEmotion = (emotionBreakdown: Record<string, number>) => {
    if (!emotionBreakdown) return "Neutral";
    const entries = Object.entries(emotionBreakdown);
    if (entries.length === 0) return "Neutral";
    const [topEmotion] = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
    return topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1);
  };

  const calculatePositivityTrend = (emotionBreakdown: Record<string, number>) => {
    if (!emotionBreakdown) return { percentage: 0, label: "Neutral" };

    // Define positive and negative emotions with weights
    const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'inspired'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'stressed', 'frustrated'];

    let positiveScore = 0;
    let negativeScore = 0;

    Object.entries(emotionBreakdown).forEach(([emotion, percentage]) => {
      const lowerEmotion = emotion.toLowerCase();
      if (positiveEmotions.includes(lowerEmotion)) {
        positiveScore += percentage;
      } else if (negativeEmotions.includes(lowerEmotion)) {
        negativeScore += percentage;
      }
    });

    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) return { percentage: 0, label: "Neutral" };

    const positivityPercentage = Math.round((positiveScore / totalScore) * 100);
    const trend = positivityPercentage > 60 ? '+' : positivityPercentage < 40 ? '-' : '';

    return {
      percentage: Math.abs(positivityPercentage - 50),
      label: positivityPercentage > 60 ? "Positive" : positivityPercentage < 40 ? "Negative" : "Balanced",
      trend
    };
  };

  const calculateEnergyLevel = (emotionBreakdown: Record<string, number>) => {
    if (!emotionBreakdown) return "Medium";

    // Define energy levels for different emotions
    const highEnergyEmotions = ['excited', 'energetic', 'happy', 'inspired'];
    const lowEnergyEmotions = ['sad', 'peaceful', 'neutral', 'tired'];

    let highEnergyScore = 0;
    let lowEnergyScore = 0;

    Object.entries(emotionBreakdown).forEach(([emotion, percentage]) => {
      const lowerEmotion = emotion.toLowerCase();
      if (highEnergyEmotions.includes(lowerEmotion)) {
        highEnergyScore += percentage;
      } else if (lowEnergyEmotions.includes(lowerEmotion)) {
        lowEnergyScore += percentage;
      }
    });

    const totalScore = highEnergyScore + lowEnergyScore;
    if (totalScore === 0) return "Medium";

    const energyPercentage = (highEnergyScore / totalScore) * 100;

    if (energyPercentage > 60) return "High";
    if (energyPercentage < 40) return "Low";
    return "Medium";
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">
            Generating your daily summary...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <button
            onClick={() => fetchSummary()}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            No memories recorded yet today. Start capturing moments to generate your daily summary!
          </div>
        </div>
      </div>
    );
  }

  const topEmotion = getTopEmotion(summary.emotion_breakdown);
  const positivityTrend = calculatePositivityTrend(summary.emotion_breakdown);
  const energyLevel = calculateEnergyLevel(summary.emotion_breakdown);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Daily Summary
            </h2>
            {isRefreshing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mb-2"
              >
                <RefreshCw className="w-5 h-5 text-orange-500" />
              </motion.div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {format(new Date(summary.date), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchSummary(true)}
            disabled={isRegenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white"
        >
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{summary.memories_count}</div>
          <div className="text-sm opacity-90">Memories Captured</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <Heart className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{topEmotion}</div>
          <div className="text-sm opacity-90">Top Emotion</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl p-6 text-white"
        >
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">
            {positivityTrend.trend}{positivityTrend.percentage}%
          </div>
          <div className="text-sm opacity-90">{positivityTrend.label}</div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white"
        >
          <Zap className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold mb-1">{energyLevel}</div>
          <div className="text-sm opacity-90">Energy Level</div>
        </motion.div>
      </div>

      {/* AI Insight */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-orange-900 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-700"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-orange-600 rounded-xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            AI Insight
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
          {summary.ai_insight}
        </p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Key Highlights */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center space-x-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Today's Highlights
            </h3>
          </div>
          <ul className="space-y-4">
            {summary.highlights.map((highlight, index) => (
              <motion.li
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="mt-1 w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{highlight}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Emotion Breakdown */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            Emotion Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(summary.emotion_breakdown).map(([emotion, percentage], index) => (
              <motion.div
                key={emotion}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                    {emotion}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">{percentage}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Key Themes */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Key Themes
        </h3>
        <div className="flex flex-wrap gap-3">
          {summary.key_themes.map((theme, index) => (
            <motion.span
              key={theme}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1 + index * 0.1, type: "spring" }}
              className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-700 dark:text-orange-300 rounded-full font-medium"
            >
              {theme}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
