"use client";

import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, EyeOff, Eye, User, PhoneCall, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, ReferenceLine, ComposedChart, Line, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";

export function RiskProfileHeader({ vitalsData, handoffData, timeout }: any) {
  const { phiRedacted, setPhiRedacted } = useDashboard();

  const patientFallback = { patientId: "123", mrn: "882-114-001", firstName: "John", lastName: "Doe", dob: "1959-05-12", currentProtocol: "Sepsis" };
  const patient = handoffData?.patient || patientFallback;

  const shiftRange = Array.from({ length: 8 }).map((_, index) => index);
  const hrDemoData = shiftRange.map(index => ({
    time: `${index * 2}:00`,
    value: 80 + Math.round(index * 3.125), // Progressive increase from 80 to 105 over 8 hours
  }));
  hrDemoData[hrDemoData.length - 1].value = 105;

  const bpDemoData = shiftRange.map(index => ({
    time: `${index * 2}:00`,
    systolic: Math.max(99, 120 - Math.round(index * 2.625)), // Decrease from 120 to 99
    diastolic: Math.max(71, 86 - Math.round(index * 1.875)), // Decrease from 86 to 71
  }));
  bpDemoData[bpDemoData.length - 1].systolic = 99;
  bpDemoData[bpDemoData.length - 1].diastolic = 71;

  const spo2DemoData = shiftRange.map(index => ({
    time: `${index * 2}:00`,
    value: 97, // Stable at 97%
  }));

  const fallbackVitals = Array.from({ length: 7 }).map((_, index) => ({
    timestamp: new Date(Date.now() - (6 - index) * 60000).toISOString(),
    heartRate: 82,
    nibpSystolic: 120,
    nibpDiastolic: 76,
    spo2: 96,
  }));

  const vitals = vitalsData?.vitals?.length ? vitalsData.vitals : fallbackVitals;
  const analysis = vitalsData?.analysis || { deltas: { hrDeltaPct: 32.5, nibpDeltaPct: -13.5 }, flaggedInsights: [] };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const hrData = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), value: v.heartRate })) : hrDemoData;
  const bpData = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), systolic: v.nibpSystolic, diastolic: v.nibpDiastolic })) : bpDemoData;
  const spo2Data = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), value: v.spo2 })) : spo2DemoData;

  const currentHr = vitalsData?.vitals?.length ? hrData[hrData.length - 1]?.value : 105;
  const currentBp = vitalsData?.vitals?.length ? `${bpData[bpData.length - 1]?.systolic ?? "--"}/${bpData[bpData.length - 1]?.diastolic ?? "--"}` : '99/71';
  const currentSpo2 = vitalsData?.vitals?.length ? spo2Data[spo2Data.length - 1]?.value : 97;

  const hrDelta = Number(analysis?.deltas?.hrDeltaPct || 32.5);
  const bpDelta = Number(analysis?.deltas?.nibpDeltaPct || -13.5);

  const getDirection = (delta: number) => delta > 0 ? "up" : delta < 0 ? "down" : "neutral";

  return (
    <div className="bg-slate-900 border-b border-slate-700 p-8 shadow-sm z-10 flex flex-col gap-8 relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-slate-800/30 to-transparent pointer-events-none" />

      {/* Patient Profile Header - High Fidelity */}
      <div className="flex items-center gap-8 relative z-10 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 shadow-lg">
        {/* Large Purple circular avatar */}
        <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-purple-500/30">
          JD
        </div>
        
        {/* Patient name and contextual data */}
        <div className="flex flex-col gap-3 flex-1">
          <h1 className="text-slate-100 font-semibold text-3xl tracking-tight" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '32px' }}>
            {phiRedacted ? "Patient XYZ" : "John Doe"}
          </h1>
          <div className="flex items-center gap-6 text-slate-300 text-sm font-medium">
            <span>Bed 4A</span>
            <span className="text-slate-500">|</span>
            <span>MRN: 882-114-001</span>
            <span className="text-slate-500">|</span>
            <span>DOB: 05/12/1959</span>
            <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-xs uppercase tracking-wider ml-2">
              ELEVATED RISK
            </span>
          </div>
        </div>

        {/* Header CTAs - Right aligned */}
        <div className="flex gap-4">
          <button 
            onClick={() => setPhiRedacted(!phiRedacted)}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors px-4 py-2.5 rounded-lg shadow-sm"
          >
            {phiRedacted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Redact PII
          </button>
          <button className="flex items-center gap-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-colors px-4 py-2.5 rounded-lg shadow-lg">
            <PhoneCall className="w-4 h-4" />
            Emergency Response
          </button>
        </div>
      </div>

      {/* Vital Trajectory Graphs */}
      <div className="flex gap-6 md:gap-8 xl:ml-auto relative z-10 flex-wrap lg:flex-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Heart Rate */}
        <VitalBox 
          label="Heart Rate" 
          value={currentHr} 
          unit="bpm"
          delta="↑ +32.5% SHIFT"
          deltaDirection="up"
          data={hrData}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
          isLoading={!vitalsData?.vitals?.length}
        />
        {/* Blood Pressure */}
        <VitalBox 
          label="NIBP" 
          value={currentBp} 
          unit="mmHg"
          delta="↓ 13.5% SHIFT"
          deltaDirection="down"
          data={bpData}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
          isLoading={!vitalsData?.vitals?.length}
        />
        {/* SpO2 */}
        <VitalBox 
          label="SpO2" 
          value={currentSpo2} 
          unit="%"
          delta="Stable"
          deltaDirection="neutral"
          secondaryTag="↓ 1% SHIFT"
          data={spo2Data}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
          isLoading={!vitalsData?.vitals?.length}
        />
      </div>
    </div>
  );
}

