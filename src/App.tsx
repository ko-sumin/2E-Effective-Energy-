import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Sparkles, 
  TrendingDown, 
  Zap, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Flame, 
  Wind, 
  Droplets, 
  ShieldAlert, 
  Send, 
  RotateCw, 
  Clock, 
  Home, 
  History, 
  AlertCircle, 
  Trash2, 
  FileText,
  ChevronRight,
  Info,
  Sliders,
  DollarSign,
  ArrowLeft,
  Refrigerator,
  WashingMachine
} from "lucide-react";
import { 
  HomeInfo, 
  UsagePattern, 
  InstallConditions, 
  ComparisonResult, 
  ChatMessage, 
  HistoryItem 
} from "./types";
import LoadingView from "./components/LoadingView";
import ReportView from "./components/ReportView";

export default function App() {
  // 1. Device Type & Model State
  const [deviceType, setDeviceType] = useState<string>("에어컨");
  const [modelA, setModelA] = useState<string>("");
  const [modelB, setModelB] = useState<string>("");

  // 1-1. AI Spec Extraction State
  const [rawText, setRawText] = useState<string>("");
  const [targetModel, setTargetModel] = useState<"A" | "B">("A");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedSpecA, setExtractedSpecA] = useState<{
    modelName: string;
    brand: string;
    powerConsumption: string;
    capacity: string;
    efficiencyClass: string;
    drivingType: string;
  } | null>(null);
  const [extractedSpecB, setExtractedSpecB] = useState<{
    modelName: string;
    brand: string;
    powerConsumption: string;
    capacity: string;
    efficiencyClass: string;
    drivingType: string;
  } | null>(null);

  // 2. Home Info State
  const [areaSize, setAreaSize] = useState<number>(24);
  const [roomStructure, setRoomStructure] = useState<string>("쓰리룸 (아파트 판상형 3Bay)");
  const [insulationStatus, setInsulationStatus] = useState<string>("보통 (일반 주택/아파트)");
  const [sunlightLevel, setSunlightLevel] = useState<string>("보통 (일반적인 동/서향)");

  // 3. Usage Pattern State
  const [dailyUsageHours, setDailyUsageHours] = useState<number>(6);
  const [timeOfDay, setTimeOfDay] = useState<string>("낮/오후 위주 (12시 ~ 20시)");
  const [userPreference, setUserPreference] = useState<string>("은은하고 조용한 모드 선호");

  // 4. Install Conditions State
  const [outdoorUnitPos, setOutdoorUnitPos] = useState<string>("외부 전용 거치대");
  const [pipeLength, setPipeLength] = useState<number>(5);
  const [perforations, setPerforations] = useState<number>(1);
  const [drainExists, setDrainExists] = useState<boolean>(true);
  const [manifoldCount, setManifoldCount] = useState<number>(5);
  const [moveFrequency, setMoveFrequency] = useState<string>("가끔 이동");
  const [noiseSensitivity, setNoiseSensitivity] = useState<string>("중 (일반 수준)");

  // New appliance specific states
  const [refrigeratorCapacity, setRefrigeratorCapacity] = useState<number>(850);
  const [refrigeratorType, setRefrigeratorType] = useState<string>("프리스탠딩 (독립 배치)");
  const [washerWeeklyCount, setWasherWeeklyCount] = useState<number>(4);
  const [washerSetup, setWasherSetup] = useState<string>("직렬 탑재 (세탁기+건조기)");
  const [inductionPowerType, setInductionPowerType] = useState<string>("일반 플러그형 (최대 3.4kW 제어)");
  const [inductionBurners, setInductionBurners] = useState<number>(3);

  // UI & Consultation Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Chat follow-up State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // History State
  const [consultHistory, setConsultHistory] = useState<HistoryItem[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load Past Consultations from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ecovolt_consult_history");
      if (stored) {
        setConsultHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local history", e);
    }
  }, []);

  // Sync install conditions preferences when device type changes
  useEffect(() => {
    if (deviceType === "에어컨") {
      setUserPreference("은은하고 직접 닿지 않는 찬바람(무풍 등) 선호");
    } else if (deviceType === "보일러") {
      setUserPreference("빠른 난방보다 일정한 실내 온도 유지 선호");
    } else if (deviceType === "제습기") {
      setUserPreference("강력한 속성 제습 및 의류 건조 모드 위주");
    } else {
      setUserPreference("지속적인 자동/정음 모드 작동 선호");
    }
  }, [deviceType]);

  // Loading indicator step rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);



  const handleExtractSpecs = async () => {
    if (!rawText.trim()) {
      setExtractionError("다나와/네이버 등에서 복사한 제품 상세 스펙 또는 텍스트 전체를 입력란에 붙여넣어 주세요.");
      return;
    }
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const response = await fetch("/api/extract-specs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: rawText,
          deviceType,
        }),
      });

      if (!response.ok) {
        throw new Error("스펙 추출에 실패했습니다. 네트워크 상태를 확인하시거나 다시 시도해 주세요.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Format a concise and descriptive string for the input field
      const formatted = `${data.brand && data.brand !== "정보 없음" ? data.brand : ""} ${data.modelName && data.modelName !== "정보 없음" ? data.modelName : "모델"}`.trim();
      
      if (targetModel === "A") {
        setModelA(formatted);
        setExtractedSpecA(data);
      } else {
        setModelB(formatted);
        setExtractedSpecB(data);
      }

      // Success feedback: reset the textarea so the user can easily paste for the next device
      setRawText("");
    } catch (err: any) {
      console.error("Extraction error:", err);
      setExtractionError(err.message || "스펙 추출 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCompare = async () => {
    if (!modelA.trim() || !modelB.trim()) {
      setErrorMsg("비교할 모델 A와 모델 B의 명칭을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setChatHistory([]); // Reset chat for new context

    const homeInfo: HomeInfo = { areaSize, roomStructure, insulationStatus, sunlightLevel };
    
    const usagePattern: any = { timeOfDay, userPreference };
    if (deviceType === "냉장고") {
      usagePattern.dailyUsageHours = 24;
      usagePattern.capacityLiters = refrigeratorCapacity;
      usagePattern.rule24Hours = true;
    } else if (deviceType === "세탁기/건조기") {
      usagePattern.weeklyUsageCount = washerWeeklyCount;
    } else if (deviceType === "인덕션") {
      usagePattern.dailyUsageHours = dailyUsageHours;
      usagePattern.inductionBurners = inductionBurners;
    } else {
      usagePattern.dailyUsageHours = dailyUsageHours;
    }
    
    const installConditions: any = {};
    if (deviceType === "에어컨") {
      installConditions.outdoorUnitPos = outdoorUnitPos;
      installConditions.pipeLength = pipeLength;
      installConditions.perforations = perforations;
    } else if (deviceType === "보일러") {
      installConditions.drainExists = drainExists;
      installConditions.manifoldCount = manifoldCount;
    } else if (deviceType === "제습기" || deviceType === "공기청정기") {
      installConditions.moveFrequency = moveFrequency;
      installConditions.noiseSensitivity = noiseSensitivity;
    } else if (deviceType === "냉장고") {
      installConditions.refrigeratorType = refrigeratorType;
    } else if (deviceType === "세탁기/건조기") {
      installConditions.washerSetup = washerSetup;
    } else if (deviceType === "인덕션") {
      installConditions.inductionPowerType = inductionPowerType;
    }

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType,
          modelA,
          modelB,
          homeInfo,
          usagePattern,
          installConditions
        })
      });

      if (!response.ok) {
        throw new Error("서버와의 통신이 원활하지 않습니다.");
      }

      const data: ComparisonResult = await response.json();
      setResult(data);

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        title: `${deviceType} - ${modelA.split(' ')[0]} vs ${modelB.split(' ')[0]}`,
        timestamp: new Date().toLocaleDateString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        deviceType,
        modelA,
        modelB,
        homeInfo,
        usagePattern,
        installConditions,
        result: data
      };

      const updatedHistory = [newHistoryItem, ...consultHistory.slice(0, 9)];
      setConsultHistory(updatedHistory);
      localStorage.setItem("ecovolt_consult_history", JSON.stringify(updatedHistory));

      // Scroll to result view
      setTimeout(() => {
        const element = document.getElementById("result-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);

    } catch (err: any) {
      console.error("Consultation fetch error:", err);
      setErrorMsg(err.message || "리포트를 작성하는 도중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskConsultant = async (customQuestion?: string) => {
    const textToSend = customQuestion || chatInput;
    if (!textToSend.trim() || !result) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    if (!customQuestion) setChatInput("");
    setIsChatLoading(true);

    const usagePattern: any = { timeOfDay, userPreference };
    if (deviceType === "냉장고") {
      usagePattern.dailyUsageHours = 24;
      usagePattern.capacityLiters = refrigeratorCapacity;
      usagePattern.rule24Hours = true;
    } else if (deviceType === "세탁기/건조기") {
      usagePattern.weeklyUsageCount = washerWeeklyCount;
    } else if (deviceType === "인덕션") {
      usagePattern.dailyUsageHours = dailyUsageHours;
      usagePattern.inductionBurners = inductionBurners;
    } else {
      usagePattern.dailyUsageHours = dailyUsageHours;
    }

    const installConditions: any = {};
    if (deviceType === "에어컨") {
      installConditions.outdoorUnitPos = outdoorUnitPos;
      installConditions.pipeLength = pipeLength;
      installConditions.perforations = perforations;
    } else if (deviceType === "보일러") {
      installConditions.drainExists = drainExists;
      installConditions.manifoldCount = manifoldCount;
    } else if (deviceType === "제습기" || deviceType === "공기청정기") {
      installConditions.moveFrequency = moveFrequency;
      installConditions.noiseSensitivity = noiseSensitivity;
    } else if (deviceType === "냉장고") {
      installConditions.refrigeratorType = refrigeratorType;
    } else if (deviceType === "세탁기/건조기") {
      installConditions.washerSetup = washerSetup;
    } else if (deviceType === "인덕션") {
      installConditions.inductionPowerType = inductionPowerType;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType,
          modelA,
          modelB,
          homeInfo: { areaSize, roomStructure, insulationStatus, sunlightLevel },
          usagePattern,
          installConditions,
          analysisResult: result,
          chatHistory,
          message: textToSend
        })
      });

      if (!response.ok) {
        throw new Error("상담 도중 끊김이 발생했습니다.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };

      setChatHistory((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Advisor chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "상담 중 원활한 답변을 생성하지 못했습니다. 다시 말씀해 주시면 감사하겠습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setDeviceType(item.deviceType);
    setModelA(item.modelA);
    setModelB(item.modelB);
    setAreaSize(item.homeInfo.areaSize);
    setRoomStructure(item.homeInfo.roomStructure);
    setInsulationStatus(item.homeInfo.insulationStatus);
    setSunlightLevel(item.homeInfo.sunlightLevel);
    setDailyUsageHours(item.usagePattern.dailyUsageHours);
    setTimeOfDay(item.usagePattern.timeOfDay);
    setUserPreference(item.usagePattern.userPreference);

    if (item.installConditions) {
      if (item.installConditions.outdoorUnitPos) setOutdoorUnitPos(item.installConditions.outdoorUnitPos);
      if (item.installConditions.pipeLength) setPipeLength(item.installConditions.pipeLength);
      if (item.installConditions.perforations) setPerforations(item.installConditions.perforations);
      if (item.installConditions.drainExists !== undefined) setDrainExists(item.installConditions.drainExists);
      if (item.installConditions.manifoldCount) setManifoldCount(item.installConditions.manifoldCount);
      if (item.installConditions.moveFrequency) setMoveFrequency(item.installConditions.moveFrequency);
      if (item.installConditions.noiseSensitivity) setNoiseSensitivity(item.installConditions.noiseSensitivity);
    }

    setResult(item.result);
    setChatHistory([]);
    setShowHistorySidebar(false);

    setTimeout(() => {
      const element = document.getElementById("result-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleClearHistory = () => {
    setConsultHistory([]);
    localStorage.removeItem("ecovolt_consult_history");
  };

  // Helper icons depending on device type
  const getDeviceIcon = (type: string, className = "w-6 h-6") => {
    switch (type) {
      case "에어컨":
        return <Wind className={`${className} text-teal-600`} />;
      case "보일러":
        return <Flame className={`${className} text-orange-600`} />;
      case "제습기":
        return <Droplets className={`${className} text-blue-600`} />;
      case "공기청정기":
        return <Sparkles className={`${className} text-emerald-600`} />;
      case "냉장고":
        return <Refrigerator className={`${className} text-cyan-600`} />;
      case "세탁기/건조기":
        return <WashingMachine className={`${className} text-indigo-600`} />;
      case "인덕션":
        return <Flame className={`${className} text-red-600`} />;
      case "기타 생활가전":
        return <Cpu className={`${className} text-slate-600`} />;
      default:
        return <Cpu className={`${className} text-slate-600`} />;
    }
  };

  // Loading Steps texts
  const LOADING_STEPS_TEXTS = [
    "각 가전의 정격 소비전력 및 최신 기술 규격 데이터베이스 대조 중...",
    "사용자 주거 환경(단열도, 햇빛 가중치)에 따른 열 부하 시뮬레이션 중...",
    "한국 전력 누진세 단계 및 가스 연료 요금 정밀 비용 계산 중...",
    "종합 매칭 판정 및 맞춤형 가전 운전 팁 리포트 작성 중..."
  ];

  // Suggestions for chat based on device type
  const getChatSuggestions = () => {
    switch (deviceType) {
      case "에어컨":
        return [
          "인버터형 에어컨인데 정말 계속 켜두는 게 싼가요?",
          "에어컨 전기세를 가장 줄일 수 있는 최적의 설정법은?",
          "배관이 길어지면 전기세나 효율에 얼마나 악영향을 주나요?",
        ];
      case "보일러":
        return [
          "콘덴싱 보일러에서 외출 모드가 좋은가요, 예약 모드가 좋은가요?",
          "노후 주택인데 보일러 난방비를 줄일 수 있는 방한 팁은?",
          "난방 분배기를 수동 조절하면 가스비를 아낄 수 있나요?",
        ];
      case "제습기":
        return [
          "제습기 사용 시 에어컨과 같이 가동하는 게 더 효율적인가요?",
          "소음에 민감한데 제습기 소음을 줄일 수 있는 세팅이나 위치 팁은?",
          "실내 빨래 건조 시 제습기 효율 극대화법은?",
        ];
      case "냉장고":
        return [
          "냉장고가 24시간 내내 켜져 있는데 전기세를 줄일 수 있는 설정 온도는?",
          "냉장실과 냉동실의 적정 수납 비율은 몇 % 정도가 효율적인가요?",
          "벽면과의 설치 간격이 냉장고 소비전력에 얼마나 큰 영향을 주나요?",
        ];
      case "세탁기/건조기":
        return [
          "세탁기 온수 세탁 시 전기 누진 요금에 미치는 영향은 어떤가요?",
          "건조기 필터 청소 주기를 놓치면 전기 소모가 얼마나 늘어나나요?",
          "소량 세탁 시 매일 빠는 것과 모아서 한번에 세탁하는 것 중 언제가 경제적인가요?",
        ];
      case "인덕션":
        return [
          "인덕션 전용 용기를 쓰면 끓는 속도나 열손실 전력이 개선되나요?",
          "인덕션 사용 시 주방 후드 동시 작동이 가스 및 열전도 효율에 영향을 미치나요?",
          "인덕션 전용 차단기 설치 여부가 안전과 상시 전력 사용량에 영향을 주나요?",
        ];
      default:
        return [
          "이 가전의 전기세를 가장 절약하는 실천 행동 요령은?",
          "설치 공간 배치에 따른 공기 흐름이나 에너지 효율 극대화법은?",
          "필터 청소나 점검 주기는 어떻게 가져가야 전력이 낭비되지 않나요?",
        ];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Header */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-teal-500 to-sky-600 p-2 rounded-xl text-white shadow-md shadow-teal-500/10">
            <Cpu className="w-6 h-6" id="app-logo-icon" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              2E(Effective Energy) <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">가전제품 비교 컨설턴트</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">우리집 환경과 사용 패턴에 딱 맞는 가전 분석 및 에너지 효율 가이드</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History Button */}
          <button 
            id="history-btn"
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">과거 분석 이력</span>
            {consultHistory.length > 0 && (
              <span className="w-5 h-5 bg-teal-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {consultHistory.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* Banner with brief introduction */}
        <section className="mb-8 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12 select-none pointer-events-none">
            <Sparkles className="w-96 h-96" />
          </div>
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-300 mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>전문적이고 신뢰성 높은 한국 맞춤형 가전 효율 시뮬레이터</span>
            </div>
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight mb-3">
              우리집 주거 공간과 전기세 요금을 <br className="hidden md:block" />
              가장 아껴줄 최적의 가전은 무엇일까요?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              서로 다른 에어컨, 보일러, 제습기 등의 세부 스펙을 한국의 복잡한 주택용 전력 누진세 및 연료비 체계를 기반으로 정밀 매칭 분석합니다. 직접 비교하고 싶은 모델명을 입력해 보세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <a 
                href="#form-section" 
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl shadow-lg transition-all"
              >
                직접 모델 분석해보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </section>



        {/* 3. Grid for Form (Left) & Results/Welcome (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="form-section">
          
          {/* LEFT: Consultant Request Form */}
          <div className={`lg:col-span-5 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm sticky top-24 ${(isLoading || result) ? "hidden" : ""}`}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
              <Sliders className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">맞춤 비교 분석 정보 입력</h3>
                <p className="text-xs text-slate-500">컨설팅을 진행할 가전과 환경 조건을 입력하세요.</p>
              </div>
            </div>

            <div className="space-y-6">
              
              {/* Device Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">1. 기기 종류</label>
                <div className="grid grid-cols-4 gap-2">
                  {["에어컨", "보일러", "제습기", "공기청정기", "냉장고", "세탁기/건조기", "인덕션", "기타 생활가전"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDeviceType(type)}
                      className={`py-2 px-0.5 rounded-lg text-[10px] sm:text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                        deviceType === type
                          ? "bg-teal-50 border-teal-500 text-teal-900 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {getDeviceIcon(type, "w-4 h-4")}
                      <span className="truncate w-full text-center">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ✨ 다나와/네이버 텍스트 자동 입력 (AI) */}
              <div className="bg-gradient-to-br from-teal-50/70 to-sky-50/70 p-4 rounded-xl border border-teal-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800">다나와/네이버 텍스트 자동 입력 (AI)</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">추천</span>
                </div>
                
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  다나와 또는 네이버 쇼핑에서 복사한 제품 상세 정보/스펙 표 텍스트 전체를 붙여넣으시면, AI가 모델명, 브랜드, 전력(kW), 용량/평형, 효율등급, 구동방식을 파싱하여 자동으로 폼에 연동합니다.
                </p>

                {/* Target Model Selector & Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">대입할 위치:</span>
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setTargetModel("A")}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          targetModel === "A"
                            ? "bg-white text-teal-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        모델 A 명칭
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetModel("B")}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                          targetModel === "B"
                            ? "bg-white text-orange-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        모델 B 명칭
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`[${deviceType}] 관련 상세 스펙 표나 특징 텍스트 전체를 복사(Ctrl+A -> Ctrl+C)해서 이곳에 붙여넣으세요.`}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 leading-relaxed placeholder-slate-400"
                  />
                </div>

                {/* Extraction Error */}
                {extractionError && (
                  <div className="flex items-center gap-1.5 p-2 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-100">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                )}

                {/* Action button */}
                <button
                  type="button"
                  onClick={handleExtractSpecs}
                  disabled={isExtracting}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>AI 스펙 자동 추출 중...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      <span>AI로 스펙 추출하여 자동 입력</span>
                    </>
                  )}
                </button>
              </div>

              {/* Models input */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      비교 기기 <span className="text-teal-600 font-semibold">모델 A 명칭</span>
                    </label>
                    <input
                      type="text"
                      value={modelA}
                      onChange={(e) => setModelA(e.target.value)}
                      placeholder="예) 삼성 비스포크 무풍 2in1"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-900"
                    />
                    
                    {/* Extracted Specs Preview A */}
                    {extractedSpecA && (
                      <div className="mt-2 p-2.5 bg-teal-50/50 border border-teal-100 rounded-lg text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-teal-800 mb-1">
                          <span>✨ AI 추출 스펙 (모델 A)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedSpecA(null);
                              setModelA("");
                            }}
                            className="text-slate-400 hover:text-slate-600 font-semibold"
                          >
                            지우기
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                          <div><span className="font-semibold text-slate-800">모델명:</span> {extractedSpecA.modelName}</div>
                          <div><span className="font-semibold text-slate-800">브랜드:</span> {extractedSpecA.brand}</div>
                          <div><span className="font-semibold text-slate-800">구동방식:</span> {extractedSpecA.drivingType}</div>
                          <div><span className="font-semibold text-slate-800">소비전력:</span> {extractedSpecA.powerConsumption}</div>
                          <div><span className="font-semibold text-slate-800">용량/평형:</span> {extractedSpecA.capacity}</div>
                          <div><span className="font-semibold text-slate-800">에너지등급:</span> {extractedSpecA.efficiencyClass}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      비교 기기 <span className="text-orange-600 font-semibold">모델 B 명칭</span>
                    </label>
                    <input
                      type="text"
                      value={modelB}
                      onChange={(e) => setModelB(e.target.value)}
                      placeholder="예) LG 휘센 오브제 스탠드"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-900"
                    />

                    {/* Extracted Specs Preview B */}
                    {extractedSpecB && (
                      <div className="mt-2 p-2.5 bg-orange-50/50 border border-orange-100 rounded-lg text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-orange-800 mb-1">
                          <span>✨ AI 추출 스펙 (모델 B)</span>
                          <button
                            type="button"
                            onClick={() => {
                              setExtractedSpecB(null);
                              setModelB("");
                            }}
                            className="text-slate-400 hover:text-slate-600 font-semibold"
                          >
                            지우기
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600">
                          <div><span className="font-semibold text-slate-800">모델명:</span> {extractedSpecB.modelName}</div>
                          <div><span className="font-semibold text-slate-800">브랜드:</span> {extractedSpecB.brand}</div>
                          <div><span className="font-semibold text-slate-800">구동방식:</span> {extractedSpecB.drivingType}</div>
                          <div><span className="font-semibold text-slate-800">소비전력:</span> {extractedSpecB.powerConsumption}</div>
                          <div><span className="font-semibold text-slate-800">용량/평형:</span> {extractedSpecB.capacity}</div>
                          <div><span className="font-semibold text-slate-800">에너지등급:</span> {extractedSpecB.efficiencyClass}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Home Environment */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Home className="w-3.5 h-3.5 text-teal-600" />
                  <span>2. 주거 거주 환경</span>
                </h4>

                {/* Area size slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-600">거주 및 가동 공간 면적</span>
                    <span className="text-xs font-bold text-teal-700">
                      {areaSize}평 (약 {Math.round(areaSize * 3.3)}㎡)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={80}
                    step={1}
                    value={areaSize}
                    onChange={(e) => setAreaSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>5평</span>
                    <span>24평</span>
                    <span>32평</span>
                    <span>50평</span>
                    <span>80평</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Room Structure */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">방 구조 및 형태</label>
                    <select
                      value={roomStructure}
                      onChange={(e) => setRoomStructure(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                    >
                      <option>원룸 (일체형 스튜디오)</option>
                      <option>투룸 (주방 및 분리 구조)</option>
                      <option>쓰리룸 (아파트 판상형 3Bay)</option>
                      <option>포룸 이상 (4Bay 아파트/단독주택)</option>
                      <option>기타 상가/사무실/오피스텔</option>
                    </select>
                  </div>

                  {/* Insulation Status */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">집안 단열 상태</label>
                    <select
                      value={insulationStatus}
                      onChange={(e) => setInsulationStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                    >
                      <option>우수 (이중창 완비 및 최신 신축 단열)</option>
                      <option>보통 (일반 주택/아파트 수준)</option>
                      <option>미흡 (노후 창호 및 단열재 유실 우려 구축)</option>
                    </select>
                  </div>
                </div>

                {/* Sunlight Level */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">하루 중 햇빛 드는 정도</label>
                  <select
                    value={sunlightLevel}
                    onChange={(e) => setSunlightLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                  >
                    <option>매우 강함 (하루 종일 해가 잘 드는 남향/정남향/탑층)</option>
                    <option>보통 (일반적인 동/서향 구조)</option>
                    <option>약함 (그늘이 잘 지거나 북향/저층 그늘막)</option>
                  </select>
                </div>

              </div>

              {/* Usage Pattern */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>3. 라이프 사용 패턴</span>
                </h4>

                {/* 냉장고 전용 입력 폼 */}
                {deviceType === "냉장고" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-600">냉장고 용량 (L)</span>
                        <span className="text-xs font-bold text-teal-700">
                          {refrigeratorCapacity} L
                        </span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={1100}
                        step={10}
                        value={refrigeratorCapacity}
                        onChange={(e) => setRefrigeratorCapacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>100L (소형)</span>
                        <span>500L (중형)</span>
                        <span>800L (4도어 표준)</span>
                        <span>1100L (초대형)</span>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-50/50 rounded-lg border border-teal-100/60 text-[11px] text-teal-800 leading-relaxed">
                      💡 <strong>24시간 상시 가동 규칙 적용:</strong> 냉장고는 신선 신선도 유지를 위해 24시간 내내 계속 켜져 작동하는 기준으로 전력 요금을 정밀 시뮬레이션합니다.
                    </div>
                  </div>
                )}

                {/* 세탁기/건조기 전용 입력 폼 */}
                {deviceType === "세탁기/건조기" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600">주 평균 기기 사용 횟수</span>
                      <span className="text-xs font-bold text-teal-700">
                        주당 평균 {washerWeeklyCount}회 작동
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={washerWeeklyCount}
                      onChange={(e) => setWasherWeeklyCount(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>1회 (싱글 가구)</span>
                      <span>4회 (표준 주 3~4회)</span>
                      <span>10회 (자녀 가구)</span>
                      <span>20회 (다회 작동)</span>
                    </div>
                  </div>
                )}

                {/* 인덕션 / 기존 기기용 가동 시간 폼 */}
                {deviceType !== "냉장고" && deviceType !== "세탁기/건조기" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-slate-600">하루 평균 기기 가동 시간</span>
                      <span className="text-xs font-bold text-teal-700">
                        하루 평균 {dailyUsageHours}시간
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={24}
                      step={1}
                      value={dailyUsageHours}
                      onChange={(e) => setDailyUsageHours(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>1시간</span>
                      <span>6시간</span>
                      <span>12시간</span>
                      <span>18시간</span>
                      <span>24시간</span>
                    </div>
                  </div>
                )}

                {/* 인덕션용 추가 스펙 (화구 수) 입력 폼 */}
                {deviceType === "인덕션" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-semibold text-slate-600">비교 대상 인덕션 화구(Zonings) 수</span>
                      <span className="text-xs font-bold text-teal-700">{inductionBurners}구</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={inductionBurners}
                      onChange={(e) => setInductionBurners(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Time of Day */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">주요 가동 시간대</label>
                    <select
                      value={timeOfDay}
                      onChange={(e) => setTimeOfDay(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                    >
                      <option>낮/오후 위주 (12시 ~ 20시)</option>
                      <option>밤/새벽 위주 (20시 ~ 익일 08시)</option>
                      <option>하루 종일 지속 사용</option>
                      <option>일정치 않고 필요시 잠깐씩 가동</option>
                    </select>
                  </div>

                  {/* User preference */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">선호 가동 세팅 방식</label>
                    <input
                      type="text"
                      value={userPreference}
                      onChange={(e) => setUserPreference(e.target.value)}
                      placeholder="예) 직접 바람 없고 조용한 설정 선호"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Install Conditions (Dynamic depending on device type) */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>4. 가전 세부 설치 조건</span>
                </h4>

                {deviceType === "에어컨" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">실외기 설치 형태</label>
                      <select
                        value={outdoorUnitPos}
                        onChange={(e) => setOutdoorUnitPos(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>외부 전용 거치대 (빌라/오피스텔 외부 난간)</option>
                        <option>아파트 내 실외기 전용실 (갤러리창 구비)</option>
                        <option>앞베란다 내부 바닥 설치 (루버셔터형 아님)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">예상 배관 길이 (m)</label>
                        <input
                          type="number"
                          min={2}
                          max={30}
                          value={pipeLength}
                          onChange={(e) => setPipeLength(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">벽면 타공 개수</label>
                        <select
                          value={perforations}
                          onChange={(e) => setPerforations(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                        >
                          <option value={0}>0개 (타공 필요 없음)</option>
                          <option value={1}>1개</option>
                          <option value={2}>2개</option>
                          <option value={3}>3개 이상</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {deviceType === "보일러" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">콘덴싱 배출용 물배수구 유무</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={drainExists}
                          onChange={(e) => setDrainExists(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                        <span className="ml-2 text-xs font-semibold text-slate-700">{drainExists ? "있음" : "없음"}</span>
                      </label>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-semibold text-slate-600">실내 온수 분배기 개수 (밸브 수)</span>
                        <span className="text-xs font-bold text-teal-700">{manifoldCount}구</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={12}
                        step={1}
                        value={manifoldCount}
                        onChange={(e) => setManifoldCount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                      />
                    </div>
                  </div>
                )}

                {(deviceType === "제습기" || deviceType === "공기청정기" || deviceType === "기타 생활가전") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">기기 공간이동 빈도</label>
                      <select
                        value={moveFrequency}
                        onChange={(e) => setMoveFrequency(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>자주 이동함 (바퀴/손잡이 필수)</option>
                        <option>가끔 이동함 (계절별로 이동)</option>
                        <option>고정하고 거의 이동 안 함</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">모터 운전소음 민감도</label>
                      <select
                        value={noiseSensitivity}
                        onChange={(e) => setNoiseSensitivity(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>상 (소음에 매우 신경 쓰임)</option>
                        <option>중 (일반 수준 소음)</option>
                        <option>하 (소음은 크게 개의치 않음)</option>
                      </select>
                    </div>
                  </div>
                )}

                {deviceType === "냉장고" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">냉장고 배치 형태</label>
                      <select
                        value={refrigeratorType}
                        onChange={(e) => setRefrigeratorType(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>프리스탠딩 (독립 배치, 통풍 우수)</option>
                        <option>키친핏/빌트인 (빌트인 장 밀착 배치)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">컴프레서 소음 민감도</label>
                      <select
                        value={noiseSensitivity}
                        onChange={(e) => setNoiseSensitivity(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>상 (침실 인근 및 극도의 저소음 선호)</option>
                        <option>중 (표준 생활 밀착 수준 소음)</option>
                        <option>하 (신경 쓰지 않음)</option>
                      </select>
                    </div>
                  </div>
                )}

                {deviceType === "세탁기/건조기" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">제품 설치/탑재 형태</label>
                      <select
                        value={washerSetup}
                        onChange={(e) => setWasherSetup(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>직렬 탑재 (세탁기+건조기 일체 타워형)</option>
                        <option>병렬 탑재 (가로형 나란히 설치)</option>
                        <option>단독 설치 (세탁기 혹은 건조기 1대만 단독)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">탈수 모터 진동/소음 민감도</label>
                      <select
                        value={noiseSensitivity}
                        onChange={(e) => setNoiseSensitivity(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>상 (밤샘 세탁 가동, 진동 저감 필수)</option>
                        <option>중 (일반 주간 가동 수준)</option>
                        <option>하 (다용도실 설치로 크게 신경 쓰지 않음)</option>
                      </select>
                    </div>
                  </div>
                )}

                {deviceType === "인덕션" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">설치 전기배선 전력 방식</label>
                      <select
                        value={inductionPowerType}
                        onChange={(e) => setInductionPowerType(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>일반 플러그형 (최대 3.4kW 자동 전력 제어)</option>
                        <option>전용선 직결형 (단독 차단기 설치, 고화력 풀파워)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">상판 고온주의소음/조리 민감도</label>
                      <select
                        value={noiseSensitivity}
                        onChange={(e) => setNoiseSensitivity(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                      >
                        <option>상 (상판 스크래치 방지 및 저소음 쿨링팬 선호)</option>
                        <option>중 (표준 인덕션 가동음 수준)</option>
                        <option>하 (소음에 구애받지 않음)</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>

              {/* Submit Button */}
              <button
                type="button"
                id="submit-compare-btn"
                onClick={handleCompare}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-sky-700 hover:from-teal-500 hover:to-sky-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>전문 시뮬레이션 가동 중...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white" />
                    <span>가전 성능 & 효율 비교 분석하기</span>
                  </>
                )}
              </button>

              {/* Error messages */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">오류 발생:</span> {errorMsg}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT COLUMN: Results / Welcome / Loading */}
          <div className={`${(isLoading || result) ? "lg:col-span-12 w-full" : "lg:col-span-7"} min-h-[500px]`}>
            
            <AnimatePresence mode="wait">
              {/* STATE 1: INITIAL WELCOME SCREEN */}
              {!isLoading && !result && (
                <motion.div
                  key="welcome-panel"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center h-full"
                >
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">기기 스펙 매칭 시뮬레이터 준비 완료</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md mb-8">
                    비교를 원하시는 두 가전제품의 제조사/모델명과 우리집 단열 상태, 가족의 사용 시간 패턴을 좌측에 입력하신 후 분석해 보세요. 에너지 소비 효율과 누진 요금을 논리적으로 시뮬레이션해 드립니다.
                  </p>

                  <div className="border border-dashed border-slate-200 rounded-xl p-5 w-full bg-slate-50 text-left max-w-lg">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-teal-600" />
                      <span>시뮬레이터가 비교 분석하는 핵심 요소</span>
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>컴프레셔 구동 방식 (인버터 초절전 제어 vs 정속형 ON/OFF 반복에 따른 서지 전력 대비)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>주거 평형 대비 기기 권장 정격 냉난방/제습 능력의 초과/미달율 대조</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                        <span>주택용 저압/고압 요금제 누진 구간 적용에 따른 실시간 요금 가중치 모델링</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* STATE 2: LOADING SCANNER */}
              {isLoading && (
                <LoadingView
                  deviceType={deviceType}
                  loadingStep={loadingStep}
                  getDeviceIcon={getDeviceIcon}
                  loadingStepsTexts={LOADING_STEPS_TEXTS}
                />
              )}

              {/* STATE 3: REPORT COMPLETED */}
              {!isLoading && result && (
                <ReportView
                  result={result}
                  deviceType={deviceType}
                  onReset={() => {
                    setResult(null);
                    setExtractedSpecA(null);
                    setExtractedSpecB(null);
                    setRawText("");
                    setExtractionError(null);
                    setTimeout(() => {
                      document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                  isChatLoading={isChatLoading}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  handleAskConsultant={handleAskConsultant}
                  getChatSuggestions={getChatSuggestions}
                  getDeviceIcon={getDeviceIcon}
                  chatBottomRef={chatBottomRef}
                />
              )}
            </AnimatePresence>

          </div>

        </div>

      </main>

      {/* 4. Drawer/Sidebar for History List */}
      <AnimatePresence>
        {showHistorySidebar && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistorySidebar(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            
            {/* Drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col border-l border-slate-100"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-slate-900">과거 가전 비교 분석 이력</h4>
                </div>
                <button 
                  onClick={() => setShowHistorySidebar(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
                >
                  닫기
                </button>
              </div>

              {/* History list content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {consultHistory.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <History className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-500" />
                    저장된 과거 비교 이력이 존재하지 않습니다.
                  </div>
                ) : (
                  consultHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all relative group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-sm">
                            {item.deviceType}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">{item.timestamp}</span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-800 mb-1 leading-relaxed">
                          {item.modelA.split(' ')[0]} vs {item.modelB.split(' ')[0]}
                        </h5>
                        <p className="text-[10px] text-slate-500 mb-2 truncate">
                          {item.homeInfo.areaSize}평 · 단열 {item.homeInfo.insulationStatus} · 하루 {item.usagePattern.dailyUsageHours}시간 가동
                        </p>
                        <p className="text-[10px] text-teal-700 font-medium bg-teal-50/50 p-2 rounded-md border border-teal-150/20 mb-3">
                          🏆 {item.result.winnerModel} ({item.result.winnerType}) 추천
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleLoadHistory(item)}
                          className="text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          리포트 불러오기
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {consultHistory.length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between">
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>전체 기록 삭제</span>
                  </button>
                  <p className="text-[10px] text-slate-400">최근 10개까지 자동 저장됩니다.</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200/60 text-slate-500 text-center py-6 text-xs mt-16">
        <p className="mb-1">© 2026 EcoVolt 가전제품 비교 분석기. All rights reserved.</p>
        <p>인공지능 모델(Gemini)에 의한 분석 수치로 실제 가전 환경 및 요금 체계에 따라 차이가 존재할 수 있습니다.</p>
      </footer>

    </div>
  );
}
