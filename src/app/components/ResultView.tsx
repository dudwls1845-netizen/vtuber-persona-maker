"use client";

import { motion } from "framer-motion";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface PersonaData {
  character_name: string;
  lore: string;
  image_prompt: string;
  music_genre: string;
  shorts_script: string;
}

interface Props {
  data: PersonaData;
}

export default function ResultView({ data }: Props) {
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedMusic, setCopiedMusic] = useState(false);
  const [copiedShorts, setCopiedShorts] = useState(false);
  const [showShorts, setShowShorts] = useState(false);

  const copyToClipboard = async (text: string, type: "image" | "music" | "shorts") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "image") {
        setCopiedImage(true);
        toast.success("✨ AI 이미지 프롬프트가 마법처럼 복사되었습니다!");
        setTimeout(() => setCopiedImage(false), 2000);
      } else if (type === "music") {
        setCopiedMusic(true);
        toast.success("🎵 음악 프롬프트가 복사되었습니다!");
        setTimeout(() => setCopiedMusic(false), 2000);
      } else {
        setCopiedShorts(true);
        toast.success("📝 유튜브 쇼츠 대본 복사 완료!");
        setTimeout(() => setCopiedShorts(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col items-center max-w-4xl w-full space-y-6 md:space-y-8 bg-white rounded-3xl p-6 md:p-14 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden text-left mx-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="w-full text-center mb-2 md:mb-4 px-2"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center break-keep leading-tight">
          {data.character_name}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-8"
      >
        <h2 className="text-xs md:text-sm uppercase tracking-widest text-gray-400 mb-3 md:mb-4 font-semibold">World Lore</h2>
        <p className="text-base md:text-xl text-gray-800 leading-relaxed font-serif break-keep">
          {data.lore}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
      >
        {/* Image Prompt Section */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 hover:shadow-md transition-all">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between">
              Image Prompt
            </h3>
            <p className="text-xs text-gray-500 font-mono mb-6 line-clamp-4 leading-relaxed">
              {data.image_prompt}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(data.image_prompt, "image")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all font-medium text-sm mt-auto"
          >
            {copiedImage ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copiedImage ? "Copied!" : "🎨 영문 프롬프트 복사"}
          </button>
        </div>

        {/* Music Genre Section */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 hover:shadow-md transition-all">
          <div>
             <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between">
              Suno Music Prompt
            </h3>
            <p className="text-xs text-gray-500 font-mono mb-6 leading-relaxed">
              {data.music_genre}
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(data.music_genre, "music")}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-all font-medium text-sm mt-auto"
          >
             {copiedMusic ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
             {copiedMusic ? "Copied!" : "음악 프롬프트 복사"}
          </button>
        </div>
      </motion.div>

      {/* Shorts Script Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="w-full mt-6"
      >
        <button
          onClick={() => setShowShorts(!showShorts)}
          className="w-full py-4 px-4 md:px-6 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-between shadow-sm group"
        >
          <span className="text-sm md:text-base text-gray-900 font-semibold flex items-center gap-2 md:gap-3">
            <span className="text-lg md:text-xl">🎥</span> 데뷔용 쇼츠 대본 보기
          </span>
          <span className={`text-gray-400 transform transition-transform duration-300 ${showShorts ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {/* Expanded Script Area */}
        <motion.div
           initial={false}
           animate={{ height: showShorts ? "auto" : 0, opacity: showShorts ? 1 : 0 }}
           transition={{ duration: 0.4, ease: "easeInOut" }}
           className="overflow-hidden"
        >
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
             <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm md:text-base break-keep">
               {data.shorts_script}
             </p>
             <button
               onClick={() => copyToClipboard(data.shorts_script, "shorts")}
               className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white hover:bg-gray-800 transition-all font-medium text-sm self-end max-w-[200px]"
             >
                {copiedShorts ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copiedShorts ? "Copied!" : "대본 복사하기"}
             </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
