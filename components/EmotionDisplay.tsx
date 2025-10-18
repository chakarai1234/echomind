"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Heart, Zap, Coffee, Star, Sun } from "lucide-react";

interface EmotionDisplayProps {
  emotion: string;
}

const emotionConfig: Record<
  string,
  { icon: React.ElementType; color: string; label: string; bgGradient: string }
> = {
  happy: {
    icon: Smile,
    color: "text-yellow-500",
    label: "Happy",
    bgGradient: "from-yellow-400 to-orange-400",
  },
  excited: {
    icon: Zap,
    color: "text-orange-500",
    label: "Excited",
    bgGradient: "from-orange-400 to-red-400",
  },
  neutral: {
    icon: Meh,
    color: "text-blue-500",
    label: "Neutral",
    bgGradient: "from-blue-400 to-cyan-400",
  },
  sad: {
    icon: Frown,
    color: "text-gray-500",
    label: "Sad",
    bgGradient: "from-gray-400 to-slate-400",
  },
  grateful: {
    icon: Heart,
    color: "text-pink-500",
    label: "Grateful",
    bgGradient: "from-pink-400 to-rose-400",
  },
  energetic: {
    icon: Coffee,
    color: "text-orange-500",
    label: "Energetic",
    bgGradient: "from-orange-400 to-amber-400",
  },
  peaceful: {
    icon: Sun,
    color: "text-green-500",
    label: "Peaceful",
    bgGradient: "from-green-400 to-emerald-400",
  },
  inspired: {
    icon: Star,
    color: "text-indigo-500",
    label: "Inspired",
    bgGradient: "from-indigo-400 to-violet-400",
  },
};

export default function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  const [recentEmotions, setRecentEmotions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = emotionConfig[emotion] || emotionConfig.neutral;
  const Icon = config.icon;

  useEffect(() => {
    const fetchRecentEmotions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/memories?userId=demo-user&recentEmotions=true");
        if (response.ok) {
          const data = await response.json();
          // Take up to 4 most recent unique emotions
          setRecentEmotions(data.emotions.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching recent emotions:", error);
        // Fallback to default if fetch fails
        setRecentEmotions(["happy", "excited", "neutral", "grateful"]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEmotions();
  }, []);

  return (
    <motion.div
      key={emotion}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
    >
      <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        Current Emotion
      </h3>

      <div className="flex flex-col items-center space-y-6">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={`p-8 bg-gradient-to-br ${config.bgGradient} rounded-full shadow-lg`}
        >
          <Icon className="w-20 h-20 text-white" />
        </motion.div>

        <div className="text-center">
          <h4 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {config.label}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            Based on voice tone analysis
          </p>
        </div>

        {/* Emotion History */}
        <div className="w-full pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Recent emotions:</p>
          <div className="flex justify-center space-x-3">
            {isLoading ? (
              <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
            ) : recentEmotions.length > 0 ? (
              recentEmotions.map((em) => {
                const emotionKey = em.toLowerCase();
                const EmIcon = emotionConfig[emotionKey]?.icon || emotionConfig.neutral.icon;
                const colorClass = emotionConfig[emotionKey]?.color || emotionConfig.neutral.color;

                return (
                  <motion.div
                    key={em}
                    whileHover={{ scale: 1.2 }}
                    title={emotionConfig[emotionKey]?.label || em}
                    className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${colorClass}`}
                  >
                    <EmIcon className="w-5 h-5" />
                  </motion.div>
                );
              })
            ) : (
              <div className="text-gray-400 dark:text-gray-500 text-sm">No recent emotions</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
