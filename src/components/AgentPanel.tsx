import React from "react";
import { Brain, RefreshCw, Sparkles, Sliders, Music, DollarSign, Activity, HelpCircle, Eye, Check, X } from "lucide-react";
import { TopicMastery } from "../types";

interface AgentPanelProps {
  activeAgent: "twin" | "retention_agent" | "transfer_agent" | "accessibility_agent";
  setActiveAgent: (agent: "twin" | "retention_agent" | "transfer_agent" | "accessibility_agent") => void;
  activeTopic: string;
  leitnerDeck: Array<{ id: string; front: string; back: string; deck: number; topic: string }>;
  setLeitnerDeck: React.Dispatch<React.SetStateAction<Array<{ id: string; front: string; back: string; deck: number; topic: string }>>>;
  selectedLeitnerIdx: number;
  setSelectedLeitnerIdx: React.Dispatch<React.SetStateAction<number>>;
  isLeitnerFlipped: boolean;
  setIsLeitnerFlipped: (flipped: boolean) => void;
  transferDomain: "physics" | "finance" | "music";
  setTransferDomain: (domain: "physics" | "finance" | "music") => void;
  transferRatio: number;
  setTransferRatio: (ratio: number) => void;
  accessibilitySettings: {
    dyslexiaFont: boolean;
    highContrast: boolean;
    textSpacing: "normal" | "wide" | "extraWide";
    simplifiedLanguage: boolean;
  };
  setAccessibilitySettings: React.Dispatch<React.SetStateAction<{
    dyslexiaFont: boolean;
    highContrast: boolean;
    textSpacing: "normal" | "wide" | "extraWide";
    simplifiedLanguage: boolean;
  }>>;
}

