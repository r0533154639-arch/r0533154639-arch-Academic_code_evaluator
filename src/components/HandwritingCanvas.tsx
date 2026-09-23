import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, RotateCcw, Trash2, Sliders, Type } from 'lucide-react';

interface HandwritingCanvasProps {
  onImageChange: (dataUrl: string) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  isEraser: boolean;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({ onImageChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#1e1b4b'); // Classic dark blue ink
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);

  // Redraw background & all strokes
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background - Ivory notebook sheet
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, height);

    // Blue lined ruled paper lines
    const lineHeight = 34;
    const startY = 80;
    ctx.strokeStyle = '#d4e3f5';
    ctx.lineWidth = 1;

    for (let y = startY; y < height - 20; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    // Left red margin line
    const marginX = 90;
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginX, 15);
    ctx.lineTo(marginX, height - 15);
    ctx.stroke();

    // Subtle header
    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Inter", sans-serif';
    ctx.fillText('EXAM ANSWER SHEET  •  WRITE STUDENT CODE BELOW', 105, 45);

    // Draw saved strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      if (stroke.isEraser) {
        ctx.strokeStyle = '#fdfbf7';
        ctx.lineWidth = stroke.width * 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      for (let i = 1; i < stroke.points.length; i++) {
        const midPointX = (stroke.points[i - 1].x + stroke.points[i].x) / 2;
        const midPointY = (stroke.points[i - 1].y + stroke.points[i].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, midPointX, midPointY);
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
    if (canvasRef.current && strokes.length > 0) {
      onImageChange(canvasRef.current.toDataURL('image/png'));
    }
  }, [strokes]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pt = getCanvasCoords(e);
    setIsDrawing(true);
    currentStrokeRef.current = [pt];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    currentStrokeRef.current.push(pt);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = currentStrokeRef.current;
    if (points.length >= 2) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#fdfbf7' : penColor;
      ctx.lineWidth = currentTool === 'eraser' ? lineWidth * 2.5 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      const newStroke: Stroke = {
        points: currentStrokeRef.current,
        color: penColor,
        width: lineWidth,
        isEraser: currentTool === 'eraser',
      };
      setStrokes((prev) => [...prev, newStroke]);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#fdfbf7';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      redrawCanvas();
      onImageChange(canvas.toDataURL('image/png'));
    }
  };

  const insertSampleHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw handwritten text into canvas using Kalam font
    ctx.save();
    ctx.fillStyle = '#1e1b4b';
    ctx.font = '22px "Kalam", cursive, sans-serif';
    let y = 110;
    const lines = [
      'def find_max(arr):',
      '    if len(arr) == 0:',
      '        return None',
      '    max_val = arr[0]',
      '    for x in arr:',
      '        if x > max_val:',
      '            max_val = x',
      '    return max_val',
    ];
    lines.forEach((l) => {
      ctx.fillText(l, 120, y);
      y += 34;
    });
    ctx.restore();
    onImageChange(canvas.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-800/80 border-b border-slate-700/80 text-xs">
        <div className="flex items-center gap-2">
          {/* Pen / Eraser tool toggles */}
          <div className="flex bg-slate-900/90 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTool === 'pen'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Pen</span>
            </button>
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                currentTool === 'eraser'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Color options */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
            {[
              { label: 'Blue Pen', color: '#1e1b4b' },
              { label: 'Black Ink', color: '#09090b' },
              { label: 'Graphite Pencil', color: '#475569' },
            ].map((c) => (
              <button
                key={c.color}
                onClick={() => {
                  setPenColor(c.color);
                  setCurrentTool('pen');
                }}
                className={`w-5 h-5 rounded-full border-2 transition ${
                  penColor === c.color && currentTool === 'pen'
                    ? 'border-indigo-400 scale-110 shadow'
                    : 'border-slate-600 hover:border-slate-400'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
          </div>

          {/* Line Width */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
            {[2, 3, 5].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`px-2 py-1 rounded text-xs transition ${
                  lineWidth === w ? 'bg-indigo-950 text-indigo-300 font-bold border border-indigo-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {w === 2 ? 'Fine' : w === 3 ? 'Medium' : 'Thick'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={insertSampleHandwriting}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-sky-300 hover:text-sky-200 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 rounded-md transition"
            title="Generate sample handwritten Python function onto paper"
          >
            <Type className="h-3.5 w-3.5" />
            <span>Insert Quick Script</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 rounded disabled:opacity-40 disabled:pointer-events-none transition"
            title="Undo stroke"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition"
            title="Clear paper"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas Drawing Area */}
      <div className="relative overflow-auto p-4 flex justify-center bg-slate-950/80 max-h-[550px]">
        <canvas
          ref={canvasRef}
          width={800}
          height={650}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="border border-amber-900/20 rounded shadow-2xl cursor-crosshair touch-none bg-[#fdfbf7] max-w-full h-auto"
        />
      </div>

      <div className="px-4 py-2 bg-slate-900 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
        <span>✍️ Draw handwritten code directly with your mouse or stylus (simulates exam booklet paper)</span>
        <span>{strokes.length} strokes drawn</span>
      </div>
    </div>
  );
};
