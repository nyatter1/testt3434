import { useState, useEffect, useMemo } from "react";
import { 
  X, Eye, RefreshCw, Trash2, Coins, Trophy, Clock, ArrowUpRight, ShieldCheck, Star, Sparkles, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { UserProfile } from "../types";

interface ProfileVisitorsModalProps {
  user: UserProfile;
  onClose: () => void;
  allRanksInfo: any;
  computedUsers: UserProfile[];
  handleProfileClick: (target: UserProfile, mode?: "quick" | "view" | "edit") => void;
  onUserUpdate: (updatedUser: Partial<UserProfile>) => void;
}

interface VisitRecord {
  id: string;
  profile_id: string;
  visitor_id: string;
  visitor_username: string;
  visitor_pfp: string;
  visitor_rank: string;
  created_at: string;
}

export default function ProfileVisitorsModal({
  user,
  onClose,
  allRanksInfo,
  computedUsers,
  handleProfileClick,
  onUserUpdate
}: ProfileVisitorsModalProps) {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [allVisitsForLeaderboard, setAllVisitsForLeaderboard] = useState<VisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"recent" | "admirers" | "leaderboard">("recent");
  const [buyError, setBuyError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  // Time remaining calculation
  const accessExpiresAt = user.profile_visits_expires_at ? new Date(user.profile_visits_expires_at) : null;
  const isAccessActive = accessExpiresAt ? accessExpiresAt > new Date() : false;

  const accessLeftString = useMemo(() => {
    if (!accessExpiresAt || !isAccessActive) return null;
    const diffMs = accessExpiresAt.getTime() - Date.now();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }, [user.profile_visits_expires_at, isAccessActive]);

  // Fetch visits
  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch visits for current user's profile
      const { data: myVisits } = await supabase
        .from("profile_visits")
        .select("*")
        .eq("profile_id", user.id);

      // 2. Fetch all visits to build the global leaderboard
      const { data: allVisits } = await supabase
        .from("profile_visits")
        .select("*");

      if (myVisits) {
        setVisits(myVisits);
      }
      if (allVisits) {
        setAllVisitsForLeaderboard(allVisits);
      }
    } catch (err) {
      console.error("Error fetching profile visits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();

    // Listen to real-time changes
    const visitsChannel = supabase
      .channel("profile-visits-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile_visits" }, () => {
        fetchVisits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(visitsChannel);
    };
  }, [user.id]);

  // Clean old visits (older than 48 hours)
  const cutoffTime = useMemo(() => {
    return Date.now() - 48 * 60 * 60 * 1000; // 48 hours ago
  }, [visits]);

  const activeVisits = useMemo(() => {
    return visits.filter(v => new Date(v.created_at).getTime() >= cutoffTime);
  }, [visits, cutoffTime]);

  const activeLeaderboardVisits = useMemo(() => {
    return allVisitsForLeaderboard.filter(v => new Date(v.created_at).getTime() >= cutoffTime);
  }, [allVisitsForLeaderboard, cutoffTime]);

  // Group visitors for current user's profile
  const groupedVisitors = useMemo(() => {
    const map: { [visitorId: string]: {
      visitorId: string;
      username: string;
      pfp: string;
      rank: string;
      visitsCount: number;
      firstVisit: string;
      lastVisit: string;
    }} = {};

    activeVisits.forEach(v => {
      const vid = v.visitor_id;
      const vTime = new Date(v.created_at).getTime();

      if (!map[vid]) {
        map[vid] = {
          visitorId: vid,
          username: v.visitor_username,
          pfp: v.visitor_pfp,
          rank: v.visitor_rank,
          visitsCount: 0,
          firstVisit: v.created_at,
          lastVisit: v.created_at
        };
      }

      map[vid].visitsCount += 1;
      
      if (vTime < new Date(map[vid].firstVisit).getTime()) {
        map[vid].firstVisit = v.created_at;
      }
      if (vTime > new Date(map[vid].lastVisit).getTime()) {
        map[vid].lastVisit = v.created_at;
      }
    });

    return Object.values(map);
  }, [activeVisits]);

  // Sort Recent Visitors (by last visit time descending)
  const recentVisitorsList = useMemo(() => {
    return [...groupedVisitors].sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
  }, [groupedVisitors]);

  // Sort Admirers (by visit count descending, then last visit descending)
  const admirersList = useMemo(() => {
    return [...groupedVisitors].sort((a, b) => {
      if (b.visitsCount !== a.visitsCount) {
        return b.visitsCount - a.visitsCount;
      }
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });
  }, [groupedVisitors]);

  // Global Leaderboard (grouped by profile_id)
  const leaderboardList = useMemo(() => {
    const map: { [profileId: string]: {
      profileId: string;
      totalVisits: number;
      uniqueVisitors: Set<string>;
    }} = {};

    activeLeaderboardVisits.forEach(v => {
      const pid = v.profile_id;
      if (!map[pid]) {
        map[pid] = {
          profileId: pid,
          totalVisits: 0,
          uniqueVisitors: new Set<string>()
        };
      }
      map[pid].totalVisits += 1;
      map[pid].uniqueVisitors.add(v.visitor_id);
    });

    return Object.values(map)
      .map(item => {
        const profileUser = computedUsers.find(u => u.id === item.profileId);
        return {
          profileId: item.profileId,
          totalVisits: item.totalVisits,
          uniqueCount: item.uniqueVisitors.size,
          username: profileUser?.username || "Unknown User",
          pfp: profileUser?.pfp || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150",
          rank: profileUser?.rank || "USER"
        };
      })
      .sort((a, b) => {
        if (b.uniqueCount !== a.uniqueCount) {
          return b.uniqueCount - a.uniqueCount;
        }
        return b.totalVisits - a.totalVisits;
      });
  }, [activeLeaderboardVisits, computedUsers]);

  // Total and Unique values for display
  const totalVisitsCount = activeVisits.length;
  const uniqueVisitorsCount = groupedVisitors.length;

  // Buy access handler
  const handleBuyAccess = async (currency: "gold" | "rubies") => {
    setBuyError(null);
    setIsBuying(true);

    const goldPrice = 500;
    const rubiesPrice = 10;

    let updatedCoins = user.coins ?? 0;
    let updatedRubies = user.rubies ?? 0;

    if (currency === "gold") {
      if (updatedCoins < goldPrice) {
        setBuyError("You don't have enough Gold! Convert or chat to earn more.");
        setIsBuying(false);
        return;
      }
      updatedCoins -= goldPrice;
    } else {
      if (updatedRubies < rubiesPrice) {
        setBuyError("You don't have enough Rubies! Exchange Gold or get active.");
        setIsBuying(false);
        return;
      }
      updatedRubies -= rubiesPrice;
    }

    // Set new expiration time to 48 hours from now
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          coins: updatedCoins,
          rubies: updatedRubies,
          profile_visits_expires_at: expiresAt
        })
        .eq("id", user.id);

      if (error) throw error;

      // Update state locally
      onUserUpdate({
        coins: updatedCoins,
        rubies: updatedRubies,
        profile_visits_expires_at: expiresAt
      });
    } catch (err: any) {
      setBuyError(err.message || "Purchase failed. Please try again.");
    } finally {
      setIsBuying(false);
    }
  };

  // Clear visitor history
  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your visitor history? This will delete all your visitor logs.")) return;

    try {
      await supabase
        .from("profile_visits")
        .delete()
        .eq("profile_id", user.id);

      setVisits([]);
    } catch (err) {
      console.error("Failed to clear visitor history:", err);
    }
  };

  // Open visitor profile
  const handleVisitorClick = (visitorUsername: string) => {
    const found = computedUsers.find(u => u.username === visitorUsername);
    if (found) {
      handleProfileClick(found, "quick");
    }
  };

  // Relative time helper
  const getRelativeTimeString = (isoStr: string) => {
    const diffMs = Date.now() - new Date(isoStr).getTime();
    const secs = Math.floor(diffMs / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (mins > 0) return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
    return "just now";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="profile_visitors_modal"
        className="w-full max-w-2xl bg-[#110d24] border border-purple-950/80 rounded-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-950/60 flex items-center justify-between bg-[#0c0919]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950/40 text-blue-400 border border-purple-900/40">
              <Eye className="w-5 h-5 animate-pulse text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5 uppercase font-sans">
                Profile Visitors
              </h2>
              <p className="text-[10px] text-purple-400">See who visited your profile recently. Visitor entries auto-delete after 48 hours.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVisits}
              className="p-1.5 rounded-lg text-purple-400 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase"
              title="Refresh Stats"
              disabled={isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-purple-400 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {/* Main Visitor Dashboard (If Active) */}
          {isAccessActive ? (
            <div className="space-y-5">
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#141029] border border-purple-950/40 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400 pointer-events-none">
                    <Eye className="w-16 h-16" />
                  </div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Total Visits</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:scale-105 transition-transform origin-left duration-250">
                    {totalVisitsCount}
                  </p>
                </div>

                <div className="p-4 bg-[#141029] border border-purple-950/40 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400 pointer-events-none">
                    <Trophy className="w-16 h-16" />
                  </div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Unique Visitors</p>
                  <p className="text-2xl font-black text-white mt-1 group-hover:scale-105 transition-transform origin-left duration-250">
                    {uniqueVisitorsCount}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#141029] to-[#110d24] border border-purple-500/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-400 pointer-events-none">
                    <Clock className="w-16 h-16" />
                  </div>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-wider">Access Left</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">
                    {accessLeftString || "Expired"}
                  </p>
                </div>
              </div>

              {/* Status Indicator & Manage Banner */}
              <div className="p-4 bg-[#141029] border border-purple-950/40 rounded-xl space-y-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-wider">Paid Access Active: <span className="text-emerald-400">{accessLeftString}</span></span>
                </div>
                
                <div className="pt-3 border-t border-purple-950/40">
                  <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Manage Settings</span>
                  </h3>
                  <p className="text-[11px] text-purple-400 mb-3">Visitor tracking is always enabled. You can clear your visitor history here. Visitor entries auto-delete after 48 hours.</p>
                  <button
                    onClick={handleClearHistory}
                    className="px-3 py-2 bg-rose-600/90 hover:bg-rose-500 text-white font-black text-[10px] rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Clear my visitor history
                  </button>
                </div>
              </div>

              {/* Tabs list */}
              <div className="flex border-b border-purple-950/40">
                <button
                  onClick={() => setActiveTab("recent")}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === "recent" ? "border-blue-500 text-white" : "border-transparent text-purple-400 hover:text-white"}`}
                >
                  Recent Visitors
                </button>
                <button
                  onClick={() => setActiveTab("admirers")}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === "admirers" ? "border-blue-500 text-white" : "border-transparent text-purple-400 hover:text-white"}`}
                >
                  Admirers
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === "leaderboard" ? "border-blue-500 text-white" : "border-transparent text-purple-400 hover:text-white"}`}
                >
                  Leaderboard
                </button>
              </div>

              {/* Active Tab View */}
              <div className="space-y-3 min-h-[250px]">
                {activeTab === "recent" && (
                  recentVisitorsList.length === 0 ? (
                    <div className="p-8 text-center bg-[#0d0a1c] border border-purple-950/30 rounded-xl">
                      <Eye className="w-8 h-8 text-purple-950 mx-auto mb-2" />
                      <p className="text-xs font-bold text-purple-400 uppercase">No recent visits</p>
                      <p className="text-[10px] text-purple-500/80 mt-1">Get active in chats or update your profile customization to draw attention!</p>
                    </div>
                  ) : (
                    recentVisitorsList.map(v => (
                      <div 
                        key={v.visitorId}
                        className="p-3 bg-[#141029] border border-purple-950/40 rounded-xl flex items-center justify-between hover:border-purple-900/30 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => handleVisitorClick(v.username)}
                            className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/15 cursor-pointer hover:border-purple-500/50 transition-all shrink-0"
                          >
                            <img src={v.pfp} alt={v.username} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {v.rank && (
                                <img 
                                  src={allRanksInfo[v.rank]?.icon || allRanksInfo['VIP']?.icon} 
                                  alt={v.rank} 
                                  className="h-3.5 w-auto object-contain" 
                                />
                              )}
                              <span 
                                onClick={() => handleVisitorClick(v.username)}
                                className="text-xs font-extrabold text-white cursor-pointer hover:underline"
                              >
                                {v.username}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                                {v.visitsCount} {v.visitsCount === 1 ? 'visit' : 'visits'}
                              </span>
                              <span className="text-[9px] text-purple-400 font-medium">
                                Last visit: <span className="text-purple-300 font-bold">{getRelativeTimeString(v.lastVisit)}</span>
                              </span>
                              {v.firstVisit !== v.lastVisit && (
                                <span className="text-[9px] text-purple-500">
                                  First visit: <span className="text-purple-400">{getRelativeTimeString(v.firstVisit)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVisitorClick(v.username)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 uppercase"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )
                )}

                {activeTab === "admirers" && (
                  admirersList.length === 0 ? (
                    <div className="p-8 text-center bg-[#0d0a1c] border border-purple-950/30 rounded-xl">
                      <Star className="w-8 h-8 text-purple-950 mx-auto mb-2" />
                      <p className="text-xs font-bold text-purple-400 uppercase">No admirers yet</p>
                      <p className="text-[10px] text-purple-500/80 mt-1">Founders, VIPs, or cool friends will show up here once they visit your profile!</p>
                    </div>
                  ) : (
                    admirersList.map((v, index) => (
                      <div 
                        key={v.visitorId}
                        className="p-3 bg-[#141029] border border-purple-950/40 rounded-xl flex items-center justify-between hover:border-purple-900/30 transition-all relative overflow-hidden"
                      >
                        {index === 0 && (
                          <div className="absolute top-0 left-0 px-2 py-0.5 bg-amber-500 text-[8px] font-black uppercase text-black tracking-widest rounded-br-lg flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-black" />
                            <span>Top Admirer</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => handleVisitorClick(v.username)}
                            className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/15 cursor-pointer hover:border-purple-500/50 transition-all shrink-0"
                          >
                            <img src={v.pfp} alt={v.username} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {v.rank && (
                                <img 
                                  src={allRanksInfo[v.rank]?.icon || allRanksInfo['VIP']?.icon} 
                                  alt={v.rank} 
                                  className="h-3.5 w-auto object-contain" 
                                />
                              )}
                              <span 
                                onClick={() => handleVisitorClick(v.username)}
                                className="text-xs font-extrabold text-white cursor-pointer hover:underline"
                              >
                                {v.username}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                                <span>{v.visitsCount} visits</span>
                              </span>
                              <span className="text-[9px] text-purple-400">
                                Last visit: <span className="font-bold text-purple-300">{getRelativeTimeString(v.lastVisit)}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVisitorClick(v.username)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 uppercase"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )
                )}

                {activeTab === "leaderboard" && (
                  leaderboardList.length === 0 ? (
                    <div className="p-8 text-center bg-[#0d0a1c] border border-purple-950/30 rounded-xl">
                      <Trophy className="w-8 h-8 text-purple-950 mx-auto mb-2" />
                      <p className="text-xs font-bold text-purple-400 uppercase">No leaderboard rankings</p>
                      <p className="text-[10px] text-purple-500/80 mt-1"> Rankings will generate once users start exploring other profiles in the app.</p>
                    </div>
                  ) : (
                    leaderboardList.map((leader, index) => (
                      <div 
                        key={leader.profileId}
                        className="p-3 bg-[#141029] border border-purple-950/40 rounded-xl flex items-center justify-between hover:border-purple-900/30 transition-all relative"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-purple-950/80 text-purple-300 flex items-center justify-center border border-purple-900 font-black text-xs shrink-0">
                            #{index + 1}
                          </div>

                          <div 
                            onClick={() => handleVisitorClick(leader.username)}
                            className="w-9 h-9 rounded-full overflow-hidden border border-purple-500/15 cursor-pointer hover:border-purple-500/50 transition-all shrink-0"
                          >
                            <img src={leader.pfp} alt={leader.username} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {leader.rank && (
                                <img 
                                  src={allRanksInfo[leader.rank]?.icon || allRanksInfo['VIP']?.icon} 
                                  alt={leader.rank} 
                                  className="h-3.5 w-auto object-contain" 
                                />
                              )}
                              <span 
                                onClick={() => handleVisitorClick(leader.username)}
                                className="text-xs font-extrabold text-white cursor-pointer hover:underline"
                              >
                                {leader.username}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] mt-0.5">
                              <span className="text-blue-400 font-bold">
                                {leader.uniqueCount} {leader.uniqueCount === 1 ? 'Unique Visitor' : 'Unique Visitors'}
                              </span>
                              <span className="text-purple-400">
                                {leader.totalVisits} {leader.totalVisits === 1 ? 'Total Visit' : 'Total Visits'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleVisitorClick(leader.username)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-lg transition-colors flex items-center gap-1 uppercase"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>

            </div>
          ) : (
            
            /* LOCKED PURCHASING OVERLAY SCREEN */
            <div className="space-y-5 py-4">
              <div className="text-center space-y-3 max-w-md mx-auto">
                <div className="inline-block p-4 rounded-full bg-purple-950/40 text-purple-400 border border-purple-900/50 relative">
                  <Eye className="w-10 h-10 text-purple-300 animate-pulse" />
                  <div className="absolute -top-1 -right-1 p-1 bg-amber-500 rounded-full text-black border-2 border-[#110d24]">
                    <Sparkles className="w-3 h-3 fill-black text-black" />
                  </div>
                </div>
                
                <h3 className="text-base font-black text-white tracking-wider uppercase font-sans">
                  Unlock Profile Visitors
                </h3>
                
                <p className="text-xs text-purple-300/90 leading-relaxed">
                  Discover who has been viewing your profile, track total & unique visitor statistics, find your top admirers, and view the global community popularity leaderboard!
                </p>
                
                <div className="p-2.5 bg-purple-950/25 border border-purple-900/30 rounded-lg text-[10px] text-amber-300/90 font-medium">
                  ⚡ Each activation grants full unrestricted access for 48 Hours.
                </div>
              </div>

              {/* Purchase Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                
                {/* Gold Purchase */}
                <div className="p-4 bg-[#141029] border border-purple-950/50 hover:border-purple-900/40 rounded-2xl flex flex-col items-center justify-between text-center space-y-4">
                  <div>
                    <div className="text-2xl mb-1">🪙</div>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Pay with Gold</p>
                    <p className="text-xl font-black text-white mt-1">500 Gold</p>
                    <p className="text-[9px] text-purple-500 mt-0.5">Your Balance: {(user.coins ?? 0).toLocaleString()} Gold</p>
                  </div>
                  
                  <button
                    disabled={isBuying}
                    onClick={() => handleBuyAccess("gold")}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50 text-black font-black text-xs rounded-xl uppercase tracking-wider transition-all"
                  >
                    Buy 48H Access
                  </button>
                </div>

                {/* Rubies Purchase */}
                <div className="p-4 bg-[#141029] border border-purple-950/50 hover:border-purple-900/40 rounded-2xl flex flex-col items-center justify-between text-center space-y-4">
                  <div>
                    <div className="text-2xl mb-1">♦️</div>
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Pay with Rubies</p>
                    <p className="text-xl font-black text-white mt-1">10 Rubies</p>
                    <p className="text-[9px] text-purple-500 mt-0.5">Your Balance: {(user.rubies ?? 0).toLocaleString()} Rubies</p>
                  </div>

                  <button
                    disabled={isBuying}
                    onClick={() => handleBuyAccess("rubies")}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all"
                  >
                    Buy 48H Access
                  </button>
                </div>

              </div>

              {/* Errors Container */}
              {buyError && (
                <div className="max-w-md mx-auto p-3 bg-rose-950/40 border border-rose-500/20 rounded-xl text-center text-[11px] font-bold text-rose-300">
                  ⚠️ {buyError}
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
