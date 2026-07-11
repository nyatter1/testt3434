import { useState, FormEvent } from "react";
import { X, Gift, Send } from "lucide-react";
import { UserProfile } from "../types";

interface GiftModalProps {
  user: UserProfile;
  onClose: () => void;
  onSend: (message: string, style: string) => void;
}

const BOX_STYLES = [
  { id: "Classic", name: "Classic", colors: "from-red-500 to-rose-600", border: "border-red-500", glow: "shadow-red-500/20", emoji: "🎁" },
  { id: "Royal", name: "Royal", colors: "from-purple-500 to-indigo-600", border: "border-purple-500", glow: "shadow-purple-500/20", emoji: "👑" },
  { id: "Neon", name: "Neon", colors: "from-fuchsia-500 via-purple-500 to-cyan-500", border: "border-cyan-400", glow: "shadow-cyan-400/30", emoji: "✨" },
  { id: "Candy", name: "Candy", colors: "from-pink-400 to-amber-500", border: "border-pink-400", glow: "shadow-pink-400/20", emoji: "🍬" },
  { id: "Ice", name: "Ice", colors: "from-sky-400 to-blue-500", border: "border-sky-400", glow: "shadow-sky-400/20", emoji: "❄️" },
  { id: "Dark", name: "Dark", colors: "from-stone-700 to-neutral-900", border: "border-stone-500", glow: "shadow-neutral-500/20", emoji: "🕷️" },
  { id: "Gold", name: "Gold", colors: "from-yellow-400 to-amber-500", border: "border-yellow-400", glow: "shadow-yellow-400/30", emoji: "🌟" },
  { id: "Love", name: "Love", colors: "from-red-400 to-pink-500", border: "border-rose-400", glow: "shadow-rose-400/20", emoji: "💖" },
];

export default function GiftModal({ user, onClose, onSend }: GiftModalProps) {
  const [message, setMessage] = useState("");
  const [activeStyle, setActiveStyle] = useState("Classic");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please write a message to put inside the Gift Box.");
      return;
    }
    
    // Check if the user has enough rubies
    const userRubies = user.rubies ?? 0;
    if (userRubies < 5) {
      alert(`Creating a Gift Box costs 5 Rubies. You only have ${userRubies} Rubies.`);
      return;
    }

    onSend(message.trim(), activeStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#120f24] border border-purple-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex justify-between items-center bg-[#0d0a1a]">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-400 animate-bounce" />
            <div>
              <h2 className="text-base font-black tracking-wide uppercase">Gift Box</h2>
              <p className="text-[10px] text-purple-400/80 font-bold">Wrap a hidden message in an animated gift box</p>
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

        {/* Cost Ribbon */}
        <div className="bg-[#191433] px-5 py-2 border-b border-purple-950/20 flex items-center justify-between">
          <span className="text-xs font-extrabold text-pink-300">
            Cost: <span className="text-white font-black">5 Rubies</span>
          </span>
          <span className="text-[10px] font-black text-purple-400/80 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded-md">
            Rate limit: 30s
          </span>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[75vh]">
          {/* Gift Message */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider">Gift message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a clean hidden message... Links, fonts, styles and file extensions are blocked."
              maxLength={250}
              className="w-full h-24 bg-[#0d0a1c] border border-purple-900/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-purple-500/60 focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-black uppercase text-purple-300 tracking-wider block">Pick box style</label>
            <div className="grid grid-cols-4 gap-2.5">
              {BOX_STYLES.map((style) => {
                const isSelected = activeStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setActiveStyle(style.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all relative overflow-hidden ${
                      isSelected
                        ? `${style.border} bg-[#1f1940] shadow-md ${style.glow} scale-105 z-10`
                        : "border-purple-950/40 bg-black/20 hover:border-purple-500/30 hover:bg-black/30"
                    }`}
                  >
                    {/* Tiny styled square container representing the gift */}
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${style.colors} flex items-center justify-center shadow-inner`}>
                      <span className="text-lg">{style.emoji}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold ${isSelected ? "text-white" : "text-purple-400/60"}`}>
                      {style.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-purple-950/40 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-extrabold text-xs uppercase rounded-xl transition-all border border-purple-900/20 text-center cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-pink-900/20 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send Gift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
