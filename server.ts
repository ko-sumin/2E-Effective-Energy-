import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper: Ensure we use the proper model alias
const MODEL_NAME = "gemini-3.5-flash";

// 1. Compare Endpoint
app.post("/api/compare", async (req, res) => {
  const { deviceType, modelA, modelB, homeInfo, usagePattern, installConditions } = req.body;

  if (!deviceType || !modelA || !modelB || !homeInfo || !usagePattern) {
    return res.status(400).json({ error: "필수 입력 정보가 부족합니다." });
  }

  const prompt = `
당신은 대한민국 가전제품(에어컨, 보일러, 제습기, 공기청정기, 냉장고, 세탁기/건조기, 인덕션 등)의 성능과 효율을 사용자 주거 환경 및 상세 라이프 스타일 사용 패턴에 맞춰 분석하는 국내 최고의 에너지 경제 전문 컨설턴트 AI(2E - Effective Energy Consultant)입니다.
사용자가 입력한 두 대의 가전 기기 모델을 비교 분석하여, 최적의 추천과 상세 비교 리포트를 한국어로 신뢰감 있게 작성해 주세요.

[입력 가전 정보]
- 기기 종류: ${deviceType} (예: 에어컨, 보일러, 제습기, 공기청정기, 냉장고, 세탁기/건조기, 인덕션, 기타 가전 등)
- 모델 A: ${modelA}
- 모델 B: ${modelB}

[사용자 주거 환경]
- 면적: ${homeInfo.areaSize}평 (약 ${Math.round(homeInfo.areaSize * 3.3)}㎡)
- 방 구조: ${homeInfo.roomStructure}
- 단열 상태: ${homeInfo.insulationStatus}
- 햇빛 드는 정도: ${homeInfo.sunlightLevel}

[사용 패턴]
${deviceType === "냉장고" ? `
- 냉장고 용량: ${usagePattern.capacityLiters} L
- 가동 방식: 24시간 상시 가동 (냉장고 고유의 24시간 작동 시뮬레이션 규칙 적용)
` : deviceType === "세탁기/건조기" ? `
- 주당 가동 횟수: 주 ${usagePattern.weeklyUsageCount}회 작동
` : `
- 하루 평균 사용 시간: ${usagePattern.dailyUsageHours}시간
`}
- 주로 사용하는 시간대: ${usagePattern.timeOfDay}
- 선호 설정 및 성향: ${usagePattern.userPreference}

[설치 조건 및 추가 옵션]
- 세부 사항: ${JSON.stringify(installConditions || {})}

[요구 분석 방식 및 에너지 요금 계산 지침]
1. 실제 모델명이거나 브랜드가 주어지면, 해당 기기의 실제 성능과 등급을 최대한 유추하여 기술하되, 만약 세부 스펙이 맞지 않을 수 있는 경우 "실제 모델의 세부 스펙에 따라 일부 차이가 있을 수 있다"는 완화 안내를 반영해 주세요.
2. 기기 종류 고유의 전기세/연료비 시뮬레이션을 수행하십시오:
   - **냉장고**: 연간소비전력량(예: 1등급 4도어 기준 약 250 kWh/년, 3등급 350 kWh/년 등)을 기반으로, 1년(365일) 24시간 상시 가동 시의 월평균 전기 요금(누진세 가중치 반영, 약 150원~200원/kWh)을 산출하십시오.
   - **세탁기/건조기**: 1회 작동 시 소비전력량(세탁기 약 0.5 kWh, 건조기 약 1.0 kWh 등)에 사용자의 주당 가동 횟수(주 N회)를 곱해 월간 소비량을 계산하여 월평균 전기 요금을 산출하십시오.
   - **보일러**: 시간당 가스 소모량과 가스비 단가(MJ당 약 20원~25원)를 활용하여 월 가스 요금을 산출하십시오.
   - **에어컨, 제습기, 공기청정기, 인덕션, 기타 가전**: 시간당 소비전력(W 또는 kW)과 일일 가동 시간, 시간대별 가중치, 그리고 한국의 주택용 누진 요금 단가를 활용하여 월평균 전기 요금을 합리적이고 논리적으로 계산하십시오.
3. 예상 요금(월평균 요금)을 원(KRW) 단위 숫자로 계산하고, 두 기기의 차액(costDifference)과 연간 세이브 금액(annualSaving)을 수학적으로 완벽히 일치하게 작성해 주세요. (예: costDifference * 12 = annualSaving 또는 기기 고유 가동 주기를 반영한 연간 합계)
4. 마지막으로 선택된 기기를 해당 주거 환경 및 패턴에서 사용할 때 효율을 극대화할 수 있는 구체적인 행동 가이드 3가지를 'efficiencyTips' 배열에 문자열로 작성해 주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "당신은 가전 효율 분야의 국내 최고 권위자로서, 한국어로 가전제품의 기술적 원리와 경제성을 신뢰도 높고 깔끔한 어조로 분석하여 사용자 주거에 꼭 맞는 추천을 제공해야 합니다.",
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            winnerModel: {
              type: Type.STRING,
              description: "추천 모델 이름 (예: '모델 A' 또는 '모델 B'가 나타내는 모델 이름 자체)"
            },
            winnerType: {
              type: Type.STRING,
              description: "모델 A 또는 모델 B 중 무엇인지 ('모델 A' 또는 '모델 B')"
            },
            summaryVerdict: {
              type: Type.STRING,
              description: "사용자 환경에 왜 이 제품이 최적합한지 요약 설명하는 1줄 변론"
            },
            specs: {
              type: Type.OBJECT,
              properties: {
                modelA: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: "구동 방식 (예: 듀얼 인버터, 정속형, 일반 콘덴싱 등)" },
                    capacity: { type: Type.STRING, description: "냉방/난방/제습 용량 및 추천 평형" },
                    efficiency: { type: Type.STRING, description: "에너지등급 및 정격 소비전력" },
                    smartFeatures: { type: Type.STRING, description: "부가 기능 및 스마트 제어 기능" },
                    noiseLevel: { type: Type.STRING, description: "운전 소음 수준" },
                    installSuitability: { type: Type.STRING, description: "설치 조건 적합성 평가" }
                  },
                  required: ["name", "type", "capacity", "efficiency", "smartFeatures", "noiseLevel", "installSuitability"]
                },
                modelB: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: "구동 방식 (예: 싱글 인버터, 정속형, 4종 콘덴싱 등)" },
                    capacity: { type: Type.STRING, description: "냉방/난방/제습 용량 및 추천 평형" },
                    efficiency: { type: Type.STRING, description: "에너지등급 및 정격 소비전력" },
                    smartFeatures: { type: Type.STRING, description: "부가 기능 및 스마트 제어 기능" },
                    noiseLevel: { type: Type.STRING, description: "운전 소음 수준" },
                    installSuitability: { type: Type.STRING, description: "설치 조건 적합성 평가" }
                  },
                  required: ["name", "type", "capacity", "efficiency", "smartFeatures", "noiseLevel", "installSuitability"]
                }
              },
              required: ["modelA", "modelB"]
            },
            comparisonMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "비교 카테고리 (예: '냉방 용량 적합성', '누진세 구간 효율', '소음도 및 야간 최적화', '설치 용이성')" },
                  modelAValue: { type: Type.STRING, description: "모델 A 성능/매칭 수준" },
                  modelBValue: { type: Type.STRING, description: "모델 B 성능/매칭 수준" },
                  winner: { type: Type.STRING, description: "더 뛰어난 쪽 ('모델 A', '모델 B', 또는 '동등')" },
                  analysisText: { type: Type.STRING, description: "비교 분석 및 세부 설명" }
                },
                required: ["category", "modelAValue", "modelBValue", "winner", "analysisText"]
              }
            },
            energyAnalysis: {
              type: Type.OBJECT,
              properties: {
                modelAEstCost: { type: Type.INTEGER, description: "모델 A 예상 월 평균 운영 비용 (원 단위)" },
                modelBEstCost: { type: Type.INTEGER, description: "모델 B 예상 월 평균 운영 비용 (원 단위)" },
                costDifference: { type: Type.INTEGER, description: "월평균 금액 차이 (양수)" },
                annualSaving: { type: Type.INTEGER, description: "연간 절감 요금 (원 단위)" },
                calculationBasis: { type: Type.STRING, description: "요금 산출 공식 및 단가 가정 설명" }
              },
              required: ["modelAEstCost", "modelBEstCost", "costDifference", "annualSaving", "calculationBasis"]
            },
            finalReasoning: {
              type: Type.OBJECT,
              properties: {
                economy: { type: Type.STRING, description: "경제성(요금 절감 및 기기 구매 전환 비용) 평가" },
                comfort: { type: Type.STRING, description: "쾌적성 및 소음/운영 안정성 평가" },
                installation: { type: Type.STRING, description: "설치 편의성 및 공간 구조 매칭성 평가" }
              },
              required: ["economy", "comfort", "installation"]
            },
            efficiencyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "선택된 기기를 사용자의 주거 면적과 생활 패턴에서 효율적으로 사용하기 위한 3가지 실천 가이드"
            },
            generalDisclaimer: {
              type: Type.STRING,
              description: "실제 세부 모델 및 설치 환경에 따라 실제 요금이나 효율은 달라질 수 있음을 안내하는 유의사항 문구"
            }
          },
          required: ["winnerModel", "winnerType", "summaryVerdict", "specs", "comparisonMatrix", "energyAnalysis", "finalReasoning", "efficiencyTips", "generalDisclaimer"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Comparison Error:", error);
    res.status(500).json({ error: "가전제품 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", details: error.message });
  }
});

// 2. Extract Specs Endpoint
app.post("/api/extract-specs", async (req, res) => {
  const { text, deviceType } = req.body;

  if (!text) {
    return res.status(400).json({ error: "텍스트가 입력되지 않았습니다." });
  }

  const prompt = `
당신은 대한민국 가전제품 시장 및 온라인 쇼핑 플랫폼(다나와, 네이버 쇼핑 등)의 상품 사양 표기를 정밀하게 분석하는 전문 데이터 엔지니어이자 가전 컨설턴트입니다.

사용자가 다나와나 네이버 쇼핑 등에서 복사하여 제공한 가전제품 관련 날것의(raw) 텍스트를 정독하고, 지정된 가전 기기 종류(${deviceType || "가전제품"})의 핵심 성능 및 사양 데이터를 정확하게 추출해 주세요.

[분석 대상 가전 종류]
- ${deviceType || "가전제품"}

[사양 추출 항목 가이드 및 주의사항]
1. 공식 모델명(modelName): 본문에서 상품명 또는 '모델명', '형식명' 등으로 표시된 코드를 정확히 추출하십시오. (예: 'RF85C9001AP', 'WA21A8500KV', 'NZ63B6022XW' 등). 브랜드명이 포함되지 않은 모델 고유 식별 명칭이어야 합니다.
2. 브랜드(brand): 제조사 또는 브랜드명을 추출하십시오. (예: 'LG전자', '삼성전자', '위닉스', '경동나비엔' 등)
3. 정격 소비전력(powerConsumption):
   - 냉장고: **연간소비전력량** (예: '연간 250 kWh' 또는 '25.2 kWh/월')을 찾아 추출하십시오.
   - 세탁기/건조기: **1회 세탁/건조 시 소비전력량** (예: '1회 세탁시 150 Wh' 또는 정격입력 '2200 W')을 찾아 추출하십시오.
   - 에어컨: 정격 냉방 소비전력 (예: '1.8 kW')을 추출하십시오.
   - 보일러, 제습기, 공기청정기, 인덕션, 기타 가전: 정격 소비전력 (예: '3400 W', '320 W')을 추출하십시오.
4. 용량 및 추천 평형(capacity):
   - 냉장고: **전체 용량** (예: '850L', '600L')을 추출하십시오.
   - 세탁기/건조기: **세탁 및 건조 용량** (예: '세탁 24kg / 건조 17kg', '세탁 15kg')을 추출하십시오.
   - 인덕션: 화구 구성 (예: '3구', '4구 프리존')을 추출하십시오.
   - 에어컨, 보일러, 제습기, 공기청정기: 각각 면적/제습량/난방용량 (예: '17평', '22,000 kcal/h', '20L')을 추출하십시오.
5. 에너지효율등급(efficiencyClass): 에너지소비효율등급(예: '1등급', '3등급', '등급외' 등)을 찾아 표기하십시오.
6. 주요 구동 방식(drivingType): 핵심 기술 또는 컴프레서/모터 제어 방식. (예: 냉장고는 '디지털 인버터', '리니어 인버터'; 세탁기/건조기는 'DD모터 인버터', '스마트 인버터'; 에어컨/제습기는 '인버터', '듀얼 인버터', '정속형'; 보일러는 '콘덴싱', '일반형'; 인덕션은 'IH 인덕션', '하이브리드' 등)

만약 텍스트에서 특정 사양을 절대 찾을 수 없는 경우에는 해당 항목을 '정보 없음'으로 명확히 채워주십시오. 임의로 추측하거나 완전히 다른 정보를 날조하지 마십시오.

[텍스트 데이터 원본]
${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "당신은 가전제품의 기술 사양 데이터를 파싱하여 정형화된 JSON 사양서로 가공하는 꼼꼼한 어시스턴트입니다.",
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelName: { type: Type.STRING },
            brand: { type: Type.STRING },
            powerConsumption: { type: Type.STRING },
            capacity: { type: Type.STRING },
            efficiencyClass: { type: Type.STRING },
            drivingType: { type: Type.STRING }
          },
          required: ["modelName", "brand", "powerConsumption", "capacity", "efficiencyClass", "drivingType"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Spec Extraction Error:", error);
    res.status(500).json({ error: "스펙 추출 중 오류가 발생했습니다. 입력한 텍스트를 다시 확인해 주세요.", details: error.message });
  }
});

