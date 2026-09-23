import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck, Scale, FileText } from 'lucide-react';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/80 border border-indigo-700/50 rounded-xl text-indigo-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Academic Code Evaluation Rubric</h2>
              <p className="text-xs text-slate-400">Standardized 100-Point Grading Scale for Handwritten Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 py-5 text-sm">
          {/* Rubric Category 1: Logic 60% */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <h3 className="font-semibold text-white">1. Logical Correctness & Problem Solving</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                60 Points (60%)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verifies whether the algorithm implements the correct business logic and solves the problem specification.
              Checks for correct variable scope, loop boundary conditions, recursion termination, condition branches, and handling of unhandled edge cases (empty inputs, null pointers, single elements, division by zero).
            </p>
          </div>

          {/* Rubric Category 2: Syntax 20% */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h3 className="font-semibold text-white">2. Syntax & Language Validity</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                20 Points (20%)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verifies standard grammar for the target language (e.g. C++, Python, Java, JS).
              <strong> Handwritten OCR Awareness:</strong> The evaluator distinguishes genuine syntax errors from handwriting artifacts (e.g., mistaking semicolons for dots, or curved braces for brackets, or organic indentation).
            </p>
          </div>

          {/* Rubric Category 3: Efficiency 10% */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-sky-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <h3 className="font-semibold text-white">3. Efficiency & Algorithmic Quality</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                10 Points (10%)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assesses the asymptotic time and auxiliary space complexity (Big-O analysis). Points awarded for avoiding unnecessary nested loops, excessive memory allocation, or redundant state operations.
            </p>
          </div>

          {/* Rubric Category 4: Readability 10% */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-semibold text-white">4. Readability & Code Structure</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10 Points (10%)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reviews structural clarity, meaningful variable naming conventions, function signature design, and clean separation of concerns.
            </p>
          </div>

          {/* Academic Policy Note */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-3 text-xs text-indigo-200">
            <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Teaching Assistant Guidelines:</span> The evaluator automatically notes scratched-out lines and illegible tokens in the OCR transcription. Recommendations and a corrected, optimal code implementation are always supplied.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
          >
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
};
