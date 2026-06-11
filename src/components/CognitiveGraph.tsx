import React from "react";
import { TOPICS_RECORDS, PATHS } from "../data/presetData";
import { TopicMastery } from "../types";
import { Brain, HelpCircle, GraduationCap, Clock, AlertTriangle } from "lucide-react";

interface CognitiveGraphProps {
  topics: Record<string, TopicMastery>;
  activeFocusTopic: string;
  onSelectTopic: (topicKey: string) => void;
}

export default function CognitiveGraph({ topics, activeFocusTopic, onSelectTopic }: CognitiveGraphProps) {
  // Coordinates layout for our curriculum flow
  const nodes: Record<string, { x: number; y: number; label: string; cat: string; level: string }> = {
    fractions: { x: 70, y: 150, label: "Fractions", cat: "Foundation", level: "Grade 5-6" },
    decimals: { x: 230, y: 70, label: "Decimals", cat: "Positional Numbers", level: "Grade 6" },
    geometry: { x: 230, y: 230, label: "Geometry", cat: "Spatial Scale", level: "Grade 6-7" },
    linear_equations: { x: 410, y: 150, label: "Linear Equations", cat: "Algebra Core", level: "Grade 7-8" },
    word_problems: { x: 570, y: 150, label: "Word Problems", cat: "Applied Verbal", level: "Grade 8" }
  };

  // Helper to retrieve mastery info
  const getTopicState = (key: string) => {
    const data = topics[key] || { mastery: 0, attempts: 0, decayRate: 0, daysSinceSeen: 99 };
    const isWeak = data.mastery < 0.5;
    const isMastered = data.mastery >= 0.8;
    return {
      mastery: data.mastery,
      attempts: data.attempts,
      isWeak,
      isMastered,
      decayRate: data.decayRate || 0.1,
      daysSinceSeen: data.daysSinceSeen || 0
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Visual map dashboard overview */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Brain className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dynamic Learner Knowledge Graph</h4>
            <p className="text-[10px] text-slate-400">Interactive curriculum dependency tree. Select nodes to focus cognitive parameters.</p>
          </div>
        </div>
        <div className="flex gap-3 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Mastered (≥80%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Weak / Decay Gap (&lt;50%)
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="flex-1 relative bg-slate-50/20 flex items-center justify-center p-2 overflow-auto" style={{ minHeight: "310px" }}>
        <svg 
          viewBox="0 0 650 300" 
          className="w-full max-w-[620px] h-auto overflow-visible select-none drop-shadow-sm"
        >
          {/* Definitions for arrow marker gradients */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#cbd5e1" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Prerequisite paths connects */}
          {PATHS.map((path, idx) => {
            const start = nodes[path.from];
            const end = nodes[path.to];
            if (!start || !end) return null;

            const fromState = getTopicState(path.from);
            const toState = getTopicState(path.to);
            const isPathUnlocked = fromState.mastery >= 0.5;

            // Draw slightly curved quadratic bezier lines
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const cx = start.x + dx / 2;
            const cy = start.y + dy / 2 - (dy === 0 ? 15 : 0); // curve straight horizontal links slightly
            const pathData = `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;

            return (
              <g key={idx}>
                {/* Glow layer if path is highly interactive / unlocked */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isPathUnlocked ? "#6366f1" : "#e2e8f0"}
                  strokeWidth={isPathUnlocked ? "2" : "1.5"}
                  strokeDasharray={isPathUnlocked ? "0" : "4 3"}
                  markerEnd={`url(#${isPathUnlocked ? "arrow-active" : "arrow"})`}
                  className="transition-all duration-350"
                  opacity={isPathUnlocked ? 0.7 : 0.4}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {Object.entries(nodes).map(([key, node]) => {
            const state = getTopicState(key);
            const isActive = activeFocusTopic === key;
            
            // Choose color scheme based on mastery thresholds
            const borderCol = state.isWeak 
              ? "stroke-rose-500" 
              : state.isMastered 
                ? "stroke-emerald-500" 
                : "stroke-indigo-500";
            const fillCol = state.isWeak
              ? "fill-rose-50/95"
              : state.isMastered
                ? "fill-emerald-50/95"
                : "fill-indigo-50/95";
            const textCol = state.isWeak
              ? "text-rose-700"
              : state.isMastered
                ? "text-emerald-700"
                : "text-indigo-700";

            return (
              <g 
                key={key} 
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectTopic(key)}
              >
                {/* Animated pulsating hover ring */}
                <circle
                  r={isActive ? "28" : "24"}
                  className={`fill-none stroke-offset-2 transition-all duration-300 ${borderCol} ${
                    isActive ? "stroke-[3px] opacity-100" : "stroke-2 opacity-60 group-hover:opacity-100"
                  }`}
                  strokeDasharray={isActive ? "none" : "3 1"}
                />

                {/* Main Node Circle */}
                <circle
                  r={isActive ? "25" : "21"}
                  className={`transition-all duration-300 ${fillCol} ${borderCol} stroke-2`}
                />

                {/* Weakness Decay Warning Banner visual */}
                {state.isWeak && state.attempts > 0 && (
                  <g transform="translate(0, -29)">
                    <rect x="-18" y="-7" width="36" height="13" rx="4" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1" />
                    <text textAnchor="middle" y="2" className="fill-rose-800 font-sans font-extrabold" fontSize="8">GAP</text>
                  </g>
                )}

                {/* Mastery Percentage Display Badge */}
                <text 
                  textAnchor="middle" 
                  y="4" 
                  className={`font-sans font-black tracking-tight ${textCol}`} 
                  fontSize={isActive ? "11" : "9"}
                >
                  {Math.round(state.mastery * 100)}%
                </text>

                {/* Node Label Below */}
                <text
                  textAnchor="middle"
                  y={isActive ? "42" : "36"}
                  className={`font-sans font-extrabold select-none transition-colors duration-300 ${
                    isActive ? "fill-indigo-950 font-black" : "fill-slate-600 group-hover:fill-slate-900"
                  }`}
                  fontSize={isActive ? "11" : "9"}
                >
                  {node.label}
                </text>

                {/* Little helper category label on hover */}
                <text
                  textAnchor="middle"
                  y={isActive ? "52" : "46"}
                  className="fill-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  fontSize="7.5"
                >
                  {node.cat}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Live Selected Node Diagnostic card drawer */}
      <div className="p-4 bg-white border-t border-slate-100 rounded-b-xl shrink-0">
        {(() => {
          const detail = nodes[activeFocusTopic] || nodes.fractions;
          const status = getTopicState(activeFocusTopic);
          const fullInfo = TOPICS_RECORDS[activeFocusTopic as keyof typeof TOPICS_RECORDS] || TOPICS_RECORDS.fractions;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-800">{detail.label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold font-mono uppercase">{detail.cat}</span>
                  <span className="text-[10px] text-slate-400">({detail.level})</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                  {fullInfo.info}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex flex-col justify-center text-left">
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                  <span>Decay Rate:</span>
                  <span className="font-mono text-slate-700 font-extrabold">{(status.decayRate * 100).toFixed(0)}%/day</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mt-1">
                  <span>Turns Practiced:</span>
                  <span className="font-mono text-slate-700 font-extrabold">{status.attempts}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mt-1">
                  <span>Last Checked:</span>
                  <span className="font-mono text-indigo-600 font-extrabold text-[9px] flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {status.daysSinceSeen === 99 ? "Never" : status.daysSinceSeen === 0 ? "Today" : `${status.daysSinceSeen}d ago`}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
