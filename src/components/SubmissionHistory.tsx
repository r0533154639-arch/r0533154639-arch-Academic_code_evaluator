import React from 'react';
import { SubmissionHistoryRecord } from '../types';
import { Clock, Trash2, Award, ChevronRight } from 'lucide-react';

interface SubmissionHistoryProps {
  history: SubmissionHistoryRecord[];
  onSelect: (record: SubmissionHistoryRecord) => void;
  onClear: () => void;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Graded Submissions History ({history.length})</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {history.map((record) => (
          <div
            key={record.id}
            onClick={() => onSelect(record)}
            className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 shadow-sm group"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black flex items-center justify-center">
                <img
                  src={record.imageThumbnail}
                  alt={record.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300 transition">
                  {record.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-mono">{record.language}</span>
                  <span>•</span>
                  <span>{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                record.score >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                record.score >= 60 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-rose-950 text-rose-300 border border-rose-800'
              }`}>
                {record.score}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
