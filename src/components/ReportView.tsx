import { motion } from "motion/react";
import { 
  Award, 
  TrendingDown, 
  Info, 
  Sliders, 
  DollarSign, 
  Wind, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Send, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import React, { useState } from "react";
import { ComparisonResult, ChatMessage } from "../types";

interface ReportViewProps {
  result: ComparisonResult;
  deviceType: string;
  onReset: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isChatLoading: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  handleAskConsultant: (presetQuestion?: string) => void;
  getChatSuggestions: () => string[];
  getDeviceIcon: (type: string, className?: string) => React.ReactNode;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReportView({
  result,
  deviceType,
  onReset,
  chatHistory,
  setChatHistory,
  isChatLoading,
  chatInput,
  setChatInput,
  handleAskConsultant,
  getChatSuggestions,
  getDeviceIcon,
  chatBottomRef,
}: ReportViewProps) {
  const [showSpecsA, setShowSpecsA] = useState(false);
  const [showSpecsB, setShowSpecsB] = useState(false);

  return (
    <motion.div
      key="result-panel-full"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-8 max-w-5xl mx-auto w-full"
      id="result-section"
    >
      {/* 1. 상단 네비게이션 액션 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600">
            {getDeviceIcon(deviceType, "w-6 h-6")}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">가전 성능 & 에너지 효율 컨설팅 리포트</h3>
            <p className="text-xs text-slate-500">2E(Effective Energy) 정밀 시뮬레이션 결과 분석 정보</p>
          </div>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-all border border-slate-200 shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>새로 비교하기 / 입력 수정</span>
        </button>
      </div>

      {/* 2. Winner Banner - 불투명 솔리드 배경을 적용하여 겹침 원천 방지 */}
      <div className="bg-teal-50/50 border border-teal-200 p-6 md:p-8 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 bg-teal-500/10 w-24 h-24 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-600 text-white p-2 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-teal-800 bg-white/95 border border-teal-200/50 px-2.5 py-1 rounded-md">
              컨설턴트 최적 추천안 판정
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            분석기준 시각: 2026. 07. 19
          </span>
        </div>

        <h2 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight mb-3">
          우리집에 가장 추천하는 가전은 <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-700 underline decoration-teal-300 decoration-3">
            {result.winnerModel} ({result.winnerType})
          </span> 입니다.
        </h2>

        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white border border-slate-150 p-4 rounded-xl flex items-start gap-2.5 shadow-xs">
          <span className="text-lg leading-none shrink-0">💡</span>
          <span>{result.summaryVerdict}</span>
        </p>
      </div>

      {/* 3. Comparison Specs Card Grid - 확실한 흰색 불투명 카드 배경 지정 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Model A Spec Card */}
        <div className={`p-6 rounded-2xl border transition-all ${
          result.winnerType === "모델 A" 
            ? "bg-white border-teal-500 shadow-md relative ring-1 ring-teal-500/10" 
            : "bg-white border-slate-200 opacity-90 shadow-xs"
        }`}>
          {result.winnerType === "모델 A" && (
            <div className="absolute top-4 right-4 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <Award className="w-3 h-3" />
              <span>BEST MATCH</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 bg-teal-100 text-teal-800 rounded-full text-xs font-bold flex items-center justify-center">A</span>
            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[70%]">{result.specs.modelA.name}</h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* Key Summary Badges / Rows shown initially */}
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">구동방식 및 부하제어</span>
              <span className="font-semibold text-slate-900 text-right">{result.specs.modelA.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">에너지소비효율 및 전력</span>
              <span className="font-semibold text-slate-900 text-right">{result.specs.modelA.efficiency}</span>
            </div>

            {/* Accordion Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSpecsA(!showSpecsA)}
                className="w-full py-2 px-3 text-xs font-bold text-teal-700 bg-teal-50/75 hover:bg-teal-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{showSpecsA ? "상세 정보 접기" : "상세 스펙 더 보기"}</span>
                {showSpecsA ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible content */}
            {showSpecsA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-2 text-xs overflow-hidden"
              >
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">용량 및 추천 평형</span>
                  <span className="font-semibold text-slate-900 text-right">{result.specs.modelA.capacity}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">스마트 제어 편의성</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[60%]">{result.specs.modelA.smartFeatures}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">운전 소음도</span>
                  <span className="font-semibold text-slate-800 text-right">{result.specs.modelA.noiseLevel}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1.5 font-medium">설치 및 공간 적합도</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg text-slate-600 leading-relaxed font-normal text-[11px] border border-slate-100">
                    {result.specs.modelA.installSuitability}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Model B Spec Card */}
        <div className={`p-6 rounded-2xl border transition-all ${
          result.winnerType === "모델 B" 
            ? "bg-white border-teal-500 shadow-md relative ring-1 ring-teal-500/10" 
            : "bg-white border-slate-200 opacity-90 shadow-xs"
        }`}>
          {result.winnerType === "모델 B" && (
            <div className="absolute top-4 right-4 bg-teal-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <Award className="w-3 h-3" />
              <span>BEST MATCH</span>
            </div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-5 h-5 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center justify-center">B</span>
            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[70%]">{result.specs.modelB.name}</h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* Key Summary Badges / Rows shown initially */}
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">구동방식 및 부하제어</span>
              <span className="font-semibold text-slate-900 text-right">{result.specs.modelB.type}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">에너지소비효율 및 전력</span>
              <span className="font-semibold text-slate-900 text-right">{result.specs.modelB.efficiency}</span>
            </div>

            {/* Accordion Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowSpecsB(!showSpecsB)}
                className="w-full py-2 px-3 text-xs font-bold text-orange-700 bg-orange-50/75 hover:bg-orange-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{showSpecsB ? "상세 정보 접기" : "상세 스펙 더 보기"}</span>
                {showSpecsB ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Collapsible content */}
            {showSpecsB && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 pt-2 text-xs overflow-hidden"
              >
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">용량 및 추천 평형</span>
                  <span className="font-semibold text-slate-900 text-right">{result.specs.modelB.capacity}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">스마트 제어 편의성</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[60%]">{result.specs.modelB.smartFeatures}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">운전 소음도</span>
                  <span className="font-semibold text-slate-800 text-right">{result.specs.modelB.noiseLevel}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1.5 font-medium">설치 및 공간 적합도</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg text-slate-600 leading-relaxed font-normal text-[11px] border border-slate-100">
                    {result.specs.modelB.installSuitability}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Energy Cost Analysis Chart - 확실한 흰색 불투명 배경 지정 */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <TrendingDown className="w-5 h-5 text-teal-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-base">월평균 에너지 사용 요금 시뮬레이션</h4>
              <p className="text-xs text-slate-500">
                {deviceType === "냉장고" 
                  ? "선택하신 거주 환경 및 24시간 상시 가동 기준 예상 요금 비교" 
                  : deviceType === "세탁기/건조기" 
                  ? "선택하신 거주 환경 및 주간 작동 횟수 기준 예상 요금 비교" 
                  : "선택하신 거주 환경 및 일일 작동시간 기준 예상 요금 비교"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              연간 최대 약 {result.energyAnalysis.annualSaving.toLocaleString()}원 절약 가능
            </span>
          </div>
        </div>

        <div className="space-y-4 max-w-xl mx-auto pt-2">
          
          {/* Model A Bar Row */}
          <div className="flex items-center gap-3">
            {/* Badge/Label */}
            <div className="w-24 md:w-32 flex-shrink-0 text-slate-700 text-xs font-bold truncate" title={result.specs.modelA.name}>
              <span className="inline-block px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded-sm text-[10px] font-extrabold mr-1.5">A</span>
              {result.specs.modelA.name}
            </div>
            
            {/* Flexible Bar Container */}
            <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden relative">
              <motion.div 
                className="bg-teal-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(10, Math.min(100, (result.energyAnalysis.modelAEstCost / Math.max(result.energyAnalysis.modelAEstCost, result.energyAnalysis.modelBEstCost)) * 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            {/* Price Display */}
            <div className="w-28 text-right flex-shrink-0">
              <span className="text-sm md:text-base font-black text-slate-950">{result.energyAnalysis.modelAEstCost.toLocaleString()}원</span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-1">/ 월 예상</span>
            </div>
          </div>

          {/* Model B Bar Row */}
          <div className="flex items-center gap-3">
            {/* Badge/Label */}
            <div className="w-24 md:w-32 flex-shrink-0 text-slate-700 text-xs font-bold truncate" title={result.specs.modelB.name}>
              <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded-sm text-[10px] font-extrabold mr-1.5">B</span>
              {result.specs.modelB.name}
            </div>
            
            {/* Flexible Bar Container */}
            <div className="flex-1 bg-slate-100 h-4 rounded-full overflow-hidden relative">
              <motion.div 
                className="bg-orange-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(10, Math.min(100, (result.energyAnalysis.modelBEstCost / Math.max(result.energyAnalysis.modelAEstCost, result.energyAnalysis.modelBEstCost)) * 100))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            {/* Price Display */}
            <div className="w-28 text-right flex-shrink-0">
              <span className="text-sm md:text-base font-black text-slate-950">{result.energyAnalysis.modelBEstCost.toLocaleString()}원</span>
              <span className="text-[10px] font-medium text-slate-400 block -mt-1">/ 월 예상</span>
            </div>
          </div>

        </div>

        {/* Cost Difference Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-teal-50/40 border border-teal-100 p-5 rounded-2xl">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">월평균 에너지 운전 요금 차이</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2.5xl md:text-3xl font-black text-teal-600 tracking-tight">
                {result.energyAnalysis.costDifference.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-slate-500">원 / 월</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              두 기기 가동 조건별 정밀 요금 모사 편차 결과
            </p>
          </div>
          
          <div className="bg-white p-4.5 rounded-xl border border-teal-100/50 flex flex-col justify-center relative overflow-hidden shadow-xs">
            <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 bg-teal-500/5 w-16 h-16 rounded-full pointer-events-none" />
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">연간 누적 예상 세이브 금액</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2.5xl md:text-3.5xl font-black text-teal-600 tracking-tight">
                {result.energyAnalysis.annualSaving.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-teal-600">원 / 년 절약</span>
            </div>
          </div>
        </div>

        {/* Calculation Basis collapsible */}
        <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-150/50">
          <div className="flex items-center gap-1.5 font-bold text-slate-400 text-[11px] mb-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>전기세/연료비 시뮬레이션 산출 근거</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pl-4 border-l border-slate-200">
            {result.energyAnalysis.calculationBasis}
          </p>
        </div>

      </div>

      {/* 5. Comparison Matrix Grid Table - 확실한 흰색 불투명 배경 지정 */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Sliders className="w-5 h-5 text-teal-600" />
          <span>핵심 매칭 판정 비교 행렬</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold">
                <th className="p-3.5 w-[25%]">평가 항목</th>
                <th className="p-3.5 w-[28%]">모델 A 분석</th>
                <th className="p-3.5 w-[28%]">모델 B 분석</th>
                <th className="p-3.5 w-[19%] text-center">우수 판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.comparisonMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800">{row.category}</td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">{row.modelAValue}</td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">{row.modelBValue}</td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] ${
                      row.winner === "모델 A" 
                        ? "bg-teal-50 text-teal-700 border border-teal-200/50" 
                        : row.winner === "모델 B" 
                          ? "bg-orange-50 text-orange-700 border border-orange-200/50" 
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      {row.winner}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Final Reasoning (Economy, Comfort, Installation) - 확실한 흰색 불투명 배경 지정 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-5.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs">
            <DollarSign className="w-4 h-4" />
            <span>경제성 측면 상세 판론</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.finalReasoning.economy}
          </p>
        </div>

        <div className="bg-white p-5.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs">
            <Wind className="w-4 h-4" />
            <span>쾌적성 및 가동소음 평가</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.finalReasoning.comfort}
          </p>
        </div>

        <div className="bg-white p-5.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-teal-700 font-bold text-xs">
            <Home className="w-4 h-4" />
            <span>물리 설치 및 공간 제합성</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {result.finalReasoning.installation}
          </p>
        </div>

      </div>

      {/* 7. Actionable Behavioral Tips */}
      <div className="bg-gradient-to-r from-teal-600 to-sky-700 text-white p-6 md:p-8 rounded-2xl shadow-md space-y-5">
        <h4 className="font-extrabold text-base flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <span>우리집 주거 공간 맞춤 효율 극대화 행동 가이드 3가지</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {result.efficiencyTips.map((tip, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex gap-3">
              <span className="text-teal-300 font-extrabold text-lg leading-none shrink-0">0{idx + 1}</span>
              <p className="text-xs leading-relaxed text-slate-100 font-medium">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Disclaimer Text */}
      <div className="text-[11px] text-slate-400 flex items-start gap-2 bg-slate-100/60 p-3.5 rounded-lg border border-slate-200/50">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p className="leading-relaxed">
          {result.generalDisclaimer} (참고: 본 시뮬레이션 계산은 한국전력공사 주택용 전력 요금 규정 및 평균 연료비를 반영한 추정치로서, 세부 주택 단열 구조 및 기상 조건 등에 따라 실제 요금은 변동될 수 있습니다.)
        </p>
      </div>

      {/* 9. Interactive Advisor Q&A Chat - 확실한 흰색 불투명 배경 지정 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <div>
              <h4 className="font-bold text-sm">에너지 관리 전문 컨설턴트 1:1 상담</h4>
              <p className="text-[10px] text-slate-400">비교 결과에 대해 궁금한 점을 질문해 보세요.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setChatHistory([])}
            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            대화 초기화
          </button>
        </div>

        {/* Chat Bubble Thread */}
        <div className="p-5 h-[320px] overflow-y-auto bg-slate-50 space-y-4">
          {chatHistory.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
              아래의 추천 질문 칩을 누르시거나 직접 궁금한 요금 아끼는 세법을 문의해 보세요!
            </div>
          )}

          {chatHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.role === "user" 
                  ? "bg-teal-600 text-white rounded-br-none" 
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[9px] mt-1 text-right opacity-60">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-xl rounded-bl-none px-4 py-3 text-xs shadow-xs text-slate-500 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>가전 효율 데이터 계산하며 답변 작성 중...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Preset Suggestion Chips */}
        <div className="px-5 py-3 border-t border-b border-slate-100 flex flex-wrap gap-2 bg-white">
          {getChatSuggestions().map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleAskConsultant(suggestion)}
              disabled={isChatLoading}
              className="text-[11px] text-teal-700 bg-teal-50 hover:bg-teal-100 font-medium px-2.5 py-1 rounded-md transition-colors border border-teal-200/40 text-left cursor-pointer disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAskConsultant(); }}
          className="p-3 bg-white flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="전기세를 더 줄일 수 있는 청소 요령이나 팁이 있을까요?"
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:bg-white text-slate-800"
            disabled={isChatLoading}
          />
          <button
            type="submit"
            disabled={isChatLoading || !chatInput.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4.5 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-30"
          >
            <Send className="w-3 h-3" />
            <span>질문</span>
          </button>
        </form>
      </div>

      {/* 10. 하단 고정 새로 고침용 홈 버튼 */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>새로 입력 및 비교 분석하기</span>
        </button>
      </div>

    </motion.div>
  );
}
