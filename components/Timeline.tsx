"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Smile, Coffee, Heart, Clock, MapPin } from "lucide-react";

interface Memory {
  id: string;
  timestamp: string;
  transcript: string;
  emotion: string;
  summary: string;
  location?: string;
}

const emotionIcons: Record<string, React.ElementType> = {
  happy: Smile,
  excited: Coffee,
  grateful: Heart,
  peaceful: Smile,
  neutral: Smile,
};

const emotionColors: Record<string, string> = {
  happy: "bg-yellow-100 text-yellow-700 border-yellow-300",
  excited: "bg-orange-100 text-orange-700 border-orange-300",
  grateful: "bg-pink-100 text-pink-700 border-pink-300",
  peaceful: "bg-green-100 text-green-700 border-green-300",
  neutral: "bg-blue-100 text-blue-700 border-blue-300",
};

export default function Timeline() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const today = format(new Date(), "yyyy-MM-dd");
        const response = await fetch(`/api/memories?userId=demo-user&date=${today}`);

        if (!response.ok) {
          throw new Error("Failed to fetch memories");
        }

        const data = await response.json();
        setMemories(data.memories || []);
      } catch (err) {
        console.error("Error fetching memories:", err);
        setError("Failed to load memories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Your Memory Timeline
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-gray-600 dark:text-gray-400">
            Loading your memories...
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400">{error}</div>
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            No memories recorded yet today. Start capturing your moments!
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-400 via-red-400 to-orange-400" />

          {/* Memory Cards */}
          <div className="space-y-8">
            {memories.map((memory, index) => {
            const EmotionIcon = emotionIcons[memory.emotion] || Smile;
            const emotionStyle = emotionColors[memory.emotion] || emotionColors.neutral;

            return (
              <motion.div
                key={memory.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                  className="absolute left-6 top-6 w-5 h-5 rounded-full bg-orange-500 border-4 border-white dark:border-gray-800 shadow-lg"
                />

                {/* Memory Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100 dark:border-gray-700">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg border-2 ${emotionStyle}`}
                      >
                        <EmotionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {memory.summary}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(memory.timestamp), "h:mm a")}</span>
                          {memory.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-4 h-4" />
                              <span>{memory.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {memory.transcript}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full font-medium">
                      #{memory.emotion}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      )}

      {/* Load More */}
      {!isLoading && !error && memories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Load Earlier Memories
          </button>
        </motion.div>
      )}
    </div>
  );
}
