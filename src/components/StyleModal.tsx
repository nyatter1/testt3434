import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Type, MessageSquare, Save, Sparkles } from 'lucide-react';

interface StyleModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (updates: Partial<UserProfile>) => void | Promise<void>;
}

const FONTS = [
  'Default', 'Inter', 'Space Grotesk', 'Playfair Display', 'JetBrains Mono', 'Comic Sans MS', 'Impact',
  'Nunito', 'Fredoka', 'Oswald', 'Cinzel', 'VT323', 'Dancing Script', 'Pacifico'
];

const EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'neon', label: 'Neon Glow' },
  { id: 'rainbow', label: 'Rainbow Animated' },
  { id: 'pulse', label: 'Pulsing Color' }
];

const FORMATS = [
  { id: 'normal', label: 'Normal' },
  { id: 'bold', label: 'Bold' },
  { id: 'italic', label: 'Italic' },
  { id: 'bold_italic', label: 'Bold & Italic' }
];

export default function StyleModal({ user, onClose, onUpdate }: StyleModalProps) {
  const [activeTab, setActiveTab] = useState<'username' | 'message'>('username');

  const [usernameColor, setUsernameColor] = useState(user.username_color || '#ffffff');
  const [usernameFont, setUsernameFont] = useState(user.username_font || 'Default');
  const [usernameEffect, setUsernameEffect] = useState(user.username_effect || 'none');
  const [usernameFormat, setUsernameFormat] = useState(user.username_format || 'normal');

  const [messageColor, setMessageColor] = useState(user.message_color || '#e9d5ff');
  const [messageFont, setMessageFont] = useState(user.message_font || 'Default');
  const [messageEffect, setMessageEffect] = useState(user.message_effect || 'none');
  const [messageFormat, setMessageFormat] = useState(user.message_format || 'normal');

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdate({
      username_color: usernameColor,
      username_font: usernameFont,
      username_effect: usernameEffect,
      username_format: usernameFormat,
      message_color: messageColor,
      message_font: messageFont,
      message_effect: messageEffect,
      message_format: messageFormat
    });
    setIsSaving(false);
    onClose();
  };

  const renderEffectPreviewClass = (effect: string, format: string) => {
    let classes = "";
    if (format.includes("bold")) classes += "font-bold ";
    if (format.includes("italic")) classes += "italic ";
    
    if (effect === 'neon') classes += "drop-shadow-[0_0_8px_currentColor] ";
    if (effect === 'rainbow') classes += "animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent ";
    if (effect === 'pulse') classes += "animate-pulse ";

    return classes;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#120e24] border border-purple-900/50 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-900/30 bg-[#0d0a18]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Style Customizer</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-purple-900/30">
          <button
            onClick={() => setActiveTab('username')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'username' 
                ? 'text-white border-b-2 border-purple-500 bg-purple-900/10' 
                : 'text-purple-400 hover:text-purple-200 hover:bg-white/5'
            }`}
          >
            <Type className="w-4 h-4" />
            Username
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'message' 
                ? 'text-white border-b-2 border-purple-500 bg-purple-900/10' 
                : 'text-purple-400 hover:text-purple-200 hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat Message
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar space-y-6">
          
          {/* Preview Panel */}
          <div className="p-4 rounded-xl bg-[#090714] border border-purple-900/40">
            <span className="text-xs text-purple-500 uppercase tracking-widest font-bold mb-2 block">Live Preview</span>
            <div className="flex flex-col gap-1">
              <span 
                className={`text-sm ${renderEffectPreviewClass(
                  activeTab === 'username' ? usernameEffect : user.username_effect || 'none',
                  activeTab === 'username' ? usernameFormat : user.username_format || 'normal'
                )}`}
                style={{ 
                  color: activeTab === 'username' && usernameEffect !== 'rainbow' ? usernameColor : (user.username_effect !== 'rainbow' ? user.username_color : undefined),
                  fontFamily: (activeTab === 'username' ? usernameFont : user.username_font) === 'Default' ? undefined : `"${activeTab === 'username' ? usernameFont : user.username_font}", sans-serif`
                }}
              >
                {user.username}
              </span>
              <span 
                className={`text-sm ${renderEffectPreviewClass(
                  activeTab === 'message' ? messageEffect : user.message_effect || 'none',
                  activeTab === 'message' ? messageFormat : user.message_format || 'normal'
                )}`}
                style={{ 
                  color: activeTab === 'message' && messageEffect !== 'rainbow' ? messageColor : (user.message_effect !== 'rainbow' ? user.message_color : undefined),
                  fontFamily: (activeTab === 'message' ? messageFont : user.message_font) === 'Default' ? undefined : `"${activeTab === 'message' ? messageFont : user.message_font}", sans-serif`
                }}
              >
                Hello, this is how it looks!
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            
            {/* Color */}
            <div>
              <label className="text-xs font-bold text-purple-300 mb-1.5 block">Color</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={activeTab === 'username' ? usernameColor : messageColor}
                  onChange={(e) => activeTab === 'username' ? setUsernameColor(e.target.value) : setMessageColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                />
                <input 
                  type="text"
                  value={activeTab === 'username' ? usernameColor : messageColor}
                  onChange={(e) => activeTab === 'username' ? setUsernameColor(e.target.value) : setMessageColor(e.target.value)}
                  className="bg-[#090714] border border-purple-900/40 rounded-lg px-3 py-2 text-sm text-white w-full outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="text-xs font-bold text-purple-300 mb-1.5 block">Font</label>
              <select
                value={activeTab === 'username' ? usernameFont : messageFont}
                onChange={(e) => activeTab === 'username' ? setUsernameFont(e.target.value) : setMessageFont(e.target.value)}
                className="w-full bg-[#090714] border border-purple-900/40 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
              >
                {FONTS.map(f => <option key={f} value={f} style={{fontFamily: f === 'Default' ? undefined : `"${f}", sans-serif`}}>{f}</option>)}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="text-xs font-bold text-purple-300 mb-1.5 block">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map(f => {
                  const isActive = (activeTab === 'username' ? usernameFormat : messageFormat) === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => activeTab === 'username' ? setUsernameFormat(f.id) : setMessageFormat(f.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                        isActive 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-[#090714] text-purple-400 hover:bg-purple-900/50 border border-purple-900/40'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Effect */}
            <div>
              <label className="text-xs font-bold text-purple-300 mb-1.5 block">Special Effect</label>
              <div className="grid grid-cols-2 gap-2">
                {EFFECTS.map(e => {
                  const isActive = (activeTab === 'username' ? usernameEffect : messageEffect) === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => activeTab === 'username' ? setUsernameEffect(e.id) : setMessageEffect(e.id)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                        isActive 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-[#090714] text-purple-400 hover:bg-purple-900/50 border border-purple-900/40'
                      }`}
                    >
                      {e.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-900/30 bg-[#0d0a18] flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
