import React from 'react';
import { SystemTelemetry } from '../../types/telemetry';
import { connectionService } from '../../services/connection';
import { IncidentTimeline } from '../IncidentTimeline';
import { Clock, Siren, CheckCircle2 } from 'lucide-react';

interface Props {
  telemetry: SystemTelemetry;
}

export const EventsPage: React.FC<Props> = ({ telemetry }) => {
  const handleFeedback = (incidentId: string, isCorrect: boolean, falseAlarmReason?: string) => {
    connectionService.submitAlertFeedback(incidentId, isCorrect, falseAlarmReason);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100 page-transition pb-20">
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">UNIFIED INCIDENT LOG</span>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Event Timeline <Clock className="w-5 h-5 text-white" />
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full lift-dashed-tag text-xs font-mono text-slate-300 font-extrabold">
          {telemetry.incidents.length} Recorded
        </span>
      </div>

      <IncidentTimeline
        incidents={telemetry.incidents}
        onFeedback={handleFeedback}
      />
    </div>
  );
};
