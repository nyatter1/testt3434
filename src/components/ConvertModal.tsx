import React, { useState } from "react";
import { X, RefreshCw, ArrowRightLeft, ShieldAlert } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface ConvertModalProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

export default function ConvertModal({ user, onUpdateUser, onClose }: ConvertModalProps) {
  const [direction, setDirection] = useState<"gold_to_rubies" | "rubies_to_gold">("gold_to_rubies");
  const [inputValue, setInputValue] = useState<number | "">("");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Constants
  // 1000 Gold = 10 Rubies -> 100 Gold = 1 Ruby
  // 100 Rubies = 10000 Gold -> 1 Ruby = 100 Gold
  const GOLD_PER_RUBY = 100;

  const currentGold = user.coins ?? 1000;
  const currentRubies = user.rubies ?? 10;

  const handleConvert = async () => {
    setError(null);
    setSuccessMessage(null);

    const val = Number(inputValue);
    if (!inputValue || isNaN(val) || val <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setIsConverting(true);

    try {
      let newGold = currentGold;
      let newRubies = currentRubies;
      let msg = "";

      if (direction === "gold_to_rubies") {
        if (currentGold < val) {
          setError(`Insufficient Gold. You only have ${currentGold} Gold.`);
          setIsConverting(false);
          return;
        }
        
        // Convert
        const gainedRubies = Math.floor(val / GOLD_PER_RUBY);
        if (gainedRubies <= 0) {
          setError(`Min gold to convert is ${GOLD_PER_RUBY} Gold (which gives 1 Ruby)`);
          setIsConverting(false);
          return;
        }

        const spentGold = gainedRubies * GOLD_PER_RUBY;
        newGold = currentGold - spentGold;
        newRubies = currentRubies + gainedRubies;
        msg = `You converted ${spentGold} Gold to ${gainedRubies} Rubies!`;
      } else {
        if (currentRubies < val) {
          setError(`Insufficient Rubies. You only have ${currentRubies} Rubies.`);
          setIsConverting(false);
          return;
        }

        // Convert
        const gainedGold = val * GOLD_PER_RUBY;
        newGold = currentGold + gainedGold;
        newRubies = currentRubies - val;
        msg = `You converted ${val} Rubies to ${gainedGold} Gold!`;
      }

      // Update database
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          coins: newGold,
          rubies: newRubies
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // Update local state
      onUpdateUser({ coins: newGold, rubies: newRubies });

      // Insert notification for current user so they get the bell alert & history
      await supabase.from("notifications").insert({
        target_id: user.id,
        sender_id: user.id,
        sender_username: "Bank",
        sender_pfp: "https://musicvibe.io/default_images/rank/bot.svg",
        sender_rank: "BOT",
        message: msg
      });

      setSuccessMessage(msg);
      setInputValue("");
    } catch (err: any) {
      console.error("Conversion failed:", err);
      setError("Failed to convert currency. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const calculatedOutput = () => {
    if (!inputValue || isNaN(Number(inputValue))) return 0;
    const val = Number(inputValue);
    if (direction === "gold_to_rubies") {
      return Math.floor(val / GOLD_PER_RUBY);
    } else {
      return val * GOLD_PER_RUBY;
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161226] border border-purple-500/30 rounded-none shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex items-center justify-between bg-purple-950/10">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-purple-300 uppercase tracking-widest">Royal Currency Exchange</h4>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Exchange Rates Reference */}
          <div className="bg-[#0c0919]/60 border border-purple-900/25 p-3 flex flex-col gap-1 rounded-none text-center">
            <p className="text-[10px] uppercase font-black tracking-wider text-purple-400">Official Exchange Rate</p>
            <div className="flex justify-center items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <span className="text-sm">🪙</span>
                <span className="text-xs text-white font-black">1000 Gold</span>
              </div>
              <span className="text-purple-500 font-black">=</span>
              <div className="flex items-center gap-1">
                <span className="text-sm">♦️</span>
                <span className="text-xs text-white font-black">10 Rubies</span>
              </div>
            </div>
          </div>

          {/* User Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0d0a1c] border border-purple-950/50 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">Your Gold</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base">🪙</span>
                <span className="text-sm font-black text-white">{currentGold}</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#0d0a1c] border border-purple-950/50 flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">Your Rubies</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-base">♦️</span>
                <span className="text-sm font-black text-purple-100">{currentRubies}</span>
              </div>
            </div>
          </div>

          {/* Selector Direction */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setDirection("gold_to_rubies");
                setError(null);
                setSuccessMessage(null);
                setInputValue("");
              }}
              className={`flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider transition-all border cursor-pointer text-center ${direction === "gold_to_rubies" ? "bg-purple-950/40 border-purple-500 text-purple-200" : "bg-[#0c0919]/40 border-purple-950 text-purple-400 hover:text-purple-300"}`}
            >
              Gold 🪙 → Ruby ♦️
            </button>
            <button
              onClick={() => {
                setDirection("rubies_to_gold");
                setError(null);
                setSuccessMessage(null);
                setInputValue("");
              }}
              className={`flex-1 py-2 px-3 text-xs font-black uppercase tracking-wider transition-all border cursor-pointer text-center ${direction === "rubies_to_gold" ? "bg-purple-950/40 border-purple-500 text-purple-200" : "bg-[#0c0919]/40 border-purple-950 text-purple-400 hover:text-purple-300"}`}
            >
              Ruby ♦️ → Gold 🪙
            </button>
          </div>

          {/* Amount input block */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block mb-1">
                Amount of {direction === "gold_to_rubies" ? "Gold to Exchange" : "Rubies to Exchange"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  placeholder={direction === "gold_to_rubies" ? "e.g. 1000" : "e.g. 10"}
                  value={inputValue}
                  onChange={(e) => {
                    setError(null);
                    setSuccessMessage(null);
                    setInputValue(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value)));
                  }}
                  className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-3 text-xs text-purple-200 font-bold focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-3 top-2.5 text-sm">
                  {direction === "gold_to_rubies" ? "🪙" : "♦️"}
                </span>
              </div>
            </div>

            {/* Simulated outcome summary */}
            {inputValue !== "" && !isNaN(Number(inputValue)) && Number(inputValue) > 0 && (
              <div className="p-3 bg-purple-950/10 border border-purple-950/30 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-purple-400">Estimated Receipt:</span>
                <span className="text-xs font-black text-emerald-400">
                  {direction === "gold_to_rubies" ? "♦️ " : "🪙 "}
                  {calculatedOutput()} {direction === "gold_to_rubies" ? "Rubies" : "Gold"}
                </span>
              </div>
            )}
          </div>

          {/* Toast feedback alerts */}
          {error && (
            <div className="p-3 bg-rose-950/20 border border-rose-900/30 flex items-center gap-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 flex flex-col gap-1 text-emerald-300 text-xs text-center font-bold">
              <span>🎉 SUCCESS!</span>
              <span className="text-[11px] font-normal text-purple-200">{successMessage}</span>
            </div>
          )}

          {/* Submit and closes */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isConverting}
              className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-black rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
            <button
              onClick={handleConvert}
              disabled={isConverting || !inputValue}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-950 disabled:to-indigo-950 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <span>Convert Boom!</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
