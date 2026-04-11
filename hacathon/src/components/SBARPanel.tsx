"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FilePlus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { HighlightedText } from "@/components/HighlightedKeywords";

export function SBARPanel({ handoffData }: any) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Follow up on generic Sputum culture results", done: false },
    { id: 2, text: "Review PRN Pain Medication effectiveness", done: true }
  ]);
  const [activeAlert, setActiveAlert] = useState<{ word: string; tooltip: string; sourceData?: string } | null>(null);

  const handleKeywordClick = (keyword: any) => {
    setActiveAlert({ word: keyword.word, tooltip: keyword.tooltip, sourceData: keyword.sourceData });
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sbar = handoffData?.sbar;
  if (!sbar) return null;

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-400" />
            <h2 className="text-white font-semibold flex items-center gap-2 tracking-tight">AI-Generated SBAR Handoff</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md font-medium font-mono border border-slate-800 inline-flex items-center gap-2">
            Synced: Just now
          </span>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400">
          <span className="bg-slate-900 border border-slate-700 rounded-full px-3 py-1">Why? (AI Rational)</span>
          <span className="bg-amber-500/10 text-amber-300 border border-amber-400 rounded-full px-3 py-1">Source Anchors</span>
          <span className="bg-crimson-500/10 text-crimson-300 border border-crimson-400 rounded-full px-3 py-1">Clinician Audit</span>
        </div>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-slate-900">
        {activeAlert && (
          <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4 text-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Active anchor</p>
                <h3 className="text-sm font-semibold text-white">{activeAlert.word}</h3>
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-amber-300 bg-amber-900/30 px-2 py-1 rounded-full">Source highlight</span>
            </div>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">{activeAlert.tooltip}</p>
            {activeAlert.sourceData && (
              <p className="mt-2 text-[12px] text-slate-400 border-t border-slate-800 pt-3">Source Data: <span className="text-emerald-300 font-mono">{activeAlert.sourceData}</span></p>
            )}
          </div>
        )}

        <SBARSection title="Situation" color="indigo">
          <div className="text-slate-300 leading-relaxed text-sm">
            <HighlightedText
              text={sbar.situation.text}
              onHover={() => null}
              onClick={handleKeywordClick}
            />
          </div>
        </SBARSection>

        <SBARSection title="Background" color="slate">
          <div className="text-slate-300 leading-relaxed text-sm">
            <HighlightedText
              text={sbar.background.text}
              onHover={() => null}
              onClick={handleKeywordClick}
            />
          </div>
        </SBARSection>

        <SBARSection title="Assessment" color="amber">
          <div className="text-slate-300 leading-relaxed text-sm">
            <HighlightedText
              text={sbar.assessment.text}
              onHover={() => null}
              onClick={handleKeywordClick}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 mt-4">
            <span className="text-xs text-amber-300 font-bold bg-amber-950/40 border border-amber-800 px-3 py-2 rounded-xl">Delta HR: {sbar.assessment.delta_hr}</span>
            <span className="text-xs text-crimson-300 font-bold bg-red-950/40 border border-red-800 px-3 py-2 rounded-xl">Delta BP: {sbar.assessment.delta_nibp}</span>
            <span className="text-xs text-slate-100 font-bold bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl">Risk Level: {sbar.assessment.risk_level}</span>
          </div>
        </SBARSection>

        <SBARSection title="Recommendation" color="emerald">
          <ul className="text-slate-300 leading-relaxed text-sm list-disc pl-4 space-y-2">
            {sbar.recommendation.actions.map((action: string, i: number) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </SBARSection>

      </div>

      {/* Unresolved Actions embedded in SBAR context */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <h3 className="text-sm font-semibold tracking-tight text-white mb-3 flex items-center gap-2">
          <FilePlus className="h-4 w-4 text-slate-400" />
          Unresolved Discontinuity Actions
        </h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <label key={task.id} className={cn("flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer border", task.done ? "opacity-60 bg-slate-900 border-transparent" : "hover:bg-slate-700 border-slate-700 bg-slate-800")}>
              <Checkbox 
                checked={task.done} 
                onCheckedChange={() => toggleTask(task.id)} 
                className="mt-0.5 border-slate-500"
              />
              <span className={cn("text-sm font-medium", task.done ? "text-slate-500 line-through" : "text-slate-200")}>
                {task.text}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SBARSection({ title, color, children }: { title: string, color: string, children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-900/30 border-indigo-500/30",
    amber: "text-amber-400 bg-amber-900/30 border-amber-500/30",
    slate: "text-slate-300 bg-slate-800 border-slate-700",
    emerald: "text-emerald-400 bg-emerald-900/30 border-emerald-500/30",
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border", colorMap[color])}>
          {title}
        </span>
      </div>
      <div className="pl-2 border-l-2 border-slate-700 ml-2">
        {children}
      </div>
    </div>
  );
}
