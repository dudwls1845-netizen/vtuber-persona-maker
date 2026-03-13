"use client";

import { useState } from "react";
import SurveyContainer, { AnswerPayload } from "./components/SurveyContainer";
import AudioRecorder from "./components/AudioRecorder";
import ResultView, { PersonaData } from "./components/ResultView";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [displayTraits, setDisplayTraits] = useState<string[]>([]);
  const [internalTraits, setInternalTraits] = useState<string[]>([]);
  
  const [phase, setPhase] = useState<"survey" | "results" | "audio" | "final">("survey");
  
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSurveyComplete = (payload: AnswerPayload) => {
    setDisplayTraits(payload.displayTraits);
    setInternalTraits(payload.internalTraits);
    setPhase("results");
  };

  const handleAudioComplete = async (voiceTrait: string) => {
    setIsGenerating(true);
    setPhase("final");

    try {
      const response = await fetch("/api/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalTraits, voiceTrait }),
      });

      const data = await response.json();
      if (data.success && data.persona) {
        setPersonaData(data.persona);
      } else {
        console.error("Failed to generate persona:", data.error);
        setErrorMessage(data.error || "API 호출 실패: 에러를 확인하세요.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden bg-black selection:bg-purple-500/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-[150px] opacity-60 animate-blob"></div>
        <div className="absolute top-[30%] right-[10%] w-96 h-96 bg-pink-900/20 rounded-full mix-blend-screen filter blur-[150px] opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[20%] left-[30%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "survey" && (
          <SurveyContainer key="survey" onComplete={handleSurveyComplete} />
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center max-w-2xl w-full text-center space-y-10 glass-panel rounded-3xl p-10 md:p-14 border border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent -z-10 pointer-events-none"></div>

            <div className="space-y-4 relative z-10 w-full">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-2xl md:text-3xl font-medium text-gray-300 tracking-wider font-serif"
              >
                당신의 영혼을 구성하는 키워드
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="pt-6 pb-2"
              >
                <p className="text-3xl md:text-4xl font-light leading-relaxed text-white drop-shadow-lg">
                  {displayTraits.map((trait, index) => (
                    <span key={index}>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 font-semibold tracking-wide">
                        {trait}
                      </span>
                      {index < displayTraits.length - 1 && (
                        <span className="text-gray-500 mx-2 font-thin">·</span>
                      )}
                    </span>
                  ))}
                </p>
              </motion.div>
            </div>
            
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.5, duration: 1.5 }}
               className="pt-10 w-full"
            >
              <button 
                onClick={() => setPhase("audio")}
                className="relative overflow-hidden px-10 py-4 rounded-full bg-white/5 border border-purple-500/30 font-medium tracking-wide text-gray-200 hover:text-white transition-all hover:bg-white/10 hover:border-purple-400 group"
              >
                <span className="relative z-10">다음 단계: 메아리 기록 (음성 분석)</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </motion.div>
          </motion.div>
        )}

        {phase === "audio" && (
          <AudioRecorder key="audio" onComplete={handleAudioComplete} />
        )}

        {phase === "final" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            {isGenerating ? (
               <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
                 <div className="relative w-16 h-16">
                   <div className="absolute inset-0 rounded-full border-[3px] border-t-transparent border-gray-300 animate-spin"></div>
                 </div>
                 <motion.p 
                   animate={{ opacity: [0.3, 1, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="text-lg md:text-xl text-gray-500 font-medium tracking-wide text-center leading-relaxed"
                 >
                   영혼과 공명할 <br /> 세계관을 구성하는 중입니다...
                 </motion.p>
               </div>
            ) : personaData ? (
               <ResultView data={personaData} />
            ) : (
               <div className="text-red-900 bg-red-50 border border-red-200 p-6 rounded-2xl w-full max-w-lg text-center font-medium">
                 {errorMessage}
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
