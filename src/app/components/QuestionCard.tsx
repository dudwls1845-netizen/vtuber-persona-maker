"use client";

import { motion } from "framer-motion";

interface Option {
  text: string;
  internal_trait: string;
  display_trait: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface Props {
  question: Question;
  onSelect: (internal: string, display: string) => void;
  direction: number;
}

export default function QuestionCard({ question, onSelect, direction }: Props) {
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.4 }
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }}
      className="w-full max-w-xl bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
    >
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-8 md:mb-10 leading-relaxed break-keep text-center">
        {question.question}
      </h2>

      <div className="flex flex-col gap-4">
        {question.options.map((option, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.internal_trait, option.display_trait)}
            className="w-full text-left p-4 md:p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group relative"
          >
            <p className="text-sm md:text-base text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed break-keep relative z-10 font-medium">
              {option.text}
            </p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
