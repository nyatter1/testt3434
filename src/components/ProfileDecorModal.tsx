import { useState, useMemo } from "react";
import { X, Sparkles, Wand2, Star, Plus, Check, Save } from "lucide-react";
import { UserProfile } from "../types";
import { getProfileBorderStyle, BORDERS_LIST } from "./ProfileModal";
import { supabase } from "../lib/supabase";

export const EFFECTS_LIST = [
  { id: "none", label: "None ❌", cost: 0, type: 'coins' },
  { id: "blueprint", label: "Developer Blueprint 📐", cost: 0, type: 'rubies' },
  { id: "sepia", label: "Vintage Sepia 📸", cost: 0, type: 'coins' },
  { id: "flames", label: "Inferno Flames 🔥", cost: 0, type: 'rubies' },
  { id: "rain", label: "Rainy Day ☔", cost: 0, type: 'coins' },
  { id: "smoke", label: "Mystic Smoke 💨", cost: 0, type: 'coins' },
  { id: "bubbles", label: "Floating Bubbles 🫧", cost: 0, type: 'coins' },
  { id: "hearts", label: "Raining Hearts 💖", cost: 0, type: 'rubies' },
  { id: "snow", label: "Winter Snow ❄️", cost: 0, type: 'coins' },
  { id: "matrix", label: "Matrix Code 💻", cost: 0, type: 'rubies' },
  { id: "glitch", label: "System Glitch 👾", cost: 0, type: 'rubies' },
  { id: "cyberpunk", label: "Cyber City 🌆", cost: 0, type: 'rubies' },
  { id: "stars", label: "Starry Night ⭐", cost: 0, type: 'coins' },
  { id: "clouds", label: "Drifting Clouds ☁️", cost: 0, type: 'coins' },
  { id: "ocean", label: "Deep Ocean 🌊", cost: 0, type: 'coins' },
  { id: "lava", label: "Volcanic Lava 🌋", cost: 0, type: 'rubies' },
  { id: "thunder", label: "Thunderstorm ⛈️", cost: 0, type: 'coins' },
  { id: "fireflies", label: "Fireflies ✨", cost: 0, type: 'rubies' },
  { id: "confetti", label: "Party Confetti 🎉", cost: 0, type: 'coins' },
  { id: "butterflies", label: "Butterflies 🦋", cost: 0, type: 'rubies' },
  { id: "bats", label: "Spooky Bats 🦇", cost: 0, type: 'rubies' },
  { id: "ghosts", label: "Haunted Ghosts 👻", cost: 0, type: 'rubies' },
  { id: "leaves", label: "Autumn Leaves 🍂", cost: 0, type: 'coins' },
  { id: "sakura", label: "Sakura Petals 🌸", cost: 0, type: 'rubies' },
  { id: "sparks", label: "Electric Sparks ⚡", cost: 0, type: 'coins' },
  { id: "hologram", label: "Sci-Fi Hologram 🛰️", cost: 0, type: 'rubies' },
  { id: "vhs", label: "Retro VHS 📼", cost: 0, type: 'coins' },
  { id: "crt", label: "Old CRT TV 📺", cost: 0, type: 'coins' },
  { id: "neon-pulse", label: "Neon Pulse 💡", cost: 0, type: 'rubies' },
  { id: "void", label: "The Void 🌌", cost: 0, type: 'rubies' },
  { id: "aurora", label: "Aurora Lights 🌠", cost: 0, type: 'rubies' },
  { id: "strobe", label: "Strobe Lights 🔦", cost: 0, type: 'coins' },
  { id: "disco", label: "Disco Floor 🪩", cost: 0, type: 'coins' },
  { id: "gold-dust", label: "Golden Dust 🪙", cost: 0, type: 'rubies' },
  { id: "blood-moon", label: "Blood Moon 🩸", cost: 0, type: 'coins' },
  { id: "underwater", label: "Deep Sea 🦑", cost: 0, type: 'coins' },
  { id: "toxic", label: "Toxic Spill ☣️", cost: 0, type: 'rubies' },
  { id: "radioactive", label: "Radioactive ☢️", cost: 0, type: 'rubies' },
  { id: "shatter", label: "Shattered Glass 🔨", cost: 0, type: 'coins' },
  { id: "mirror", label: "Mirror House 🪞", cost: 0, type: 'coins' },
  { id: "ink", label: "Ink Spill 🖋️", cost: 0, type: 'coins' },
  { id: "paper", label: "Torn Paper 📄", cost: 0, type: 'coins' },
  { id: "wood", label: "Wood Cabin 🪵", cost: 0, type: 'coins' },
  { id: "metal", label: "Brushed Metal ⚙️", cost: 0, type: 'coins' },
  { id: "leather", label: "Dark Leather 🧳", cost: 0, type: 'coins' },
  { id: "hacker", label: "Hacker Terminal ⌨️", cost: 0, type: 'rubies' },
  { id: "rainbow-swirl", label: "Rainbow Swirl 🌀", cost: 0, type: 'rubies' },
  { id: "diamond", label: "Diamond Crystal 💎", cost: 0, type: 'rubies' },
];

