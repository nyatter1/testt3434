import React, { useState, useRef, ChangeEvent, useEffect, ReactNode } from "react";
import { 
  X, Camera, Heart, Edit2, Eye, Info, User, 
  MessageSquare, Star, Trash2, Shield, Languages, MapPin, Calendar, Clock,
  Users, Globe, Share2, Edit3, TrendingUp, Lock, TrendingUp as ShareIcon,
  Sparkles, Frame, CreditCard, Palette, Paintbrush, Zap,
  LayoutGrid, Ban, ChevronLeft, ChevronRight, Check, Layout, Move
} from "lucide-react";
import { UserProfile, Rating, UserRank, RANKS_INFO, getLevelFromXp, ProfileLayout, ElementLayout } from "../types";
import GalleryViewModal from "./GalleryViewModal";
import { Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabase";
import { uploadImageToStorage } from "../lib/storage";

const EFFECTS_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Lobster&family=Pacifico&family=Dancing+Script&family=Satisfy&family=Sacramento&family=Great+Vibes&family=Yellowtail&family=Cookie&family=Kaushan+Script&family=Shadows+Into+Light&family=Amatic+SC&family=Special+Elite&family=Creepster&family=Bungee&family=Righteous&family=VT323&family=Press+Start+2P&family=Orbitron&family=Audiowide&family=Syncopate&family=Rajdhani&family=Montserrat&family=Oswald&family=Raleway&family=Abril+Fatface&family=Cinzel&family=Lora&family=Merriweather&family=DM+Serif+Display&family=Poppins&family=Lexend&family=Syne&family=Unbounded&family=Inconsolata&family=Source+Code+Pro&display=swap');

/* Animations */
@keyframes bio-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes bio-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes bio-shake { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(2px, -2px); } 60% { transform: translate(-2px, -2px); } 80% { transform: translate(2px, 2px); } }
@keyframes bio-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes bio-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
@keyframes bio-rainbow { 0% { color: #ff0000; } 17% { color: #ff8800; } 33% { color: #ffff00; } 50% { color: #00ff00; } 67% { color: #0000ff; } 83% { color: #8800ff; } 100% { color: #ff0000; } }
@keyframes bio-glitch { 0%, 100% { text-shadow: 1px 1px #ff0000, -1px -1px #0000ff; } 50% { text-shadow: -1px 1px #ff0000, 1px -1px #0000ff; } }
@keyframes bio-flicker { 0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.3; } }
@keyframes bio-fire { 0%, 100% { text-shadow: 0 -2px 4px #ff3b30, 0 -4px 10px #ff9500, 0 -10px 20px #ffcc00; color: #fff; } 50% { text-shadow: 0 -1px 3px #ff3b30, 0 -3px 8px #ff9500, 0 -8px 15px #ffcc00; color: #ffd700; } }
@keyframes bio-neon { 0%, 100% { text-shadow: 0 0 5px #fff, 0 0 10px #f43f5e, 0 0 20px #e11d48; color: #fff; } 50% { text-shadow: 0 0 2px #fff, 0 0 5px #f43f5e, 0 0 10px #e11d48; color: #ffe4e6; } }
@keyframes bio-slide { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
@keyframes bio-zoom { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes bio-flip { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(-1); } }
@keyframes bio-strobe { 0%, 100% { opacity: 1; filter: brightness(1.5); } 50% { opacity: 0.15; } }
@keyframes bio-ghost { 0%, 100% { opacity: 1; filter: blur(0px); } 50% { opacity: 0.3; filter: blur(2px); } }
@keyframes bio-heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.2); } 28% { transform: scale(1); } 42% { transform: scale(1.2); } 70% { transform: scale(1); } }
@keyframes bio-blur { 0%, 100% { filter: blur(0); } 50% { filter: blur(4px); } }
@keyframes bio-rotate3d { 0% { transform: perspective(400px) rotateY(0deg); } 100% { transform: perspective(400px) rotateY(360deg); } }
@keyframes bio-wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes bio-wind { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-12deg); } }
@keyframes bio-cyber { 0%, 100% { color: #22c55e; text-shadow: 0 0 4px #22c55e, 0 0 10px #15803d; } 50% { color: #4ade80; text-shadow: 0 0 2px #4ade80; } }
@keyframes bio-gold { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes bio-matrix { 0% { text-shadow: 0 0 2px #0f0; color: #0f0; } 50% { text-shadow: 0 0 8px #0f0; color: #8f8; } 100% { text-shadow: 0 0 2px #0f0; color: #0f0; } }
@keyframes bio-retro { 0%, 100% { opacity: 0.95; text-shadow: 1px 0 #f00, -1px 0 #00f; } 50% { opacity: 1; text-shadow: -1px 0 #f00, 1px 0 #00f; } }
@keyframes bio-pixel { 0%, 100% { box-shadow: 2px 2px 0 #fff; } 50% { box-shadow: -2px -2px 0 #fff; } }
@keyframes bio-lava { 0% { color: #f97316; text-shadow: 0 0 5px #f97316; } 50% { color: #ef4444; text-shadow: 0 0 10px #ef4444; } 100% { color: #f97316; text-shadow: 0 0 5px #f97316; } }
@keyframes bio-disco { 0% { color: #f43f5e; } 25% { color: #3b82f6; } 50% { color: #10b981; } 75% { color: #eab308; } 100% { color: #f43f5e; } }
@keyframes bio-smoke { 0%, 100% { text-shadow: 0 0 4px #ccc; opacity: 0.8; transform: skewY(1deg); } 50% { text-shadow: 0 0 12px #aaa; opacity: 0.4; transform: skewY(-1deg); } }
@keyframes bio-thunder { 0%, 95%, 98%, 100% { opacity: 1; filter: brightness(1); } 96%, 97% { opacity: 1; filter: brightness(3) contrast(1.5); } }
@keyframes bio-frost { 0%, 100% { text-shadow: 0 0 5px #e0f2fe, 0 0 10px #bae6fd; color: #f0f9ff; } 50% { text-shadow: 0 0 2px #e0f2fe; color: #e0f2fe; } }
@keyframes bio-slime { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.85) translateY(2px); color: #84cc16; } }
@keyframes bio-bubble { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.05); } }
@keyframes bio-comet { 0% { text-shadow: -2px 0 2px #3b82f6; } 50% { text-shadow: 4px 0 8px #f43f5e; } 100% { text-shadow: -2px 0 2px #3b82f6; } }
@keyframes bio-supernova { 0%, 100% { text-shadow: 0 0 4px #f43f5e, 0 0 12px #a855f7; transform: scale(1); } 50% { text-shadow: 0 0 20px #f43f5e, 0 0 40px #a855f7; transform: scale(1.08); } }
@keyframes bio-nebula { 0% { text-shadow: 0 0 5px #a855f7; } 50% { text-shadow: 0 0 15px #ec4899; } 100% { text-shadow: 0 0 5px #6366f1; } }
@keyframes bio-eclipse { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(0.2); } }
@keyframes bio-blackhole { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(0.6) rotate(180deg); opacity: 0.5; } }
@keyframes bio-magic { 0%, 100% { text-shadow: 0 0 2px #fff, 0 0 8px #eab308; } 50% { text-shadow: 0 0 10px #fff, 0 0 20px #eab308; } }
@keyframes bio-heartbeat-slow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
@keyframes bio-heartbeat-fast { 0%, 50%, 100% { transform: scale(1); } 25%, 75% { transform: scale(1.25); } }
@keyframes bio-strobe-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes bio-morph { 0%, 100% { letter-spacing: 0px; font-weight: normal; } 50% { letter-spacing: 4px; font-weight: bold; } }
@keyframes bio-static { 0%, 100% { opacity: 0.9; filter: contrast(1.2) brightness(0.8); } 50% { opacity: 1; filter: contrast(1) brightness(1.1); } }
@keyframes bio-fireflies { 0%, 100% { text-shadow: 0 0 2px #fef08a; } 50% { text-shadow: 0 0 10px #fef08a, 0 0 20px #eab308; } }
@keyframes bio-water-wave { 0%, 100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-4px) scaleY(1.05); } }
@keyframes bio-wind-fast { 0%, 100% { transform: skewX(0deg) translateX(0); } 50% { transform: skewX(-20deg) translateX(-4px); } }
@keyframes bio-explode { 0%, 100% { transform: scale(1); letter-spacing: 0px; } 50% { transform: scale(1.2); letter-spacing: 8px; opacity: 0.5; } }
@keyframes bio-compress { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.3, 0.7); } }
@keyframes bio-expand { 0%, 100% { transform: scale(1); letter-spacing: 0px; } 50% { transform: scale(1.1); letter-spacing: 6px; } }
@keyframes bio-vanish { 0%, 100% { opacity: 1; filter: blur(0px); } 50% { opacity: 0.05; filter: blur(4px); } }
@keyframes bio-pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); text-shadow: 0 0 8px rgba(255,255,255,0.8); } }

/* Effect Classes */
.bio-effect-spin { display: inline-block; animation: bio-spin 4s linear infinite; }
.bio-effect-pulse { display: inline-block; animation: bio-pulse 2s ease-in-out infinite; }
.bio-effect-shake { display: inline-block; animation: bio-shake 0.3s linear infinite; }
.bio-effect-bounce { display: inline-block; animation: bio-bounce 1s ease-in-out infinite; }
.bio-effect-float { display: inline-block; animation: bio-float 2s ease-in-out infinite; }
.bio-effect-rainbow { animation: bio-rainbow 4s linear infinite; }
.bio-effect-glitch { display: inline-block; animation: bio-glitch 0.2s linear infinite; }
.bio-effect-flicker { animation: bio-flicker 1.5s linear infinite; }
.bio-effect-fire { display: inline-block; animation: bio-fire 1s ease-in-out infinite; }
.bio-effect-neon { display: inline-block; animation: bio-neon 1.5s ease-in-out infinite; }
.bio-effect-slide { display: inline-block; animation: bio-slide 2s ease-in-out infinite; }
.bio-effect-zoom { display: inline-block; animation: bio-zoom 2s ease-in-out infinite; }
.bio-effect-flip { display: inline-block; animation: bio-flip 2s ease-in-out infinite; }
.bio-effect-strobe { animation: bio-strobe 0.8s ease-in-out infinite; }
.bio-effect-ghost { animation: bio-ghost 3s ease-in-out infinite; }
.bio-effect-heartbeat { display: inline-block; animation: bio-heartbeat 1.2s ease-in-out infinite; }
.bio-effect-blur { animation: bio-blur 3s ease-in-out infinite; }
.bio-effect-rotate3d { display: inline-block; animation: bio-rotate3d 4s linear infinite; }
.bio-effect-wave { display: inline-block; animation: bio-wave 1s ease-in-out infinite; }
.bio-effect-wind { display: inline-block; animation: bio-wind 2s ease-in-out infinite; }
.bio-effect-cyber { animation: bio-cyber 2s linear infinite; }
.bio-effect-gold {
  background: linear-gradient(90deg, #ffe259, #ffa751, #ffe259);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bio-gold 2s linear infinite;
}
.bio-effect-emerald {
  background: linear-gradient(90deg, #34d399, #059669, #34d399);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bio-gold 2s linear infinite;
}
.bio-effect-sapphire {
  background: linear-gradient(90deg, #60a5fa, #2563eb, #60a5fa);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bio-gold 2s linear infinite;
}
.bio-effect-matrix { animation: bio-matrix 2s linear infinite; }
.bio-effect-retro { animation: bio-retro 0.5s linear infinite; }
.bio-effect-pixel { border: 1px solid #fff; padding: 2px 4px; animation: bio-pixel 1s steps(2) infinite; }
.bio-effect-lava { animation: bio-lava 2s linear infinite; }
.bio-effect-disco { animation: bio-disco 1s linear infinite; }
.bio-effect-smoke { display: inline-block; animation: bio-smoke 4s ease-in-out infinite; }
.bio-effect-thunder { animation: bio-thunder 5s linear infinite; }
.bio-effect-frost { animation: bio-frost 2s ease-in-out infinite; }
.bio-effect-slime { display: inline-block; animation: bio-slime 2.5s ease-in-out infinite; }
.bio-effect-bubble { display: inline-block; animation: bio-bubble 1.5s ease-in-out infinite; }
.bio-effect-comet { animation: bio-comet 2s linear infinite; }
.bio-effect-supernova { display: inline-block; animation: bio-supernova 1.5s ease-in-out infinite; }
.bio-effect-nebula { animation: bio-nebula 3s linear infinite; }
.bio-effect-eclipse { animation: bio-eclipse 4s ease-in-out infinite; }
.bio-effect-blackhole { display: inline-block; animation: bio-blackhole 3s linear infinite; }
.bio-effect-magic { animation: bio-magic 2s linear infinite; }
.bio-effect-heartbeat-slow { display: inline-block; animation: bio-heartbeat-slow 2s ease-in-out infinite; }
.bio-effect-heartbeat-fast { display: inline-block; animation: bio-heartbeat-fast 0.6s ease-in-out infinite; }
.bio-effect-strobe-fast { animation: bio-strobe-fast 0.2s steps(2) infinite; }
.bio-effect-morph { display: inline-block; animation: bio-morph 3s ease-in-out infinite; }
.bio-effect-static { animation: bio-static 0.15s infinite; }
.bio-effect-fireflies { animation: bio-fireflies 1.5s ease-in-out infinite; }
.bio-effect-water-wave { display: inline-block; animation: bio-water-wave 1.5s ease-in-out infinite; }
.bio-effect-wind-fast { display: inline-block; animation: bio-wind-fast 0.5s ease-in-out infinite; }
.bio-effect-explode { display: inline-block; animation: bio-explode 2s ease-in-out infinite; }
.bio-effect-compress { display: inline-block; animation: bio-compress 1s ease-in-out infinite; }
.bio-effect-expand { display: inline-block; animation: bio-expand 2s ease-in-out infinite; }
.bio-effect-vanish { display: inline-block; animation: bio-vanish 3s ease-in-out infinite; }
.bio-effect-pop { display: inline-block; animation: bio-pop 1.5s ease-in-out infinite; }

/* Custom Profile Animated Borders */
.profile-border-rainbow {
  border-image: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1 !important;
}
.profile-border-neon-rainbow {
  border-image: linear-gradient(to right, #ff007f, #ff00ff, #7f00ff, #0000ff, #00ffff, #00ff00, #ffff00, #ff7f00, #ff0000) 1 !important;
  box-shadow: 0 0 15px rgba(236, 72, 153, 0.6), inset 0 0 8px rgba(59, 130, 246, 0.4);
}
.profile-border-lava {
  border-image: linear-gradient(to right, #ef4444, #f97316, #b91c1c, #f97316) 1 !important;
  animation: border-lava-pulse 2s ease infinite;
}
@keyframes border-lava-pulse {
  0%, 100% { box-shadow: 0 0 8px #ef4444; }
  50% { box-shadow: 0 0 18px #f97316; }
}
.profile-border-strobe {
  animation: border-strobe-effect 0.4s steps(2) infinite !important;
}
@keyframes border-strobe-effect {
  0% { border-color: #ffffff !important; box-shadow: 0 0 15px #ffffff; }
  100% { border-color: #000000 !important; box-shadow: none; }
}
.profile-border-disco {
  animation: border-disco-effect 1.5s linear infinite !important;
}
@keyframes border-disco-effect {
  0% { border-color: #ef4444 !important; box-shadow: 0 0 12px #ef4444; }
  20% { border-color: #3b82f6 !important; box-shadow: 0 0 12px #3b82f6; }
  40% { border-color: #10b981 !important; box-shadow: 0 0 12px #10b981; }
  60% { border-color: #eab308 !important; box-shadow: 0 0 12px #eab308; }
  80% { border-color: #ec4899 !important; box-shadow: 0 0 12px #ec4899; }
  100% { border-color: #ef4444 !important; box-shadow: 0 0 12px #ef4444; }
}
.profile-border-electric {
  animation: border-electric-flicker 0.8s ease infinite !important;
  border-color: #60a5fa !important;
}
@keyframes border-electric-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { box-shadow: 0 0 15px #60a5fa, inset 0 0 5px #60a5fa; opacity: 1; }
  20%, 24%, 55% { box-shadow: 0 0 2px #60a5fa; opacity: 0.5; }
}
.profile-border-cyber {
  border-style: dashed !important;
  border-color: #22c55e !important;
  box-shadow: 0 0 8px rgba(34, 197, 150, 0.4);
}
.profile-border-matrix {
  border-style: dotted !important;
  border-color: #00ff00 !important;
  text-shadow: 0 0 5px #00ff00;
  box-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
}
.profile-border-frost {
  border-color: #e0f2fe !important;
  box-shadow: 0 0 15px #bae6fd, inset 0 0 5px #ffffff;
}
.profile-border-bubble {
  border-style: double !important;
  border-color: #38bdf8 !important;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
}
.profile-border-dark-shadow {
  border-color: #1e1b4b !important;
  box-shadow: 0 0 25px rgba(0, 0, 0, 1), inset 0 0 10px #000000;
}
.profile-border-toxic {
  border-color: #a3e635 !important;
  box-shadow: 0 0 15px #84cc16;
}
.profile-border-ghostly {
  border-color: #f1f5f9 !important;
  animation: border-ghostly-fade 3s ease-in-out infinite;
}
@keyframes border-ghostly-fade {
  0%, 100% { opacity: 0.3; box-shadow: 0 0 5px #f1f5f9; }
  50% { opacity: 1; box-shadow: 0 0 15px #cbd5e1; }
}
.profile-border-pixel-art {
  border-style: double !important;
  border-color: #f8fafc !important;
  box-shadow: 4px 4px 0px #000000, -4px -4px 0px #000000;
}
.profile-border-supernova {
  border-image: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6) 1 !important;
  animation: border-supernova-glow 4s linear infinite;
}
@keyframes border-supernova-glow {
  0%, 100% { box-shadow: 0 0 10px #ec4899; }
  50% { box-shadow: 0 0 25px #8b5cf6; }
}
.profile-border-eclipse {
  border-color: #000000 !important;
  box-shadow: 0 0 15px #ffffff, inset 0 0 8px rgba(255, 255, 255, 0.5);
}
.profile-border-blackhole {
  border-color: #1e1b4b !important;
  box-shadow: 0 0 20px #8b5cf6, inset 0 0 15px #000000;
}
.profile-border-comet {
  border-color: #3b82f6 !important;
  box-shadow: 0 -4px 15px #3b82f6, 0 4px 5px rgba(59, 130, 246, 0.3);
}
.profile-border-nebula {
  border-image: linear-gradient(to bottom, #a855f7, #ec4899) 1 !important;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}
.profile-border-sky-cloud {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 10px #bae6fd;
}
.profile-border-halloween {
  border-image: linear-gradient(135deg, #f97316, #581c87, #f97316) 1 !important;
  box-shadow: 0 0 15px #f97316;
}
.profile-border-christmas {
  border-image: linear-gradient(135deg, #ef4444, #22c55e, #ef4444) 1 !important;
  box-shadow: 0 0 12px #ef4444;
}
.profile-border-love {
  border-color: #f472b6 !important;
  box-shadow: 0 0 15px #f43f5e;
}
.profile-border-forest {
  border-color: #15803d !important;
  box-shadow: 0 0 10px #166534;
}
.profile-border-glitch {
  animation: border-glitch-anim 0.1s linear infinite !important;
  border-image: linear-gradient(45deg, #ff00ff, #00ffff) 1 !important;
  box-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
}
@keyframes border-glitch-anim {
  0% { transform: translate(0) }
  20% { transform: translate(-3px, 3px) }
  40% { transform: translate(-3px, -3px) }
  60% { transform: translate(3px, 3px) }
  80% { transform: translate(3px, -3px) }
  100% { transform: translate(0) }
}
`;

const FONTS_LIST = [
  "Inter", "Outfit", "Space Grotesk", "Nunito", "Fredoka", "Montserrat", "Raleway", "Oswald", "Poppins", "Lexend",
  "Lobster", "Pacifico", "Dancing Script", "Satisfy", "Sacramento", "Great Vibes", "Yellowtail", "Cookie", "Kaushan Script", "Shadows Into Light",
  "Amatic SC", "Special Elite", "Creepster", "Bungee", "Righteous", "VT323", "Press Start 2P", "Orbitron", "Audiowide", "Syncopate",
  "Rajdhani", "Syne", "Unbounded", "Inconsolata", "Source Code Pro", "Courier New", "Lucida Console", "Playfair Display", "Abril Fatface", "Cinzel",
  "Lora", "Merriweather", "DM Serif Display", "Cursive", "Monospace", "Sans-Serif", "Serif", "Impact", "Comic Sans MS", "Georgia", "Palatino", "Garamond"
];

const EFFECTS_LIST = [
  { id: "spin", label: "Slow Spin 🌀" },
  { id: "pulse", label: "Pulse Beat 💓" },
  { id: "shake", label: "Vibrate/Shake 📳" },
  { id: "bounce", label: "Bounce Up 🚀" },
  { id: "float", label: "Gently Float 🎈" },
  { id: "rainbow", label: "Rainbow Cycles 🌈" },
  { id: "glitch", label: "Glitch Shadow ⚡" },
  { id: "flicker", label: "Flicker Light 💡" },
  { id: "fire", label: "Fire Flame 🔥" },
  { id: "neon", label: "Neon Pink Glow 🎆" },
  { id: "slide", label: "Slide Side-to-Side ↔️" },
  { id: "zoom", label: "Zooming Focus 🔍" },
  { id: "flip", label: "Horizontal Flip 🔄" },
  { id: "strobe", label: "Strobe Lights 🚦" },
  { id: "ghost", label: "Ghost Blur 👻" },
  { id: "heartbeat", label: "Heartbeat scaling ❤️" },
  { id: "blur", label: "Blur Transitions 🌫️" },
  { id: "rotate3d", label: "3D Perspective Rotate 🔮" },
  { id: "wave", label: "Wavy Float 🌊" },
  { id: "wind", label: "Wind Swept 🌬️" },
  { id: "cyber", label: "Cyberpunk Tech 🤖" },
  { id: "gold", label: "Shimmering Gold 🪙" },
  { id: "emerald", label: "Emerald Radiance 💚" },
  { id: "sapphire", label: "Sapphire Shine 💙" },
  { id: "matrix", label: "Matrix Rain 📟" },
  { id: "retro", label: "Retro CRT Scanline 📺" },
  { id: "pixel", label: "Retro Pixel Box 👾" },
  { id: "lava", label: "Volcanic Lava 🌋" },
  { id: "disco", label: "Disco Flash 🪩" },
  { id: "smoke", label: "Soft Smoke Drift 💨" },
  { id: "thunder", label: "Thunder Lightning ⛈️" },
  { id: "frost", label: "Icy Frost Glow ❄️" },
  { id: "slime", label: "Green Slime Bubbling 🧪" },
  { id: "bubble", label: "Drifting Bubbles 🧼" },
  { id: "comet", label: "Cosmic Comet Tail ☄️" },
  { id: "supernova", label: "Supernova Explosion 💥" },
  { id: "nebula", label: "Swirling Nebula 🌌" },
  { id: "eclipse", label: "Solar Eclipse 🌑" },
  { id: "blackhole", label: "Sucking Blackhole 🕳️" },
  { id: "magic", label: "Magic Star Glow ✨" },
  { id: "heartbeat-slow", label: "Slow Heartbeat 💟" },
  { id: "heartbeat-fast", label: "Fast Heartbeat 🫀" },
  { id: "strobe-fast", label: "Fast Strobe 🚨" },
  { id: "morph", label: "Letter Morph 🧬" },
  { id: "static", label: "Analog Static 📻" },
  { id: "fireflies", label: "Fireflies Sparkle 🪰" },
  { id: "water-wave", label: "Water Wave Ripple 💧" },
  { id: "wind-fast", label: "Fast Storm Gale 🌀" },
  { id: "explode", label: "Shattered Fragments 💥" },
  { id: "compress", label: "Squash/Stretch 🥨" },
  { id: "expand", label: "Vast Expanding 🌌" },
  { id: "vanish", label: "Fade & Vanish 🌫️" },
  { id: "pop", label: "Pop Balloon 🎈" }
];

const COLOR_CATEGORIES = [
  {
    name: "Vivid Presets",
    colors: [
      "#ef4444", "#dc2626", "#b91c1c", "#f97316", "#ea580c", "#c2410c",
      "#f59e0b", "#d97706", "#b45309", "#eab308", "#ca8a04", "#a16207",
      "#84cc16", "#65a30d", "#4d7c0f", "#22c55e", "#16a34a", "#15803d",
      "#10b981", "#059669", "#047857", "#14b8a6", "#0d9488", "#0f766e"
    ]
  },
  {
    name: "Neons & Pastels",
    colors: [
      "#06b6d4", "#0891b2", "#0e7490", "#3b82f6", "#2563eb", "#1d4ed8",
      "#6366f1", "#4f46e5", "#4338ca", "#8b5cf6", "#7c3aed", "#6d28d9",
      "#a855f7", "#9333ea", "#7e22ce", "#d946ef", "#c084fc", "#a21caf",
      "#ec4899", "#db2777", "#be185d", "#f43f5e", "#e11d48", "#be123c"
    ]
  },
  {
    name: "Pastel Dreams",
    colors: [
      "#ffb3ba", "#ffdfba", "#ffffba", "#baffc9", "#bae1ff", "#e8c4ec",
      "#fcd5ce", "#f8ad9d", "#f4978e", "#f08080", "#ffcad4", "#b5e2fa",
      "#edede9", "#d6ccc2", "#f5ebe0", "#e3d5ca", "#d5bdaf", "#e9edc9",
      "#fefae0", "#faedcd", "#d8f3dc", "#b7e4c7", "#95d5b2", "#74c69d"
    ]
  },
  {
    name: "Gradients & Metallics",
    colors: [
      "#ffd700", "#c0c0c0", "#b87333", "#8a2be2", "#39ff14", "#ff007f",
      "#00ffff", "#ff00ff", "#ffff00", "#ff3131", "#e6c229", "#f17105",
      "#d100d1", "#00b4d8", "#90e0ef", "#f72585", "#7209b7", "#3f37c9",
      "#4895ef", "#4cc9f0", "#52b788", "#74c69d", "#a3f7bf", "#2dc653"
    ]
  },
  {
    name: "Deep Cosmic",
    colors: [
      "#0f172a", "#1e293b", "#334155", "#475569", "#0c0a09", "#1c1917",
      "#2e2a24", "#44403c", "#180018", "#300030", "#480048", "#600060",
      "#001818", "#003030", "#004848", "#006060", "#181800", "#303000",
      "#484800", "#606000", "#1c1917", "#0f172a", "#111827", "#030712"
    ]
  }
];

export function extractBgMusic(text: string): { cleanText: string, bgUrl: string | null } {
  const lines = text.split('\n');
  let bgUrl: string | null = null;
  const cleanLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('BG:')) {
      bgUrl = line.trim().substring(3).trim();
    } else {
      cleanLines.push(line);
    }
  }
  
  return {
    cleanText: cleanLines.join('\n'),
    bgUrl
  };
}

export function getYoutubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getSpotifyEmbedUrl(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    const type = match[1];
    const id = match[2];
    return `https://open.spotify.com/embed/${type}/${id}`;
  }
  return null;
}

export function extractMediaLinks(text: string) {
  const lines = text.split('\n');
  const ytVideoIds: string[] = [];
  const spotifyUrls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  for (const line of lines) {
    if (line.trim().startsWith('BG:')) continue;
    const matches = line.match(urlRegex);
    if (matches) {
      for (const link of matches) {
        const ytId = getYoutubeVideoId(link);
        if (ytId) {
          ytVideoIds.push(ytId);
          continue;
        }
        const spotifyUrl = getSpotifyEmbedUrl(link);
        if (spotifyUrl) {
          spotifyUrls.push(spotifyUrl);
        }
      }
    }
  }
  
  return { ytVideoIds, spotifyUrls };
}

interface ASTNode {
  tag: string;
  attr?: string;
  children: (ASTNode | string)[];
}

export function parseBioTags(text: string): ASTNode {
  const root: ASTNode = { tag: 'root', children: [] };
  const stack: ASTNode[] = [root];
  let i = 0;
  
  while (i < text.length) {
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i);
      if (closeBracket !== -1) {
        const tagContent = text.substring(i + 1, closeBracket).trim();
        i = closeBracket + 1;
        
        if (tagContent.startsWith('/')) {
          const tagName = tagContent.substring(1).toLowerCase();
          if (stack.length > 1) {
            let foundIdx = -1;
            for (let s = stack.length - 1; s >= 1; s--) {
              if (stack[s].tag === tagName) {
                foundIdx = s;
                break;
              }
            }
            if (foundIdx !== -1) {
              while (stack.length > foundIdx) {
                stack.pop();
              }
            } else {
              stack[stack.length - 1].children.push(`[${tagContent}]`);
            }
          } else {
            root.children.push(`[${tagContent}]`);
          }
        } else {
          let tagName = tagContent.toLowerCase();
          let attr = "";
          const eqIdx = tagContent.indexOf('=');
          if (eqIdx !== -1) {
            tagName = tagContent.substring(0, eqIdx).trim().toLowerCase();
            attr = tagContent.substring(eqIdx + 1).trim();
          }
          
          const newNode: ASTNode = { tag: tagName, attr, children: [] };
          stack[stack.length - 1].children.push(newNode);
          stack.push(newNode);
        }
        continue;
      }
    }
    
    const current = stack[stack.length - 1];
    let nextBracket = text.indexOf('[', i);
    if (nextBracket === -1) nextBracket = text.length;
    
    const textChunk = text.substring(i, nextBracket);
    if (textChunk) {
      current.children.push(textChunk);
    }
    i = nextBracket;
  }
  
  return root;
}

export function renderAST(node: ASTNode | string, key: string | number): React.ReactNode {
  if (typeof node === 'string') {
    return node;
  }
  
  const children = node.children.map((child, idx) => renderAST(child, `${key}-${idx}`));
  
  switch (node.tag) {
    case 'b':
      return <strong key={key} className="font-black text-white">{children}</strong>;
    case 'i':
      return <em key={key} className="italic text-purple-200">{children}</em>;
    case 'u':
      return <span key={key} className="underline decoration-purple-500">{children}</span>;
    case 'color':
      return <span key={key} style={{ color: node.attr }}>{children}</span>;
    case 'font':
      return <span key={key} style={{ fontFamily: node.attr }}>{children}</span>;
    case 'glow':
      return (
        <span 
          key={key} 
          style={{ 
            textShadow: `0 0 8px ${node.attr || '#a855f7'}, 0 0 20px ${node.attr || '#a855f7'}`,
            color: '#ffffff'
          }}
        >
          {children}
        </span>
      );
    case 'effect':
      const effectClass = `bio-effect-${node.attr || 'none'}`;
      return <span key={key} className={effectClass}>{children}</span>;
    default:
      return <span key={key}>{children}</span>;
  }
}

export function stripSpotifyLinks(text: string): string {
  // Matches Spotify URLs starting with http/https or open.spotify.com
  const spotifyRegex = /https?:\/\/open\.spotify\.com\/[^\s]+/gi;
  return text.replace(spotifyRegex, '').trim();
}

export function BioContentRenderer({ text }: { text: string }) {
  const { cleanText } = extractBgMusic(text);
  const textWithoutSpotify = stripSpotifyLinks(cleanText);
  const lines = textWithoutSpotify.split('\n');
  
  return (
    <div className="space-y-1">
      <style>{EFFECTS_STYLE}</style>
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-4" />;
        const ast = parseBioTags(line);
        return (
          <div key={idx} className="leading-relaxed whitespace-pre-wrap text-purple-100 break-all text-sm font-medium">
            {renderAST(ast, idx)}
          </div>
        );
      })}
    </div>
  );
}

export function BioMediaRenderer({ text }: { text: string }) {
  const { ytVideoIds, spotifyUrls } = extractMediaLinks(text);
  
  if (ytVideoIds.length === 0 && spotifyUrls.length === 0) return null;
  
  return (
    <div className="mt-6 pt-6 border-t border-purple-900/20 space-y-4">
      {spotifyUrls.map((url, idx) => (
        <div key={`spotify-${idx}`} className="rounded-xl overflow-hidden bg-black/40 border border-purple-900/10">
          <iframe 
            src={url} 
            width="100%" 
            height="152" 
            allowFullScreen={false} 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            className="border-0"
          />
        </div>
      ))}
      
      {ytVideoIds.map((id, idx) => (
        <div key={`yt-${idx}`} className="rounded-xl overflow-hidden bg-black/40 border border-purple-900/10 aspect-video">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${id}`} 
            title="YouTube video player" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            className="border-0 w-full h-full"
          />
        </div>
      ))}
    </div>
  );
}

export function BackgroundMusicPlayer({ bioText }: { bioText: string }) {
  return null;
}

export const BORDERS_LIST = [
  { id: "none", label: "None ❌" },
  { id: "white", label: "Solid White ⚪" },
  { id: "thick-white", label: "Thick White ⭐" },
  { id: "dashed-white", label: "Dashed White ➖" },
  { id: "dotted-white", label: "Dotted White ░" },
  { id: "rainbow", label: "Rainbow 🌈" },
  { id: "neon-rainbow", label: "Glowing Rainbow ⚡" },
  { id: "red", label: "Crimson Red 🔴" },
  { id: "red-neon", label: "Neon Red 🔥" },
  { id: "orange", label: "Flame Orange 🟠" },
  { id: "orange-neon", label: "Neon Orange ☄️" },
  { id: "yellow", label: "Electric Yellow 🟡" },
  { id: "yellow-neon", label: "Neon Yellow 💡" },
  { id: "green", label: "Lime Green 🟢" },
  { id: "green-neon", label: "Neon Green 💚" },
  { id: "cyan", label: "Ice Cyan 🔵" },
  { id: "cyan-neon", label: "Neon Cyan 🧊" },
  { id: "blue", label: "Royal Blue 🟦" },
  { id: "blue-neon", label: "Neon Blue 🌌" },
  { id: "purple", label: "Amethyst Purple 🟣" },
  { id: "purple-neon", label: "Neon Purple 🔮" },
  { id: "pink", label: "Barbie Pink 💗" },
  { id: "pink-neon", label: "Neon Pink 💖" },
  { id: "gold", label: "Metallic Gold 🏆" },
  { id: "gold-neon", label: "Glowing Gold ✨" },
  { id: "silver", label: "Metallic Silver 🥈" },
  { id: "silver-neon", label: "Glowing Silver 💎" },
  { id: "bronze", label: "Rustic Bronze 🥉" },
  { id: "vintage", label: "Royal Vintage 👑" },
  { id: "vintage-dark", label: "Dark Vintage 🏛️" },
  { id: "cyber", label: "Cyber Dashed 🧬" },
  { id: "matrix", label: "Matrix Code 📟" },
  { id: "lava", label: "Fiery Lava 🌋" },
  { id: "frost", label: "Frozen Frost ❄️" },
  { id: "strobe", label: "Fast Strobe 🚨" },
  { id: "disco", label: "Party Disco 🪩" },
  { id: "bubble", label: "Aero Bubbles 🫧" },
  { id: "dark-shadow", label: "Dark Shadow 🖤" },
  { id: "electric", label: "Electric Flicker ⚡" },
  { id: "toxic", label: "Toxic Slime ☣️" },
  { id: "ghostly", label: "Ghost Whispers 👻" },
  { id: "glitch", label: "Insane Glitch 👾" },
  { id: "pixel-art", label: "Pixel Border 🎮" },
  { id: "supernova", label: "Supernova 💥" },
  { id: "eclipse", label: "Eclipse 🌑" },
  { id: "blackhole", label: "Blackhole 🕳️" },
  { id: "comet", label: "Comet Tail ☄️" },
  { id: "nebula", label: "Orion Nebula 🌌" },
  { id: "sky-cloud", label: "Sky Cloud ☁️" },
  { id: "halloween", label: "Halloween 🎃" },
  { id: "christmas", label: "Holiday Festive 🎄" },
  { id: "love", label: "Love Hearts 💕" },
  { id: "forest", label: "Deep Forest 🌲" }
];

export function getProfileBorderStyle(borderType: string, thickness: string = "2px"): React.CSSProperties {
  if (!borderType || borderType === "none") {
    return {
      border: "1px solid rgba(147, 51, 234, 0.4)",
      boxShadow: "none"
    };
  }

  const t = thickness || "2px";

  switch (borderType) {
    case "white":
      return { border: `${t} solid #ffffff` };
    case "thick-white":
      return { border: `calc(${t} * 2) solid #ffffff` };
    case "dashed-white":
      return { border: `${t} dashed #ffffff` };
    case "dotted-white":
      return { border: `${t} dotted #ffffff` };
    case "red":
      return { border: `${t} solid #ef4444` };
    case "orange":
      return { border: `${t} solid #f97316` };
    case "yellow":
      return { border: `${t} solid #eab308` };
    case "green":
      return { border: `${t} solid #22c55e` };
    case "cyan":
      return { border: `${t} solid #06b6d4` };
    case "blue":
      return { border: `${t} solid #3b82f6` };
    case "purple":
      return { border: `${t} solid #a855f7` };
    case "pink":
      return { border: `${t} solid #ec4899` };
    
    // Neons
    case "red-neon":
      return { border: `${t} solid #ef4444`, boxShadow: `0 0 12px #ef4444, inset 0 0 6px #ef4444` };
    case "orange-neon":
      return { border: `${t} solid #f97316`, boxShadow: `0 0 12px #f97316, inset 0 0 6px #f97316` };
    case "yellow-neon":
      return { border: `${t} solid #eab308`, boxShadow: `0 0 12px #eab308, inset 0 0 6px #eab308` };
    case "green-neon":
      return { border: `${t} solid #22c55e`, boxShadow: `0 0 12px #22c55e, inset 0 0 6px #22c55e` };
    case "cyan-neon":
      return { border: `${t} solid #06b6d4`, boxShadow: `0 0 12px #06b6d4, inset 0 0 6px #06b6d4` };
    case "blue-neon":
      return { border: `${t} solid #3b82f6`, boxShadow: `0 0 12px #3b82f6, inset 0 0 6px #3b82f6` };
    case "purple-neon":
      return { border: `${t} solid #a855f7`, boxShadow: `0 0 12px #a855f7, inset 0 0 6px #a855f7` };
    case "pink-neon":
      return { border: `${t} solid #ec4899`, boxShadow: `0 0 12px #ec4899, inset 0 0 6px #ec4899` };
    
    // Metallics
    case "gold":
      return { border: `${t} solid #d4af37`, background: "linear-gradient(#0d0a1c, #0d0a1c) padding-box, linear-gradient(135deg, #fed7aa, #d4af37, #fef08a, #ca8a04) border-box" };
    case "gold-neon":
      return { border: `${t} solid #f59e0b`, boxShadow: `0 0 15px #f59e0b, inset 0 0 8px #f59e0b` };
    case "silver":
      return { border: `${t} solid #e2e8f0`, background: "linear-gradient(#0d0a1c, #0d0a1c) padding-box, linear-gradient(135deg, #ffffff, #94a3b8, #cbd5e1, #475569) border-box" };
    case "silver-neon":
      return { border: `${t} solid #cbd5e1`, boxShadow: `0 0 15px #cbd5e1, inset 0 0 8px #cbd5e1` };
    case "bronze":
      return { border: `${t} solid #b45309`, background: "linear-gradient(#0d0a1c, #0d0a1c) padding-box, linear-gradient(135deg, #f59e0b, #b45309, #d97706, #78350f) border-box" };
    
    // Vintages
    case "vintage":
      return { 
        border: `calc(${t} + 2px) double #d4af37`, 
        outline: "1px solid #78350f", 
        outlineOffset: "-4px" 
      };
    case "vintage-dark":
      return { 
        border: `calc(${t} + 2px) double #475569`, 
        outline: "1px solid #1e293b", 
        outlineOffset: "-4px" 
      };

    default:
      return { border: `${t} solid transparent` }; // Animated / complex border styled via custom CSS classes
  }
}

interface ProfileModalProps {
  targetUser: UserProfile;
  currentUser: UserProfile;
  mode: "quick" | "view" | "edit";
  onClose: () => void;
  onEdit: () => void;
  onView: () => void;
  onMention: (username: string) => void;
  onUpdate: (updatedUser: Partial<UserProfile>) => void;
  ranksInfo?: Record<string, { name: string; icon: string; priority: number; isStaff?: boolean }>;
}

const DEFAULT_LAYOUT: ProfileLayout = {
  banner: { x: 0, y: 0, width: 448, height: 160, scale: 1, rotation: 0 },
  pfp: { x: 24, y: 110, width: 90, height: 90, scale: 1, rotation: 0 },
  username: { x: 130, y: 150, width: 290, height: 50, scale: 1, rotation: 0 },
  infoGrid: { x: 24, y: 230, width: 400, height: 130, scale: 1, rotation: 0 },
  aboutMe: { x: 24, y: 380, width: 400, height: 180, scale: 1, rotation: 0 }
};

export default function ProfileModal({ 
  targetUser, 
  currentUser, 
  mode, 
  onClose, 
  onEdit, 
  onView, 
  onMention,
  onUpdate,
  ranksInfo
}: ProfileModalProps) {
  const finalRanksInfo = ranksInfo || RANKS_INFO;
  const isOwnProfile = targetUser.username === currentUser.username;
  const isBotUser = targetUser.id === "musicvibe-bot-system-id" || targetUser.isSystem || targetUser.rank === "BOT" || targetUser.username === "System";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isShowingRatings, setIsShowingRatings] = useState(false);
  const [isShowingGallery, setIsShowingGallery] = useState(false);
  const [showLevelStats, setShowLevelStats] = useState(false);
  const [editTab, setEditTab] = useState<"account" | "more">("account");

  const [isEditingCustomLayout, setIsEditingCustomLayout] = useState(false);
  const [customLayout, setCustomLayout] = useState<ProfileLayout>(targetUser.profile_layout || DEFAULT_LAYOUT);
  const [selectedElement, setSelectedElement] = useState<keyof ProfileLayout | null>(null);
  const [activeDragId, setActiveDragId] = useState<keyof ProfileLayout | null>(null);
  const [activeResizeId, setActiveResizeId] = useState<keyof ProfileLayout | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialResizeDims, setInitialResizeDims] = useState({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  
  // Borders & Banner Background States
  const [isEditingBorder, setIsEditingBorder] = useState(false);
  const [tempBorder, setTempBorder] = useState(targetUser.border || "none");
  const [tempBorderThickness, setTempBorderThickness] = useState(targetUser.borderThickness || "2px");
  const [profileBorderViewMode, setProfileBorderViewMode] = useState<"preview" | "grid">("preview");
  const [borderGridPage, setBorderGridPage] = useState(0);

  const [isEditingCardBg, setIsEditingCardBg] = useState(false);
  const [tempCardBg, setTempCardBg] = useState(targetUser.cardBg || "");
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingCardBg, setIsUploadingCardBg] = useState(false);
  const cardBgInputRef = useRef<HTMLInputElement>(null);
  
  const [tempAbout, setTempAbout] = useState(targetUser.aboutMe || "");
  const [tempMood, setTempMood] = useState(targetUser.mood || "");
  const [tempUsername, setTempUsername] = useState(targetUser.username);
  const [tempAge, setTempAge] = useState(targetUser.age.toString());
  const [tempGender, setTempGender] = useState(targetUser.gender);

  // Bio customizer editor state
  const [bgMuted, setBgMuted] = useState(false);
  const [editorTab, setEditorTab] = useState<"effects" | "fonts" | "colors" | "media">("effects");
  const [effectFilter, setEffectFilter] = useState("");
  const [fontFilter, setFontFilter] = useState("");
  const [customColor, setCustomColor] = useState("#a855f7");
  const [customGlow, setCustomGlow] = useState("#3b82f6");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag and resize handlers
  const handleDragStart = (id: keyof ProfileLayout, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedElement(id);
    setActiveDragId(id);
    const layout = customLayout[id] || DEFAULT_LAYOUT[id]!;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      setDragOffset({
        x: mouseX - layout.x,
        y: mouseY - layout.y
      });
    }
  };

  const handleResizeStart = (id: keyof ProfileLayout, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElement(id);
    setActiveResizeId(id);
    const layout = customLayout[id] || DEFAULT_LAYOUT[id]!;
    setInitialResizeDims({
      width: layout.width || 100,
      height: layout.height || 100,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeDragId) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          const mouseX = e.clientX - canvasRect.left;
          const mouseY = e.clientY - canvasRect.top;
          let newX = Math.round(mouseX - dragOffset.x);
          let newY = Math.round(mouseY - dragOffset.y);
          // Clamp to reasonable canvas bounds
          newX = Math.max(-50, Math.min(500, newX));
          newY = Math.max(-50, Math.min(700, newY));
          
          setCustomLayout(prev => ({
            ...prev,
            [activeDragId]: {
              ...(prev[activeDragId] || DEFAULT_LAYOUT[activeDragId]!),
              x: newX,
              y: newY
            }
          }));
        }
      } else if (activeResizeId) {
        const dx = e.clientX - initialResizeDims.mouseX;
        const dy = e.clientY - initialResizeDims.mouseY;
        const newWidth = Math.max(50, initialResizeDims.width + dx);
        const newHeight = Math.max(30, initialResizeDims.height + dy);
        
        setCustomLayout(prev => ({
          ...prev,
          [activeResizeId]: {
            ...(prev[activeResizeId] || DEFAULT_LAYOUT[activeResizeId]!),
            width: Math.round(newWidth),
            height: Math.round(newHeight)
          }
        }));
      }
    };

    const handleMouseUp = () => {
      setActiveDragId(null);
      setActiveResizeId(null);
    };

    if (activeDragId || activeResizeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragId, activeResizeId, dragOffset, initialResizeDims]);

  const applyStyleTag = (openTag: string, closeTag: string) => {
    if (!textareaRef.current) return;
    const txt = textareaRef.current;
    const start = txt.selectionStart;
    const end = txt.selectionEnd;
    const value = tempAbout;
    
    const selected = value.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    
    setTempAbout(newValue);
    
    setTimeout(() => {
      txt.focus();
      txt.setSelectionRange(start, start + replacement.length);
    }, 10);
  };
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [ratingTab, setRatingTab] = useState<"overview" | "rate">("overview");
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  const [likes, setLikes] = useState(targetUser.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"rank" | "mute" | "kick" | "ban" | "unmute" | "unkick" | "unban">("rank");
  const [selectedRank, setSelectedRank] = useState<UserRank>(targetUser.rank);
  const [modReason, setModReason] = useState("");
  const [modDuration, setModDuration] = useState("60");

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    if (targetUser.email === 'dev@gmail.com' && mode === 'view') {
      audio = new Audio('/PASSO BEM SOLTO (Super Slowed).mp3');
      audio.loop = true;
      audio.play().catch(err => console.error("Could not play audio", err));
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [targetUser, mode]);

  useEffect(() => {
    setLikes(targetUser.likes || 0);
    
    // Check if the current user has already liked this profile
    if (currentUser && targetUser && currentUser.id !== targetUser.id) {
      if (targetUser.id === "musicvibe-bot-system-id") {
        setHasLiked(false);
        return;
      }
      supabase
        .from('profile_likes')
        .select('*')
        .eq('liker_id', currentUser.id)
        .eq('liked_id', targetUser.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setHasLiked(true);
          } else {
            setHasLiked(false);
          }
        });
    }
  }, [targetUser.id, currentUser.id]);

  const handleLike = async () => {
    if (isOwnProfile) return;

    if (targetUser.id === "musicvibe-bot-system-id") {
      if (hasLiked) {
        setLikes(prev => prev - 1);
        setHasLiked(false);
      } else {
        setLikes(prev => prev + 1);
        setHasLiked(true);
      }
      return;
    }

    const { data: profileData } = await supabase.from('profiles').select('likes').eq('id', targetUser.id).single();
    const currentLikes = profileData ? (profileData.likes || 0) : (targetUser.likes || 0);

    if (hasLiked) {
      // Unlike (dislike)
      const newLikes = Math.max(0, currentLikes - 1);
      setLikes(newLikes);
      setHasLiked(false);

      await supabase.from('profile_likes').delete().eq('liker_id', currentUser.id).eq('liked_id', targetUser.id);
      await supabase.from('profiles').update({ likes: newLikes }).eq('id', targetUser.id);
      onUpdate({ likes: newLikes });
    } else {
      // Like
      const newLikes = currentLikes + 1;
      setLikes(newLikes);
      setHasLiked(true);

      await supabase.from('profile_likes').insert({ liker_id: currentUser.id, liked_id: targetUser.id });
      await supabase.from('profiles').update({ likes: newLikes }).eq('id', targetUser.id);

      // Send a notification!
      await supabase.from('notifications').insert({
        target_id: targetUser.id,
        sender_id: currentUser.id,
        sender_username: currentUser.username,
        sender_pfp: currentUser.pfp,
        sender_rank: currentUser.rank,
        message: 'Has liked your profile!'
      });

      onUpdate({ likes: newLikes });
    }
  };

  useEffect(() => {
    if (isShowingRatings) {
      fetchRatings();
    }
  }, [isShowingRatings, targetUser.id]);

  const fetchRatings = async () => {
    setIsRatingLoading(true);
    if (targetUser.id === "musicvibe-bot-system-id") {
      setRatings([]);
      setIsRatingLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('ratings')
      .select('*, profiles:author_id(username, pfp)')
      .eq('target_id', targetUser.id)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = data.map((r: any) => ({
        id: r.id,
        target_id: r.target_id,
        author_id: r.author_id,
        author_username: r.profiles?.username || "Unknown",
        author_pfp: r.profiles?.pfp || "",
        score: r.score,
        comment: r.comment,
        created_at: r.created_at
      }));
      setRatings(formatted);
    }
    setIsRatingLoading(false);
  };

  const handlePfpUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPfp(true);
      try {
        const publicUrl = await uploadImageToStorage(file, 'pfps', file.name);
        onUpdate({ pfp: publicUrl });
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingPfp(false);
      }
    }
  };

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingBanner(true);
      try {
        const publicUrl = await uploadImageToStorage(file, 'banners', file.name);
        onUpdate({ banner: publicUrl });
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingBanner(false);
      }
    }
  };

  const handleCardBgUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingCardBg(true);
      try {
        const publicUrl = await uploadImageToStorage(file, 'card_bgs', file.name);
        setTempCardBg(publicUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingCardBg(false);
      }
    }
  };

  const resetPfp = () => {
    onUpdate({ pfp: `https://api.dicebear.com/7.x/adventurer/svg?seed=${targetUser.username}` });
  };

  const resetBanner = () => {
    onUpdate({ banner: undefined });
  };

  const handleSaveAbout = () => {
    onUpdate({ aboutMe: tempAbout });
    setIsEditingAbout(false);
  };

  const handleSaveMood = () => {
    onUpdate({ mood: tempMood });
    setIsEditingMood(false);
  };

  const handleSaveUsername = () => {
    onUpdate({ username: tempUsername });
    setIsEditingUsername(false);
  };

  const handleSaveInfo = () => {
    onUpdate({ age: parseInt(tempAge) || 18, gender: tempGender });
    setIsEditingInfo(false);
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    
    if (!currentPassword || !newPassword) {
      setPasswordError("Both fields are required.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setIsEditingPassword(false), 1500);
    }
  };

  const handleSubmitRating = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const { error } = await supabase.from('ratings').insert({
      target_id: targetUser.id,
      author_id: authUser.id,
      score: ratingScore,
      comment: ratingComment
    });

    if (!error) {
      setRatingComment("");
      setRatingTab("overview");
      fetchRatings();
    }
  };

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1)
    : "0.0";

  const ratingDistribution = [5, 4, 3, 2, 1].map(score => ({
    score,
    count: ratings.filter(r => r.score === score).length,
    percentage: ratings.length > 0 ? (ratings.filter(r => r.score === score).length / ratings.length) * 100 : 0
  }));

  if (mode === "quick") {
    return (
      <>
        {/* Mobile Backdrop for quick profile */}
        <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:right-72 md:mr-2 md:top-20 z-50 animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-200">
          <div 
            className="w-full md:w-64 bg-[#161226] rounded-t-2xl md:rounded-none shadow-2xl overflow-hidden flex flex-col relative border-t md:border border-purple-900/50"
          >
          {/* Banner */}
          <div className="h-20 w-full relative bg-purple-900/30">
            {targetUser.banner && (
              <img src={targetUser.banner} className="w-full h-full object-cover" alt="Banner" />
            )}
            {/* Avatar */}
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-16 rounded-none border-4 border-[#161226] bg-[#090714] overflow-hidden">
              <img src={targetUser.pfp} className="w-full h-full object-cover" alt={targetUser.username} />
            </div>
          </div>
          
          <div 
            className="pt-6 pb-2 px-4 text-center flex flex-col items-center bg-[#161226]"
          >
            <div className="flex items-center gap-1.5 mb-1 text-purple-300">
              <img src={finalRanksInfo[targetUser.rank]?.icon || finalRanksInfo['VIP'].icon} alt={targetUser.rank} className="h-3.5 object-contain" />
              <span className="text-[10px] font-black uppercase tracking-wider">{finalRanksInfo[targetUser.rank]?.name || targetUser.rank}</span>
            </div>
            <h3 className="text-white font-bold text-lg">
              {targetUser.username}
            </h3>
            {targetUser.mood && (
              <p className="text-purple-400 text-xs italic mt-1 truncate px-2 max-w-full">{targetUser.mood}</p>
            )}
            
            <div className="flex flex-col gap-1 mt-2 w-full overflow-hidden">
              {targetUser.is_banned && (
                <div className="py-1 bg-red-600 border border-red-500 overflow-hidden w-full flex items-center">
                  <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0 px-2">🚨 THIS USER IS BANNED 🚨</span>
                </div>
              )}
              {targetUser.is_muted && (
                <div className="py-1 bg-slate-600 border border-slate-500 overflow-hidden w-full flex items-center">
                  <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0 px-2">🔇 THIS USER IS MUTED 🔇</span>
                </div>
              )}
              {targetUser.is_kicked && (
                <div className="py-1 bg-orange-600 border border-orange-500 overflow-hidden w-full flex items-center">
                  <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0 px-2">⚠️ THIS USER IS KICKED ⚠️</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col border-t border-purple-900/30">
            <button 
              onClick={onView}
              className="w-full text-left px-4 py-3 text-sm text-purple-200 hover:bg-purple-950/50 flex items-center gap-3 transition-colors rounded-none"
            >
              <User className="w-4 h-4 text-purple-400" />
              View profile
            </button>
            
            {isOwnProfile && (
              <button 
                onClick={onEdit}
                className="w-full text-left px-4 py-3 text-sm text-purple-200 hover:bg-purple-950/50 flex items-center gap-3 transition-colors rounded-none"
              >
                <Edit2 className="w-4 h-4 text-purple-400" />
                Edit
              </button>
            )}

            {(!targetUser.profile_locked || isOwnProfile) && !isBotUser && (
              <button 
                onClick={() => { setIsShowingRatings(true); onView(); }}
                className="w-full text-left px-4 py-3 text-sm text-purple-200 hover:bg-purple-950/50 flex items-center gap-3 transition-colors rounded-none"
              >
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                {isOwnProfile ? "My ratings" : "Ratings"}
              </button>
            )}

            {!isBotUser && (
              <button 
                onClick={() => {
                  onMention(targetUser.username);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 text-sm text-purple-200 hover:bg-purple-950/50 flex items-center gap-3 transition-colors rounded-none"
              >
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Mention User
              </button>
            )}

            {(() => {
              const isActorDev = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(currentUser.email || '');
              const actorPriority = finalRanksInfo[currentUser.rank]?.priority ?? 14;
              const targetPriority = finalRanksInfo[targetUser.rank]?.priority ?? 14;
              const canActionTarget = !isBotUser && (isActorDev || (actorPriority <= 5 && actorPriority < targetPriority && !isOwnProfile));

              if (!canActionTarget) return null;

              return (
                <button 
                  onClick={() => {
                    const available = Object.keys(finalRanksInfo).filter((rKey) => {
                      if (isActorDev) return true;
                      const rPriority = finalRanksInfo[rKey as UserRank]?.priority ?? 14;
                      return rPriority > actorPriority;
                    }) as UserRank[];
                    const defaultRank = available.includes(targetUser.rank) ? targetUser.rank : (available[0] || 'VIP');
                    setSelectedRank(defaultRank);
                    setShowActionModal(true);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-950/50 flex items-center gap-3 transition-colors font-black rounded-none border-t border-rose-950/40"
                >
                  <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Action
                </button>
              );
            })()}
          </div>
        </div>
        {/* Backdrop for closing quick view */}
        <div className="fixed inset-0 -z-10" onClick={onClose} />
        
        {/* Action Modal Overlay rendered inside quick view if triggered */}
        {showActionModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-sm bg-[#161226] border border-rose-500/30 rounded-none overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-rose-950/40 flex items-center justify-between bg-rose-950/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest">Admin Actions</h4>
                </div>
                <button onClick={() => setShowActionModal(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[10px] text-purple-400 uppercase font-black tracking-widest block mb-2">Select Action</label>
                  <select 
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="rank">Rank</option>
                    {(() => {
                      const isActorDev = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(currentUser.email || '');
                      const actorPriority = finalRanksInfo[currentUser.rank]?.priority ?? 14;
                      return (
                        <>
                          {(isActorDev || actorPriority <= 5) && <option value="mute">Mute</option>}
                          {(isActorDev || actorPriority <= 5) && <option value="unmute">Unmute</option>}
                          {(isActorDev || actorPriority <= 4) && <option value="kick">Kick</option>}
                          {(isActorDev || actorPriority <= 4) && <option value="unkick">Unkick</option>}
                          {(isActorDev || actorPriority <= 2) && <option value="ban">Ban</option>}
                          {(isActorDev || actorPriority <= 2) && <option value="unban">Unban</option>}
                        </>
                      );
                    })()}
                  </select>
                </div>

                {actionType === "rank" && (
                  <div>
                    <label className="text-[10px] text-purple-400 uppercase font-black tracking-widest block mb-2">Set User Rank</label>
                    <select 
                      value={selectedRank}
                      onChange={(e) => setSelectedRank(e.target.value as UserRank)}
                      className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500"
                    >
                      {Object.keys(finalRanksInfo)
                        .filter((rKey) => {
                          const isActorDev = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(currentUser.email || '');
                          if (isActorDev) return true;
                          const actorPriority = finalRanksInfo[currentUser.rank]?.priority ?? 14;
                          const rPriority = finalRanksInfo[rKey as UserRank]?.priority ?? 14;
                          return rPriority > actorPriority;
                        })
                        .map((rKey) => (
                          <option key={rKey} value={rKey}>
                            {finalRanksInfo[rKey]?.name || rKey}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {["mute", "kick", "ban"].includes(actionType) && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-purple-400 uppercase font-black tracking-widest block mb-2">Reason</label>
                      <input 
                        type="text"
                        value={modReason}
                        onChange={(e) => setModReason(e.target.value)}
                        placeholder="Required"
                        className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    {["mute", "kick"].includes(actionType) && (
                      <div>
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-widest block mb-2">Duration (Minutes)</label>
                        <input 
                          type="number"
                          value={modDuration}
                          onChange={(e) => setModDuration(e.target.value)}
                          min="1"
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2.5 text-xs text-purple-100 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (["mute", "kick", "ban"].includes(actionType) && !modReason.trim()) {
                      alert("A reason is required.");
                      return;
                    }

                    let updates: any = {};
                    if (actionType === "rank") {
                      updates = { rank: selectedRank };
                    } else if (actionType === "ban") {
                      updates = { is_banned: true, ban_reason: modReason };
                    } else if (actionType === "unban") {
                      updates = { is_banned: false, ban_reason: null };
                    } else if (actionType === "kick") {
                      const minutes = parseInt(modDuration) || 60;
                      updates = { is_kicked: true, kick_reason: modReason, kick_expires_at: new Date(Date.now() + minutes * 60000).toISOString() };
                    } else if (actionType === "unkick") {
                      updates = { is_kicked: false, kick_reason: null, kick_expires_at: null };
                    } else if (actionType === "mute") {
                      const minutes = parseInt(modDuration) || 60;
                      updates = { is_muted: true, mute_reason: modReason, mute_expires_at: new Date(Date.now() + minutes * 60000).toISOString() };
                    } else if (actionType === "unmute") {
                      updates = { is_muted: false, mute_reason: null, mute_expires_at: null };
                    }

                    const { error } = await supabase
                      .from('profiles')
                      .update(updates)
                      .eq('id', targetUser.id);

                    if (!error) {
                      let actionText = "";
                      if (actionType === "ban") actionText = "banned";
                      else if (actionType === "unban") actionText = "unbanned";
                      else if (actionType === "kick") actionText = "kicked";
                      else if (actionType === "unkick") actionText = "unkicked";
                      else if (actionType === "mute") actionText = "muted";
                      else if (actionType === "unmute") actionText = "unmuted";
                      
                      if (actionText) {
                         await supabase.from("messages").insert({
                            profile_id: currentUser.id,
                            text: `[SYSTEM] ${targetUser.username} has been ${actionText}! Reason: ${modReason || 'No reason specified.'}`,
                            room: 'main'
                         });
                      }

                      // Optional: Send a system message or notification here
                      if (actionType === "mute") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `You have been muted for ${modDuration} minutes. Reason: ${modReason}`
                        });
                      } else if (actionType === "unmute") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `You have been unmuted.`
                        });
                      } else if (actionType === "kick") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `You have been kicked for ${modDuration} minutes. Reason: ${modReason}`
                        });
                      } else if (actionType === "unkick") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `Your kick has been revoked.`
                        });
                      } else if (actionType === "ban") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `You have been banned. Reason: ${modReason}`
                        });
                      } else if (actionType === "unban") {
                        await supabase.from("notifications").insert({
                          target_id: targetUser.id,
                          sender_id: currentUser.id,
                          sender_username: "System",
                          message: `Your ban has been revoked.`
                        });
                      }
                      
                      window.location.reload();
                    } else {
                      alert("Error executing action: " + error.message);
                    }
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-none uppercase tracking-widest shadow-lg shadow-rose-900/25 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Submit Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
    );
  }

  if (isEditingCustomLayout) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative w-full max-w-lg bg-[#0d0a1c] border border-purple-900/40 rounded-none overflow-hidden flex flex-col h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Custom layout editor */}
          <div className="flex flex-col h-full bg-[#0c091b]">
            {/* Header / Controls */}
            <div className="flex items-center justify-between p-4 border-b border-purple-950/40 bg-[#0f0c23] shrink-0">
              <div>
                <h2 className="text-xs font-black uppercase text-purple-300 tracking-wider">Layout Editor</h2>
                <p className="text-[10px] text-purple-500">Drag items to position, bottom-right handles to resize!</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all element positions?")) {
                      setCustomLayout(DEFAULT_LAYOUT);
                      setSelectedElement(null);
                    }
                  }}
                  className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-900/30 text-[9px] font-bold hover:bg-red-900/30 transition-all cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditingCustomLayout(false);
                    setSelectedElement(null);
                  }}
                  className="px-2 py-1 bg-zinc-950/40 text-zinc-400 border border-zinc-900/30 text-[9px] font-bold hover:bg-zinc-900/30 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={async () => {
                    await supabase.from('profiles').update({
                      profile_layout: customLayout
                    }).eq('id', targetUser.id);
                    onUpdate({ profile_layout: customLayout });
                    setIsEditingCustomLayout(false);
                    setSelectedElement(null);
                    alert("Custom layout saved successfully!");
                  }}
                  className="px-2.5 py-1 bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] text-[9px] font-bold hover:bg-purple-500 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Element Adjustment Toolbar */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#120e29] border-b border-purple-950/30 text-[9px] text-purple-300 shrink-0">
              <span className="font-bold uppercase tracking-wider text-purple-400">Toolbar:</span>
              {selectedElement ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/20 text-purple-200 uppercase font-black font-mono">
                    {selectedElement}
                  </span>
                  {/* Scale controls */}
                  <div className="flex items-center gap-1">
                    <span>Scale:</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const current = customLayout[selectedElement] || DEFAULT_LAYOUT[selectedElement]!;
                        const newScale = Math.max(0.5, Math.min(2.0, (current.scale || 1.0) - 0.1));
                        setCustomLayout(prev => ({
                          ...prev,
                          [selectedElement]: { ...prev[selectedElement]!, scale: Number(newScale.toFixed(1)) }
                        }));
                      }}
                      className="w-4 h-4 bg-purple-950 border border-purple-800/30 rounded flex items-center justify-center hover:bg-purple-900 text-white text-[10px] font-black cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-[9px]">{(customLayout[selectedElement]?.scale || 1.0).toFixed(1)}x</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const current = customLayout[selectedElement] || DEFAULT_LAYOUT[selectedElement]!;
                        const newScale = Math.max(0.5, Math.min(2.0, (current.scale || 1.0) + 0.1));
                        setCustomLayout(prev => ({
                          ...prev,
                          [selectedElement]: { ...prev[selectedElement]!, scale: Number(newScale.toFixed(1)) }
                        }));
                      }}
                      className="w-4 h-4 bg-purple-950 border border-purple-800/30 rounded flex items-center justify-center hover:bg-purple-900 text-white text-[10px] font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Rotation controls */}
                  <div className="flex items-center gap-1">
                    <span>Rotate:</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const current = customLayout[selectedElement] || DEFAULT_LAYOUT[selectedElement]!;
                        let newRot = ((current.rotation || 0) - 15) % 360;
                        if (newRot < 0) newRot += 360;
                        setCustomLayout(prev => ({
                          ...prev,
                          [selectedElement]: { ...prev[selectedElement]!, rotation: newRot }
                        }));
                      }}
                      className="px-1 py-0.5 bg-purple-950 border border-purple-800/30 rounded hover:bg-purple-900 text-white text-[8px] cursor-pointer"
                    >
                      -15°
                    </button>
                    <span className="font-mono text-[9px]">{customLayout[selectedElement]?.rotation || 0}°</span>
                    <button 
                      type="button"
                      onClick={() => {
                        const current = customLayout[selectedElement] || DEFAULT_LAYOUT[selectedElement]!;
                        const newRot = ((current.rotation || 0) + 15) % 360;
                        setCustomLayout(prev => ({
                          ...prev,
                          [selectedElement]: { ...prev[selectedElement]!, rotation: newRot }
                        }));
                      }}
                      className="px-1 py-0.5 bg-purple-950 border border-purple-800/30 rounded hover:bg-purple-900 text-white text-[8px] cursor-pointer"
                    >
                      +15°
                    </button>
                  </div>
                </div>
              ) : (
                <span className="italic text-purple-500">Click any element below to edit</span>
              )}
            </div>

            {/* Main Canvas Area */}
            <div 
              ref={canvasRef}
              className="relative flex-1 w-full bg-[#070510] bg-[linear-gradient(to_right,#13102d_1px,transparent_1px),linear-gradient(to_bottom,#13102d_1px,transparent_1px)] bg-[size:16px_16px] overflow-y-auto overflow-x-hidden p-4 custom-scrollbar select-none"
            >
              <div className="relative w-full h-[650px] bg-[#0d0a1c]/95 rounded-xl border border-purple-950/40 shadow-2xl overflow-hidden">
                {/* Elements inside Editor */}
                {Object.keys(DEFAULT_LAYOUT).map((idStr) => {
                  const id = idStr as keyof ProfileLayout;
                  const itemLayout = customLayout[id] || DEFAULT_LAYOUT[id]!;
                  const isSelected = selectedElement === id;

                  return (
                    <div
                      key={id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(id);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${itemLayout.x}px`,
                        top: `${itemLayout.y}px`,
                        width: itemLayout.width ? `${itemLayout.width}px` : 'auto',
                        height: itemLayout.height ? `${itemLayout.height}px` : 'auto',
                        transform: `rotate(${itemLayout.rotation || 0}deg) scale(${itemLayout.scale || 1})`,
                        transformOrigin: 'top left',
                        zIndex: isSelected ? 100 : (id === 'pfp' ? 10 : (id === 'username' ? 9 : 5)),
                        cursor: 'pointer'
                      }}
                      className={`transition-all ${
                        isSelected 
                          ? "ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] bg-purple-950/10" 
                          : "hover:ring-1 hover:ring-purple-800/50"
                      }`}
                    >
                      {/* Drag Handle */}
                      {isSelected && (
                        <div 
                          onMouseDown={(e) => handleDragStart(id, e)}
                          className="absolute -top-5 left-0 bg-purple-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 z-50 cursor-move shadow-md"
                        >
                          <Move className="w-2.5 h-2.5" />
                          <span>Move</span>
                        </div>
                      )}

                      {/* Content Renderers */}
                      {id === 'banner' && (
                        <div className="w-full h-full relative bg-purple-900/20 overflow-hidden">
                          {targetUser.banner ? (
                            <img src={targetUser.banner} className="w-full h-full object-cover pointer-events-none" alt="Banner" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-[#0d0a1c] flex items-center justify-center text-purple-500 text-[10px] font-black">No Banner</div>
                          )}
                        </div>
                      )}

                      {id === 'pfp' && (
                        <div className="w-full h-full rounded-none border-4 border-[#0d0a1c] bg-[#161226] overflow-hidden shadow-2xl relative">
                          <img src={targetUser.pfp} className="w-full h-full object-cover pointer-events-none" alt={targetUser.username} />
                        </div>
                      )}

                      {id === 'username' && (
                        <div className="p-2 rounded-lg bg-[#16122a]/95 border border-purple-900/20 backdrop-blur-md w-full h-full min-w-[150px]">
                          <div className="flex items-center gap-1 mb-0.5 text-purple-200">
                            <img src={finalRanksInfo[targetUser.rank]?.icon || finalRanksInfo['VIP'].icon} alt={targetUser.rank} className="h-3 object-contain" />
                            <span className="text-[8px] font-black tracking-wider uppercase">
                              {finalRanksInfo[targetUser.rank]?.name || targetUser.rank}
                            </span>
                          </div>
                          <h2 className="text-xs font-black text-white leading-tight">
                            {targetUser.username}
                          </h2>
                          {targetUser.mood && (
                            <p className="text-purple-400 text-[8px] italic font-medium">{targetUser.mood}</p>
                          )}
                        </div>
                      )}

                      {id === 'infoGrid' && (
                        <div className="bg-[#16122a]/95 rounded-none p-3 border border-purple-900/20 w-full h-full overflow-hidden backdrop-blur-md">
                          <h3 className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Info
                          </h3>
                          <div className="grid grid-cols-2 gap-y-1 text-[9px] text-purple-200">
                            <div>Age: {targetUser.age}</div>
                            <div>Gender: {targetUser.gender}</div>
                            <div className="col-span-2">Online: {targetUser.lastOnline || "Just now"}</div>
                          </div>
                        </div>
                      )}

                      {id === 'aboutMe' && (
                        <div className="bg-[#16122a]/95 rounded-none p-3 border border-purple-900/20 w-full h-full overflow-y-auto custom-scrollbar backdrop-blur-md">
                          <h3 className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Bio
                          </h3>
                          {targetUser.aboutMe ? (
                            <p className="text-[9px] text-purple-200 line-clamp-2 leading-normal">{targetUser.aboutMe}</p>
                          ) : (
                            <p className="text-[9px] text-purple-200/40 italic">No Bio Written</p>
                          )}
                        </div>
                      )}

                      {/* Resize Handle */}
                      {isSelected && ['banner', 'pfp', 'username', 'infoGrid', 'aboutMe'].includes(id) && (
                        <div 
                          onMouseDown={(e) => handleResizeStart(id, e)}
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-purple-600 rounded-full border border-white flex items-center justify-center cursor-se-resize z-50 shadow-md"
                          title="Resize"
                        >
                          <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 0L0 4H4V0Z" fill="white"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get custom border styles
  const currentBorderId = targetUser.border || "none";
  const currentBorderThickness = targetUser.borderThickness || "2px";
  const currentBorderStyle = targetUser.borderStyle || "solid";
  const borderStyles = currentBorderId !== "none" ? getProfileBorderStyle(currentBorderId, currentBorderThickness) : {};
  if (currentBorderId !== "none" && currentBorderStyle !== "solid") {
    borderStyles.borderStyle = currentBorderStyle;
  }
  
  const outerBorderClass = `relative w-full max-w-lg bg-[#0d0a1c] rounded-none overflow-hidden flex flex-col max-h-[90vh] ${
    currentBorderId !== "none" ? `profile-border-${currentBorderId}` : 'border border-purple-900/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]'
  } ${targetUser.profile_effect === 'sepia' ? 'profile-effect-sepia' : ''} ${targetUser.email === 'dev@gmail.com' && mode === 'view' ? 'animate-gentle-shake' : ''}`;
  
  const currentEffectClass = targetUser.profile_effect && targetUser.profile_effect !== 'none' 
    ? (targetUser.profile_effect === 'sepia' ? '' : `profile-effect-${targetUser.profile_effect}`) 
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={outerBorderClass}
        style={currentBorderId !== "none" ? borderStyles : {}}
      >
        
        {/* About Me Editor Modal */}
        {isEditingAbout && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-[85vh] bg-[#110e21] border border-purple-500/30 rounded-none overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col animate-in scale-in duration-200">
              
              {/* Header */}
              <div className="p-4 bg-[#16122a] border-b border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                    <Edit3 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Advanced Custom Bio Studio</h4>
                    <p className="text-[10px] text-purple-300/80">Highlight words, choose style on left, and click to apply!</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Background Music Player inside the Editor Preview */}
                  <BackgroundMusicPlayer bioText={tempAbout} />
                  
                  <button 
                    onClick={() => setIsEditingAbout(false)} 
                    className="p-1.5 rounded-lg bg-[#090714] border border-purple-900/40 text-purple-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* 3-Column Content Body */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#090714]/40">
                
                {/* Column 1: Left Customizer Menu (lg:col-span-3) */}
                <div className="lg:col-span-3 border-r border-purple-900/30 flex flex-col overflow-hidden bg-[#16122a]/40">
                  <div className="flex border-b border-purple-900/30 bg-[#16122a]/80 shrink-0">
                    {(["effects", "fonts", "colors", "media"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setEditorTab(tab)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
                          editorTab === tab
                            ? "border-purple-500 text-purple-400 bg-purple-950/20"
                            : "border-transparent text-purple-300/60 hover:text-purple-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-4">
                    {/* Effects Tab */}
                    {editorTab === "effects" && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Search 50+ effects..."
                          value={effectFilter}
                          onChange={(e) => setEffectFilter(e.target.value)}
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 placeholder-purple-300/30 focus:outline-none focus:border-purple-500"
                        />
                        <div className="grid grid-cols-1 gap-1.5">
                          {EFFECTS_LIST.filter(eff => eff.label.toLowerCase().includes(effectFilter.toLowerCase())).map((eff) => (
                            <button
                              key={eff.id}
                              onClick={() => applyStyleTag(`[effect=${eff.id}]`, `[/effect]`)}
                              className="w-full text-left p-2 rounded-lg bg-[#16122a] border border-purple-900/10 hover:border-purple-500/40 text-[11px] text-purple-200 transition-all flex items-center justify-between group"
                            >
                              <span>{eff.label}</span>
                              <span className="text-[9px] text-purple-500/60 group-hover:text-purple-400 font-bold uppercase tracking-wider">Apply</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fonts Tab */}
                    {editorTab === "fonts" && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Search 50+ fonts..."
                          value={fontFilter}
                          onChange={(e) => setFontFilter(e.target.value)}
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-lg px-2.5 py-1.5 text-xs text-purple-100 placeholder-purple-300/30 focus:outline-none focus:border-purple-500"
                        />
                        <div className="grid grid-cols-1 gap-1.5">
                          {FONTS_LIST.filter(font => font.toLowerCase().includes(fontFilter.toLowerCase())).map((font) => (
                            <button
                              key={font}
                              onClick={() => applyStyleTag(`[font=${font}]`, `[/font]`)}
                              className="w-full text-left p-2 rounded-lg bg-[#16122a] border border-purple-900/10 hover:border-purple-500/40 text-xs transition-all flex items-center justify-between group"
                              style={{ fontFamily: font }}
                            >
                              <span className="text-purple-200 truncate max-w-[140px]">{font}</span>
                              <span className="text-[9px] font-sans text-purple-500/60 group-hover:text-purple-400 font-bold uppercase tracking-wider">Apply</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Colors Tab */}
                    {editorTab === "colors" && (
                      <div className="space-y-4">
                        {/* Custom Color Selector & Picker */}
                        <div className="p-2.5 rounded-lg bg-[#090714] border border-purple-900/20 space-y-2">
                          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Color Wheel / Picker</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
                            />
                            <button
                              onClick={() => applyStyleTag(`[color=${customColor}]`, `[/color]`)}
                              className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black rounded transition-colors uppercase tracking-wider"
                            >
                              Apply Picker ({customColor})
                            </button>
                          </div>
                        </div>

                        {/* Custom Glow Selector & Picker */}
                        <div className="p-2.5 rounded-lg bg-[#090714] border border-purple-900/20 space-y-2">
                          <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Neon Glow Picker</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customGlow}
                              onChange={(e) => setCustomGlow(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
                            />
                            <button
                              onClick={() => applyStyleTag(`[glow=${customGlow}]`, `[/glow]`)}
                              className="flex-1 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black rounded transition-colors uppercase tracking-wider"
                            >
                              Apply Glow ({customGlow})
                            </button>
                          </div>
                        </div>

                        {/* 100+ Preset Colors organized in lists */}
                        {COLOR_CATEGORIES.map((category) => (
                          <div key={category.name} className="space-y-1.5">
                            <h5 className="text-[9px] font-black uppercase text-purple-400/60 tracking-wider px-1">{category.name}</h5>
                            <div className="grid grid-cols-6 gap-1 p-1 bg-[#16122a]/50 border border-purple-900/10 rounded-lg">
                              {category.colors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => applyStyleTag(`[color=${color}]`, `[/color]`)}
                                  className="aspect-square rounded border border-black/30 hover:scale-110 active:scale-95 transition-transform relative group"
                                  style={{ backgroundColor: color }}
                                  title={color}
                                >
                                  <span className="absolute inset-0 rounded scale-0 group-hover:scale-100 bg-white/20 transition-transform pointer-events-none" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Media & Helpers Tab */}
                    {editorTab === "media" && (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg bg-[#090714] border border-purple-900/20 space-y-2">
                          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Classic Typography</label>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => applyStyleTag("[b]", "[/b]")}
                              className="py-1 bg-[#16122a] border border-purple-900/30 hover:border-purple-500/40 text-xs font-black text-white rounded transition-colors"
                            >
                              B
                            </button>
                            <button
                              onClick={() => applyStyleTag("[i]", "[/i]")}
                              className="py-1 bg-[#16122a] border border-purple-900/30 hover:border-purple-500/40 text-xs italic text-purple-200 rounded transition-colors"
                            >
                              I
                            </button>
                            <button
                              onClick={() => applyStyleTag("[u]", "[/u]")}
                              className="py-1 bg-[#16122a] border border-purple-900/30 hover:border-purple-500/40 text-xs underline text-purple-200 rounded transition-colors"
                            >
                              U
                            </button>
                          </div>
                        </div>

                        {/* Background music section */}
                        <div className="p-2.5 rounded-lg bg-[#090714] border border-purple-900/20 space-y-2">
                          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Background Music (BG:)</label>
                          <p className="text-[9px] text-purple-300/60 leading-relaxed">Add a background sound URL (Youtube, MP3, MP4) that hides itself and plays when your bio is viewed.</p>
                          <button
                            onClick={() => {
                              const url = prompt("Enter a background music URL (Youtube, MP3, MP4, etc.):");
                              if (url) {
                                setTempAbout(prev => {
                                  const lines = prev.split('\n');
                                  const filtered = lines.filter(line => !line.trim().startsWith('BG:'));
                                  filtered.push(`BG:${url.trim()}`);
                                  return filtered.join('\n');
                                });
                              }
                            }}
                            className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[10px] font-black rounded uppercase tracking-wider transition-colors"
                          >
                            Set BG Music Song
                          </button>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#090714] border border-purple-900/20 space-y-2">
                          <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block">Media Embed Codes</label>
                          <p className="text-[9px] text-purple-300/60 leading-relaxed">Directly paste Youtube videos or Spotify links anywhere in your text. They will render beautifully as playable frames!</p>
                          <div className="space-y-1.5">
                            <button
                              onClick={() => {
                                const url = prompt("Enter YouTube video link (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ):");
                                if (url) {
                                  setTempAbout(prev => prev + (prev.endsWith('\n') || prev === "" ? "" : "\n") + url.trim());
                                }
                              }}
                              className="w-full py-1 bg-red-950/40 border border-red-900/40 hover:border-red-500/50 text-red-300 text-[10px] font-bold rounded transition-colors text-left px-2"
                            >
                              📹 Insert YouTube Video Link
                            </button>
                            <button
                              onClick={() => {
                                const url = prompt("Enter Spotify playlist or song link:");
                                if (url) {
                                  setTempAbout(prev => prev + (prev.endsWith('\n') || prev === "" ? "" : "\n") + url.trim());
                                }
                              }}
                              className="w-full py-1 bg-green-950/40 border border-green-900/40 hover:border-green-500/50 text-green-300 text-[10px] font-bold rounded transition-colors text-left px-2"
                            >
                              🎵 Insert Spotify Link
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Column 2: Middle Text Editor (lg:col-span-5) */}
                <div className="lg:col-span-5 border-r border-purple-900/30 flex flex-col overflow-hidden bg-[#0d0a1c]">
                  <div className="p-2 bg-[#16122a]/50 border-b border-purple-900/20 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Bio Composer Editor</span>
                    <span className="text-[9px] text-purple-400/60 font-mono">{tempAbout.length} characters</span>
                  </div>
                  
                  <textarea
                    ref={textareaRef}
                    value={tempAbout}
                    onChange={(e) => setTempAbout(e.target.value)}
                    className="flex-1 w-full p-4 bg-transparent text-purple-100 text-sm focus:outline-none custom-scrollbar resize-none font-mono"
                    placeholder="Type or paste your bio here. Highlight text to apply left-side styles!"
                  />
                  
                  <div className="p-3 bg-[#16122a]/40 border-t border-purple-900/30 flex items-center justify-between gap-3 shrink-0">
                    <p className="text-[9px] text-purple-400/50 leading-relaxed max-w-xs">
                      ⚡ *Pro tip*: Highlight text in the composer, then select any effect, font, or color on the left to format it.
                    </p>
                    <button
                      onClick={handleSaveAbout}
                      className="px-6 py-2 bg-gradient-to-r from-[#009bf3] to-[#0070b0] hover:from-[#00a6ff] hover:to-[#0081cc] text-white text-xs font-black rounded-lg transition-all shadow-lg uppercase tracking-widest shrink-0"
                    >
                      Save Bio
                    </button>
                  </div>
                </div>
                
                {/* Column 3: Right Live Preview (lg:col-span-4) */}
                <div className="lg:col-span-4 flex flex-col overflow-hidden bg-[#16122a]/30">
                  <div className="p-2 bg-[#16122a]/50 border-b border-purple-900/20 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Live Aesthetic Preview</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  </div>
                  
                  <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-[#090714]/60 space-y-4">
                    {/* Rendered Live Bio Text */}
                    <div className="min-h-[120px] p-4 rounded-xl bg-[#16122a]/40 border border-purple-500/10 shadow-inner">
                      {tempAbout.trim() ? (
                        <BioContentRenderer text={tempAbout} />
                      ) : (
                        <span className="text-xs italic text-purple-300/40">Nothing composed yet... Start writing in the middle!</span>
                      )}
                    </div>
                    
                    {/* Rendered Media Embed Players (Spotify, YouTube) */}
                    <BioMediaRenderer text={tempAbout} />
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}

        {/* Mood Editor Modal */}
        {isEditingMood && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#161226] border border-purple-900/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Mood</h4>
                <button onClick={() => setIsEditingMood(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <input 
                  type="text"
                  value={tempMood}
                  onChange={(e) => setTempMood(e.target.value)}
                  className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  placeholder="How are you feeling?"
                />
                <button 
                  onClick={handleSaveMood}
                  className="mt-4 w-24 py-2 bg-[#009bf3] hover:bg-[#0086d1] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Username Editor Modal */}
        {isEditingUsername && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#161226] border border-purple-900/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Username</h4>
                <button onClick={() => setIsEditingUsername(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <input 
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  placeholder="New username"
                />
                <button 
                  onClick={handleSaveUsername}
                  className="mt-4 w-24 py-2 bg-[#009bf3] hover:bg-[#0086d1] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info (Age/Gender) Editor Modal */}
        {isEditingInfo && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#161226] border border-purple-900/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Edit Info</h4>
                <button onClick={() => setIsEditingInfo(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[10px] text-purple-500 uppercase font-bold tracking-widest block mb-1">Age</label>
                  <input 
                    type="number"
                    value={tempAge}
                    onChange={(e) => setTempAge(e.target.value)}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-purple-500 uppercase font-bold tracking-widest block mb-1">Gender</label>
                  <select 
                    value={tempGender}
                    onChange={(e) => setTempGender(e.target.value)}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <button 
                  onClick={handleSaveInfo}
                  className="w-24 py-2 bg-[#009bf3] hover:bg-[#0086d1] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Editor Modal */}
        {isEditingPassword && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#161226] border border-purple-900/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-purple-900/30 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Change Password</h4>
                <button onClick={() => setIsEditingPassword(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                {passwordError && <p className="text-rose-500 text-xs">{passwordError}</p>}
                {passwordSuccess && <p className="text-emerald-500 text-xs">{passwordSuccess}</p>}
                <div>
                  <label className="text-[10px] text-purple-500 uppercase font-bold tracking-widest block mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-purple-500 uppercase font-bold tracking-widest block mb-1">New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-lg p-3 text-sm text-purple-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button 
                  onClick={handleSavePassword}
                  className="w-24 py-2 bg-[#009bf3] hover:bg-[#0086d1] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ratings Modal */}
        
      {isShowingGallery && (
        <GalleryViewModal
          user={targetUser}
          onClose={() => setIsShowingGallery(false)}
        />
      )}

      {isShowingRatings && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-lg bg-[#0d0d14] border border-purple-900/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              <div className="p-5 flex items-center justify-between border-b border-purple-900/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                    <Star className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Profile ratings</h3>
                    <p className="text-[11px] text-purple-400">Leave a clean 1 to 5 star rating</p>
                  </div>
                </div>
                <button onClick={() => setIsShowingRatings(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-purple-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Header in Ratings */}
              <div className="px-5 py-4 bg-gradient-to-r from-purple-900/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-500/20">
                    <img src={targetUser.pfp} className="w-full h-full object-cover" alt="pfp" />
                  </div>
                  <div>
                    <h4 className="text-purple-400 font-bold text-lg">{targetUser.username}</h4>
                    <div className="flex gap-2 mt-1">
                      <div className="px-2 py-0.5 bg-white/5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-white fill-current" />
                        <span className="text-[10px] text-white font-bold">{averageRating}/5</span>
                      </div>
                      <div className="px-2 py-0.5 bg-white/5 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-white" />
                        <span className="text-[10px] text-white font-bold">{ratings.length} ratings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-5 flex gap-4 border-b border-purple-900/10">
                <button 
                  onClick={() => setRatingTab("overview")}
                  className={`py-3 text-xs font-bold transition-all border-b-2 ${ratingTab === "overview" ? "text-white border-blue-500" : "text-purple-500 border-transparent"}`}
                >
                  Overview
                </button>
                {!isOwnProfile && !isBotUser && (
                  <button 
                    onClick={() => setRatingTab("rate")}
                    className={`py-3 text-xs font-bold transition-all border-b-2 ${ratingTab === "rate" ? "text-white border-blue-500" : "text-purple-500 border-transparent"}`}
                  >
                    Rate
                  </button>
                )}
              </div>

              {/* Content Area */}
              <div className="p-5 max-h-[50vh] overflow-y-auto custom-scrollbar bg-[#09090f]">
                {ratingTab === "overview" ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest mb-1">Average score</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">{averageRating}/5</span>
                        </div>
                        <p className="text-[10px] text-purple-500 mt-1">Live profile score</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest mb-1">Ratings</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">{ratings.length}</span>
                        </div>
                        <p className="text-[10px] text-purple-500 mt-1">Recent ratings</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-[11px] text-white font-bold">Distribution</h5>
                      {ratingDistribution.map((d) => (
                        <div key={d.score} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-8">
                            <span className="text-[10px] text-white font-bold">{d.score}</span>
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="text-[10px] text-white font-bold w-4 text-right">{d.count}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[11px] text-white font-bold">Recent ratings</h5>
                      {isRatingLoading ? (
                        <p className="text-xs text-purple-500 italic text-center py-4">Loading ratings...</p>
                      ) : ratings.length === 0 ? (
                        <p className="text-xs text-purple-500 italic text-center py-4">No ratings yet.</p>
                      ) : (
                        ratings.map((r) => (
                          <div key={r.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-purple-500/10">
                              <img src={r.author_pfp} className="w-full h-full object-cover" alt="author" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-purple-400">{r.author_username}</span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3 h-3 ${s <= r.score ? "text-white fill-current" : "text-white/10"}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-purple-500 mb-2">{new Date(r.created_at).toLocaleDateString()}</p>
                              <p className="text-xs text-white leading-relaxed">{r.comment || "No comment left."}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                      <h5 className="text-lg font-bold text-white mb-2">Your rating</h5>
                      <p className="text-[11px] text-purple-400 leading-relaxed mb-4">
                        Comments are filtered to simple plain text and existing mute/flood rules are applied.
                      </p>
                      <div className="flex gap-2 mb-8">
                        <div className="px-3 py-1.5 bg-white/5 rounded-full flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[10px] text-white font-bold">Free rating</span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/5 rounded-full flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-[10px] text-white font-bold">plain text only</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-4 mb-8">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                            key={s} 
                            onClick={() => setRatingScore(s)}
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${ratingScore >= s ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "bg-white/5 text-purple-400"}`}
                          >
                            <Star className={`w-7 h-7 ${ratingScore >= s ? "fill-current" : ""}`} />
                          </button>
                        ))}
                      </div>

                      <textarea 
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Plain text only. No links, symbols, emojis, or styled fonts."
                        className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white placeholder:text-purple-600 focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                      />
                      <div className="flex justify-between items-center mt-2 px-1">
                        <span className="text-[10px] font-bold text-purple-500">{ratingComment.length}/50</span>
                        <button 
                          onClick={handleSubmitRating}
                          className="px-6 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center gap-2"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Submit rating
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Controls Left */}
        {mode === "view" && (
          <div className="absolute top-4 left-4 z-10 flex gap-2 items-center flex-wrap max-w-[60vw]">
            <button 
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-lg transition-all ${
                isOwnProfile
                  ? "bg-purple-950/40 text-purple-500 cursor-not-allowed"
                  : hasLiked 
                    ? "bg-rose-500 text-white" 
                    : "bg-black/40 text-white hover:bg-black/60 backdrop-blur-md"
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
              {likes}
            </button>
            <button 
              onClick={() => setShowLevelStats(true)}
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-black shadow-lg bg-amber-500 text-black hover:bg-amber-400 hover:scale-105 transition-all cursor-pointer"
              title="Click to view level statistics"
            >
              <Star className="w-3.5 h-3.5 fill-black text-black" />
              <span>Level {targetUser.email === 'dev@gmail.com' ? 1000 : getLevelFromXp(targetUser.total_xp || 0).level}</span>
            </button>
            
            {targetUser.is_banned && (
              <div className="px-3 py-1.5 rounded-full bg-red-600 shadow-lg border border-red-500 overflow-hidden max-w-[150px] flex items-center">
                <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0">🚨 THIS USER IS BANNED 🚨</span>
              </div>
            )}
            {targetUser.is_muted && (
              <div className="px-3 py-1.5 rounded-full bg-slate-600 shadow-lg border border-slate-500 overflow-hidden max-w-[150px] flex items-center">
                <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0">🔇 THIS USER IS MUTED 🔇</span>
              </div>
            )}
            {targetUser.is_kicked && (
              <div className="px-3 py-1.5 rounded-full bg-orange-600 shadow-lg border border-orange-500 overflow-hidden max-w-[150px] flex items-center">
                <span className="text-[10px] font-black uppercase text-white animate-marquee shrink-0">⚠️ THIS USER IS KICKED ⚠️</span>
              </div>
            )}
          </div>
        )}

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {mode === "view" && isOwnProfile && (
            <button 
              onClick={onEdit}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
          {mode === "edit" && (
            <>
              <button 
                onClick={() => bannerInputRef.current?.click()}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                title="Change Banner"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                onClick={resetBanner}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                title="Delete Banner"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={onView}
                className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                title="View Profile"
              >
                <Eye className="w-5 h-5" />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="h-48 w-full relative bg-purple-900/20 shrink-0">
          {targetUser.banner && (
            <img src={targetUser.banner} className="w-full h-full object-cover" alt="Banner" />
          )}
          {isUploadingBanner && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 z-10">
              <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
              <span className="text-xs font-black uppercase text-purple-200 tracking-wider">Uploading Banner...</span>
            </div>
          )}
          
          {/* Avatar Area */}
          <div className="absolute bottom-[-40px] left-8 flex items-end gap-5">
            <div className="relative group">
              <div className="w-32 h-32 rounded-none border-4 border-[#0d0a1c] bg-[#161226] overflow-hidden shadow-2xl relative">
                <img src={targetUser.pfp} className="w-full h-full object-cover" alt={targetUser.username} />
                {isUploadingPfp && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 z-10">
                    <span className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                    <span className="text-[10px] font-black uppercase text-purple-200">Uploading</span>
                  </div>
                )}
              </div>
              
              {mode === "edit" && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-none">
                  <button 
                    onClick={resetPfp}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
                    title="Reset PFP"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40"
                    title="Change PFP"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-1.5 text-purple-200">
                <img src={finalRanksInfo[targetUser.rank]?.icon || finalRanksInfo['VIP'].icon} alt={targetUser.rank} className="h-4 object-contain" />
                <span className="text-xs font-black tracking-wider uppercase">
                  {finalRanksInfo[targetUser.rank]?.name || targetUser.rank}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {targetUser.username}
              </h2>
              {targetUser.profile_locked ? (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.15)] animate-pulse">
                  <Lock className="w-3 h-3" />
                  Locked
                </div>
              ) : (
                <>
                  {targetUser.mood && (
                    <p className="text-purple-400 text-xs italic font-medium mt-0.5">{targetUser.mood}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div 
          className={`pt-14 p-8 overflow-y-auto custom-scrollbar flex-1 ${targetUser.email === 'dev@gmail.com' && mode === 'view' && (!targetUser.profile_effect || targetUser.profile_effect === 'none') ? 'bg-blueprint-pattern' : currentEffectClass}`}
        >

          <div className="mb-6">
            <button
               onClick={() => setIsShowingGallery(true)}
               className="w-full py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 font-bold flex items-center justify-center gap-2 hover:bg-blue-500/20 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.15)]"
            >
              <ImageIcon className="w-5 h-5" /> View Gallery ({targetUser.gallery?.length || 0} Photos)
            </button>
          </div>
          {mode === "view" ? (
            targetUser.profile_locked && !isOwnProfile ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in duration-300">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <Lock className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Profile Locked</h3>
                <p className="text-xs text-purple-300 max-w-xs leading-relaxed">
                  This user has locked their profile. All sections, including information, mood, age, gender, and about me details are hidden.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Info Grid */}
                <div className="bg-[#16122a]/50 rounded-none p-6 border border-purple-900/20">
                  <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    User Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Age</p>
                      <p className="text-sm text-purple-100 font-medium">{targetUser.age}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Gender</p>
                      <p className="text-sm text-purple-100 font-medium">{targetUser.gender}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Last Online</p>
                      <div className="flex items-center gap-1.5 text-sm text-purple-100 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{targetUser.lastOnline || "Just now"}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Created</p>
                      <div className="flex items-center gap-1.5 text-sm text-purple-100 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                        <span>{targetUser.createdDate || "Today"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Me */}
                <div className="bg-[#16122a]/50 rounded-none p-6 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                      <User className="w-4 h-4" />
                      About me
                    </h3>
                    {/* Background Music player */}
                    {targetUser.aboutMe && (
                      <BackgroundMusicPlayer bioText={targetUser.aboutMe} />
                    )}
                  </div>
                  
                  {targetUser.aboutMe ? (
                    <div className="space-y-4">
                      <BioContentRenderer text={targetUser.aboutMe} />
                      <BioMediaRenderer text={targetUser.aboutMe} />
                    </div>
                  ) : (
                    <p className="text-sm text-purple-200/40 italic font-medium">
                      This user hasn't written anything yet.
                    </p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div>
              {/* Tab Switcher */}
              <div className="flex border-b border-purple-950/40 mb-4 shrink-0">
                <button 
                  type="button"
                  onClick={() => setEditTab("account")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                    editTab === "account" ? "text-purple-400 border-purple-500" : "text-purple-600 border-transparent hover:text-purple-500"
                  }`}
                >
                  Account
                </button>
                <button 
                  type="button"
                  onClick={() => setEditTab("more")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                    editTab === "more" ? "text-purple-400 border-purple-500" : "text-purple-600 border-transparent hover:text-purple-500"
                  }`}
                >
                  More
                </button>
              </div>

              {editTab === "account" ? (
                <div className="flex flex-col border-t border-b border-white/[0.05] divide-y divide-white/[0.05]">
                  <button 
                    onClick={() => {
                      setTempAge(targetUser.age.toString());
                      setTempGender(targetUser.gender);
                      setIsEditingInfo(true);
                    }}
                    className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-white/[0.02] transition-all rounded-none"
                  >
                    <Info className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="text-sm font-bold text-white">Edit info</span>
                  </button>

                  <button 
                    onClick={() => {
                      setTempAbout(targetUser.aboutMe || "");
                      setIsEditingAbout(true);
                    }}
                    className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-white/[0.02] transition-all rounded-none"
                  >
                    <User className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-white">Edit about me</span>
                  </button>

                  <button 
                    onClick={() => {
                      setTempUsername(targetUser.username);
                      setIsEditingUsername(true);
                    }}
                    className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-white/[0.02] transition-all rounded-none"
                  >
                    <Edit3 className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white">Edit username</span>
                  </button>

                  <button 
                    onClick={() => {
                      setTempMood(targetUser.mood || "");
                      setIsEditingMood(true);
                    }}
                    className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-white/[0.02] transition-all rounded-none"
                  >
                    <TrendingUp className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-sm font-bold text-white">Edit mood</span>
                  </button>

                  <button 
                    onClick={() => setIsEditingPassword(true)}
                    className="w-full text-left py-4 px-2 flex items-center gap-4 hover:bg-white/[0.02] transition-all rounded-none"
                  >
                    <Lock className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="text-sm font-bold text-white">Security</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col border-t border-b border-white/[0.05] divide-y divide-white/[0.05]">
                  <div className="p-4 bg-purple-950/20 border border-purple-500/10 rounded-xl my-2">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-5 h-5 text-red-400 shrink-0" />
                      <span className="text-sm font-black text-white uppercase tracking-wider">Profile Lock</span>
                    </div>
                    <p className="text-xs text-purple-300 leading-relaxed mb-4">
                      Lock your profile so that others can only see your profile picture, username, and rank. Your age, gender, mood, and about me section will be completely hidden from everyone else, displaying a <strong>LOCKED</strong> badge.
                    </p>

                    {targetUser.profile_locked ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-950/20 border border-red-500/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Profile is LOCKED</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to unlock your profile? Unlocking is free, but locking it again later will cost 1,500 Coins.")) {
                                const updated = {
                                  profile_locked: false,
                                  // Increase lock count so next lock costs 1500
                                  profile_lock_count: (targetUser.profile_lock_count || 0) + 1
                                };
                                await supabase.from('profiles').update(updated).eq('id', currentUser.id);
                                onUpdate(updated);
                              }
                            }}
                            className="px-3 py-1 rounded bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-black uppercase transition-all cursor-pointer"
                          >
                            Unlock Profile (Free)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="text-[10px] text-purple-400 font-bold">
                          Current Balance: <span className="text-amber-400 font-mono">{(currentUser.coins || 0).toLocaleString()} Coins</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-xs text-purple-300">
                            Cost to Lock: <span className="text-amber-400 font-bold font-mono">{(targetUser.profile_lock_count && targetUser.profile_lock_count > 0) ? "1,500" : "1,000"} Coins</span>
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              const isReLock = (targetUser.profile_lock_count && targetUser.profile_lock_count > 0);
                              const cost = isReLock ? 1500 : 1000;
                              const currentCoins = currentUser.coins || 0;
                              if (currentCoins < cost) {
                                alert(`Insufficient Coins! You need ${cost.toLocaleString()} Coins to lock your profile, but you only have ${currentCoins.toLocaleString()}. Chat more to earn coins!`);
                                return;
                              }
                              if (window.confirm(`Lock your profile for ${cost.toLocaleString()} Coins?`)) {
                                const newCoins = currentCoins - cost;
                                const updated = {
                                  profile_locked: true,
                                  coins: newCoins
                                };
                                await supabase.from('profiles').update(updated).eq('id', currentUser.id);
                                onUpdate(updated);
                                alert("Your profile has been locked successfully!");
                              }
                            }}
                            className="px-3 py-1.5 rounded bg-amber-500 text-black text-xs font-black uppercase hover:bg-amber-400 transition-all cursor-pointer shadow-lg"
                          >
                            {(targetUser.profile_lock_count && targetUser.profile_lock_count > 0) ? "1,500 Coins" : "1,000 Coins"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handlePfpUpload}
        />
        <input 
          type="file" 
          ref={bannerInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleBannerUpload}
        />

        {/* Profile Borders Editor Modal */}
        {isEditingBorder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-sm bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in scale-in duration-200">
              {/* Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-[15px] font-black text-white tracking-wide">Profile Borders</h4>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-[#1f1a0e] border border-yellow-500/30 px-3 py-1 rounded-full shadow-inner">
                    <span className="text-xs font-bold text-yellow-500 tracking-widest uppercase">FREE</span>
                  </div>
                  <button 
                    onClick={() => setIsEditingBorder(false)} 
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar flex flex-col">
                
                {profileBorderViewMode === "preview" ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="text-center mb-1">
                      <span className="text-[10px] font-bold text-white tracking-[0.2em] opacity-40 uppercase">STYLE {BORDERS_LIST.findIndex(b => b.id === tempBorder)}</span>
                    </div>

                    {/* Visual Live Preview of User Card */}
                    <div className="w-full mx-auto">
                      <div 
                        className={`relative w-full rounded-2xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)] ${
                          tempBorder !== "none" ? `profile-border-${tempBorder}` : "border border-red-500"
                        }`}
                        style={{
                          ...getProfileBorderStyle(tempBorder, tempBorderThickness),
                          backgroundColor: "#0d0a1c",
                          minHeight: "340px"
                        }}
                      >
                        {/* Banner */}
                        <div className="h-40 w-full relative bg-purple-900/20 shrink-0">
                          {targetUser.banner && (
                            <img src={targetUser.banner} className="w-full h-full object-cover relative z-10" alt="Banner" />
                          )}
                          
                          {/* Avatar Area inside banner overlaying slightly bottom */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-3 z-20">
                            <div className="w-24 h-24 rounded-2xl border border-white/20 overflow-hidden shadow-lg bg-black">
                              <img src={targetUser.pfp} className="w-full h-full object-cover" alt="Avatar" />
                            </div>
                            <div className="mt-8 text-left drop-shadow-md">
                              <div className="flex items-center gap-1 text-[10px] text-purple-200">
                                <img src={finalRanksInfo[targetUser.rank]?.icon || finalRanksInfo['VIP'].icon} alt={targetUser.rank} className="h-3 object-contain" />
                                <span className="font-black tracking-wider text-cyan-400">
                                  {finalRanksInfo[targetUser.rank]?.name || targetUser.rank}
                                </span>
                              </div>
                              <h3 className="text-xl font-black text-red-500 drop-shadow-md tracking-wide mt-0.5 leading-tight">
                                {targetUser.username}
                              </h3>
                              <p className="text-xs font-black text-red-500 drop-shadow-md">Preview Mode</p>
                            </div>
                          </div>
                        </div>

                        {/* Card Background image area */}
                        <div 
                          className="flex-1 p-4 bg-cover bg-center bg-no-repeat bg-[#1a1a1a]"
                          style={tempCardBg ? { backgroundImage: `url(${tempCardBg})` } : undefined}
                        >
                          <div className="flex gap-4 justify-center border-b border-white/5 pb-3">
                            <span className="text-[11px] font-black text-red-500 bg-white/5 px-3 py-1 rounded">Info</span>
                            <span className="text-[11px] font-bold text-red-500 opacity-60">About</span>
                            <span className="text-[11px] font-bold text-red-500 opacity-60">Friends</span>
                          </div>

                          <div className="mt-4 space-y-4">
                            <div className="flex justify-between items-center px-4 border-b border-white/5 pb-3">
                              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 opacity-70">
                                <Globe className="w-3 h-3" /> Country
                              </span>
                              <span className="text-xs font-bold text-red-500">United Kingdom</span>
                            </div>
                            <div className="flex justify-between items-center px-4 border-b border-white/5 pb-3">
                              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 opacity-70">
                                <User className="w-3 h-3" /> Gender
                              </span>
                              <span className="text-xs font-bold text-red-500">Male</span>
                            </div>
                            <div className="flex justify-between items-center px-4">
                              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 opacity-70">
                                <MessageSquare className="w-3 h-3" /> Language
                              </span>
                              <span className="text-xs font-bold text-red-500">English</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between gap-3 mt-6">
                      <button 
                        className="w-12 h-11 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-colors"
                        onClick={() => {
                          const fullIndex = BORDERS_LIST.findIndex(b => b.id === tempBorder);
                          const nextIndex = (fullIndex - 1 + BORDERS_LIST.length) % BORDERS_LIST.length;
                          setTempBorder(BORDERS_LIST[nextIndex].id);
                        }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button 
                        onClick={() => setProfileBorderViewMode("grid")}
                        className="flex-1 h-11 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-white text-[11px] font-black tracking-widest transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4" /> VIEW GRID
                      </button>

                      <button 
                        className="w-12 h-11 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white transition-colors"
                        onClick={() => {
                          const fullIndex = BORDERS_LIST.findIndex(b => b.id === tempBorder);
                          const nextIndex = (fullIndex + 1) % BORDERS_LIST.length;
                          setTempBorder(BORDERS_LIST[nextIndex].id);
                        }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <button
                      onClick={() => setProfileBorderViewMode("preview")}
                      className="w-full py-3.5 bg-[#1a1a1a] border border-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Preview
                    </button>
                    
                    <div className="grid grid-cols-5 gap-3 max-h-[420px] overflow-y-auto custom-scrollbar p-1">
                      {BORDERS_LIST.map((b, i) => {
                        const isSelected = tempBorder === b.id;
                        // Build preview styles for the grid cell
                        const isGlitch = b.id === "glitch";
                        const previewStyle = getProfileBorderStyle(b.id, tempBorderThickness);
                        
                        return (
                          <button
                            key={b.id}
                            onClick={() => setTempBorder(b.id)}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center relative transition-transform hover:scale-105 ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]" : ""} ${b.id !== "none" ? `profile-border-${b.id}` : ""}`}
                            style={b.id === "none" ? {
                              border: "1px solid rgba(255,255,255,0.1)"
                            } : previewStyle}
                          >
                             {b.id === "none" ? (
                               <Ban className="w-4 h-4 text-cyan-400" />
                             ) : (
                               <span className="text-xs font-black text-white">{i}</span>
                             )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Save & Actions */}
              {profileBorderViewMode === "preview" && (
                <div className="p-5 border-t border-white/5 flex items-center justify-between shrink-0">
                  <button 
                    onClick={() => {
                      const fullIndex = BORDERS_LIST.findIndex(b => b.id === tempBorder);
                      const nextIndex = (fullIndex + 1) % BORDERS_LIST.length;
                      setTempBorder(BORDERS_LIST[nextIndex].id);
                    }}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold bg-white/5 px-4 py-2.5 rounded-full"
                  >
                    Next Style <span className="text-[10px]">➡️</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      onUpdate({ border: tempBorder, borderThickness: tempBorderThickness });
                      setIsEditingBorder(false);
                    }}
                    className="px-8 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-[13px] font-black rounded-full transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                  >
                    <Check className="w-4 h-4" /> Save
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profilecard Banner Editor Modal */}
        {isEditingCardBg && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-md bg-[#110e21] border border-purple-500/30 rounded-none overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col max-h-[90vh] animate-in scale-in duration-200">
              {/* Header */}
              <div className="p-4 bg-[#16122a] border-b border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Profilecard Banner</h4>
                    <p className="text-[10px] text-purple-300/80 font-medium">Upload background image or animated .gif for lower banner</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditingCardBg(false)} 
                  className="p-1.5 rounded-lg bg-[#090714] border border-purple-900/40 text-purple-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Main Workspace */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                {/* Upload Trigger Section */}
                <div 
                  onClick={() => !isUploadingCardBg && cardBgInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 bg-[#16122a]/30 rounded-xl p-8 text-center cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
                >
                  {isUploadingCardBg ? (
                    <div className="space-y-2 py-4 flex flex-col items-center justify-center">
                      <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                      <p className="text-xs text-purple-300 font-bold">Uploading to Storage...</p>
                    </div>
                  ) : tempCardBg ? (
                    <div className="space-y-3">
                      <img src={tempCardBg} className="max-h-32 mx-auto rounded border border-purple-500/20 object-contain" alt="Background preview" />
                      <p className="text-xs text-emerald-400 font-bold">Image loaded successfully!</p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cardBgInputRef.current?.click();
                        }}
                        className="px-3 py-1 bg-white/10 text-[10px] font-black rounded uppercase text-white hover:bg-white/20"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <Camera className="w-10 h-10 text-purple-400 mx-auto animate-bounce" />
                      <h5 className="text-sm font-bold text-white">Upload image</h5>
                      <p className="text-[11px] text-purple-300/60 font-medium">Click here to upload a .gif, .png, or .jpg background</p>
                      <p className="text-[9px] text-rose-400 font-bold uppercase tracking-wider">Note: MP4 videos are not supported</p>
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={cardBgInputRef} 
                  className="hidden" 
                  accept="image/gif, image/png, image/jpeg, image/jpg" 
                  onChange={handleCardBgUpload}
                />

                {tempCardBg && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setTempCardBg("")}
                      className="px-4 py-1.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-[10px] font-black rounded uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Current Image
                    </button>
                  </div>
                )}
              </div>

              {/* Footer Save & Actions */}
              <div className="p-4 bg-[#16122a] border-t border-purple-900/40 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  100% Free Upload
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingCardBg(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onUpdate({ cardBg: tempCardBg || null });
                      setIsEditingCardBg(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-black rounded-lg transition-all shadow-lg uppercase tracking-widest"
                  >
                    Save Background
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Level Statistics Modal */}
        {showLevelStats && (() => {
          const xpInfo = getLevelFromXp(targetUser.total_xp || 0);
          const targetLevel = targetUser.email === 'dev@gmail.com' ? 1000 : xpInfo.level;
          const targetProgress = targetUser.email === 'dev@gmail.com' ? 100 : xpInfo.progress;
          const targetXpInLevel = targetUser.email === 'dev@gmail.com' ? 0 : xpInfo.xpInCurrentLevel;
          const targetXpNeeded = targetUser.email === 'dev@gmail.com' ? 0 : xpInfo.xpNeededForNextLevel;
          const targetRemaining = targetUser.email === 'dev@gmail.com' ? 0 : xpInfo.remainingXp;
          
          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
              <div className="bg-[#120e24] border border-purple-900/50 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left">
                <button 
                  onClick={() => setShowLevelStats(false)}
                  className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="text-lg font-black text-white mb-4">Level {targetLevel}</h3>
                
                {/* Progress Bar Container */}
                <div className="w-full bg-purple-950/40 rounded-full h-6 overflow-hidden border border-purple-900/20 relative mb-2">
                  <div 
                    className="bg-emerald-500 h-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${targetProgress}%` }}
                  >
                    {targetProgress > 8 && (
                      <span className="text-[10px] font-black text-black">{targetProgress.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-purple-300 font-bold px-1">
                  <span>{targetXpInLevel} / {targetXpNeeded} XP</span>
                </div>
                
                <p className="text-[11px] text-sky-400 italic font-medium mt-2 mb-6">
                  {targetRemaining} messages needed for next level
                </p>
                
                <div className="space-y-3.5 border-t border-purple-950/40 pt-4 text-xs">
                  <div className="flex justify-between items-center text-purple-200">
                    <span className="font-bold">Weekly XP</span>
                    <span className="font-mono font-bold text-white">{targetUser.weekly_xp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-200">
                    <span className="font-bold">Monthly XP</span>
                    <span className="font-mono font-bold text-white">{targetUser.monthly_xp || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-200">
                    <span className="font-bold">Total XP</span>
                    <span className="font-mono font-bold text-white">{targetUser.total_xp || 0}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowLevelStats(false)}
                  className="w-full mt-6 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-black rounded-xl transition-colors cursor-pointer text-center"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