export default function AgentPanel({
  activeAgent,
  setActiveAgent,
  activeTopic,
  leitnerDeck,
  setLeitnerDeck,
  selectedLeitnerIdx,
  setSelectedLeitnerIdx,
  isLeitnerFlipped,
  setIsLeitnerFlipped,
  transferDomain,
  setTransferDomain,
  transferRatio,
  setTransferRatio,
  accessibilitySettings,
  setAccessibilitySettings
}: AgentPanelProps) {

  // Retrieve relevant flashcards based on active topic focus
  const relevantCards = leitnerDeck.filter(c => c.topic === activeTopic);
  const currentCard = relevantCards.length > 0 ? relevantCards[selectedLeitnerIdx % relevantCards.length] : null;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tab Selection */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveAgent("twin")}
          className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeAgent === "twin" 
              ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
          title="Cognitive Learning Twin Central Coordinator"
        >
          <Brain className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="hidden sm:inline">Central Twin</span>
          <span className="inline sm:hidden text-[9px]">Twin</span>
        </button>

        <button
          onClick={() => setActiveAgent("retention_agent")}
          className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeAgent === "retention_agent" 
              ? "bg-white text-amber-800 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
          title="Spaced Repetition & Leptner Memory Decay Auditor"
        >
          <RefreshCw className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Retention</span>
        </button>

        <button
          onClick={() => setActiveAgent("transfer_agent")}
          className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeAgent === "transfer_agent" 
              ? "bg-white text-emerald-800 shadow-sm border border-indigo-100" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
          title="Cross-Domain Analogical Translation Module"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="hidden sm:inline">Skill Transfer</span>
          <span className="inline sm:hidden text-[9px]">Transfer</span>
        </button>

        <button
          onClick={() => setActiveAgent("accessibility_agent")}
          className={`py-2 px-1 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeAgent === "accessibility_agent" 
              ? "bg-white text-blue-800 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
          title="Cognitive Impairment Filters & Accessibility Overrides"
        >
          <Sliders className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="hidden sm:inline">Accessibility</span>
          <span className="inline sm:hidden text-[9px]">Access</span>
        </button>
      </div>

      {/* Main Agent Workspace */}
      <div className="flex-1 p-5 overflow-y-auto">
        
        {/* TWIN COORDINATOR */}
        {activeAgent === "twin" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Central Cognitive Coordinator</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Integrates real-time diagnostic inputs, assesses root conceptual weaknesses, and synchronizes the remedial pathways.
                </p>
              </div>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Twin Responsibilities</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800">⚡ Dynamic Pathway</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Calculates prerequisite blockers. Restructures target topics instantly on state shift.</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-100">
                  <span className="font-bold text-slate-800">🧠 Diagnostic Graph</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tracks chronological mastery thresholds and identifies forgotten details.</p>
                </div>
              </div>
            </div>

            <div className="text-xs bg-indigo-50/50 text-indigo-900 p-3.5 rounded-lg border border-indigo-100/50 leading-relaxed font-medium">
              💡 <span className="font-bold">Advice:</span> Use the <span className="font-bold">What-If Playground</span> on the left tab to change values. Notice how the central recommendation auto-points to foundational roots (e.g., Fraction mastery blockers).
            </div>
          </div>
        )}

        {/* RETENTION AGENT */}
        {activeAgent === "retention_agent" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Retention & Spaced Repetition Agent</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Audits forgetting intervals. Uses a Leitner system to test active memory recall.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase tracking-wide">
                Leitner Box Active
              </span>
            </div>

            {/* Leitner Box Widget */}
            <div className="border border-amber-200 bg-amber-50/20 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono font-black text-amber-800 tracking-widest">
                  Focal Topic Flashcard: <span className="underline italic text-indigo-700">{activeTopic.replace("_", " ")}</span>
                </span>
                {currentCard && (
                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Box {currentCard.deck}
                  </span>
                )}
              </div>

              {currentCard ? (
                <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-xs min-h-[110px] flex flex-col justify-between transition-all">
                  <div className="flex-1 flex items-center justify-center py-2 text-center">
                    {!isLeitnerFlipped ? (
                      <p className="text-xs font-extrabold text-slate-800 leading-relaxed px-2">{currentCard.front}</p>
                    ) : (
                      <div className="w-full bg-emerald-50/30 border border-emerald-100 p-3 rounded-lg text-left">
                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Decoded Answer:</span>
                        <p className="text-xs font-semibold text-emerald-900 leading-relaxed">{currentCard.back}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setIsLeitnerFlipped(!isLeitnerFlipped)}
                      className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isLeitnerFlipped ? "Show Question" : "Reveal Answer"}
                    </button>

                    {isLeitnerFlipped && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setLeitnerDeck(prev => prev.map(c => c.id === currentCard.id ? { ...c, deck: Math.min(3, c.deck + 1) } : c));
                            setIsLeitnerFlipped(false);
                            setSelectedLeitnerIdx(prev => prev + 1);
                          }}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Got It
                        </button>
                        <button
                          onClick={() => {
                            setLeitnerDeck(prev => prev.map(c => c.id === currentCard.id ? { ...c, deck: 1 } : c));
                            setIsLeitnerFlipped(false);
                            setSelectedLeitnerIdx(prev => prev + 1);
                          }}
                          className="px-2.5 py-1.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Forgot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 border border-amber-100 p-6 rounded-xl text-center">
                  <p className="text-xs text-amber-800 italic">No flashcards loaded for the current focal topic yet. Tweak different topic parameters to see customized cards.</p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              💡 **Leitner Rule**: Correctly recalled cards move up a box and are tested less frequently. Forgotten cards return to Box 1, securing systematic overlearning of weak items.
            </p>
          </div>
        )}

        {/* SKILL TRANSFER AGENT */}
        {activeAgent === "transfer_agent" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Skill Transfer Agent</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Traces mathematical formulas into real-world analogue environments to secure conceptual agility.
                  </p>
                </div>
              </div>
            </div>

            {/* Domain Tabs Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTransferDomain("physics")}
                className={`flex-1 py-1 px-1.5 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  transferDomain === "physics" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3 h-3 text-emerald-500" />
                Physics
              </button>
              <button
                onClick={() => setTransferDomain("finance")}
                className={`flex-1 py-1 px-1.5 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  transferDomain === "finance" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <DollarSign className="w-3 h-3 text-amber-500" />
                Finance
              </button>
              <button
                onClick={() => setTransferDomain("music")}
                className={`flex-1 py-1 px-1.5 text-[10.5px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  transferDomain === "music" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Music className="w-3 h-3">
                  <span className="text-[10px]">🎵</span>
                </Music>
                Music
              </button>
            </div>

            {/* Interactive Analogy slider panel */}
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4.5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Analogue Proportional Slider:</span>
                <span className="font-mono text-emerald-800 font-black bg-emerald-100/50 px-2.5 py-0.5 rounded-md text-xs">
                  {Math.round(transferRatio * 100)}% ({Math.round(transferRatio * 4)}/4 Scale)
                </span>
              </div>

              <input
                type="range"
                min="0.25"
                max="1"
                step="0.25"
                value={transferRatio}
                onChange={(e) => setTransferRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              {/* Live Analog Translation Text block */}
              <div className="bg-white border border-emerald-100 rounded-lg p-3 text-xs leading-relaxed text-emerald-950 font-medium space-y-1.5">
                <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest block">
                  Interactive Analogy Mapping:
                </span>
                
                {transferDomain === "physics" && (
                  <div>
                    <span className="font-extrabold text-slate-800">Density load on liquid volumes:</span>
                    <p className="text-slate-600 mt-1">
                      A fluid mass load of <span className="font-bold text-indigo-700">{(transferRatio * 12).toFixed(1)} kg</span> spread in segments represents an exact density ratio partition of <span className="font-semibold text-emerald-700">{transferRatio === 0.25 ? "1/4" : transferRatio === 0.5 ? "2/4 (1/2)" : transferRatio === 0.75 ? "3/4" : "4/4 (Whole)"}</span> volume displacement scale.
                    </p>
                  </div>
                )}

                {transferDomain === "finance" && (
                  <div>
                    <span className="font-extrabold text-slate-800">Pro-rata payout yields:</span>
                    <p className="text-slate-600 mt-1">
                      A capitalization allocation amount of <span className="font-bold text-amber-700">${(transferRatio * 5000).toLocaleString()}</span> represents a partial pro-rata yield partition of <span className="font-semibold text-emerald-700">{transferRatio === 0.25 ? "1/4" : transferRatio === 0.5 ? "2/4 (1/2)" : transferRatio === 0.75 ? "3/4" : "4/4"}</span> of the parent asset. Interest splits build on these proportional values!
                    </p>
                  </div>
                )}

                {transferDomain === "music" && (
                  <div>
                    <span className="font-extrabold text-slate-800">Musical rhythm meters:</span>
                    <p className="text-slate-600 mt-1">
                      A time signature measure of <span className="font-bold text-slate-800">{Math.round(transferRatio * 4)}/4</span> rhythm denotes exactly <span className="font-semibold text-emerald-700">{transferRatio === 0.25 ? "one single quarter-note beat" : transferRatio === 0.5 ? "two quarter-note beats (half bar)" : transferRatio === 0.75 ? "three quarter-note beats" : "a complete finished whole bar measures"}</span>. Fractional divisions write directly onto sheet orchestrations!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACCESSIBILITY AGENT */}
        {activeAgent === "accessibility_agent" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <Sliders className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Accessibility & Simplicity Agent</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Provides layout overrides to combat high cognitive loads and dyslexia. Alters chat layouts in real time.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-4">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Interface Adaptations</h5>
              
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dyslexic-Friendly Font</p>
                    <p className="text-[10px] text-slate-400">Enlarges line height and optimizes spacing metrics.</p>
                  </div>
                  <button
                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative cursor-pointer ${
                      accessibilitySettings.dyslexiaFont ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                      accessibilitySettings.dyslexiaFont ? "left-6" : "left-1"
                    }`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">High Contrast Layout</p>
                    <p className="text-[10px] text-slate-400">Forces deep borders, simple colors, and high visual outlines.</p>
                  </div>
                  <button
                    onClick={() => setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }))}
                    className={`w-11 h-6 rounded-full transition-all duration-200 relative cursor-pointer ${
                      accessibilitySettings.highContrast ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${
                      accessibilitySettings.highContrast ? "left-6" : "left-1"
                    }`}></span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-bold text-slate-800">Character & Tracking Spacing</p>
                    <span className="text-[9px] font-bold font-mono text-blue-600 uppercase">
                      {accessibilitySettings.textSpacing}
                    </span>
                  </div>
                  <div className="flex gap-1 bg-slate-200/50 p-1 rounded-lg border border-slate-200">
                    {(["normal", "wide", "extraWide"] as const).map(sp => (
                      <button
                        key={sp}
                        onClick={() => setAccessibilitySettings(prev => ({ ...prev, textSpacing: sp }))}
                        className={`flex-1 py-1 text-[9px] font-bold rounded uppercase cursor-pointer transition-all ${
                          accessibilitySettings.textSpacing === sp ? "bg-white text-blue-800 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] bg-blue-50 text-blue-900 border border-blue-100 p-3 rounded-lg leading-relaxed font-semibold">
              ℹ️ Notice: Activating Dyslexic-Friendly spacing instantly scales the typography and padding parameters inside our central Cognitive Chat segments below!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
