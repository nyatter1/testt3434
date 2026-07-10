import React, { useState } from "react";
import { X, HelpCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface RevealDecisionModalProps {
  user: UserProfile;
  notification: any; // The notification clicked
  onClose: () => void;
  onSuccess: () => void;
}

export default function RevealDecisionModal({ user, notification, onClose, onSuccess }: RevealDecisionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse secret message ID from [REVEAL_REQUEST:id] prefix
  const parseMsgId = () => {
    const match = notification.message.match(/\[REVEAL_REQUEST:([^\]]+)\]/);
    return match ? match[1] : null;
  };

  const handleDecision = async (approved: boolean) => {
    setError(null);
    setIsProcessing(true);

    const msgId = parseMsgId();
    if (!msgId) {
      setError("Corrupted notification. Could not find corresponding message ID.");
      setIsProcessing(false);
      return;
    }

    try {
      if (approved) {
        // 1. Update the secret message 'revealed' to true
        const { error: updateErr } = await supabase
          .from("secret_messages")
          .update({ revealed: true })
          .eq("id", msgId);

        if (updateErr) throw updateErr;

        // 2. Insert notification for the requester (the target_id of this notification is our sender, wait!
        // The sender of the notification is the person who requested the reveal.
        // So the target of our new notification is notification.sender_id)
        const { error: notifErr } = await supabase.from("notifications").insert({
          target_id: notification.sender_id,
          sender_id: user.id,
          sender_username: user.username,
          sender_pfp: user.pfp,
          sender_rank: user.rank,
          message: `🔓 The secret message was from: ${user.username}`
        });

        if (notifErr) throw notifErr;
      }

      // 3. Delete this request notification so it is dismissed
      await supabase.from("notifications").delete().eq("id", notification.id);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Decision update failed:", err);
      setError("Failed to update reveal decision.");
    } finally {
      setIsProcessing(false);
    }
  };

  const requesterName = notification.sender_username || "Someone";

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#161226] border border-purple-500/30 rounded-none shadow-2xl flex flex-col p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-purple-950/40">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-widest">Reveal Sender Request</h4>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="text-center py-6 space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Decision Recorded!</p>
            <p className="text-[11px] text-purple-300">Your choice has been updated and sent to the recipient.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-purple-200 leading-relaxed font-medium">
              <span className="font-bold text-white">@{requesterName}</span> is requesting to reveal your identity for the secret message you sent them.
            </p>

            <p className="text-[11px] text-purple-400 italic">
              * Choosing "Yes" will let @{requesterName} see that you were the sender of that message and notify them immediately.
            </p>

            {error && (
              <div className="p-3 bg-rose-950/25 border border-rose-900/30 flex items-center gap-2 text-rose-300 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => handleDecision(false)}
                className="flex-1 py-2 px-4 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs font-black uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                No, Keep Secret
              </button>
              <button
                disabled={isProcessing}
                onClick={() => handleDecision(true)}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                Yes, Reveal Identity
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
