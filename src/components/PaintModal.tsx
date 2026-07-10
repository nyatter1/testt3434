import React, { useRef, useState, useEffect } from "react";
import { X, Trash2, RotateCcw, Palette, Circle, Type, Eye, Check, Square, Upload } from "lucide-react";
import { uploadImageToStorage } from "../lib/storage";

interface PaintModalProps {
  onClose: () => void;
  onSend: (imageUrl: string) => void;
}

export default function PaintModal({ onClose, onSend }: PaintModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState("#a855f7"); // purple default
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState<"brush" | "circle" | "text" | "eraser">("brush");
  const [textInput, setTextInput] = useState("");
  
  // Undo history stack
  const [history, setHistory] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const colors = [
    "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#000000"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill with black/dark background initially
    ctx.fillStyle = "#0c0919";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    setHistory([canvas.toDataURL()]);
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => [...prev, canvas.toDataURL()]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const previous = history[history.length - 2];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previous;
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Account for css scale
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setStartX(x);
    setStartY(y);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === "eraser" ? "#0c0919" : color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Take snapshot for shape previewing
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (tool === "text") {
      if (!textInput.trim()) {
        alert("Please enter some text in the input box first!");
        setIsDrawing(false);
        return;
      }
      ctx.font = `${thickness * 3}px 'Inter', sans-serif`;
      ctx.fillStyle = color;
      ctx.fillText(textInput, x, y);
      saveToHistory();
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "circle" && snapshot) {
      // Restore canvas state to avoid drawing filled/nested circles during move
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
      ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0c0919";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw image keeping ratio
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height,
          centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
        
        saveToHistory();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsUploading(true);
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Could not create drawing blob");
        const file = new File([blob], `painting_${Date.now()}.png`, { type: "image/png" });
        const uploadedUrl = await uploadImageToStorage(file, "paintings", file.name);
        onSend(uploadedUrl);
        onClose();
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("Failed to send painting. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0d0a1c] border border-purple-500/40 rounded-none shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex items-center justify-between bg-purple-950/10">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-purple-300 uppercase tracking-widest">Draw & Painting Studio</h4>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Canvas Area */}
        <div ref={containerRef} className="flex-1 bg-black/40 flex items-center justify-center p-4 min-h-[300px] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full max-w-full bg-[#0c0919] border border-purple-950/50 cursor-crosshair rounded-none shadow-inner touch-none object-contain"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 border-t border-purple-950/40 bg-[#120f26]/80 space-y-4">
          
          {/* Tool selectors and brush width */}
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setTool("brush")}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${tool === "brush" ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950" : "bg-[#16122a] text-purple-300 border-purple-950 hover:text-white"}`}
                title="Paint Brush"
              >
                <Palette className="w-4 h-4" />
                <span>Brush</span>
              </button>
              
              <button
                onClick={() => setTool("circle")}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${tool === "circle" ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950" : "bg-[#16122a] text-purple-300 border-purple-950 hover:text-white"}`}
                title="Draw Circles"
              >
                <Circle className="w-4 h-4" />
                <span>Circle</span>
              </button>

              <button
                onClick={() => setTool("text")}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${tool === "text" ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950" : "bg-[#16122a] text-purple-300 border-purple-950 hover:text-white"}`}
                title="Add Text"
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>

              <button
                onClick={() => setTool("eraser")}
                className={`p-2 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${tool === "eraser" ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950" : "bg-[#16122a] text-purple-300 border-purple-950 hover:text-white"}`}
                title="Eraser Tool"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Eraser</span>
              </button>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-2 flex-1 min-w-[150px]">
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-400 shrink-0">Size: {thickness}px</span>
              <input
                type="range"
                min="1"
                max="40"
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value))}
                className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-purple-950 rounded-lg appearance-none"
              />
            </div>
          </div>

          {/* Text Input Row (only shows if Text Tool is selected) */}
          {tool === "text" && (
            <div className="flex gap-2 p-1.5 bg-[#090714] border border-purple-900/40 rounded-xl animate-in slide-in-from-top-1 duration-150">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your canvas text here, then click where you want to drop it..."
                className="flex-1 bg-transparent text-xs text-purple-100 placeholder-purple-500 focus:outline-none px-2 font-medium"
              />
            </div>
          )}

          {/* Colors Palettes & Reference Stamp Upload */}
          <div className="flex flex-wrap items-center gap-4 justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border transition-all hover:scale-110 cursor-pointer ${color === c ? "border-white ring-2 ring-purple-500/80 scale-105" : "border-black/30"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-purple-500/30 flex items-center justify-center shrink-0 cursor-pointer">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span className="text-xs">🎨</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Stamp file uploader */}
              <label className="p-2 bg-purple-950/30 hover:bg-purple-950/60 border border-purple-900/40 rounded-lg text-xs text-purple-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Reference</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <button
                onClick={undo}
                disabled={history.length <= 1}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-300 border border-zinc-800 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                title="Undo last action"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
              
              <button
                onClick={clearCanvas}
                className="p-2 bg-rose-950/20 hover:bg-rose-950/50 rounded-lg text-rose-300 border border-rose-900/30 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer"
                title="Reset Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-purple-950/30">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isUploading}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-950/50 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Sending Painting...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Send to Chat</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
