import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import React from "react";

interface LoadingViewProps {
  deviceType: string;
  loadingStep: number;
  getDeviceIcon: (type: string, className?: string) => React.ReactNode;
  loadingStepsTexts: string[];
}

export default function LoadingView({
  deviceType,
  loadingStep,
  getDeviceIcon,
  loadingStepsTexts,
}: LoadingViewProps) {
  return (
    <motion.div
      key="loading-panel-full"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-900 text-white p-8 md:p-16 rounded-2xl shadow-xl flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden w-full"
      id="full-screen-loading-view"
    >
      {/* Pulsing background glow */}
      <div className="absolute inset-0 bg-radial-gradient from-teal-500/10 to-transparent pointer-events-none" />

      {/* High-tech Scanner circle */}
      <div className="relative w-28 h-28 mb-8 z-10">
        <div className="absolute inset-0 rounded-full border-4 border-teal-500/20" />
        <motion.div 
          className="absolute inset-0 rounded-full border-4 border-t-teal-400 border-r-teal-500/10"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <div className="absolute inset-4 rounded-full bg-slate-800 flex items-center justify-center">
          {getDeviceIcon(deviceType, "w-8 h-8 text-teal-400")}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1 tracking-tight text-teal-300 z-10">2E 컨설팅 시뮬레이션 가동</h3>
      <p className="text-xs text-slate-400 mb-6 font-mono z-10">MODEL PREDICTION ENGINE v1.2</p>

      {/* Progress indicator stages */}
      <div className="w-full max-w-md space-y-3 bg-slate-850 p-5 rounded-xl border border-white/5 z-10">
        {loadingStepsTexts.map((stepText, idx) => {
          const isActive = loadingStep === idx;
          const isCompleted = loadingStep > idx;

          return (
            <div 
              key={idx} 
              className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                isActive ? "text-teal-300 font-semibold" : isCompleted ? "text-slate-500" : "text-slate-600"
              }`}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                )}
              </div>
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center z-10">
        <p className="text-[11px] text-slate-400 uppercase tracking-widest animate-pulse max-w-sm leading-relaxed">
          Gemini AI에 의뢰하여 가전 스펙 정밀 분석 및 맞춤형 에너지 절약 리포트를 작성하는 중입니다. 잠시만 기다려 주세요.
        </p>
      </div>
    </motion.div>
  );
}