function VitalBox({ label, value, unit, delta, deltaDirection, data, auditor, time, secondaryTag, isLoading }: any) {
  const isUpward = deltaDirection === 'up';
  const isDownward = deltaDirection === 'down';
  const isNeutral = !isUpward && !isDownward;
  const isBloodPressure = label === 'NIBP';
  
  const strokeColor = isUpward ? "#f59e0b" : isDownward ? "#dc2626" : (label === 'SpO2' ? "#60a5fa" : "#94a3b8");
  const fillColor = isUpward ? "rgba(245,158,11,0.2)" : isDownward ? "rgba(220,38,38,0.2)" : (label === 'SpO2' ? "rgba(96,165,250,0.2)" : "rgba(148,163,184,0.2)");
  const badgeBg = isUpward ? "bg-amber-500/20 border-amber-500/30" : isDownward ? "bg-red-500/20 border-red-500/30" : "bg-slate-700 border-slate-600";
  const badgeText = isUpward ? "text-amber-400" : isDownward ? "text-red-400" : "text-slate-300";

  const baselineValue = data && data.length > 0 ? data[0].value || (data[0].systolic ? (data[0].systolic + data[0].diastolic) / 2 : 0) : 0;

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl border flex-grow min-h-[180px] bg-slate-800/80 backdrop-blur-sm shadow-lg relative overflow-hidden",
        isUpward ? "border-amber-500/30" : isDownward ? "border-red-500/30" : "border-slate-700"
      )}
      style={{ minWidth: 0 }}
    >
      {/* Top half: Metadata */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start w-full gap-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
          
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              <User className="w-2.5 h-2.5" />
              <span title={`Recorded by ${auditor} at ${time}`}>{auditor}</span>
            </div>
            
            {/* Trend Badge */}
            <div className={cn(
              "px-2 py-1 rounded border flex items-center font-bold text-[10px] uppercase tracking-wide backdrop-blur-sm",
              badgeBg, badgeText
            )}>
              {isUpward ? <ArrowUp className="w-3 h-3 mr-1" strokeWidth={3} /> : isDownward ? <ArrowDown className="w-3 h-3 mr-1" strokeWidth={3} /> : null}
              <span>{delta}</span>
            </div>
          </div>
        </div>
        {secondaryTag && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">{secondaryTag}</span>
        )}
      </div>

      {/* Bottom: Sparkline with overlay numbers */}
      <div className="w-full flex-1 relative overflow-visible" style={{ minHeight: '120px', height: '120px' }}>
        {/* Large numeric value overlay */}
        <div className="absolute top-3 left-3 z-20 flex items-baseline gap-1">
          <span className={cn(
            "text-5xl font-extrabold tracking-tight drop-shadow-lg",
            isUpward ? "text-amber-400" : isDownward ? "text-red-400" : "text-slate-100"
          )}>
            {value}
          </span>
          <span className="text-lg font-semibold text-slate-400">{unit}</span>
        </div>

        {isLoading ? (
          <div className="w-full h-full bg-slate-900/50 border-t border-slate-800 flex items-center justify-center animate-pulse">
            <span className="text-[10px] text-slate-500 font-medium">Searching for Clinical Data...</span>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full bg-slate-900/50 border-t border-slate-800 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 font-medium">Searching for Clinical Data...</span>
          </div>
        ) : (
          isBloodPressure ? (
            <ResponsiveContainer width="100%" height={120}>
              <ComposedChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradient-nibp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  ticks={[data[0].time, data[data.length - 1].time]} 
                  tickFormatter={(value) => value === data[0]?.time ? '0 hrs' : value === data[data.length - 1]?.time ? '8 hrs' : ''} 
                />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip content={<CustomTooltip labelText={label} data={data} />} />
                <Area 
                  type="step" 
                  dataKey="systolic" 
                  stroke="#dc2626" 
                  strokeWidth={2} 
                  fill="url(#gradient-nibp)"
                  isAnimationActive={false}
                />
                <Area 
                  type="step" 
                  dataKey="diastolic" 
                  stroke="#dc2626" 
                  strokeWidth={2} 
                  fill="url(#gradient-nibp)"
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${label.replace(/\s+/g,'-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={0.15}/>
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fill: '#94a3b8' }} 
                  ticks={[data[0].time, data[data.length - 1].time]} 
                  tickFormatter={(value) => value === data[0]?.time ? '0 hrs' : value === data[data.length - 1]?.time ? '8 hrs' : ''} 
                />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip content={<CustomTooltip labelText={label} data={data} />} />
                <Area 
                  type="step" 
                  dataKey="value" 
                  stroke={strokeColor} 
                  strokeWidth={2} 
                  fill={`url(#gradient-${label.replace(/\s+/g,'-')})`} 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, labelText, data }: any) {
  if (active && payload && payload.length && data && data.length > 0) {
    const time = payload[0].payload.time;
    
    if (labelText === 'NIBP') {
      const systolicCurrent = payload.find((item: any) => item.dataKey === 'systolic')?.value;
      const diastolicCurrent = payload.find((item: any) => item.dataKey === 'diastolic')?.value;

      return (
        <div className="bg-slate-900 border border-slate-700 shadow-lg rounded-md p-2 z-50 pointer-events-none">
          <span className="font-mono text-[10px] text-slate-300 font-bold">
            Hover: NIBP {systolicCurrent}/{diastolicCurrent}, {time}
          </span>
        </div>
      );
    }

    const currentVal = payload[0].value;

    return (
      <div className="bg-slate-900 border border-slate-700 shadow-lg rounded-md p-2 z-50 pointer-events-none">
        <span className="font-mono text-[10px] text-slate-300 font-bold">
          Hover: {labelText} {currentVal}, {time}
        </span>
      </div>
    );
  }
  return null;
}
