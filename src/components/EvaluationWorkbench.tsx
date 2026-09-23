import React, { useState, useEffect, useRef } from 'react';
import { EXAM_SAMPLES, renderExamSheetToCanvas } from '../utils/sampleGenerator';
import { HandwritingCanvas } from './HandwritingCanvas';
import { CameraCapture } from './CameraCapture';
import { ExamSample } from '../types';
import {
  Upload,
  FileText,
  PenTool,
  Camera,
  Play,
  Sparkles,
  BookOpen,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface EvaluationWorkbenchProps {
  onEvaluate: (payload: {
    imageBase64: string;
    mimeType: string;
    problemDescription: string;
    expectedLanguage: string;
  }) => Promise<void>;
  isLoading: boolean;
  loadingStep: number;
}

export const EvaluationWorkbench: React.FC<EvaluationWorkbenchProps> = ({
  onEvaluate,
  isLoading,
  loadingStep,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'samples' | 'draw' | 'upload' | 'camera'>('samples');
  const [selectedSample, setSelectedSample] = useState<ExamSample>(EXAM_SAMPLES[0]);
  const [sampleImageUri, setSampleImageUri] = useState<string>('');
  const [drawnImageUri, setDrawnImageUri] = useState<string>('');
  const [uploadedImageUri, setUploadedImageUri] = useState<string>('');
  const [cameraImageUri, setCameraImageUri] = useState<string>('');

  const [problemDescription, setProblemDescription] = useState<string>(EXAM_SAMPLES[0].problemDescription);
  const [expectedLanguage, setExpectedLanguage] = useState<string>(EXAM_SAMPLES[0].expectedLanguage);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // When selected sample changes, generate authentic handwritten exam canvas image
  useEffect(() => {
    if (selectedSample) {
      const dataUri = renderExamSheetToCanvas(selectedSample);
      setSampleImageUri(dataUri);
      setProblemDescription(selectedSample.problemDescription);
      setExpectedLanguage(selectedSample.expectedLanguage);
    }
  }, [selectedSample]);

  // Determine current active image based on tab
  const getActiveImageUri = (): string => {
    switch (activeInputTab) {
      case 'samples':
        return sampleImageUri;
      case 'draw':
        return drawnImageUri;
      case 'upload':
        return uploadedImageUri;
      case 'camera':
        return cameraImageUri;
      default:
        return '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImageUri(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImageUri(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEvaluation = () => {
    const imageToEvaluate = getActiveImageUri();
    if (!imageToEvaluate) {
      alert('Please select or provide an image of handwritten code first.');
      return;
    }

    onEvaluate({
      imageBase64: imageToEvaluate,
      mimeType: imageToEvaluate.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png',
      problemDescription,
      expectedLanguage,
    });
  };

  const loadingStepsLabels = [
    'Initializing Gemini Academic TA Evaluator...',
    'Step 1: Performing OCR & transcribing handwritten code...',
    'Step 2: Identifying language & filtering handwriting artifacts...',
    'Step 3: Verifying algorithmic logic, flow & edge cases...',
    'Step 4: Computing 60/20/10/10 rubric breakdown & report...',
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Teaching Assistant Evaluation Workbench</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Evaluate Handwritten Student Code
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Upload handwritten exam papers, snap a desk photo, write with a stylus, or test preloaded university exam sheets. Automatically transcribes code, isolates handwriting artifacts, checks logic, and grades according to the 60/20/10/10 rubric.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end justify-center gap-2">
            <div className="text-xs text-slate-400">Standard Rubric Weighting:</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
                Logic 60%
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
                Syntax 20%
              </span>
              <span className="px-2.5 py-1 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/60 font-semibold">
                Efficiency 10%
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                Readability 10%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1.5 rounded-xl text-xs gap-1">
        <button
          onClick={() => setActiveInputTab('samples')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            activeInputTab === 'samples'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Academic Exam Samples (4 Pre-built)</span>
        </button>

        <button
          onClick={() => setActiveInputTab('draw')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            activeInputTab === 'draw'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <PenTool className="h-4 w-4" />
          <span>Handwriting Canvas (Stylus / Mouse)</span>
        </button>

        <button
          onClick={() => setActiveInputTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            activeInputTab === 'upload'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Exam Paper Scan / Photo</span>
        </button>

        <button
          onClick={() => setActiveInputTab('camera')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition ${
            activeInputTab === 'camera'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>Webcam Document Scanner</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB 1: SAMPLES */}
          {activeInputTab === 'samples' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Select an Exam Submission</h3>
                <p className="text-xs text-slate-400">Authentic university student answer booklets with real handwriting simulation & bugs.</p>
              </div>

              {/* Sample cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXAM_SAMPLES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => setSelectedSample(sample)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition text-left flex flex-col justify-between ${
                      selectedSample.id === sample.id
                        ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50 shadow-md'
                        : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold uppercase text-indigo-400">
                          {sample.course.split('-')[0].trim()}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {sample.expectedLanguage}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-200 text-xs mb-1">{sample.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{sample.sampleSummary}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{sample.studentCodeLines.length} lines handwritten</span>
                      {selectedSample.id === sample.id && (
                        <span className="text-indigo-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Selected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview of the rendered exam sheet */}
              {sampleImageUri && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">Rendered Exam Booklet Preview:</span>
                    <span className="text-slate-400 text-[11px]">Ready for Gemini OCR</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-h-[380px] bg-slate-950 flex justify-center p-2 shadow-inner">
                    <img
                      src={sampleImageUri}
                      alt="Sample Handwritten Sheet"
                      className="max-h-[360px] w-auto object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HANDWRITING CANVAS */}
          {activeInputTab === 'draw' && (
            <HandwritingCanvas onImageChange={setDrawnImageUri} />
          )}

          {/* TAB 3: UPLOAD */}
          {activeInputTab === 'upload' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Upload Exam Paper Image</h3>
                <p className="text-xs text-slate-400">Upload a photo of handwritten code from a notebook, test paper, or whiteboard.</p>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  uploadedImageUri
                    ? 'border-indigo-500/60 bg-indigo-950/20'
                    : 'border-slate-700 hover:border-indigo-500/60 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {uploadedImageUri ? (
                  <div className="space-y-3">
                    <img
                      src={uploadedImageUri}
                      alt="Uploaded Handwritten Code"
                      className="max-h-[320px] max-w-full rounded-lg object-contain shadow-lg border border-slate-700 mx-auto"
                    />
                    <p className="text-xs text-indigo-300 font-medium">Click to select a different image</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center mx-auto text-indigo-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-slate-200">Click to browse or drag and drop</span>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, or WEBP up to 20MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CAMERA */}
          {activeInputTab === 'camera' && (
            <CameraCapture onCapture={setCameraImageUri} />
          )}
        </div>

        {/* Right Column: Problem Context & Evaluation Control (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Problem Description & Rubric Spec</h3>
              </div>
              <span className="text-[11px] text-slate-400">Academic Context</span>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Target Language</span>
                <span className="text-[11px] text-slate-400 font-normal">Identified by TA</span>
              </label>
              <select
                value={expectedLanguage}
                onChange={(e) => setExpectedLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="auto">Auto-Detect from handwriting</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C">C</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </select>
            </div>

            {/* Problem Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Problem Requirements & Edge Cases</span>
                <span className="text-[11px] text-slate-400 font-normal">Used to verify logic</span>
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={6}
                placeholder="Enter problem requirements, edge cases, expected complexities, etc."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono resize-y"
              />
            </div>

            {/* Rubric Breakdown summary box */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center justify-between">
                <span>Standardized Rubric Weights:</span>
                <span className="text-indigo-400 font-bold">Total: 100 pts</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span>Logic & Correctness: <strong>60%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Syntax Validity: <strong>20%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  <span>Efficiency Quality: <strong>10%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Readability Structure: <strong>10%</strong></span>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleSubmitEvaluation}
              disabled={isLoading || !getActiveImageUri()}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating Submission...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Evaluate Code with Gemini TA</span>
                </>
              )}
            </button>
          </div>

          {/* Loading status stepper */}
          {isLoading && (
            <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Academic Evaluation Process:</span>
              </div>
              <div className="space-y-1.5">
                {loadingStepsLabels.map((lbl, idx) => (
                  <div
                    key={idx}
                    className={`text-[11px] flex items-center gap-2 transition-colors ${
                      loadingStep > idx
                        ? 'text-emerald-400 font-medium'
                        : loadingStep === idx
                        ? 'text-indigo-300 font-semibold animate-pulse'
                        : 'text-slate-500'
                    }`}
                  >
                    {loadingStep > idx ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : loadingStep === idx ? (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin inline-block"></span>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 inline-block"></span>
                    )}
                    <span>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