export default function ProfileDecorModal({ user, onClose, onUserUpdate, onPurchase }: { user: UserProfile, onClose: () => void, onUserUpdate: (u: Partial<UserProfile>) => void, onPurchase?: () => void }) {
  const [activeTab, setActiveTab] = useState<"borders" | "effects">("borders");
  
  const [selectedBorder, setSelectedBorder] = useState(user.border || "none");
  const [selectedThickness, setSelectedThickness] = useState(user.borderThickness || "2px");
  const [selectedStyle, setSelectedStyle] = useState(user.borderStyle || "solid");
  
  const [selectedEffect, setSelectedEffect] = useState(user.profile_effect || "none");
  
  const [isSaving, setIsSaving] = useState(false);

  const calculateCost = () => { return { coins: 0, rubies: 0 }; };
  
  const { coins: costCoins, rubies: costRubies } = calculateCost();
  
  const canAfford = (user.coins || 0) >= costCoins && (user.rubies || 0) >= costRubies;

  const handleSave = async () => {
    
    setIsSaving(true);
    
    const newCoins = (user.coins || 0) - costCoins;
    const newRubies = (user.rubies || 0) - costRubies;
    
    const updates = {
      border: selectedBorder,
      borderThickness: selectedThickness,
      borderStyle: selectedStyle,
      profile_effect: selectedEffect,
      coins: newCoins,
      rubies: newRubies
    };
    
    await supabase.from("profiles").update(updates).eq("id", user.id);
    onUserUpdate(updates);
    if (onPurchase) onPurchase();
    else onClose();
  };

  const previewBorderStyle = useMemo(() => {
    const s = getProfileBorderStyle(selectedBorder, selectedThickness);
    if (selectedBorder !== "none") {
       s.borderStyle = selectedStyle;
    }
    return s;
  }, [selectedBorder, selectedThickness, selectedStyle]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="w-full max-w-4xl bg-[#121212] border border-purple-900/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/40 flex items-center justify-between shrink-0 bg-[#0d0a1c]">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h4 className="font-black text-white text-lg">Profile Decor</h4>
          </div>
          <div className="flex items-center gap-4">
            
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-[#0d0a1c] shrink-0">
          <button
            onClick={() => setActiveTab("borders")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "borders" ? "border-purple-500 text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            Profile Borders
          </button>
          <button
            onClick={() => setActiveTab("effects")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "effects" ? "border-purple-500 text-white" : "border-transparent text-white/50 hover:text-white/80"}`}
          >
            Profile Effects
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-[400px]">
          {/* Left side: selection list */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-4 custom-scrollbar bg-[#0d0a1c]">
            {activeTab === "borders" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold px-1">Thickness</label>
                    <select 
                      value={selectedThickness}
                      onChange={(e) => setSelectedThickness(e.target.value)}
                      className="w-full bg-[#16122a] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="1px">Thin (1px)</option>
                      <option value="2px">Normal (2px)</option>
                      <option value="4px">Thick (4px)</option>
                      <option value="6px">Heavy (6px)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-white/50 uppercase font-bold px-1">Style</label>
                    <select 
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full bg-[#16122a] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                      <option value="double">Double</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {BORDERS_LIST.map((b, i) => {
                    
                    const isSelected = selectedBorder === b.id;
                    const isOwned = user.border === b.id;

                    return (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBorder(b.id)}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-2 gap-1 transition-all ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'bg-[#16122a] hover:bg-[#1a1532]'} border border-white/5`}
                        title={b.label}
                      >
                        <div 
                          className={`w-8 h-8 rounded-full ${b.id !== 'none' ? `profile-border-${b.id}` : ''}`} 
                          style={b.id === 'none' ? { border: '1px solid rgba(255,255,255,0.2)' } : getProfileBorderStyle(b.id, '2px')}
                        />
                        <span className="text-[9px] text-center font-medium text-white/70 truncate w-full">{b.label}</span>
                        
                        {isOwned && (
                          <div className="absolute top-1 right-1 text-[8px] font-black text-green-400 bg-green-400/10 px-1 py-0.5 rounded">
                            OWNED
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTab === "effects" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EFFECTS_LIST.map(e => {
                  const isSelected = selectedEffect === e.id;
                  const isOwned = user.profile_effect === e.id;
                  
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEffect(e.id)}
                      className={`relative flex flex-col items-center justify-center p-3 gap-2 rounded-xl border transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-white/5 bg-[#16122a] hover:bg-[#1a1532]'}`}
                    >
                      <span className="text-[11px] font-bold text-white text-center">{e.label}</span>
                      
                      {isOwned && (
                        <div className="text-[9px] font-black text-green-400 mt-1 px-2 py-0.5 bg-green-400/10 rounded">OWNED</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right side: Live Preview */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 bg-[#090714] flex flex-col border-l border-white/5">
            <h5 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 text-center">Live Preview</h5>
            
            <div className="flex-1 flex items-center justify-center">
              <div 
                className={`relative w-full max-w-sm rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[400px] ${
                  selectedBorder !== "none" ? `profile-border-${selectedBorder}` : "border border-purple-900/40" } ${selectedEffect === "sepia" ? "profile-effect-sepia" : ""
                }`}
                style={selectedBorder !== "none" ? previewBorderStyle : {}}
              >
                
                
                <div className="relative z-10 flex flex-col h-full bg-[#0d0a1c]/80 backdrop-blur-sm">
                  <div className="h-28 w-full bg-purple-900/30" />
                  <div className={`px-6 pb-6 flex-1 flex flex-col items-center text-center -mt-10 ${selectedEffect !== "none" && selectedEffect !== "sepia" ? "profile-effect-" + selectedEffect : ""}`}>
                    <div className="w-20 h-20 rounded-full border-2 border-[#121212] overflow-hidden bg-black mb-3">
                      <img src={user.pfp} className="w-full h-full object-cover" alt="pfp" />
                    </div>
                    <h3 className="font-black text-xl text-white">{user.username}</h3>
                    <p className="text-xs text-purple-300 mt-1 uppercase tracking-wider font-bold">{user.rank}</p>
                    
                    <div className="mt-6 w-full p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-white/70 italic">"{user.aboutMe || "No bio set."}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Purchase Action */}
            <div className="mt-6 p-4 bg-[#16122a] rounded-xl border border-white/10 shrink-0">
              <div className="flex justify-between items-center mb-3 text-sm font-bold text-white"><span>Price:</span><span className="text-green-400">FREE</span></div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors ${
                  'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                }`}
              >
                {isSaving ? "Saving..." : <><Check className="w-4 h-4" /> Apply Changes</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
