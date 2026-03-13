"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2 } from "lucide-react";

const MOCK_VOICE_TRAITS = ["허스키한", "차분한 톤", "맑고 높은 톤", "시니컬하고 낮은 톤", "활기찬 애니메이션 톤"];

interface Props {
  onComplete: (voiceTrait: string) => void;
}

export default function AudioRecorder({ onComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (isRecording) {
      // Stop recording and process
      setIsRecording(false);
      setIsProcessing(true);
      
      // Simulate API processing delay
      setTimeout(() => {
        const randomTrait = MOCK_VOICE_TRAITS[Math.floor(Math.random() * MOCK_VOICE_TRAITS.length)];
        setIsProcessing(false);
        onComplete(randomTrait);
      }, 2500);
      
    } else {
      // Start recording
      setTimer(0);
      setIsRecording(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center max-w-sm w-full bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden text-center"
      >
        <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
          영혼의 메아리
        </h2>
        <p className="text-sm md:text-base text-gray-500 mb-10">
          당신의 목소리를 들려주세요 (Mock)
        </p>

        {/* Microphone Button Area */}
        <div className="relative flex items-center justify-center w-32 h-32 mb-8">
          {/* Animated rings when recording */}
          <AnimatePresence>
            {isRecording && (
            <>
              <motion.div
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full bg-red-100 rounded-full"
              />
              <motion.div
                initial={{ opacity: 0.8, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-full h-full bg-red-50 rounded-full"
              />
            </>
            )}
          </AnimatePresence>

          {/* Record/Stop Button */}
          {!isProcessing && (
            <button
              onClick={handleToggleRecord}
              disabled={isProcessing}
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md group border cursor-pointer"
            >
              {isRecording ? (
                <div className="w-8 h-8 bg-red-500 rounded-sm" />
              ) : (
                <Mic className="w-10 h-10 text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={1.5} />
              )}
            </button>
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-gray-800 animate-spin" />
            </div>
          )}
        </div>

        {/* Timer / Status Text */}
        <div className="h-8 flex items-center justify-center">
          {isProcessing ? (
            <p className="text-gray-500 font-medium tracking-wide animate-pulse">분석 중...</p>
          ) : isRecording ? (
            <p className="text-red-500 font-medium font-mono text-xl tracking-widest">
              {formatTime(timer)}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">버튼을 눌러 시작하기</p>
          )}
        </div>

      </motion.div>
    </div>
  );
}
