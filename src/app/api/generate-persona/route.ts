import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Helper to pick random item
const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// Transform internal traits into MBTI and Values
function analyzeTraits(internalTraits: string[]) {
  // Simplified logic based on provided inputs: [E/I, S/N, T/F, J/P, Good/Evil]
  const mbti = internalTraits.slice(0, 4).join("");
  const value = internalTraits[4] || "중립";
  return { mbti, value };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { internalTraits, voiceTrait } = body;

    if (!internalTraits || !voiceTrait) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { mbti, value } = analyzeTraits(internalTraits);
    
    // Hidden Variable Roulette
    const selectedStyle = pickRandom(ART_STYLES);
    const selectedSpecies = pickRandom(SPECIES);
    const selectedQuirk = pickRandom(UNIQUE_LORE_QUIRKS);

    // Compose Final Prompt for LLM
    const characterPrompt = `이 유저의 MBTI는 ${mbti}이고 가치관은 ${value}이다. 목소리는 ${voiceTrait}하다. 이 성격을 바탕으로, [${selectedStyle}] 화풍으로 그려진 [${selectedSpecies}] 캐릭터를 만들어라. 서사에는 [${selectedQuirk}] 요소가 반영되어야 한다.`;

    console.log("\n--- [Phase 3] Sending Prompt Payload to Gemini ---");
    console.log(characterPrompt);
    console.log("--------------------------------------------------\n");

    const systemInstruction = `
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
`;

    let personaData;
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "여기에_키_입력") {
        throw new Error("GEMINI_API_KEY is not configured properly in .env.local");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction,
        generationConfig: { responseMimeType: "application/json" } 
      });

      const result = await model.generateContent(characterPrompt);

      const responseText = result.response.text();
      
      // Robust Parsing: Safely strip markdown code blocks (```json ... ```) if Gemini includes them
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
      const cleanJsonString = jsonMatch ? jsonMatch[1] : responseText;
      
      // Attempt parse
      personaData = JSON.parse(cleanJsonString.trim());
    } catch (apiError: any) {
      console.error("Gemini API Error (Fallback to Mock):", apiError);
      
      // Fallback Mock Data so the frontend UI can still be tested even if the API Key has quota issues (429)
      personaData = {
        character_name: "루미나 에테르 (Lumina Aether)",
        lore: `과거의 기억을 잃은 채 낡은 회중시계의 초침 소리에만 의존하며 세계를 유랑하는 정령. 인간의 감정을 이해하지 못해 차가워 보이지만, 사실 누구보다도 잃어버린 온기를 되찾고 싶어 한다. 안경 너머로 세상을 관찰하며, 매일 밤 부서진 부품들을 조립해 새로운 생명을 불어넣는 의식을 치른다.`,
        image_prompt: `A beautiful anime spirit VTuber, silver glowing hair, wearing matte gold thick-rimmed glasses, holding a glowing antique pocket watch, dark dystopian background, highly detailed, masterpieces, 8k resolution, cinematic lighting`,
        music_genre: `Melancholic classical piano with dark synthwave undertones and heavy bass`,
        shorts_script: `[시계 초침 소리가 째깍거린다. 안경을 밀어올리며 카메라를 무심하게 응시하는 루미나]\n루미나: "...당신도, 고장 난 시간을 살아가는 사람인가요?"\n[주머니에서 빛나는 회중시계를 꺼내 보여준다]\n루미나: "상관없어요. 내가 다시 조립해줄 테니까. 당신의 잃어버린 시간, 나 루미나 에테르와 함께 찾고 싶다면... 구독, 해두는 게 좋을 거예요."\n[차가운 미소를 지으며 시계를 닫는다]`
      };
    }

    return NextResponse.json({ 
      success: true, 
      promptPayload: characterPrompt,
      persona: personaData,
      metadata: {
        mbti,
        value,
        style: selectedStyle,
        species: selectedSpecies,
        quirk: selectedQuirk,
        voice: voiceTrait
      }
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
