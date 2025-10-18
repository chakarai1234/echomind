"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, StopCircle, Play, Save, Camera } from "lucide-react";
import EmotionDisplay from "./EmotionDisplay";
import WebcamCapture from "./WebcamCapture";

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  transcript: string;
  emotion: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CapturePanel() {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    transcript: "",
    emotion: "neutral",
  });
  const [showWebcam, setShowWebcam] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ today: 0, week: 0 });
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  const [speechRecognitionAvailable, setSpeechRecognitionAvailable] = useState(false);
  const [conversationMode, setConversationMode] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(Date.now());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationStartTimeRef = useRef<string | null>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsLiveTranscribing(true);
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result received');
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          fullTranscriptRef.current += finalTranscript;
          setLastSpeechTime(Date.now());
        }

        // Update transcript but keep conversation history visible
        const displayTranscript = fullTranscriptRef.current + interimTranscript;
        setRecordingState((prev) => ({ ...prev, transcript: displayTranscript }));

        // In conversation mode, reset silence timer when user speaks
        if (conversationMode && (finalTranscript || interimTranscript)) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Start 3-second silence detection
          if (finalTranscript && !isAiSpeaking) {
            console.log('🕐 Starting 3-second silence timer...');
            silenceTimerRef.current = setTimeout(() => {
              console.log('⏰ 3 seconds elapsed, triggering AI response');
              handleSilenceDetected();
            }, 3000);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        // Don't show alert for audio-capture errors as MediaRecorder is already using the mic
        if (event.error === 'not-allowed' && !mediaRecorderRef.current) {
          alert('Microphone access denied. Please allow microphone access for live transcription.');
        }
        // Silently ignore 'audio-capture' and 'aborted' errors as they're expected
        // when MediaRecorder and SpeechRecognition share the microphone
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsLiveTranscribing(false);
      };

      recognitionRef.current = recognition;
      setSpeechRecognitionAvailable(true);
    } else {
      console.warn('Web Speech API not supported in this browser');
      setSpeechRecognitionAvailable(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition on cleanup:', e);
        }
      }
    };
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats?userId=demo-user");
      if (response.ok) {
        const data = await response.json();
        setStats({ today: data.today, week: data.week });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSilenceDetected = async () => {
    if (!fullTranscriptRef.current.trim() || isAiSpeaking) {
      console.log('Skipping silence handler:', {
        hasTranscript: !!fullTranscriptRef.current.trim(),
        isAiSpeaking
      });
      return;
    }

    console.log('✅ Silence detected, getting AI response...');
    console.log('User message:', fullTranscriptRef.current.trim());

    const userMessage = fullTranscriptRef.current.trim();

    // Clear current transcript immediately
    fullTranscriptRef.current = "";
    setRecordingState(prev => ({ ...prev, transcript: "" }));

    try {
      setIsAiSpeaking(true);

      // Add user message to conversation
      const userMsg: ConversationMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };

      // Update both state and ref
      conversationHistoryRef.current = [...conversationHistoryRef.current, userMsg];
      setConversationHistory(conversationHistoryRef.current);
      console.log('Adding user message to history');

      // Get AI response using the current history (excluding the user message we just added)
      console.log('Calling conversation API with history length:', conversationHistoryRef.current.length - 1);
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userMessage,
          conversationHistory: conversationHistoryRef.current.slice(0, -1) // Don't include the user message we just added
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const aiResponse = data.response;
      console.log('AI response:', aiResponse);

      // Add AI response to conversation
      const aiMsg: ConversationMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      // Update both state and ref
      conversationHistoryRef.current = [...conversationHistoryRef.current, aiMsg];
      setConversationHistory(conversationHistoryRef.current);
      console.log('Adding AI response to history');

      // Speak the AI response
      console.log('Speaking AI response...');
      await speakText(aiResponse);
      console.log('Done speaking');

    } catch (error) {
      console.error('❌ Error getting AI response:', error);
    } finally {
      setIsAiSpeaking(false);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = () => {
          console.error('Speech synthesis error');
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Reset and start live transcription
      fullTranscriptRef.current = "";
      setRecordingState((prev) => ({ ...prev, isRecording: true, duration: 0, transcript: "" }));

      // Start speech recognition after a short delay to avoid conflicts
      if (recognitionRef.current) {
        setTimeout(() => {
          try {
            console.log('Starting speech recognition...');
            recognitionRef.current.start();
          } catch (error: any) {
            console.error("Speech recognition start error:", error);
            if (error.message && error.message.includes('already started')) {
              console.log('Recognition already started, stopping and restarting...');
              recognitionRef.current.stop();
              setTimeout(() => {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.error('Failed to restart recognition:', e);
                }
              }, 100);
            }
          }
        }, 500);
      } else {
        console.warn('Speech recognition not initialized');
      }

      timerRef.current = setInterval(() => {
        setRecordingState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow microphone access to record.");
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      // Stop live transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Speech recognition stop error:", error);
        }
      }

      setRecordingState((prev) => ({ ...prev, isRecording: false }));

      // Save conversation if in conversation mode
      if (conversationMode && conversationHistoryRef.current.length > 0) {
        try {
          const response = await fetch('/api/conversations/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: 'demo-user',
              startedAt: conversationStartTimeRef.current,
              endedAt: new Date().toISOString(),
              messages: conversationHistoryRef.current
            })
          });

          if (response.ok) {
            console.log('Conversation saved successfully');
          }
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsSaving(true);
    try {
      // Use the live transcript if available, otherwise transcribe via API
      let finalTranscript = fullTranscriptRef.current.trim();
      let emotion = recordingState.emotion;

      // If we have a live transcript, just analyze emotion
      if (finalTranscript) {
        // Analyze emotion from live transcript
        const emotionResponse = await fetch("/api/analyze-emotion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: finalTranscript }),
        });

        if (emotionResponse.ok) {
          const { emotion: detectedEmotion } = await emotionResponse.json();
          emotion = detectedEmotion;
        }
      } else {
        // Fallback to Whisper transcription if live transcript failed
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const transcribeResponse = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!transcribeResponse.ok) {
          throw new Error("Failed to transcribe audio");
        }

        const { transcript, emotion: detectedEmotion } = await transcribeResponse.json();
        finalTranscript = transcript;
        emotion = detectedEmotion;
      }

      setRecordingState((prev) => ({
        ...prev,
        transcript: finalTranscript,
        emotion,
      }));

      // Save to Supabase
      const memoryData = {
        userId: "demo-user", // Replace with actual user ID from auth
        transcript: finalTranscript,
        emotion,
      };

      const saveResponse = await fetch("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memoryData),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save memory");
      }

      console.log("Memory saved successfully!");

      // Refresh stats after saving memory
      await fetchStats();
    } catch (error) {
      console.error("Error processing audio:", error);
      alert("Failed to process recording. Please check your API keys and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Panel - Recording Controls */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
            Capture Your Moment
          </h2>

          {/* Webcam Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowWebcam(!showWebcam)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{showWebcam ? "Hide" : "Show"} Webcam</span>
            </button>
          </div>

          {/* Webcam Feed */}
          {showWebcam && <WebcamCapture isRecording={recordingState.isRecording} />}

          {/* Recording Timer */}
          <div className="my-8 text-center">
            <div className="text-5xl font-mono font-bold text-gray-800 dark:text-white">
              {formatDuration(recordingState.duration)}
            </div>
            {recordingState.isRecording && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-4 w-4 h-4 bg-red-500 rounded-full mx-auto"
              />
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center space-x-4">
            {!recordingState.isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Mic className="w-6 h-6" />
                <span className="font-semibold">Start Recording</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="flex items-center space-x-2 px-8 py-4 bg-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <StopCircle className="w-6 h-6" />
                <span className="font-semibold">Stop Recording</span>
              </motion.button>
            )}
          </div>

          {/* Saving Indicator */}
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-orange-600 dark:text-orange-400"
            >
              <div className="animate-pulse">Processing your memory...</div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right Panel - Transcript & Emotion */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="space-y-6"
      >
        {/* Emotion Display */}
        <EmotionDisplay emotion={recordingState.emotion} />

        {/* Transcript / Conversation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {conversationMode ? "Conversation" : "Live Transcript"}
            </h3>
            {recordingState.isRecording && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center space-x-2 text-orange-600 dark:text-orange-400"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm font-medium">
                  {isAiSpeaking ? "AI Speaking..." : "Listening..."}
                </span>
              </motion.div>
            )}
          </div>
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
            {conversationMode && conversationHistory.length > 0 ? (
              <>
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recordingState.transcript && !isAiSpeaking && (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] p-3 rounded-lg bg-orange-300 text-gray-800">
                      <p className="text-sm leading-relaxed italic">{recordingState.transcript}</p>
                    </div>
                  </div>
                )}
              </>
            ) : recordingState.transcript ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {recordingState.transcript}
              </p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">
                {conversationMode
                  ? "Enable conversation mode and start recording to chat with AI..."
                  : "Start recording to see your live transcript here..."}
              </p>
            )}
          </div>
          {conversationMode && recordingState.isRecording && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              AI will respond after 3 seconds of silence
            </div>
          )}
          {!conversationMode && recordingState.transcript && recordingState.isRecording && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Transcribing in real-time using Web Speech API
            </div>
          )}
          {!speechRecognitionAvailable && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Live transcription is not available in this browser.
                Please use Chrome, Edge, or Safari for the best experience.
                Your recording will still be transcribed after you stop.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.today}</div>
            <div className="text-sm opacity-90">Memories Today</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">{stats.week}</div>
            <div className="text-sm opacity-90">This Week</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
