"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import QuestionCard from "./QuestionCard";

export const QUESTIONS = [
  {
    "id": 1,
    "question": "끝없는 모험에 지친 당신, 눈앞에 쉴 수 있는 두 공간이 나타났습니다. 당신의 발걸음이 향하는 곳은?",
    "options": [
      { "text": "음유시인의 흥겨운 노래와 모험가들의 무용담이 시끌벅적하게 오가는 밝은 주점.", "internal_trait": "E", "display_trait": "열정" },
      { "text": "단 하나의 촛불만이 켜져 있는, 먼지 쌓인 책들로 가득한 고요한 마법사의 서재.", "internal_trait": "I", "display_trait": "신중" }
    ]
  },
  {
    "id": 2,
    "question": "고대 유적의 미궁 속, 길을 잃었습니다. 당신은 무엇을 믿고 나아갈 것인가요?",
    "options": [
      { "text": "벽에 새겨진 발자국, 이끼의 방향, 그리고 손에 쥐어진 낡은 지도의 정확한 좌표.", "internal_trait": "S", "display_trait": "꼼꼼" },
      { "text": "논리로는 설명할 수 없지만, 우주 저 너머에서 들려오는 듯한 기묘한 왈츠 선율과 나의 직감.", "internal_trait": "N", "display_trait": "창의" }
    ]
  },
  {
    "id": 3,
    "question": "길을 걷다, 치명적인 오류를 저질러 사람들에게 버려진 낡고 망가진 골렘을 발견했습니다.",
    "options": [
      { "text": "골렘의 동력원을 분석하고 해체하여, 내 무기를 강화하는 데 유용한 부품으로 재활용한다.", "internal_trait": "T", "display_trait": "냉철" },
      { "text": "어쩐지 나와 닮은 것 같아 마음이 쓰인다. 어떻게든 부품을 기워 맞춰 다시 움직일 수 있게 수리해 본다.", "internal_trait": "F", "display_trait": "공감" }
    ]
  },
  {
    "id": 4,
    "question": "내일, 당신은 세상을 위협하는 거대한 드래곤과 전투를 치러야 합니다. 당신의 오늘 밤은?",
    "options": [
      { "text": "무기를 손질하고, 지형도를 외우며, 만약의 사태를 대비한 A, B, C 플랜을 철저히 세운다.", "internal_trait": "J", "display_trait": "체계" },
      { "text": "일단 푹 잔다. 전장은 항상 변하는 법, 내일 현장에서 내 임기응변과 본능에 맡긴다.", "internal_trait": "P", "display_trait": "유연" }
    ]
  },
  {
    "id": 5,
    "question": "절대적인 힘을 가진 마왕 바알이 당신에게 손을 내밉니다. \"이 썩어빠진 세상을 부수자.\"",
    "options": [
      { "text": "그의 손을 쳐낸다. 인간이 서툴더라도, 나는 기꺼이 이 세상을 지키는 방패가 되겠다.", "internal_trait": "Good", "display_trait": "수호" },
      { "text": "그의 손을 잡는다. 때로는 세상을 고치기 위해 철저한 악당이 되어 모든 것을 뒤엎을 필요도 있으니까.", "internal_trait": "Evil", "display_trait": "변혁" }
    ]
  }
];

export interface AnswerPayload {
  internalTraits: string[];
  displayTraits: string[];
}

export default function SurveyContainer({ onComplete }: { onComplete: (payload: AnswerPayload) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalTraits, setInternalTraits] = useState<string[]>([]);
  const [displayTraits, setDisplayTraits] = useState<string[]>([]);
  const [direction, setDirection] = useState(1);

  const handleSelect = (internal: string, display: string) => {
    setInternalTraits((prev) => [...prev, internal]);
    setDisplayTraits((prev) => [...prev, display]);
    
    if (currentIndex < QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete({
        internalTraits: [...internalTraits, internal],
        displayTraits: [...displayTraits, display]
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 md:px-0">
      
      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-8 md:mb-12">
        <div className="flex justify-between text-xs md:text-sm font-semibold text-gray-400 mb-2 px-1 uppercase tracking-wider">
          <span>운명의 질문 {currentIndex + 1}</span>
          <span>{QUESTIONS.length}</span>
        </div>
        <div className="flex gap-2">
          {QUESTIONS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                i <= currentIndex ? "w-16 bg-black" : "w-8 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <QuestionCard 
          key={currentIndex}
          question={QUESTIONS[currentIndex]}
          onSelect={handleSelect}
          direction={direction}
        />
      </AnimatePresence>
    </div>
  );
}
