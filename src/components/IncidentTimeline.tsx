import React, { useState } from 'react';
import { IncidentEvent } from '../types/telemetry';
import { Siren, AlertTriangle, CheckCircle2, XCircle, MapPin, ThumbsUp, ThumbsDown, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  incidents: IncidentEvent[];
  onFeedback: (incidentId: string, isCorrect: boolean, falseAlarmReason?: string) => void;
}

export const IncidentTimeline: React.FC<Props> = ({ incidents, onFeedback }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackDialogId, setFeedbackDialogId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('Sitting quickly');

  const falseAlarmOptions = [
    'Sitting quickly',
    'Bending',
    'Getting up',
    'Running',
    'Jumping',
    'Other'
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleFeedbackSubmit = (id: string, isCorrect: boolean) => {
    if (isCorrect) {
      onFeedback(id, true);
      setFeedbackDialogId(null);
    } else {
      setFeedbackDialogId(id);
    }
  };

  const handleConfirmFalseAlarm = (id: string) => {
    onFeedback(id, false, selectedReason);
    setFeedbackDialogId(null);
  };

  return (
    <div className="lift-card rounded-3xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white text-black font-black flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Unified Incident Event Log</h3>
            <span className="text-[10px] font-mono text-slate-400">Timeline & Sensor Snapshot History</span>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono font-extrabold text-slate-300">
          {incidents.length} Events
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {incidents.map((inc) => {
          const isExpanded = expandedId === inc.id;
          const isDialog = feedbackDialogId === inc.id;

          return (
            <div key={inc.id} className="bg-[#000000] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    inc.eventType === 'FALL' || inc.eventType === 'MANUAL_SOS' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                  }`} />
                  <span className="font-extrabold text-white uppercase text-xs">{inc.eventType.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-400">({inc.confidence}% conf)</span>
                </div>

                <span className="text-[10px] text-slate-400">
                  {new Date(inc.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> {inc.location.address}
                </span>

                <button
                  onClick={() => toggleExpand(inc.id)}
                  className="text-[10px] text-white font-extrabold flex items-center gap-1 hover:underline"
                >
                  {isExpanded ? 'Hide Sensor Data' : 'View Sensor Context'}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expandable Sensor Context Data */}
              {isExpanded && (
                <div className="p-3 bg-[#12151E] rounded-xl text-[10px] space-y-1.5 border border-white/10">
                  <div className="flex justify-between text-slate-300">
                    <span>Gait Activity: <strong className="text-white">{inc.sensorContext.activity}</strong></span>
                    <span>Heart Rate: <strong className="text-rose-400">{inc.sensorContext.heartRateBpm} BPM</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>G-Force Impact: <strong className="text-white">{inc.sensorContext.gForce}g</strong></span>
                    <span>Obstacle Dist: <strong className="text-white">{inc.sensorContext.nearestObstacleMm} mm</strong></span>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold">Was this alert correct?</span>

                {inc.userResponse === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedbackSubmit(inc.id, true)}
                      className="px-3 py-1 bg-white text-black font-extrabold rounded-full text-[10px] flex items-center gap-1 hover:bg-slate-200"
                    >
                      <ThumbsUp className="w-3 h-3" /> Yes
                    </button>
                    <button
                      onClick={() => handleFeedbackSubmit(inc.id, false)}
                      className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 font-extrabold rounded-full text-[10px] flex items-center gap-1 hover:bg-rose-900"
                    >
                      <ThumbsDown className="w-3 h-3" /> False Alarm
                    </button>
                  </div>
                ) : (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    inc.userResponse === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {inc.userResponse === 'CONFIRMED' ? '✓ Verified Correct' : `False Alarm (${inc.falseAlarmReason || 'Reported'})`}
                  </span>
                )}
              </div>

              {/* False Alarm Feedback Dialog */}
              {isDialog && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl space-y-2 font-mono text-[11px]">
                  <span className="text-white font-extrabold block">What activity were you performing?</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {falseAlarmOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedReason(opt)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold text-left transition-all border ${
                          selectedReason === opt
                            ? 'bg-white text-black border-white'
                            : 'bg-[#141416] text-slate-300 border-white/10'
                        }`}
                      >
                        • {opt}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleConfirmFalseAlarm(inc.id)}
                    className="w-full py-2 bg-white text-black font-black text-[11px] rounded-xl shadow mt-1"
                  >
                    Submit False Alarm Feedback
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
