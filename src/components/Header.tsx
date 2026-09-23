import React from 'react';
import { GraduationCap, Award, HelpCircle, Sparkles, BookOpen } from 'lucide-react';

interface HeaderProps {
  onOpenRubricModal: () => void;
  onReset: () => void;
  hasSubmission: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRubricModal, onReset, hasSubmission }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg text-slate-100 tracking-tight">Academic Code Evaluator</span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                TA Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400">Handwritten OCR, Logic Verification & 60/20/10/10 Rubric Scoring</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRubricModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/60 transition shadow-sm"
            title="View Standard Academic Rubric (60% Logic, 20% Syntax, 10% Efficiency, 10% Readability)"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>Grading Rubric</span>
          </button>

          {hasSubmission && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/60 transition shadow-sm"
            >
              <span>+ New Submission</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gemini TA Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};
