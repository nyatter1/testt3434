import { useState, useRef, FormEvent } from "react";
import { X, Plus, Trash2, CheckSquare } from "lucide-react";
import { UserProfile } from "../types";

interface PollModalProps {
  user: UserProfile;
  onClose: () => void;
  onSend: (pollData: { question: string; mode: string; duration: string; options: string[] }) => void;
}

export default function PollModal({ user, onClose, onSend }: PollModalProps) {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("Normal - show voters");
  const [duration, setDuration] = useState("1 hour");
  const [options, setOptions] = useState<string[]>(["", ""]); // starts with 2 empty options

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      alert("Please enter a poll question.");
      return;
    }
    // Filter out blank options
    const finalOptions = options.map(opt => opt.trim()).filter(Boolean);
    if (finalOptions.length < 2) {
      alert("Please provide at least 2 non-empty options for the poll.");
      return;
    }

    onSend({
      question: question.trim(),
      mode,
      duration,
      options: finalOptions
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#120f24] border border-purple-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex justify-between items-center bg-[#0d0a1a]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-base font-black tracking-wide uppercase">Create room poll</h2>
              <p className="text-[10px] text-purple-400/80 font-bold">Ask the room and watch live results update.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/5 text-purple-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[80vh]">
          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What should we do tonight?"
              className="w-full bg-[#0d0a1c] border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-purple-500/60 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Voting Mode & Duration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Voting mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-[#0d0a1c] border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Normal - show voters">Normal - show voters</option>
                <option value="Anonymous - hide voters">Anonymous - hide voters</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Duration</label>
              <select
                value={duration}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-[#0d0a1c] border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="15 mins">15 mins</option>
                <option value="1 hour">1 hour</option>
                <option value="1 day">1 day</option>
                <option value="Unlimited">Unlimited</option>
              </select>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Options 2 to 5</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 bg-[#0d0a1c] border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-purple-500/50 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-2.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 rounded-xl text-red-400 hover:text-red-300 transition-colors"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-1 flex items-center gap-1.5 px-3 py-2 bg-purple-950/30 border border-purple-900/30 rounded-xl text-xs font-bold text-purple-300 hover:bg-purple-950/60 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add option
              </button>
            )}
          </div>

          {/* Submit & Disclaimer */}
          <div className="pt-4 border-t border-purple-950/40 space-y-3">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              📝 Create poll in room
            </button>
            <p className="text-[10px] text-purple-500/80 font-bold leading-relaxed text-center px-2">
              Polls allow plain text only. Links, file extensions, fonts, and styled text are blocked by spam protection.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
