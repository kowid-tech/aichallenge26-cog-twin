import React from "react";
import { TOPICS_RECORDS } from "../data/presetData";
import { StudentProfile, TopicMastery, AdvisorRecommendation } from "../types";
import { Sparkles, Code, Volume2, Share2, AlertCircle, TrendingUp, Sliders, Settings } from "lucide-react";

interface SidebarMetricsProps {
  activeTab: "insights" | "cognitive" | "parameters" | "export";
  setActiveTab: (tab: "insights" | "cognitive" | "parameters" | "export") => void;
  profile: StudentProfile;
  handleSliderChange: (topicKey: string, newValue: number) => void;
  recommendation: AdvisorRecommendation & { targetOfWeakness?: string };
}

export default function SidebarMetrics({
  activeTab,
  setActiveTab,
  profile,
  handleSliderChange,
  recommendation
}: SidebarMetricsProps) {

  // Cognitive pace state label helpers
  const getPaceBadge = (pace: string) => {
    switch (pace) {
      case "accelerated":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "steady":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "intermittent":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-rose-50 text-rose-700 border-rose-100";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 border-b border-slate-200 shrink-0">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
            activeTab === "insights" 
              ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Mastery Matrix
        </button>
        <button
          onClick={() => setActiveTab("cognitive")}
          className={`flex-1 py-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
            activeTab === "cognitive" 
              ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Cognitive Profile
        </button>
        <button
          onClick={() => setActiveTab("parameters")}
          className={`flex-1 py-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
            activeTab === "parameters" 
              ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          What-If Simulator
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`flex-1 py-2 text-[10.5px] font-extrabold rounded-lg transition-all cursor-pointer ${
            activeTab === "export" 
              ? "bg-white text-indigo-750 shadow-sm border border-slate-200/50" 
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Twin JSON
        </button>
      </div>

      {/* Sidebar Panel Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        
        {/* MASTERY MATRIX */}
        {activeTab === "insights" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded"></span>
              Chronological Mastery Thresholds
            </h3>

            <div className="space-y-4">
              {(Object.entries(profile.topics) as Array<[string, TopicMastery]>).map(([key, data]) => {
                const label = TOPICS_RECORDS[key as keyof typeof TOPICS_RECORDS]?.name || key;
                const isWeak = data.mastery < 0.5;
                const percent = Math.round(data.mastery * 100);

                return (
                  <div key={key} className="group space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className={`font-semibold cursor-default ${isWeak ? "text-rose-600 font-extrabold" : "text-slate-700"}`}>
                        {label} {isWeak && " [Gap Zone]"}
                      </span>
                      <span className={`font-mono font-black ${isWeak ? "text-rose-600" : "text-emerald-600"}`}>
                        {percent}%
                      </span>
                    </div>

                    {/* Progress visual */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isWeak ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                      <span>Practice Attempts: {data.attempts}</span>
                      <span>Last: {data.last_seen === "Never" ? "Never Seen" : data.last_seen}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Retention Audit */}
            <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-xl mt-6 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Memory Decay warnings</span>
              <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                Student shows decay tendencies regarding basic division rules because they have not tested Fractions ratios in 2 days. 
              </p>
            </div>
          </div>
        )}

        {/* COGNITIVE PROFILE */}
        {activeTab === "cognitive" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-600 rounded"></span>
              Cognitive Profile Properties
            </h3>

            {/* Conceptual Pace */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs">
              <span className="text-slate-500 font-semibold">Conceptual Pace:</span>
              <span className={`px-2 py-0.5 border rounded-md font-sans text-[10px] font-black uppercase tracking-wider ${getPaceBadge(profile.cognitive.pace)}`}>
                {profile.cognitive.pace}
              </span>
            </div>

            {/* Feldern-Silverman learning style vectors */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Sensing (Concrete Examples)</span>
                  <span>Intuitive (Abstract/Logic)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: profile.cognitive.learningStyle.perception === "sensing" ? "30%" : "70%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Visual (Graphs/Shapes)</span>
                  <span>Verbal (Text/Speak)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: profile.cognitive.learningStyle.input === "visual" ? "30%" : "80%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                  <span>Active (Testing/Actions)</span>
                  <span>Reflective (Reading)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: profile.cognitive.learningStyle.processing === "active" ? "40%" : "70%" }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Predictive Learning Insights */}
            <div className="pt-2 border-t border-slate-100 space-y-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Predictive Metrics</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Pass Readiness</span>
                  <span className="text-xl font-black text-emerald-600 block leading-none">
                    {profile.cognitive.readinessScore}%
                  </span>
                </div>

                <div className={`border rounded-xl p-3 text-center ${
                  profile.cognitive.stallingRisk === "high" 
                    ? "bg-rose-50 border-rose-100 text-rose-700" 
                    : profile.cognitive.stallingRisk === "moderate"
                      ? "bg-amber-50 border-amber-100 text-amber-700"
                      : "bg-teal-50 border-teal-100 text-teal-700"
                }`}>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Stalling Risk</span>
                  <span className="text-xl font-black uppercase block leading-none">
                    {profile.cognitive.stallingRisk}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-1">
                <p className="text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Projected Roadmap Milestone:
                </p>
                <p className="text-xs text-indigo-900 font-semibold leading-relaxed">
                  {profile.cognitive.predictedMilestone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WHAT-IF PLAYGROUND */}
        {activeTab === "parameters" && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-indigo-600 rounded"></span>
                What-If Parameter Playground
              </h3>
              <p className="text-[11px] text-slate-500">
                Drag the sliders to simulate a hypothetical change in student diagnostic outcomes. Prerequisite constraints instantly recalculate.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {Object.keys(TOPICS_RECORDS).map(key => {
                const label = TOPICS_RECORDS[key as keyof typeof TOPICS_RECORDS].name;
                const currentObj = profile.topics[key] || { mastery: 0.0 };

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-semibold">{label}</span>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-extrabold text-[10.5px]">
                        {Math.round(currentObj.mastery * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={currentObj.mastery}
                      onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COGNITIVE TWIN JSON EXPORT */}
        {activeTab === "export" && (
          <div className="space-y-4 animate-fade-in h-full flex flex-col justify-between">
            <div className="space-y-1 shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
                <span>Twin JSON Specification</span>
                <span className="text-[9px] text-emerald-600 uppercase font-bold bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  Schema 1.0.4
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 leading-normal">
                Exports the calculated properties to synchronized enterprise learning management applications.
              </p>
            </div>

            <div className="flex-1 bg-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-emerald-400 overflow-auto border border-slate-800 my-4 min-h-[140px]">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  cognitive_twin: {
                    recommendations: {
                      topic_target: recommendation.study_next,
                      barrier_topic: recommendation.targetOfWeakness || null,
                      diagnostic_explanation: recommendation.reason
                    },
                    profile_attributes: {
                      pace: profile.cognitive.pace,
                      style_vectors: profile.cognitive.learningStyle,
                      readiness_score: profile.cognitive.readinessScore,
                      stalling_risk: profile.cognitive.stallingRisk
                    }
                  }
                }, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify({
                  cognitive_twin: {
                    recommendations: {
                      topic_target: recommendation.study_next,
                      barrier_topic: recommendation.targetOfWeakness || null,
                      diagnostic_explanation: recommendation.reason
                    },
                    profile_attributes: {
                      pace: profile.cognitive.pace,
                      style_vectors: profile.cognitive.learningStyle,
                      readiness_score: profile.cognitive.readinessScore,
                      stalling_risk: profile.cognitive.stallingRisk
                    }
                  }
                }, null, 2));
                alert("Copied dynamic Cognitive Twin JSON spec payload to clipboard!");
              }}
              className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <Code className="w-3.5 h-3.5" />
              Copy Student Spec Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
