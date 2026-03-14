"use client";

import { useState } from "react";
import SurveyContainer, { AnswerPayload } from "./components/SurveyContainer";
import AudioRecorder from "./components/AudioRecorder";
import ResultView, { PersonaData } from "./components/ResultView";
import { motion, AnimatePresence } from "framer-motion";

import { GoogleGenerativeAI } from "@google/generative-ai";

const ART_STYLES = [
  "지브리 스튜디오풍의 따뜻한 셀 애니메이션", 
  "어둡고 거친 다크 디스토피아", 
  "사이버펑크", 
  "90년대 레트로 애니메이션풍"
];

const SPECIES = [
  "인간", 
  "안드로이드", 
  "수인(동물 귀/꼬리)", 
  "정령"
];

const UNIQUE_LORE_QUIRKS = [
  "항상 무광 골드의 굵은 뿔테 안경을 끼고 다니는 결벽증이 있음",
  "인류가 꿈꿀 수 있는 마지막 장소에 멈춰야 하는 영구기관 기차의 기관사. 후계자를 찾고 있음",
  "버려진 잡동사니를 주워 생명력을 불어넣는 취미가 있음",
  "과거의 기억을 잃고 낡은 회중시계의 초침 소리에만 집착함"
];

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

function analyzeTraits(internalTraits: string[]) {
  const mbti = internalTraits.slice(0, 4).join("");
  const value = internalTraits[4] || "중립";
  return { mbti, value };
}

export default function Home() {
  const [displayTraits, setDisplayTraits] = useState<string[]>([]);
  const [internalTraits, setInternalTraits] = useState<string[]>([]);
  
  const [phase, setPhase] = useState<"survey" | "results" | "audio" | "final">("survey");
  
  const [personaData, setPersonaData] = useState<PersonaData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  const handleSurveyComplete = (payload: AnswerPayload) => {
    setDisplayTraits(payload.displayTraits);
    setInternalTraits(payload.internalTraits);
    setPhase("results");
  };

  const handleAudioComplete = async (voiceTrait: string) => {
    setIsGenerating(true);
    setPhase("final");

    try {
      const apiKey = apiKeyInput.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey || apiKey === "여기에_키_입력") {
        throw new Error("API 키가 입력되지 않았거나 NEXT_PUBLIC_GEMINI_API_KEY가 없습니다.");
      }

      const { mbti, value } = analyzeTraits(internalTraits);
      const selectedStyle = pickRandom(ART_STYLES);
      const selectedSpecies = pickRandom(SPECIES);
      const selectedQuirk = pickRandom(UNIQUE_LORE_QUIRKS);

      const characterPrompt = `
You are an expert anime character designer and VTuber lore writer. 
Generate a character based on the user's prompt. 
You must respond ONLY with a valid JSON document matching this exact schema:
{
  "character_name": "캐릭터의 매력적이고 직관적인 이름 (한글/영문 혼용 가능)",
  "lore": "캐릭터의 입체적인 성격과 히든 서사(과거, 집착 등)가 녹아든 몰입감 있는 세계관 요약 (3~4문장)",
  "image_prompt": "DALL-E 3, Stable Diffusion 등 어떤 이미지 생성 AI에 넣어도 작동하는 '범용 고해상도 캐릭터 시트 영문 프롬프트'. (--ar 9:16 같은 특정 툴 명령어 절대 금지)",
  "music_genre": "이 캐릭터의 숏폼 티저용 Suno API 배경음악 장르/무드 (영문, 예: Dark synthwave with heavy bass)",
  "shorts_script": "생성된 캐릭터의 성격과 세계관(Lore) 말투가 100% 반영된 15초짜리 유튜브 쇼츠 데뷔용 대본. [행동 지문]과 대사, 구독 유도 포함."
}

[User Profile & Traits]
이 유저의 MBTI는 ${mbti}이고 가치관은 ${value}이다. 목소리는 ${voiceTrait}하다. 이 성격을 바탕으로, [${selectedStyle}] 화풍으로 그려진 [${selectedSpecies}] 캐릭터를 만들어라. 서사에는 [${selectedQuirk}] 요소가 반영되어야 한다.

CRITICAL INSTRUCTION: Return ONLY standard JSON. Do not include markdown formatting (like \`\`\`json) or any other text before or after the JSON object.
`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const result = await model.generateContent(characterPrompt);
      const responseText = result.response.text();
      
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
      const cleanJsonString = jsonMatch ? jsonMatch[1] : responseText;
      
      const personaDataParsed = JSON.parse(cleanJsonString.trim());
      setPersonaData(personaDataParsed);

    } catch (error: any) {
      console.error("Gemini Client Error:", error);
      setErrorMessage(`생성 실패: ${error.message || "알 수 없는 에러가 발생했습니다."}`);
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
          <div key="survey" className="w-full flex w-full flex-col items-center">
            <div className="mb-4 flex flex-col items-center w-full max-w-sm gap-2 z-10">
              <label htmlFor="apiKey" className="text-gray-400 text-xs font-semibold tracking-wider">
                TEST API KEY (선택)
              </label>
              <input 
                id="apiKey"
                type="password"
                placeholder="키를 직접 입력하세요"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-white/5 border border-purple-500/30 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <SurveyContainer onComplete={handleSurveyComplete} />
          </div>
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
