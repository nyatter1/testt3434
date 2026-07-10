import React, { useState, useEffect, useRef } from "react";
import { X, Send, Search, ShieldAlert, CheckCircle2, UserCheck } from "lucide-react";
import { UserProfile } from "../types";
import { supabase } from "../lib/supabase";

interface SecretMessageModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function SecretMessageModal({ user, onClose }: SecretMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, pfp, rank")
          .ilike("username", `%${searchQuery}%`)
          .neq("id", user.id) // Cannot send to yourself
          .limit(6);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Search profiles error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, user.id]);

  const handleSend = async () => {
    setError(null);
    if (!selectedUser) {
      setError("Please select a recipient first");
      return;
    }
    if (!message.trim()) {
      setError("Please type a message before sending");
      return;
    }

    setIsSending(true);

    try {
      // 1. Insert into secret_messages
      const { error: insertErr } = await supabase.from("secret_messages").insert({
        sender_id: user.id,
        sender_username: user.username,
        recipient_id: selectedUser.id,
        message: message.trim(),
        revealed: false,
        request_reveal: false
      });

      if (insertErr) throw insertErr;

      // 2. Send notification to the recipient
      const { error: notifErr } = await supabase.from("notifications").insert({
        target_id: selectedUser.id,
        sender_id: user.id,
        sender_username: "Anonymous",
        sender_pfp: "https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png",
        sender_rank: "BOT",
        message: `🔒 You received a secret message! Click to see.`
      });

      if (notifErr) throw notifErr;

      setSuccess(true);
      setMessage("");
      setSelectedUser(null);
      setSearchQuery("");
    } catch (err: any) {
      console.error("Failed to send secret message:", err);
      setError("Failed to transmit secret message. Check if your database table is set up!");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161226] border border-purple-500/30 rounded-none shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-950/40 flex items-center justify-between bg-purple-950/10">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-black text-purple-300 uppercase tracking-widest">Send Secret Message</h4>
          </div>
          <button onClick={onClose} className="text-purple-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          {success ? (
            <div className="space-y-4 py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h5 className="text-sm font-black text-emerald-400 uppercase tracking-wider">Message Dispatched!</h5>
                <p className="text-xs text-purple-300">Your secret message has been safely encrypted and sent anonymously.</p>
              </div>
              <button
                onClick={() => setSuccess(false)}
                className="py-2 px-6 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/25 text-purple-200 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              {/* Recipient Selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">
                  Select Recipient Username
                </label>
                
                {selectedUser ? (
                  <div className="p-3 bg-[#0d0a1c] border border-emerald-500/30 flex items-center justify-between animate-in zoom-in-95 duration-100">
                    <div className="flex items-center gap-2.5">
                      <img src={selectedUser.pfp} alt={selectedUser.username} className="w-8 h-8 object-cover border border-purple-950" />
                      <div>
                        <p className="text-xs font-black text-white">{selectedUser.username}</p>
                        <p className="text-[10px] text-purple-400 uppercase">{selectedUser.rank || "VIP"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-purple-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Type username to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-3 pl-10 text-xs text-purple-200 font-medium focus:outline-none focus:border-purple-500"
                    />

                    {/* Autocomplete list */}
                    {searchQuery.trim() && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#131024] border border-purple-900/50 shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-purple-950/40 custom-scrollbar">
                        {isSearching ? (
                          <div className="p-3 text-center text-xs text-purple-400">Searching...</div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-center text-xs text-purple-500">No members found matching "{searchQuery}"</div>
                        ) : (
                          searchResults.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(p);
                                setSearchQuery("");
                              }}
                              className="w-full text-left p-2.5 hover:bg-purple-950/40 flex items-center gap-2.5 transition-all"
                            >
                              <img src={p.pfp} alt={p.username} className="w-7 h-7 object-cover border border-purple-950" />
                              <div>
                                <p className="text-xs font-bold text-purple-200">{p.username}</p>
                                <p className="text-[9px] uppercase text-purple-500">{p.rank || "VIP"}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Box */}
              {selectedUser && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-150">
                  <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block">
                    Your Secret Message (Delivered Anonymously)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter message text... Recipient will see this as sent by 'Anonymous' until you choose to reveal."
                    value={message}
                    onChange={(e) => {
                      setError(null);
                      setMessage(e.target.value);
                    }}
                    className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-3 text-xs text-purple-200 font-medium focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-rose-950/25 border border-rose-900/30 flex items-center gap-2 text-rose-300 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-purple-950/40">
                <button
                  onClick={onClose}
                  disabled={isSending}
                  className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-black rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !selectedUser || !message.trim()}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-lg uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Secret</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
