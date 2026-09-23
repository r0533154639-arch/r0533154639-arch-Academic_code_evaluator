import React, { useState } from 'react';
import {
  EvaluationResult,
} from '../types';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Code2,
  Award,
  Zap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Download,
  Eye,
  FileCode,
  Layers,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';

interface EvaluationResultViewProps {
  result: EvaluationResult;
  handwrittenImageUrl: string;
  problemDescription?: string;
  onNewEvaluation: () => void;
}

export const EvaluationResultView: React.FC<EvaluationResultViewProps> = ({
  result,
  handwrittenImageUrl,
  problemDescription,
  onNewEvaluation,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcription' | 'feedback' | 'diff' | 'rawReport'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedCorrectedCode, setCopiedCorrectedCode] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);
  const [expandedRubric, setExpandedRubric] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40';
    if (score >= 75) return 'text-sky-400 border-sky-500/50 bg-sky-950/40';
    if (score >= 60) return 'text-amber-400 border-amber-500/50 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/50 bg-rose-950/40';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const rubric = result.rubricBreakdown;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                Evaluation Report
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {result.language || 'Auto-Detected'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Gemini TA Grader (Temp 0.2)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Academic Code Evaluation</h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Handwritten code transcribed via OCR, checked for logical validity and boundary edge cases against problem requirements, and scored on a standard 100-point rubric.
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center font-bold shadow-lg ${getScoreColor(result.overallScore)}`}>
              <span className="text-2xl leading-none">{Math.round(result.overallScore)}</span>
              <span className="text-[11px] opacity-80 uppercase tracking-wider">/ 100</span>
              <span className="text-xs font-extrabold mt-0.5">{getScoreGrade(result.overallScore)}</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Final Grade</div>
              <div className="text-base font-bold text-white">
                {result.overallScore >= 80 ? 'Proficient / Pass' : result.overallScore >= 60 ? 'Satisfactory' : 'Needs Revision'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Logic: {rubric.logicalCorrectness.score}/60</span>
                <span>•</span>
                <span>Syntax: {rubric.syntaxValidity.score}/20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          {[
            { id: 'overview', label: 'Score & Rubric Breakdown', icon: Award },
            { id: 'transcription', label: 'OCR & Transcribed Code', icon: Code2 },
            { id: 'feedback', label: 'Detailed Evaluation', icon: AlertCircle },
            { id: 'diff', label: 'Optimal Corrected Code', icon: Sparkles },
            { id: 'rawReport', label: 'Formatted Academic Sheet', icon: FileCode },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium transition ${
                  activeTab === t.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(result.formattedMarkdownOutput, setCopiedReport)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Copy academic report text for LMS/Gradescope"
            >
              {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedReport ? 'Copied Report' : 'Copy Report'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Print evaluation"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Handwritten Paper Viewer (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
              <div className="flex items-center gap-2 font-medium text-slate-300">
                <Eye className="h-4 w-4 text-indigo-400" />
                <span>Original Handwritten Submission</span>
              </div>
              <button
                onClick={() => setZoomImage(!zoomImage)}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline"
              >
                {zoomImage ? 'Standard view' : 'Expand full'}
              </button>
            </div>

            <div className={`relative rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 flex items-center justify-center ${zoomImage ? 'max-h-[800px]' : 'max-h-[480px]'}`}>
              <img
                src={handwrittenImageUrl}
                alt="Student Handwritten Code"
                className="w-full h-auto object-contain transition duration-200"
              />
            </div>

            {/* OCR Notes Card */}
            <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>OCR & Handwriting Artifact Observations</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {result.ocrNotes || 'Handwriting clearly legible with standard handwriting indentations.'}
              </p>
            </div>

            {problemDescription && (
              <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                  <span>Problem Context / Prompt</span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-4 hover:line-clamp-none transition-all">
                  {problemDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tab Panels (7 cols) */}
        <div className="lg:col-span-7">
          {/* TAB 1: OVERVIEW & RUBRIC BREAKDOWN */}
          {activeTab === 'overview' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-400" />
                  <span>Objective Scoring Breakdown (0–100)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard Academic Criteria: Logic (60%), Syntax (20%), Efficiency (10%), Readability (10%)
                </p>
              </div>

              {/* 4 Rubric Cards */}
              <div className="space-y-3.5">
                {/* 1. Logical Correctness (60%) */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-indigo-500/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                      <h3 className="font-semibold text-white text-sm">Logical Correctness & Problem Solving</h3>
                    </div>
                    <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-full border border-indigo-700/50">
                      {rubric.logicalCorrectness.score} / {rubric.logicalCorrectness.maxScore} pts (60%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(rubric.logicalCorrectness.score / rubric.logicalCorrectness.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rubric.logicalCorrectness.feedback}
                  </p>
                </div>

                {/* 2. Syntax & Language Validity (20%) */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-emerald-500/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h3 className="font-semibold text-white text-sm">Syntax & Language Validity</h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/50">
                      {rubric.syntaxValidity.score} / {rubric.syntaxValidity.maxScore} pts (20%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(rubric.syntaxValidity.score / rubric.syntaxValidity.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rubric.syntaxValidity.feedback}
                  </p>
                </div>

                {/* 3. Efficiency & Algorithmic Quality (10%) */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-sky-500/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                      <h3 className="font-semibold text-white text-sm">Efficiency & Complexity</h3>
                    </div>
                    <span className="text-xs font-bold text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-full border border-sky-700/50">
                      {rubric.efficiencyQuality.score} / {rubric.efficiencyQuality.maxScore} pts (10%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(rubric.efficiencyQuality.score / rubric.efficiencyQuality.maxScore) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 font-mono font-semibold border border-slate-700">
                      Time: {rubric.efficiencyQuality.timeComplexity || 'O(n)'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-sky-300 font-mono font-semibold border border-slate-700">
                      Space: {rubric.efficiencyQuality.spaceComplexity || 'O(1)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rubric.efficiencyQuality.feedback}
                  </p>
                </div>

                {/* 4. Readability & Structure (10%) */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 hover:border-amber-500/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h3 className="font-semibold text-white text-sm">Readability & Code Structure</h3>
                    </div>
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/50">
                      {rubric.readabilityStructure.score} / {rubric.readabilityStructure.maxScore} pts (10%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(rubric.readabilityStructure.score / rubric.readabilityStructure.maxScore) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rubric.readabilityStructure.feedback}
                  </p>
                </div>
              </div>

              {/* Quick Action to next tabs */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">Total Score: {result.overallScore} / 100</span>
                <button
                  onClick={() => setActiveTab('feedback')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition"
                >
                  <span>View Detailed Errors & Edge Cases</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OCR & TRANSCRIBED CODE */}
          {activeTab === 'transcription' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-indigo-400" />
                    <span>OCR Transcribed Code</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Extracted from handwritten paper image with handwriting artifact awareness.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.transcribedCode, setCopiedCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span className="ml-2 font-semibold text-slate-300">student_submission.{result.language.toLowerCase().includes('py') ? 'py' : result.language.toLowerCase().includes('c++') ? 'cpp' : result.language.toLowerCase().includes('java') ? 'java' : 'js'}</span>
                  </span>
                  <span>{result.language}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed whitespace-pre font-mono">
                  {result.transcribedCode}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>OCR Transcription & Artifact Notes</span>
                </span>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {result.ocrNotes}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED EVALUATION */}
          {activeTab === 'feedback' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-indigo-400" />
                  <span>Detailed Evaluation</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Academic itemized review: key correct implementations, syntax/logic flaws, and boundary conditions.
                </p>
              </div>

              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Strengths (Key Correct Implementations & Logic)</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-6 list-disc">
                  {result.detailedEvaluation.strengths && result.detailedEvaluation.strengths.length > 0 ? (
                    result.detailedEvaluation.strengths.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">{str}</li>
                    ))
                  ) : (
                    <li>Standard structure attempted.</li>
                  )}
                </ul>
              </div>

              {/* Syntax & Logic Errors */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-rose-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Syntax & Logic Errors</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60">
                    {result.detailedEvaluation.syntaxAndLogicErrors?.length || 0} issues detected
                  </span>
                </div>

                {result.detailedEvaluation.syntaxAndLogicErrors && result.detailedEvaluation.syntaxAndLogicErrors.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {result.detailedEvaluation.syntaxAndLogicErrors.map((err, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-rose-900/40 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            <span>{err.errorType || 'Error'}</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                            err.severity === 'Major' ? 'bg-rose-900/80 text-rose-200' : 'bg-amber-900/80 text-amber-200'
                          }`}>
                            {err.severity || 'Moderate'}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{err.description}</p>
                        {err.lineHint && (
                          <div className="mt-1 text-[11px] text-slate-400 font-mono bg-slate-950/60 p-1.5 rounded border border-slate-800">
                            Reference: {err.lineHint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-300">No fatal syntax or logic errors found!</p>
                )}
              </div>

              {/* Unhandled Edge Cases */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-amber-400 text-sm">
                  <HelpCircle className="h-4 w-4" />
                  <span>Unhandled Edge Cases & Boundary Conditions</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-6 list-disc">
                  {result.detailedEvaluation.unhandledEdgeCases && result.detailedEvaluation.unhandledEdgeCases.length > 0 ? (
                    result.detailedEvaluation.unhandledEdgeCases.map((edge, idx) => (
                      <li key={idx} className="leading-relaxed">{edge}</li>
                    ))
                  ) : (
                    <li>All common edge cases were accounted for.</li>
                  )}
                </ul>
              </div>

              {/* Suggested Actionable Improvements */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-indigo-400 text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Suggested Improvements & Recommendations</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300 pl-6 list-disc">
                  {result.suggestedImprovements?.map((imp, idx) => (
                    <li key={idx} className="leading-relaxed">{imp}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: OPTIMAL CORRECTED CODE */}
          {activeTab === 'diff' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    <span>Suggested Improvements & Corrected Code</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fully corrected, optimal reference implementation addressing all syntax, logic, and edge case flaws.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.correctedCode, setCopiedCorrectedCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition shadow-sm"
                >
                  {copiedCorrectedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCorrectedCode ? 'Copied' : 'Copy Corrected Code'}</span>
                </button>
              </div>

              {/* Code comparison viewer */}
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 font-mono text-xs shadow-lg">
                  <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/40 border-b border-emerald-900/50 text-[11px] text-emerald-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>TA Reference Solution (Optimized & Bug-Free)</span>
                    </span>
                    <span>{result.language}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-emerald-200 leading-relaxed whitespace-pre font-mono">
                    {result.correctedCode}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-semibold text-slate-200">Key Changes Applied:</h4>
                  <ul className="list-disc pl-5 text-slate-300 space-y-1">
                    {result.suggestedImprovements?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FORMATTED ACADEMIC SHEET / MARKDOWN (REQUIRED PROMPT FORMAT) */}
          {activeTab === 'rawReport' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-indigo-400" />
                    <span>Formatted Academic Grading Sheet</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ready to copy directly into Canvas, Gradescope, or Blackboard rubrics.
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(result.formattedMarkdownOutput, setCopiedReport)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition"
                >
                  {copiedReport ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedReport ? 'Copied' : 'Copy All Text'}</span>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>evaluation_report.md</span>
                  <span>Markdown Output</span>
                </div>
                <pre className="p-5 overflow-x-auto text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
                  {result.formattedMarkdownOutput}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
