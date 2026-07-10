import React, { useState, useEffect } from "react";
import { X, Lock, Unlock, HelpCircle, Eye, ShieldAlert, CheckCircle2 } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface SecretMessagesListModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function SecretMessagesListModal({ user, onClose }: SecretMessagesListModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchSecretMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from("secret_messages")
        .select("*")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;
      setMessages(data || []);
    } catch (err) {
      console.error("Error fetching secret messages:", err);
      setError("Could not retrieve secret messages. Ensure the database table is configured.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecretMessages();
  }, [user.id]);

  const handleRequestReveal = async (msgId: string, senderId: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      // 1. Update request_reveal inside secret_messages
      const { error: updateErr } = await supabase
        .from("secret_messages")
        .update({ request_reveal: true })
        .eq("id", msgId);

      if (updateErr) throw updateErr;

      // 2. Insert reveal request notification for the sender
      const { error: notifErr } = await supabase.from("notifications").insert({
        target_id: senderId,
        sender_id: user.id,
        sender_username: user.username,
        sender_pfp: user.pfp,
        sender_rank: user.rank,
        message: `[REVEAL_REQUEST:${msgId}] ${user.username} request to reveal your secretmessage`
      });

      if (notifErr) throw notifErr;

      setSuccessMsg("Reveal request sent successfully!");
      // Refresh list
      fetchSecretMessages();
    } catch (err: any) {
      console.error("Failed to request reveal:", err);
      setError("Could not submit reveal request.");
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#161226] border border-purple-500/30 rounded-none shadow-2xl flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex items-center justify-between bg-purple-950/10">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-purple-300 uppercase tracking-widest">Confidential Messages</h4>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-950/25 border border-rose-900/30 flex items-center gap-2 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/25 border border-emerald-900/30 flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-purple-400/60 text-xs space-y-2">
              <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin block mx-auto"></span>
              <p>Decrypting message archive...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-purple-400/50 text-xs">
              No confidential messages received yet.
            </div>
          ) : (
            <div className="space-y-3.5">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-4 border transition-all relative ${
                    msg.revealed 
                      ? "bg-purple-950/10 border-emerald-500/25" 
                      : "bg-[#0c0919]/60 border-purple-950/40"
                  }`}
                >
                  {/* Sender & Stamp Area */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {msg.revealed ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                            From: {msg.sender_username}
                          </span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-purple-500" />
                          <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                            From: Anonymous 🔒
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-purple-500 font-medium">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="bg-black/20 p-3 rounded border border-purple-950/30 text-xs text-purple-200 whitespace-pre-wrap leading-relaxed mb-3 font-medium">
                    {msg.message}
                  </div>

                  {/* Actions footer */}
                  {!msg.revealed && (
                    <div className="flex justify-end pt-1">
                      {msg.request_reveal ? (
                        <span className="text-[10px] text-amber-500 font-bold bg-amber-950/20 px-2 py-1 rounded border border-amber-900/30 uppercase tracking-wider animate-pulse">
                          Reveal Requested (Pending)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRequestReveal(msg.id, msg.sender_id)}
                          className="px-3 py-1.5 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 hover:text-purple-100 border border-purple-900/30 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-lg"
                        >
                          Request Reveal 🔍
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-950/40 bg-purple-950/10 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
