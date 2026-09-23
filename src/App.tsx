import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EvaluationWorkbench } from './components/EvaluationWorkbench';
import { EvaluationResultView } from './components/EvaluationResultView';
import { RubricModal } from './components/RubricModal';
import { SubmissionHistory } from './components/SubmissionHistory';
import { EvaluationResult, SubmissionHistoryRecord } from './types';
import { AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [currentProblem, setCurrentProblem] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<SubmissionHistoryRecord[]>([]);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('academic_evaluator_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const saveToHistory = (newRecord: SubmissionHistoryRecord) => {
    setHistory((prev) => {
      const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)].slice(0, 10);
      try {
        localStorage.setItem('academic_evaluator_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage quota exceeded:', e);
      }
      return updated;
    });
  };

  const handleEvaluate = async (payload: {
    imageBase64: string;
    mimeType: string;
    problemDescription: string;
    expectedLanguage: string;
  }) => {
    setIsLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);
    setCurrentImage(payload.imageBase64);
    setCurrentProblem(payload.problemDescription);

    // Realistic stepper progression as the model processes OCR, Language, Logic, and Rubric
    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 600),
      setTimeout(() => setLoadingStep(2), 1800),
      setTimeout(() => setLoadingStep(3), 3200),
      setTimeout(() => setLoadingStep(4), 4600),
    ];

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      stepTimers.forEach(clearTimeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Evaluation request failed with status ${response.status}`);
      }

      const data: EvaluationResult = await response.json();
      setCurrentResult(data);

      // Save to session history
      const historyItem: SubmissionHistoryRecord = {
        id: `sub_${Date.now()}`,
        timestamp: Date.now(),
        title: data.language ? `${data.language} Submission` : 'Student Submission',
        language: data.language || 'Code',
        score: Math.round(data.overallScore),
        imageThumbnail: payload.imageBase64,
        result: data,
      };
      saveToHistory(historyItem);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      stepTimers.forEach(clearTimeout);
      console.error('Evaluation failed:', error);
      setErrorMessage(error.message || 'An error occurred during evaluation.');
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setCurrentImage('');
    setCurrentProblem('');
    setErrorMessage(null);
  };

  const handleSelectFromHistory = (record: SubmissionHistoryRecord) => {
    setCurrentResult(record.result);
    setCurrentImage(record.imageThumbnail);
    setCurrentProblem('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('academic_evaluator_history');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        onOpenRubricModal={() => setIsRubricModalOpen(true)}
        onReset={handleReset}
        hasSubmission={Boolean(currentResult)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/70 border border-rose-800 rounded-xl flex items-start justify-between gap-3 text-sm text-rose-200 shadow-lg animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Evaluation Error: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-rose-900 rounded transition text-rose-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View toggle: Workbench vs Result */}
        {currentResult ? (
          <EvaluationResultView
            result={currentResult}
            handwrittenImageUrl={currentImage}
            problemDescription={currentProblem}
            onNewEvaluation={handleReset}
          />
        ) : (
          <EvaluationWorkbench
            onEvaluate={handleEvaluate}
            isLoading={isLoading}
            loadingStep={loadingStep}
          />
        )}

        {/* Previous Submissions History Tray */}
        <SubmissionHistory
          history={history}
          onSelect={handleSelectFromHistory}
          onClear={handleClearHistory}
        />
      </main>

      {/* Rubric Criteria Modal */}
      <RubricModal
        isOpen={isRubricModalOpen}
        onClose={() => setIsRubricModalOpen(false)}
      />

      {/* Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Academic Code Evaluator • Computer Science Department Grading Assistant</span>
          <div className="flex items-center gap-3">
            <span>Standard 60/20/10/10 Rubric</span>
            <span>•</span>
            <span>OCR Handwriting Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
