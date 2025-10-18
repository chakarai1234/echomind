"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Mic, Video, Sparkles } from "lucide-react";
import CapturePanel from "@/components/CapturePanel";
import Timeline from "@/components/Timeline";
import DailySummary from "@/components/DailySummary";

export default function Home() {
  const [activeView, setActiveView] = useState<"capture" | "timeline" | "summary">("capture");

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                EchoMind
              </h1>
            </div>

            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveView("capture")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === "capture"
                    ? "bg-orange-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Capture</span>
              </button>
              <button
                onClick={() => setActiveView("timeline")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === "timeline"
                    ? "bg-orange-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Timeline</span>
              </button>
              <button
                onClick={() => setActiveView("summary")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeView === "summary"
                    ? "bg-orange-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Summary</span>
              </button>
            </nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === "capture" && <CapturePanel />}
          {activeView === "timeline" && <Timeline />}
          {activeView === "summary" && <DailySummary />}
        </motion.div>
      </div>
    </main>
  );
}