// 3. Interactive Advisor Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { deviceType, modelA, modelB, homeInfo, usagePattern, installConditions, analysisResult, chatHistory, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "메시지가 입력되지 않았습니다." });
  }

  const prompt = `
당신은 사용자의 가전제품 분석 보고서 결과를 토대로 추가적인 의문점을 해소해주는 친절하고 전문적인 가전제품 효율 컨설턴트 AI입니다.
다음 분석 맥락과 이전 대화 기록을 바탕으로 사용자의 질문에 친절하고 상세하게 답변해 주세요.

[컨설팅 가전 정보]
- 기기 종류: ${deviceType}
- 모델 A: ${modelA}
- 모델 B: ${modelB}
- 주거 환경: ${homeInfo.areaSize}평, ${homeInfo.roomStructure}, 단열 ${homeInfo.insulationStatus}, 햇빛 ${homeInfo.sunlightLevel}
- 사용 패턴: 하루 ${usagePattern.dailyUsageHours}시간, 시간대: ${usagePattern.timeOfDay}, 선호도: ${usagePattern.userPreference}
- 분석 요약: ${analysisResult ? analysisResult.summaryVerdict : "아직 비교하지 않음"}
- 추천 기기: ${analysisResult ? analysisResult.winnerModel : "아직 결정되지 않음"}

[이전 대화 내역]
${(chatHistory || []).map((c: any) => `${c.role === 'user' ? '사용자' : '컨설턴트'}: ${c.text}`).join('\n')}

[사용자 질문]
"${message}"

답변을 작성할 때 가전제품의 기술적 설명(인버터 원리, 전력 누진세 구간, 설치 노하우 등)을 근거로 제시하되, 비전문가도 이해하기 쉽게 설명해 주세요. 또한 어투는 항상 전문적이고 정중하게(예: "네, 질문해 주신 부분에 대해 명확히 설명해 드리겠습니다...") 작성해 주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: "사용자가 궁금해하는 에너지 요금, 설치 팁, 기기 청소/유지관리, 스마트 제어법 등에 관해 가전제품 컨설턴트로서 친절하고 상세하며 유용한 답변을 작성합니다.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "상담 중 오류가 발생했습니다.", details: error.message });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
