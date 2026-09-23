import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI client according to instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', problemDescription, expectedLanguage } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing handwritten code image.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the environment. Please add it to Settings > Secrets.',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const systemInstruction = `You are an academic teaching assistant and code evaluator. Your role is to analyze an image of handwritten code, transcribe it into clear text, evaluate its correctness against a given problem description or requirements, assign an objective score, and provide constructive feedback.

Follow this Step-by-Step Evaluation Process strictly:
1. OCR & Transcription:
- Transcribe the handwritten code from the image into a formatted code block.
- Explicitly note any illegible, ambiguous, or scratched-out parts in 'ocrNotes'.

2. Language & Syntax Identification:
- Identify the programming language used (e.g., Python, C++, Java, JavaScript, C, etc.).
- Account for common handwriting artifacts (e.g., mistaking semicolons for dots or braces for brackets), but note genuine syntax errors.

3. Logic & Correctness Verification:
- Verify if the algorithm correctly solves the intended problem.
- Check for logical flow, proper variable scope, correct loops/conditionals, and efficiency.
- Identify unhandled edge cases (e.g., empty inputs, division by zero, null values, single element, negative numbers, overflow).

4. Scoring Breakdown (Total: 0–100):
- Logical Correctness & Problem Solving (60%): Does the code implement the correct logic? Assign a score out of 60.
- Syntax & Language Validity (20%): Is the code syntactically sound for the chosen language? Assign a score out of 20.
- Efficiency & Algorithmic Quality (10%): Time/space complexity and optimization. Assign a score out of 10.
- Readability & Structure (10%): Clean structure and proper naming conventions. Assign a score out of 10.
Overall Score = Sum of the 4 sub-scores (0 to 100). Be fair, objective, rigorous, and standard for university computer science exam grading.

Required Output Schema:
Generate a valid JSON object matching the provided schema. In addition, format the formattedMarkdownOutput string to match:
Transcribed Code:
\`\`\`[language]
// Insert transcribed code here
\`\`\`
Overall Score: [Score / 100]

Detailed Evaluation:
Strengths: [Key correct implementations and logic]
Syntax & Logic Errors: [Itemized list of errors, if any]
Unhandled Edge Cases: [List of missed boundary conditions]

Suggested Improvements & Corrected Code:
[Provide actionable recommendations and the fully corrected, optimal code implementation]`;

    const userPromptText = `Please evaluate this student's handwritten code submission.
${problemDescription ? `\n--- PROBLEM DESCRIPTION & REQUIREMENTS ---\n${problemDescription}\n` : '\n(No specific problem description provided; deduce the intended problem and algorithm from the function name, context, and logic.)'}
${expectedLanguage && expectedLanguage !== 'auto' ? `\nTarget Language: ${expectedLanguage}\n` : ''}

Inspect the handwritten code image carefully. Transcribe all text, identify handwriting flaws, verify logic against requirements, score according to the 60/20/10/10 rubric, and output the response.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: userPromptText,
    };

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [imagePart, textPart],
          },
          config: {
            systemInstruction,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                language: {
                  type: Type.STRING,
                  description: 'Identified programming language (e.g., Python, C++, Java, JavaScript, C)',
                },
                ocrNotes: {
                  type: Type.STRING,
                  description: 'Notes on illegible, ambiguous, scratched-out parts, or handwriting artifacts identified.',
                },
                transcribedCode: {
                  type: Type.STRING,
                  description: 'The exact transcribed code extracted from handwriting.',
                },
                overallScore: {
                  type: Type.NUMBER,
                  description: 'Total objective score out of 100.',
                },
                rubricBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    logicalCorrectness: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER, description: 'Score out of 60' },
                        maxScore: { type: Type.NUMBER, description: 'Always 60' },
                        feedback: { type: Type.STRING, description: 'Detailed justification for logic score' },
                      },
                      required: ['score', 'maxScore', 'feedback'],
                    },
                    syntaxValidity: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER, description: 'Score out of 20' },
                        maxScore: { type: Type.NUMBER, description: 'Always 20' },
                        feedback: { type: Type.STRING, description: 'Detailed justification for syntax score' },
                      },
                      required: ['score', 'maxScore', 'feedback'],
                    },
                    efficiencyQuality: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER, description: 'Score out of 10' },
                        maxScore: { type: Type.NUMBER, description: 'Always 10' },
                        timeComplexity: { type: Type.STRING, description: 'Estimated Big-O time complexity' },
                        spaceComplexity: { type: Type.STRING, description: 'Estimated Big-O auxiliary space complexity' },
                        feedback: { type: Type.STRING, description: 'Detailed justification for efficiency score' },
                      },
                      required: ['score', 'maxScore', 'timeComplexity', 'spaceComplexity', 'feedback'],
                    },
                    readabilityStructure: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER, description: 'Score out of 10' },
                        maxScore: { type: Type.NUMBER, description: 'Always 10' },
                        feedback: { type: Type.STRING, description: 'Detailed justification for readability and naming' },
                      },
                      required: ['score', 'maxScore', 'feedback'],
                    },
                  },
                  required: ['logicalCorrectness', 'syntaxValidity', 'efficiencyQuality', 'readabilityStructure'],
                },
                detailedEvaluation: {
                  type: Type.OBJECT,
                  properties: {
                    strengths: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Key correct implementations and logic',
                    },
                    syntaxAndLogicErrors: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          errorType: { type: Type.STRING, description: 'Syntax, Logic, Runtime, or Scope' },
                          description: { type: Type.STRING, description: 'Description of the error' },
                          lineHint: { type: Type.STRING, description: 'Approximate line or code snippet reference' },
                          severity: { type: Type.STRING, description: 'Major, Moderate, or Minor' },
                        },
                        required: ['errorType', 'description', 'severity'],
                      },
                      description: 'Itemized list of errors',
                    },
                    unhandledEdgeCases: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'List of missed boundary conditions and edge cases',
                    },
                  },
                  required: ['strengths', 'syntaxAndLogicErrors', 'unhandledEdgeCases'],
                },
                suggestedImprovements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Actionable recommendations for the student',
                },
                correctedCode: {
                  type: Type.STRING,
                  description: 'Fully corrected, optimal code implementation with comments',
                },
                formattedMarkdownOutput: {
                  type: Type.STRING,
                  description: 'The exact formatted text report matching the required academic output format',
                },
              },
              required: [
                'language',
                'ocrNotes',
                'transcribedCode',
                'overallScore',
                'rubricBreakdown',
                'detailedEvaluation',
                'suggestedImprovements',
                'correctedCode',
                'formattedMarkdownOutput',
              ],
            },
          },
        });

        if (response && response.text) {
          break; // Succeeded!
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // Wait 800ms before attempting fallback model
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All models failed to generate response.');
    }

    const text = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output:', text);
      return res.status(500).json({ error: 'Failed to parse evaluation response from model.', raw: text });
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Evaluation API error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while evaluating code.',
    });
  }
});

// Serve frontend with Vite in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Academic Code Evaluator running at http://localhost:${port}`);
  });
}

startServer();
