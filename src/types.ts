export interface RubricItem {
  score: number;
  maxScore: number;
  feedback: string;
}

export interface EfficiencyRubricItem extends RubricItem {
  timeComplexity: string;
  spaceComplexity: string;
}

export interface SyntaxLogicError {
  errorType: 'Syntax' | 'Logic' | 'Runtime' | 'Scope' | string;
  description: string;
  lineHint?: string;
  severity: 'Major' | 'Moderate' | 'Minor' | string;
}

export interface RubricBreakdown {
  logicalCorrectness: RubricItem; // 60%
  syntaxValidity: RubricItem;      // 20%
  efficiencyQuality: EfficiencyRubricItem; // 10%
  readabilityStructure: RubricItem; // 10%
}

export interface DetailedEvaluation {
  strengths: string[];
  syntaxAndLogicErrors: SyntaxLogicError[];
  unhandledEdgeCases: string[];
}

export interface EvaluationResult {
  language: string;
  ocrNotes: string;
  transcribedCode: string;
  overallScore: number;
  rubricBreakdown: RubricBreakdown;
  detailedEvaluation: DetailedEvaluation;
  suggestedImprovements: string[];
  correctedCode: string;
  formattedMarkdownOutput: string;
}

export interface ExamSample {
  id: string;
  title: string;
  course: string;
  handwrittenTitle: string;
  problemDescription: string;
  expectedLanguage: string;
  studentCodeLines: string[];
  scratchedOutLine?: string;
  ambiguityNote?: string;
  sampleSummary: string;
}

export interface SubmissionHistoryRecord {
  id: string;
  timestamp: number;
  title: string;
  language: string;
  score: number;
  imageThumbnail: string;
  result: EvaluationResult;
}
