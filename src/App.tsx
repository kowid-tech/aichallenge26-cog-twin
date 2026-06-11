import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Send,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ChevronRight,
  User,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StudentProfile, AdvisorRecommendation, Message, TopicMastery } from "./types";
import { 
  TOPICS_RECORDS, 
  PATHS, 
  INITIAL_LEITNER_DECK, 
  CONCEPT_GUIDES, 
  PRESET_PROFILES 
} from "./data/presetData";

import CognitiveGraph from "./components/CognitiveGraph";
import AgentPanel from "./components/AgentPanel";
import SidebarMetrics from "./components/SidebarMetrics";

export default function App() {
  // Profile preset states
  const [selectedPresetId, setSelectedPresetId] = useState<string>("demo_student");
  const [profile, setProfile] = useState<StudentProfile>(structuredClone(PRESET_PROFILES.demo_student));
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"insights" | "cognitive" | "parameters" | "export">("insights");
  const [panelView, setPanelView] = useState<"recommendation" | "chat" | "quiz">("recommendation");
  const [activeAgent, setActiveAgent] = useState<"twin" | "retention_agent" | "transfer_agent" | "accessibility_agent">("twin");

  // Interactive Leitner states
  const [leitnerDeck, setLeitnerDeck] = useState(structuredClone(INITIAL_LEITNER_DECK));
  const [selectedLeitnerIdx, setSelectedLeitnerIdx] = useState<number>(0);
  const [isLeitnerFlipped, setIsLeitnerFlipped] = useState<boolean>(false);

  // Skill transfer variables
  const [transferDomain, setTransferDomain] = useState<"physics" | "finance" | "music">("physics");
  const [transferRatio, setTransferRatio] = useState<number>(0.75);

  // Accessibility parameters
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    dyslexiaFont: false,
    highContrast: false,
    textSpacing: "normal" as "normal" | "wide" | "extraWide",
    simplifiedLanguage: false
  });

  // Target Focus Topic derived from recommendation study_next
  const [activeFocusTopic, setActiveFocusTopic] = useState<string>("fractions");

  // Quiz diagnostic responses
  const [quizAnswer, setQuizAnswer] = useState<string>("");
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Chat conversation logs
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      sender: "twin",
      text: "👋 Hello! I am your AI Cognitive Learning Twin. I model your conceptual strengths, track decay rates, and map prerequisite gaps in real time.\n\nSelect a topic above or ask me any question to begin diagnostic counseling!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [inputMsg, setInputMsg] = useState<string>( "");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deterministic Local Prerequisite recommender for real-time slider reactions
  const calculateRecommendation = (currTopics: typeof profile.topics): AdvisorRecommendation & { targetOfWeakness?: string } => {
    const prereqChain: Record<string, string[]> = {
      decimals: ["fractions"],
      geometry: ["fractions"],
      linear_equations: ["fractions", "decimals"],
      word_problems: ["linear_equations"],
      fractions: []
    };

    const getMasteryValue = (t: string) => currTopics[t]?.mastery ?? 0.0;
    const weakList = Object.keys(TOPICS_RECORDS).filter(t => getMasteryValue(t) < 0.5);

    if (weakList.length === 0) {
      const incomplete = Object.keys(TOPICS_RECORDS).filter(t => getMasteryValue(t) < 1.0);
      if (incomplete.length === 0) {
        return {
          study_next: "word_problems",
          reason: "You have achieved full mastery across all available math modules! Dynamic learner twin status is highly competent.",
          encouragement: "Sensational learning curve! Absolute mastery attained!"
        };
      }
      return {
        study_next: incomplete[0],
        reason: `Excellent. Let's practice ${TOPICS_RECORDS[incomplete[0] as keyof typeof TOPICS_RECORDS]?.name} further to complete all metric sectors to 100%.`,
        encouragement: "You are steps away from a flawless academic status!"
      };
    }

    // Sort weaknesses pedagogically
    const visualTeachingOrder = ["fractions", "decimals", "geometry", "linear_equations", "word_problems"];
    const sortedWeak = [...weakList].sort((a, b) => visualTeachingOrder.indexOf(a) - visualTeachingOrder.indexOf(b));

    // Resolve prerequisite gaps first
    for (const tw of sortedWeak) {
      const prs = prereqChain[tw] || [];
      const primaryWeakPrereq = prs.find(p => getMasteryValue(p) < 0.5);
      if (primaryWeakPrereq) {
        return {
          study_next: primaryWeakPrereq,
          reason: `${TOPICS_RECORDS[primaryWeakPrereq as keyof typeof TOPICS_RECORDS]?.name} is a vital prerequisite bottleneck for ${TOPICS_RECORDS[tw as keyof typeof TOPICS_RECORDS]?.name}. Raising this score first will resolve root confusion.`,
          encouragement: "Foundational mastery solves complex equations!",
          targetOfWeakness: tw
        };
      }
    }

    const leadTopic = sortedWeak[0];
    let reason = `Recommended learning target is ${TOPICS_RECORDS[leadTopic as keyof typeof TOPICS_RECORDS]?.name} based on chronological curricular pathways.`;
    let encouragement = "Focus on this topic to optimize your daily learning score!";

    if (leadTopic === "fractions") {
      reason = "Fractions form your core arithmetic root. Resolving this will simplify decimals conversion and algebraic equations simultaneously.";
      encouragement = "Mastering this basic fraction slice clears the road for algebra!";
    } else if (leadTopic === "decimals") {
      reason = "Decimals represent pos-10 fractional sizing. Refining this enables real-world physics formulas and rates measurements.";
      encouragement = "Let's connect your fraction segments straight to decimal spots!";
    } else if (leadTopic === "linear_equations") {
      reason = "Linear equations require balancing operations in mirror steps. A great gateway to high school mathematical physics.";
      encouragement = "Let's solve the mysteries of variable 'x' together!";
    }

    return {
      study_next: leadTopic,
      reason,
      encouragement
    };
  };

  const currentRecommendation = calculateRecommendation(profile.topics);

  // Sync active focus topic to proposed next target on study load
  useEffect(() => {
    if (currentRecommendation.study_next) {
      setActiveFocusTopic(currentRecommendation.study_next);
    }
  }, [selectedPresetId]);

  // Adjust profile states on slider Playground manipulation
  const handleSliderChange = (topicKey: string, newValue: number) => {
    setProfile(prev => {
      const updated = { ...prev.topics };
      updated[topicKey] = {
        ...updated[topicKey],
        mastery: parseFloat(newValue.toFixed(2)),
        attempts: updated[topicKey]?.attempts > 0 ? updated[topicKey].attempts : 1,
        last_seen: new Date().toISOString().split("T")[0]
      };

      const wks: string[] = [];
      Object.entries(updated as Record<string, TopicMastery>).forEach(([k, dat]) => {
        if (dat.mastery < 0.5) {
          wks.push(k);
        }
      });

      return {
        ...prev,
        updated_at: new Date().toISOString().split("T")[0],
        topics: updated,
        weaknesses: wks
      };
    });
  };

  const handleSelectTopicNode = (topicKey: string) => {
    setActiveFocusTopic(topicKey);
  };

  const handlePresetProfileSelection = (presetId: string) => {
    setSelectedPresetId(presetId);
    setProfile(structuredClone(PRESET_PROFILES[presetId]));
    setQuizSubmitted(false);
    setQuizFeedback(null);
  };

  // Scroll chat area
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Send message to back-end Gemini API proxy route safely
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userVal = inputMsg.trim();
    setInputMsg("");

    const updatedMessages = [
      ...chatMessages,
      {
        sender: "student" as const,
        text: userVal,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setChatMessages(updatedMessages);
    setIsTyping(true);

    try {
      const response = await fetch("/api/twin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          studentProfile: profile,
          targetTopic: activeFocusTopic,
          activeAgent: activeAgent
        })
      });

      if (!response.ok) {
        throw new Error("Adviser system connection issue.");
      }

      const resBody = await response.json();
      setChatMessages(prev => [
        ...prev,
        {
          sender: activeAgent,
          text: resBody.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.warn("API Error, showing simulated twin fallback response:", err);
      // Socratic pedagogical simulated tutor response as fallback if API has any latency/troubles
      const topicName = TOPICS_RECORDS[activeFocusTopic as keyof typeof TOPICS_RECORDS]?.name || activeFocusTopic;
      setChatMessages(prev => [
        ...prev,
        {
          sender: activeAgent,
          text: `💡 **[Tutor Companion] Learning Guidance on ${topicName}**:\n\nTo master this, let's look at the foundational partition. Try answering this simple step:\n- Where do you feel the gap originates? Common blocks in this section arise because we calculate denominators directly instead of keeping relative weights identical.\n\n*Would you like to try our active recall card on this section? Tap 'Retention' above.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Automated Remedial Plan generator triggered from advice
  const handleGenerateRemedialPlan = () => {
    setPanelView("chat");
    const targetName = TOPICS_RECORDS[activeFocusTopic as keyof typeof TOPICS_RECORDS]?.name;
    
    setChatMessages(prev => [
      ...prev,
      {
        sender: "student",
        text: `Can you generate a tailored visual lesson plan for my ${targetName} gap?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [
        ...prev,
        {
          sender: "twin",
          text: `🎯 **Personalized Remedial Path - ${targetName}**\n\n1. **Conceptual Alignment (10mins)**: Draw visual partitioning blocks to bridge concrete-abstract conversions.\n2. **Active Reciprocal Drills (15mins)**: Open 'Retention' tab to exercise active flashcards 2 times daily.\n3. **Validation Check**: Ask me "quiz me on equivalence" to earn dynamic mastery updates!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 700);
  };

  // Local Quiz grading callbacks
  const handleGradeQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);

    const textAns = quizAnswer.toLowerCase().trim();
    
    // Increment turns practiced count
    setProfile(prev => {
      const up = { ...prev.topics };
      up[activeFocusTopic] = {
        ...up[activeFocusTopic],
        attempts: (up[activeFocusTopic]?.attempts || 0) + 1,
        last_seen: new Date().toISOString().split("T")[0]
      };
      return { ...prev, topics: up };
    });

    if (activeFocusTopic === "fractions") {
      if (textAns.includes("yes") || textAns.includes("same") || textAns.includes("equal") || textAns.includes("1/3") || textAns.includes("2/6")) {
        setQuizFeedback({
          isCorrect: true,
          message: "Excellent! Jordan's portion of 2/6 simplifies precisely to 1/3 when dividing the numerator and denominator by 2. Thus, they ate equivalent slices!"
        });
        handleSliderChange("fractions", Math.min(1.0, profile.topics.fractions.mastery + 0.15));
      } else {
        setQuizFeedback({
          isCorrect: false,
          message: "Let's review: Jordan had 6 slices total and ate 2. Dividing both by 2 gives 1/3, meaning his total proportion was identical to Sarah's!"
        });
      }
    } else if (activeFocusTopic === "linear_equations") {
      if (textAns.includes("5") || textAns === "x=5" || textAns === "x = 5") {
        setQuizFeedback({
          isCorrect: true,
          message: "Flawless algebra! Subtracting 12 from both sides yields 3x = 15. Division by 3 leaves x = 5!"
        });
        handleSliderChange("linear_equations", Math.min(1.0, profile.topics.linear_equations.mastery + 0.15));
      } else {
        setQuizFeedback({
          isCorrect: false,
          message: "Not quite. Think about mirror operations: first pull 12 away from 27 to find what 3x is equal to, then solve for a single x."
        });
      }
    } else {
      if (textAns.includes("1.5") || textAns.includes("1 1/2") || textAns.includes("1.50")) {
        setQuizFeedback({
          isCorrect: true,
          message: "Correct quantitative conversion! Since 1/4 equals 0.25, placing it on top of 1.25 gives exactly 1.50."
        });
        handleSliderChange(activeFocusTopic, Math.min(1.0, (profile.topics[activeFocusTopic]?.mastery || 0) + 0.1));
      } else {
        setQuizFeedback({
          isCorrect: false,
          message: "Hint: 1/4 translates to 0.25 as a pos-10 decimal. Try completing the sum: 1.25 + 0.25 again."
        });
      }
    }
  };

  const handleResetQuizView = () => {
    setQuizAnswer("");
    setQuizFeedback(null);
    setQuizSubmitted(false);
  };

  return (
    <div className={`flex flex-col lg:h-screen w-full bg-slate-50 font-sans overflow-y-auto lg:overflow-hidden ${
      accessibilitySettings.highContrast ? "bg-slate-900 border-indigo-900" : ""
    }`}>
      
      {/* Premium Dashboard Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-600" />
            </span>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Cognitive Learning Twin</h1>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
              Core: Gemini-3.5-flash
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full uppercase tracking-wider">
              Diagnostic Twin Mode
            </span>
            <span className="text-slate-200 font-light">|</span>
            <span className="font-semibold text-slate-500">
              Active Learner ID: <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10.5px]">{profile.student_id}</span>
            </span>
          </div>
        </div>

        {/* Preset profiles pill selections */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            <button
              onClick={() => handlePresetProfileSelection("demo_student")}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                selectedPresetId === "demo_student" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Demo Profile
            </button>
            <button
              onClick={() => handlePresetProfileSelection("underprepared")}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                selectedPresetId === "underprepared" ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Struggling
            </button>
            <button
              onClick={() => handlePresetProfileSelection("transitioning")}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                selectedPresetId === "transitioning" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Transitioning
            </button>
            <button
              onClick={() => handlePresetProfileSelection("advanced_learner")}
              className={`px-3 py-1.5 text-[10.5px] font-bold rounded-md transition-all cursor-pointer ${
                selectedPresetId === "advanced_learner" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Advanced
            </button>
          </div>

          <div className="w-8.5 h-8.5 rounded-full bg-indigo-600 border-2 border-indigo-200 text-white font-extrabold flex items-center justify-center text-xs shadow-xs uppercase">
            {profile.student_id ? profile.student_id.substring(0, 2).toUpperCase() : "ST"}
          </div>
        </div>
      </header>

      {/* Main Responsive Layout */}
      <main className="flex-1 flex flex-col lg:flex-row gap-5 p-4 lg:p-5 h-auto lg:h-full lg:overflow-hidden">
        
        {/* COLUMN 1: Profile Matrix & Parameters (Sidebar) */}
        <section className="w-full lg:w-80 flex flex-col h-auto lg:h-full shrink-0">
          <SidebarMetrics
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
            handleSliderChange={handleSliderChange}
            recommendation={currentRecommendation}
          />
        </section>

        {/* COLUMN 2: Visual Knowledge Graph (Middle) */}
        <section className="w-full lg:flex-1 h-[340px] sm:h-[400px] lg:h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm shrink-0 lg:shrink-1">
          <CognitiveGraph
            topics={profile.topics}
            activeFocusTopic={activeFocusTopic}
            onSelectTopic={handleSelectTopicNode}
          />
        </section>

        {/* COLUMN 3: Central Recommendation Adviser & Quizzes (Right) */}
        <section className="w-full lg:w-96 flex flex-col h-[740px] sm:h-[780px] lg:h-full shrink-0">
          <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            {/* View Selector Controls */}
            <div className="flex bg-slate-100 p-1 border-b border-slate-200 shrink-0">
              <button
                onClick={() => setPanelView("recommendation")}
                className={`flex-1 py-2 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                  panelView === "recommendation" ? "bg-white text-indigo-750 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Learning Advisor
              </button>
              <button
                onClick={() => setPanelView("chat")}
                className={`flex-1 py-2 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                  panelView === "chat" ? "bg-white text-indigo-750 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Cooperative Agents
              </button>
              <button
                onClick={() => {
                  setPanelView("quiz");
                  handleResetQuizView();
                }}
                className={`flex-1 py-2 text-[10.5px] font-black rounded-lg transition-all cursor-pointer ${
                  panelView === "quiz" ? "bg-white text-indigo-750 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Practice Quiz
              </button>
            </div>

            {/* Dynamic Card Viewports */}
            <div className="flex-1 overflow-hidden flex flex-col">
              
              {/* LEARNING ADVISORY NODE DETAIL */}
              {panelView === "recommendation" && (
                <div className="flex-1 p-5 overflow-y-auto space-y-5 flex flex-col justify-between">
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 px-2.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                        Dynamic Pathway Advice
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 capitalize block">Proposed Focal Area:</span>
                      <h3 className="text-base font-black text-slate-800">
                        Solve: {TOPICS_RECORDS[currentRecommendation.study_next as keyof typeof TOPICS_RECORDS]?.name || currentRecommendation.study_next}
                      </h3>
                      <p className="text-xs text-rose-600 font-extrabold bg-rose-50/70 border border-rose-100 rounded-lg p-2.5 leading-relaxed">
                        {currentRecommendation.reason}
                      </p>
                    </div>

                    <div className="bg-slate-50/80 border border-slate-150 p-3.5 rounded-xl space-y-3">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">Sub-Concept Guidance:</span>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                        "{CONCEPT_GUIDES[currentRecommendation.study_next as keyof typeof CONCEPT_GUIDES]?.summary}"
                      </p>

                      <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                        <span className="text-[9px] font-black uppercase text-indigo-800 block">Expert Pedagogical Tips:</span>
                        <ul className="text-[11px] text-slate-500 pl-4 list-disc space-y-1 font-medium">
                          {(CONCEPT_GUIDES[currentRecommendation.study_next as keyof typeof CONCEPT_GUIDES]?.tips || []).map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleGenerateRemedialPlan()}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Retrieve Lesson Blueprint
                    </button>
                    <button
                      onClick={() => {
                        setPanelView("quiz");
                        handleResetQuizView();
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Begin Subject Quiz
                    </button>
                  </div>

                </div>
              )}

              {/* COOPERATIVE AGENTS PANEL CHAT */}
              {panelView === "chat" && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <AgentPanel
                      activeAgent={activeAgent}
                      setActiveAgent={setActiveAgent}
                      activeTopic={activeFocusTopic}
                      leitnerDeck={leitnerDeck}
                      setLeitnerDeck={setLeitnerDeck}
                      selectedLeitnerIdx={selectedLeitnerIdx}
                      setSelectedLeitnerIdx={setSelectedLeitnerIdx}
                      isLeitnerFlipped={isLeitnerFlipped}
                      setIsLeitnerFlipped={setIsLeitnerFlipped}
                      transferDomain={transferDomain}
                      setTransferDomain={setTransferDomain}
                      transferRatio={transferRatio}
                      setTransferRatio={setTransferRatio}
                      accessibilitySettings={accessibilitySettings}
                      setAccessibilitySettings={setAccessibilitySettings}
                    />
                  </div>

                  {/* Dialogue inputs inside parent agent block */}
                  <div className="border-t border-slate-200 p-3 bg-white space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => {
                          const topicLabel = TOPICS_RECORDS[activeFocusTopic as keyof typeof TOPICS_RECORDS]?.name;
                          setInputMsg(`Explain the active concept behind ${topicLabel} using intuitive analogies.`);
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full px-2.5 py-1 text-[9.5px] font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        💡 Ask Analogy
                      </button>
                      <button
                        onClick={() => {
                          setInputMsg("Can you diagnose why I am stalling on algebraic equations?");
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full px-2.5 py-1 text-[9.5px] font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        🔍 Diagnose Stalling
                      </button>
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        placeholder={`Chat with ${
                          activeAgent === "twin"
                            ? "Central Twin"
                            : activeAgent === "retention_agent"
                            ? "Retention Agent"
                            : activeAgent === "transfer_agent"
                            ? "Skill Transfer Agent"
                            : "Accessibility Agent"
                        }...`}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg active:scale-95 transition-all text-xs font-black cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        Send
                      </button>
                    </form>
                  </div>

                  {/* Active Dialogue messages drawer overlay */}
                  <div className="h-40 border-t border-slate-200 bg-slate-50/50 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin shrink-0">
                    {chatMessages.map((msg, index) => {
                      const isUser = msg.sender === "student";
                      return (
                        <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`p-2.5 rounded-xl text-xs max-w-[90%] leading-relaxed tracking-wide ${
                            isUser ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-700 rounded-tl-none border border-slate-200/50"
                          } ${accessibilitySettings.dyslexiaFont ? "font-sans leading-loose tracking-widest text-sm" : ""}`}>
                            {!isUser && (
                              <span className="block text-[8px] font-black uppercase text-indigo-700 mb-0.5 tracking-wider">
                                {msg.sender.replace("_", " ")}
                              </span>
                            )}
                            <p className="whitespace-pre-wrap font-semibold text-[10.5px]">{msg.text}</p>
                            <span className="block text-[8px] text-right text-slate-400 mt-1">{msg.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex gap-1.5 items-center py-1.5">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    )}
                    <div ref={chatBottomRef}></div>
                  </div>

                </div>
              )}

              {/* COGNITIVE SUBJECT QUIZ */}
              {panelView === "quiz" && (
                <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-indigo-50/30 border border-indigo-150 p-3 rounded-lg">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 font-mono">Focal Section:</span>
                      <span className="text-xs font-black text-slate-800">
                        {TOPICS_RECORDS[activeFocusTopic as keyof typeof TOPICS_RECORDS]?.name || activeFocusTopic}
                      </span>
                    </div>

                    {/* Dynamic math quiz formulation depending on focus topic */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[90px] flex items-center justify-center">
                      {activeFocusTopic === "fractions" && (
                        <p className="text-xs text-slate-600 leading-relaxed font-extrabold text-center">
                          Q: Sarah ate 1/3 of a cake bar and Jordan ate 2/6. Did they consume the same amount? (Type 'yes' or 'no' with a brief reason).
                        </p>
                      )}

                      {activeFocusTopic === "linear_equations" && (
                        <p className="text-xs text-slate-600 leading-relaxed font-extrabold text-center w-full">
                          Q: Solve the variable x to balance the equation:<br />
                          <span className="text-sm font-mono text-indigo-600 font-black block mt-2 text-center">3x + 12 = 27</span>
                        </p>
                      )}

                      {activeFocusTopic !== "fractions" && activeFocusTopic !== "linear_equations" && (
                        <p className="text-xs text-slate-600 leading-relaxed font-extrabold text-center">
                          Q: Turn the following sum into a standard decimal answer:<br />
                          <span className="font-mono text-indigo-600 font-black block mt-1.5">what is 1.25 plus 1/4 of a unit?</span>
                        </p>
                      )}
                    </div>

                    {!quizSubmitted ? (
                      <form onSubmit={handleGradeQuiz} className="space-y-3">
                        <input
                          type="text"
                          value={quizAnswer}
                          onChange={(e) => setQuizAnswer(e.target.value)}
                          placeholder="Type your diagnostic solution..."
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer text-center"
                        >
                          Submit Answer
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-3 rounded-lg border text-xs leading-relaxed font-medium ${
                          quizFeedback?.isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                        }`}>
                          <span className="font-extrabold block uppercase tracking-wider text-[10px] mb-1.5">
                            {quizFeedback?.isCorrect ? "✅ Perfect score!" : "⚠️ Review suggestions:"}
                          </span>
                          <p>{quizFeedback?.message}</p>
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            onClick={() => handleResetQuizView()}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer text-center"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={() => {
                              setPanelView("chat");
                              setInputMsg(`Can you explain the mathematical steps behind the ${activeFocusTopic} quiz?`);
                            }}
                            className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg cursor-pointer text-center"
                          >
                            Explain logic
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Earn progress dynamically! Answering correct math answers expands target mastery levels by 15%.
                    </span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
