import { useState, useEffect, useRef, FormEvent, ChangeEvent, useMemo } from "react";
import { 
  Menu, X, Send, Plus, Smile, Users, 
  Crown, ShieldAlert as RulesIcon, ChevronLeft, ChevronRight, LogOut, Shield,
  MoreHorizontal, EyeOff, Trash2, Reply, Volume2, VolumeX,
  Bell, ShieldCheck, Sparkles, AlertTriangle, Eye, Check, Heart, Edit2, Camera,
  Palette, CreditCard, Star, Lock, Unlock, Coins, Hand, Type, Newspaper,
  Vote, Gift
} from "lucide-react";
import { UserProfile, Message, OnlineUser, RANKS_INFO, mapDbRankToUserRank, UserRank, getLevelFromXp } from "../types";
import ProfileModal from "./ProfileModal";
import { supabase } from "../lib/supabase";
import { uploadImageToStorage } from "../lib/storage";

// Feature Modals
import PaintModal from "./PaintModal";
import StyleModal from "./StyleModal";
import ConvertModal from "./ConvertModal";
import SecretMessageModal from "./SecretMessageModal";
import GallerySettingsModal from "./GallerySettingsModal";
import { Image as ImageIcon } from "lucide-react";
import SecretMessagesListModal from "./SecretMessagesListModal";
import RevealDecisionModal from "./RevealDecisionModal";
import NewsSidebar from "./NewsSidebar";
import ProfileVisitorsModal from "./ProfileVisitorsModal";
import ProfileDecorModal from "./ProfileDecorModal";
import PollModal from "./PollModal";
import GiftModal from "./GiftModal";

const getAssetUrl = (path: string) => {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return cleanBase + cleanPath;
};

const BOT_USER: OnlineUser = {
  id: "musicvibe-bot-system-id",
  username: "System",
  gender: "OTHER",
  age: 0,
  pfp: "https://musicvibe.io/default_images/avatar/default_system.png",
  rank: "BOT",
  aboutMe: "",
  mood: "Always active ⚡",
  border: "none",
  borderThickness: "2px",
  cardBg: "",
  likes: 9999,
  isSystem: true,
  status: "online"
};

interface ChatRoomProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
}

export default function ChatRoom({ user, onLogout, onUpdateUser }: ChatRoomProps) {
  const onUpdateUserRef = useRef(onUpdateUser);
  useEffect(() => {
    onUpdateUserRef.current = onUpdateUser;
  }, [onUpdateUser]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnlinePanelOpen, setIsOnlinePanelOpen] = useState(window.innerWidth > 768);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileMenuView, setProfileMenuView] = useState<'default' | 'status' | 'wallet'>('default');
  const [showChatBgModal, setShowChatBgModal] = useState(false);
  const [tempBgBase64, setTempBgBase64] = useState<string | null>(null);
  const [tempBgFile, setTempBgFile] = useState<File | null>(null);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [chatBgError, setChatBgError] = useState<string | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "staff" | "rules">("chat");
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<"online" | "staff">("online");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "MALE" | "FEMALE" | "OTHER">("ALL");
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [hiddenMessages, setHiddenMessages] = useState<Set<string>>(new Set());
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);

  // Profile Modal State
  const [profileTarget, setProfileTarget] = useState<UserProfile | null>(null);
  const [profileMode, setProfileMode] = useState<"quick" | "view" | "edit">("quick");

  // Dynamic custom ranks, announcements, notifications, and admin state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [customRanks, setCustomRanks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  // Collaborative Paint, Currency Convert, and Secret Messages States
  const [showPlusOptions, setShowPlusOptions] = useState(false);
  const [showPaintModal, setShowPaintModal] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSecretMessageModal, setShowSecretMessageModal] = useState(false);
  const [showGallerySettingsModal, setShowGallerySettingsModal] = useState(false);
  const [showSecretMessagesListModal, setShowSecretMessagesListModal] = useState(false);
  const [showProfileVisitorsModal, setShowProfileVisitorsModal] = useState(false);
  const [showProfileDecorModal, setShowProfileDecorModal] = useState(false);
  const [activeDecisionNotif, setActiveDecisionNotif] = useState<any | null>(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Form states inside Admin Panel
  const [newRankKey, setNewRankKey] = useState("");
  const [newRankName, setNewRankName] = useState("");
  const [newRankIcon, setNewRankIcon] = useState("");
  const [newRankPriority, setNewRankPriority] = useState("15");
  const [newRankIsStaff, setNewRankIsStaff] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [globalNotifText, setGlobalNotifText] = useState("");
  const [adminTab, setAdminTab] = useState<"accounts" | "ranks" | "announcements">("accounts");

  const playNotifySound = () => {
    try {
      const audio = new Audio('/notify.mp3');
      audio.play().catch(() => {});
    } catch (e) {
      console.warn("Failed to play notify.mp3", e);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  const audioCache = useRef<{ [key: string]: HTMLAudioElement }>({});
  const lastPlayTime = useRef<{ [key: string]: number }>({});

  const playSynthSound = (src: string) => {
    const nowTime = Date.now();
    const last = lastPlayTime.current[src] || 0;
    if (nowTime - last < 150) return; // Prevent double trigger in fast succession
    lastPlayTime.current[src] = nowTime;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (src.includes('clear')) {
        // Soft sweep sound for clear
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (src.includes('username')) {
        // Elegant double chime note alert for mention tags
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.setValueAtTime(659, now + 0.1); // E5
        osc.frequency.setValueAtTime(784, now + 0.2); // G5
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (src.includes('message')) {
        // High quality sweet organic notification bubble sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.exponentialRampToValueAtTime(784, now + 0.12); // G5
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (src.includes('private')) {
        // Soft double-pulse private message chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        osc.frequency.setValueAtTime(659, now + 0.08);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (src.includes('notify')) {
        // Multi-tone chime sound for notifications/username changes
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(554, now + 0.08); // C#5
        osc.frequency.setValueAtTime(659, now + 0.16); // E5
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (src.includes('join')) {
        // Pleasant bubble join sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(554, now + 0.15);
        gainNode.gain.setValueAtTime(0.07, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
      } else {
        // Simple pleasant short alert
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      console.warn("Synthesizer fallback failed to construct:", e);
    }
  };

  const playAudio = (src: string) => {
    if (!soundsEnabled) return;
    try {
      const url = getAssetUrl(src);
      let audio = audioCache.current[url];
      if (!audio) {
        audio = new Audio(url);
        audio.onerror = () => {
          // Automatic seamless fallback if format is not supported or file is empty
          playSynthSound(src);
        };
        audioCache.current[url] = audio;
      }
      audio.currentTime = 0;
      audio.play().catch((err) => {
        // If playback is blocked or fails, trigger synthesizer
        playSynthSound(src);
      });
    } catch (e) {
      playSynthSound(src);
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      // Play a quick silent sound to unlock browser audio autoplay restriction
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD");
      silentAudio.play().then(() => {
        console.log("Audio autoplay restriction successfully unlocked via user interaction.");
      }).catch((e) => {
        console.warn("Silent audio unlock failed:", e);
      });
      
      // Warm up and pre-load all real sounds so they are loaded and ready instantly
      const sounds = ['/clear.mp3', '/join.mp3', '/message.mp3', '/new_news.mp3', '/private.mp3', '/username.mp3', '/notify.mp3'];
      sounds.forEach(sound => {
        try {
          const url = getAssetUrl(sound);
          let audio = audioCache.current[url];
          if (!audio) {
            audio = new Audio(url);
            audioCache.current[url] = audio;
          }
          audio.load();
        } catch (err) {}
      });

      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // 1. Fetch initial messages and subscribe to real-time
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = payload?.new as any;
        if (!newMsg) return;
        
        if (newMsg.text?.startsWith('[SYSTEM] Chat cleared by')) {
           playAudio('/clear.mp3');
        } else if (newMsg.text?.startsWith('[USERNAME_CHANGE] ')) {
           playAudio('/action.mp3');
        } else if (newMsg.profile_id !== user.id) {
           if (newMsg.text && newMsg.text.toLowerCase().includes(`@${user.username.toLowerCase()}`)) {
              playAudio('/username.mp3');
           } else {
              playAudio('/message.mp3');
           }
        }
        
        fetchMessageAuthor(newMsg);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        if (payload?.old?.id) {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const updatedMsg = payload?.new as any;
        if (!updatedMsg) return;
        setMessages(prev => prev.map(m => {
          if (m.id === updatedMsg.id) {
            return {
              ...m,
              text: updatedMsg.text || "",
              image_url: updatedMsg.image_url,
            };
          }
          return m;
        }));
      })
      .subscribe();

    const handleBeforeUnload = () => {
       supabase.removeChannel(channel);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user.id, user.username]);

  // Dynamic custom ranks, announcements, notifications, and profiles fetch + real-time subscriptions
  useEffect(() => {
    // 1. Fetch custom ranks
    supabase
      .from('custom_ranks')
      .select('*')
      .order('priority', { ascending: true })
      .then(({ data }) => {
        if (data) setCustomRanks(data);
      });

    // 2. Fetch announcements
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data);
      });

    // 3. Fetch notifications for current user
    supabase
      .from('notifications')
      .select('*')
      .or(`target_id.is.null,target_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data);
      });

    // 4. Set up real-time subscriptions for notifications, custom_ranks, and announcements
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const newNotif = payload?.new;
        if (!newNotif) return;
        if (!newNotif.target_id || newNotif.target_id === user.id) {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadNotifications(true);
          playNotifySound();
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notifications' }, (payload) => {
        if (payload?.old?.id) {
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      })
      .subscribe();

    const customRanksChannel = supabase
      .channel('custom-ranks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_ranks' }, () => {
        supabase
          .from('custom_ranks')
          .select('*')
          .order('priority', { ascending: true })
          .then(({ data }) => {
            if (data) setCustomRanks(data);
          });
      })
      .subscribe();

    const announcementsChannel = supabase
      .channel('announcements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) setAnnouncements(data);
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(customRanksChannel);
      supabase.removeChannel(announcementsChannel);
    };
  }, [user.id]);

  const allRanksInfo = useMemo(() => {
    const ranks = { ...RANKS_INFO };
    customRanks.forEach((cr) => {
      ranks[cr.rank_key.toUpperCase()] = {
        name: cr.name,
        icon: cr.icon,
        priority: cr.priority,
        isStaff: cr.is_staff
      };
    });
    return ranks;
  }, [customRanks]);

  const fetchAllProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      setAllProfiles(data.map(p => {
        const isDev = p.email === 'dev@gmail.com';
        return {
          id: p.id,
          username: p.username,
          gender: p.gender || "Not specified",
          age: p.age || 0,
          pfp: p.pfp || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`,
          banner: p.banner,
          aboutMe: p.about_me,
          mood: p.mood,
          rank: mapDbRankToUserRank(p.rank),
          email: p.email,
          border: p.border || "none",
          borderThickness: p.border_thickness || "2px",
          is_muted: p.is_muted,
          mute_expires_at: p.mute_expires_at,
          cardBg: p.card_bg || "",
          coins: isDev ? 100000000 : (p.coins !== undefined ? p.coins : 1000),
          rubies: isDev ? 1000000 : (p.rubies !== undefined ? p.rubies : 10),
          total_xp: isDev ? 24975000 : (p.total_xp || 0),
          weekly_xp: isDev ? 24975000 : (p.weekly_xp || 0),
          monthly_xp: isDev ? 24975000 : (p.monthly_xp || 0),
          chat_background: p.chat_background || "",
          custom_status: p.custom_status || "online",
          custom_profile_enabled: p.custom_profile_enabled,
          profile_layout: p.profile_layout,
          profile_locked: p.profile_locked,
          profile_lock_count: p.profile_lock_count
        };
      }));
    }
  };

  const handleAddCustomRank = async () => {
    if (!newRankKey.trim() || !newRankName.trim() || !newRankIcon.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    const priorityNum = parseInt(newRankPriority);
    if (isNaN(priorityNum)) {
      alert("Priority must be a valid number.");
      return;
    }
    
    const { error } = await supabase.from('custom_ranks').insert({
      rank_key: newRankKey.toUpperCase().trim(),
      name: newRankName.trim(),
      icon: newRankIcon.trim(),
      priority: priorityNum,
      is_staff: newRankIsStaff
    });
    
    if (!error) {
      setNewRankKey("");
      setNewRankName("");
      setNewRankIcon("");
      setNewRankPriority("15");
      setNewRankIsStaff(false);
      alert("Custom rank added successfully!");
    } else {
      alert("Error adding custom rank: " + error.message);
    }
  };

  const handleDeleteCustomRank = async (id: string) => {
    const { error } = await supabase.from('custom_ranks').delete().eq('id', id);
    if (error) {
      alert("Error deleting custom rank: " + error.message);
    }
  };

  const handleSendGlobalNotification = async () => {
    if (!globalNotifText.trim()) return;
    
    const { error } = await supabase.from('notifications').insert({
      target_id: null,
      sender_id: user.id,
      sender_username: user.username,
      sender_pfp: user.pfp,
      sender_rank: user.rank,
      message: globalNotifText
    });
    
    if (!error) {
      setGlobalNotifText("");
      alert("Global notification broadcasted successfully!");
    } else {
      alert("Error broadcasting: " + error.message);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(username, pfp, rank, username_color, username_font, username_effect, username_format, message_color, message_font, message_effect, message_format)')
      .order('created_at', { ascending: true })
      .limit(50);

    if (data) {
      const formatted = data.map((m: any) => {
        const isSystem = typeof m.text === 'string' && m.text.startsWith('[SYSTEM]');
        return {
          id: m.id,
          profile_id: m.profile_id,
          username: m.profiles?.username || "Unknown",
          pfp: m.profiles?.pfp || "https://api.dicebear.com/7.x/adventurer/svg?seed=existence",
          text: isSystem && m.text ? m.text.replace('[SYSTEM]', '').trim() : (m.text || ""),
          image_url: m.image_url,
          time: m.created_at && !isNaN(new Date(m.created_at).getTime()) ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isSystem,
          rank: mapDbRankToUserRank(m.profiles?.rank),
          username_color: m.profiles?.username_color,
          username_font: m.profiles?.username_font,
          username_effect: m.profiles?.username_effect,
          username_format: m.profiles?.username_format,
          message_color: m.profiles?.message_color,
          message_font: m.profiles?.message_font,
          message_effect: m.profiles?.message_effect,
          message_format: m.profiles?.message_format
        };
      });
      setMessages(formatted);
    }
  };

  const fetchMessageAuthor = async (rawMsg: any) => {
    if (!rawMsg) return;

    let profileData: any = null;
    if (rawMsg.profile_id) {
      const { data } = await supabase
        .from('profiles')
        .select('username, pfp, rank, username_color, username_font, username_effect, username_format, message_color, message_font, message_effect, message_format')
        .eq('id', rawMsg.profile_id)
        .single();
      profileData = data;
    }

    const username = profileData?.username || rawMsg.username || "Unknown";
    const pfp = profileData?.pfp || rawMsg.pfp || "https://api.dicebear.com/7.x/adventurer/svg?seed=existence";
    const rawText = rawMsg.text || "";
    const isSystem = typeof rawText === 'string' && rawText.startsWith('[SYSTEM]');
    
    const rawTime = rawMsg.created_at ? new Date(rawMsg.created_at) : new Date();
    const formattedTime = isNaN(rawTime.getTime()) 
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
      : rawTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formattedMsg: Message = {
      id: rawMsg.id,
      profile_id: rawMsg.profile_id || null,
      username,
      pfp,
      text: isSystem && typeof rawText === 'string' ? rawText.replace('[SYSTEM]', '').trim() : rawText,
      image_url: rawMsg.image_url || null,
      time: formattedTime,
      isSystem,
      rank: mapDbRankToUserRank(profileData?.rank || rawMsg.rank || 'VIP'),
      username_color: profileData?.username_color || rawMsg.username_color,
      username_font: profileData?.username_font || rawMsg.username_font,
      username_effect: profileData?.username_effect || rawMsg.username_effect,
      username_format: profileData?.username_format || rawMsg.username_format,
      message_color: profileData?.message_color || rawMsg.message_color,
      message_font: profileData?.message_font || rawMsg.message_font,
      message_effect: profileData?.message_effect || rawMsg.message_effect,
      message_format: profileData?.message_format || rawMsg.message_format
    };

    setMessages(prev => {
      if (typeof rawText === 'string' && rawText.startsWith('[SYSTEM] Chat cleared by')) {
        return [formattedMsg];
      }
      const next = [
        ...prev.filter(m => 
          m && m.id !== formattedMsg.id && 
          !(m.id && typeof m.id === 'string' && m.id.startsWith('temp-') && 
            (m.profile_id === formattedMsg.profile_id || (m.username === formattedMsg.username && m.profile_id === null)) && 
            (m.text || "").trim() === (formattedMsg.text || "").trim() && 
            (m.image_url || null) === (formattedMsg.image_url || null))
        ), 
        formattedMsg
      ];
      return next.slice(-500); // Wipe history after 500
    });
  };

  // 2. Online List logic & Presence
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const mapDbProfileToOnlineUser = (p: any): OnlineUser => {
    const isDev = p.email === 'dev@gmail.com';
    return {
      id: p.id,
      username: p.username,
      gender: p.gender || "Not specified",
      age: p.age || 0,
      pfp: p.pfp || `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.username}`,
      banner: p.banner,
      aboutMe: p.about_me,
      mood: p.mood,
      createdDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      language: p.language,
      currentRoom: p.current_room,
      rank: mapDbRankToUserRank(p.rank),
      likes: p.likes || 0,
      border: p.border || "none",
      borderThickness: p.border_thickness || "2px",
      is_muted: p.is_muted,
      mute_expires_at: p.mute_expires_at,
      cardBg: p.card_bg || "",
      email: p.email,
      coins: isDev ? 100000000 : (p.coins !== undefined ? p.coins : 1000),
      rubies: isDev ? 1000000 : (p.rubies !== undefined ? p.rubies : 10),
      total_xp: isDev ? 24975000 : (p.total_xp || 0),
      weekly_xp: isDev ? 24975000 : (p.weekly_xp || 0),
      monthly_xp: isDev ? 24975000 : (p.monthly_xp || 0),
      chat_background: p.chat_background || "",
      custom_status: p.custom_status || "online",
      custom_profile_enabled: p.custom_profile_enabled,
      profile_layout: p.profile_layout,
      profile_locked: p.profile_locked,
      profile_lock_count: p.profile_lock_count,
      isSystem: false,
      isCurrentUser: user && p.id === user.id,
      status: 'offline' // Overridden by computedUsers dynamically
    };
  };

  useEffect(() => {
    fetchOnlineUsers();
    
    // Subscribe to all profile changes (INSERT, UPDATE, DELETE) in real-time
    const profileChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload: any) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          const newUser = mapDbProfileToOnlineUser(payload.new);
          setOnlineUsers(prev => {
            if (prev.some(u => u.id === newUser.id)) return prev;
            const updatedList = [...prev, newUser];
            
            // Re-sort the list: Rank priority first, then username alphabetical
            return updatedList.sort((a, b) => {
              const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
              if (rankDiff !== 0) return rankDiff;
              return a.username.localeCompare(b.username);
            });
          });
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setOnlineUsers(prev => {
            const updatedList = prev.map(u => 
              u.id === payload.new.id ? { 
                ...u, 
                username: payload.new.username !== undefined ? payload.new.username : u.username,
                pfp: payload.new.pfp !== undefined ? payload.new.pfp : u.pfp,
                banner: payload.new.banner !== undefined ? payload.new.banner : u.banner,
                aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : u.aboutMe,
                mood: payload.new.mood !== undefined ? payload.new.mood : u.mood,
                age: payload.new.age !== undefined ? payload.new.age : u.age,
                gender: payload.new.gender !== undefined ? payload.new.gender : u.gender,
                rank: mapDbRankToUserRank(payload.new.rank),
                likes: payload.new.likes !== undefined ? payload.new.likes : u.likes,
                border: payload.new.border !== undefined ? payload.new.border : u.border,
                borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : u.borderThickness,
                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : u.is_muted,
                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : u.mute_expires_at,
                cardBg: payload.new.card_bg !== undefined ? payload.new.card_bg : u.cardBg,
                username_color: payload.new.username_color !== undefined ? payload.new.username_color : u.username_color,
                username_font: payload.new.username_font !== undefined ? payload.new.username_font : u.username_font,
                username_effect: payload.new.username_effect !== undefined ? payload.new.username_effect : u.username_effect,
                username_format: payload.new.username_format !== undefined ? payload.new.username_format : u.username_format,
                message_color: payload.new.message_color !== undefined ? payload.new.message_color : u.message_color,
                message_font: payload.new.message_font !== undefined ? payload.new.message_font : u.message_font,
                message_effect: payload.new.message_effect !== undefined ? payload.new.message_effect : u.message_effect,
                message_format: payload.new.message_format !== undefined ? payload.new.message_format : u.message_format
              } : u
            );
            
            // Re-sort the list in case username or rank changed
            return updatedList.sort((a, b) => {
              const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
              if (rankDiff !== 0) return rankDiff;
              return a.username.localeCompare(b.username);
            });
          });
          
          if (user && payload.new.id === user.id) {
            onUpdateUserRef.current({
              username: payload.new.username !== undefined ? payload.new.username : user.username,
              pfp: payload.new.pfp !== undefined ? payload.new.pfp : user.pfp,
              banner: payload.new.banner !== undefined ? payload.new.banner : user.banner,
              aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : user.aboutMe,
              mood: payload.new.mood !== undefined ? payload.new.mood : user.mood,
              age: payload.new.age !== undefined ? payload.new.age : user.age,
              gender: payload.new.gender !== undefined ? payload.new.gender : user.gender,
              rank: mapDbRankToUserRank(payload.new.rank),
              border: payload.new.border !== undefined ? payload.new.border : user.border,
              borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : user.borderThickness,
              is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : user.is_muted,
              mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : user.mute_expires_at,
              cardBg: payload.new.card_bg !== undefined ? payload.new.card_bg : user.cardBg,
              username_color: payload.new.username_color !== undefined ? payload.new.username_color : user.username_color,
              username_font: payload.new.username_font !== undefined ? payload.new.username_font : user.username_font,
              username_effect: payload.new.username_effect !== undefined ? payload.new.username_effect : user.username_effect,
              username_format: payload.new.username_format !== undefined ? payload.new.username_format : user.username_format,
              message_color: payload.new.message_color !== undefined ? payload.new.message_color : user.message_color,
              message_font: payload.new.message_font !== undefined ? payload.new.message_font : user.message_font,
              message_effect: payload.new.message_effect !== undefined ? payload.new.message_effect : user.message_effect,
              message_format: payload.new.message_format !== undefined ? payload.new.message_format : user.message_format
            });
          }

          setProfileTarget(prev => {
            if (prev && prev.id === payload.new.id) {
              return {
                ...prev,
                username: payload.new.username !== undefined ? payload.new.username : prev.username,
                pfp: payload.new.pfp !== undefined ? payload.new.pfp : prev.pfp,
                banner: payload.new.banner !== undefined ? payload.new.banner : prev.banner,
                aboutMe: payload.new.about_me !== undefined ? payload.new.about_me : prev.aboutMe,
                mood: payload.new.mood !== undefined ? payload.new.mood : prev.mood,
                age: payload.new.age !== undefined ? payload.new.age : prev.age,
                gender: payload.new.gender !== undefined ? payload.new.gender : prev.gender,
                rank: mapDbRankToUserRank(payload.new.rank),
                likes: payload.new.likes !== undefined ? payload.new.likes : prev.likes,
                border: payload.new.border !== undefined ? payload.new.border : prev.border,
                borderThickness: payload.new.border_thickness !== undefined ? payload.new.border_thickness : prev.borderThickness,
                is_muted: payload.new.is_muted !== undefined ? payload.new.is_muted : prev.is_muted,
                mute_expires_at: payload.new.mute_expires_at !== undefined ? payload.new.mute_expires_at : prev.mute_expires_at,
                cardBg: payload.new.card_bg !== undefined ? payload.new.card_bg : prev.cardBg,
                username_color: payload.new.username_color !== undefined ? payload.new.username_color : prev.username_color,
                username_font: payload.new.username_font !== undefined ? payload.new.username_font : prev.username_font,
                username_effect: payload.new.username_effect !== undefined ? payload.new.username_effect : prev.username_effect,
                username_format: payload.new.username_format !== undefined ? payload.new.username_format : prev.username_format,
                message_color: payload.new.message_color !== undefined ? payload.new.message_color : prev.message_color,
                message_font: payload.new.message_font !== undefined ? payload.new.message_font : prev.message_font,
                message_effect: payload.new.message_effect !== undefined ? payload.new.message_effect : prev.message_effect,
                message_format: payload.new.message_format !== undefined ? payload.new.message_format : prev.message_format
              };
            }
            return prev;
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setOnlineUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    // Supabase Presence
    const presenceChannel = supabase.channel('online-users', {
      config: { presence: { key: user.id } }
    });

    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const ids = new Set<string>();
      for (const id in state) {
        ids.add(id);
      }
      setOnlineUserIds(ids);
    }).on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // Silenced join events as requested
    }).on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // Silenced leave events as requested
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && user) {
        await presenceChannel.track({ username: user.username, online_at: new Date().toISOString() });
      }
    });

    const handleBeforeUnloadPresence = () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
    window.addEventListener('beforeunload', handleBeforeUnloadPresence);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnloadPresence);
      supabase.removeChannel(profileChannel);
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [user.id]);

  const fetchOnlineUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (data) {
      const formatted: OnlineUser[] = data.map(mapDbProfileToOnlineUser);

      // Sort: Rank priority first, then username alphabetical
      const sorted = formatted.sort((a, b) => {
        const rankDiff = (allRanksInfo[a.rank]?.priority ?? 14) - (allRanksInfo[b.rank]?.priority ?? 14);
        if (rankDiff !== 0) return rankDiff;
        return a.username.localeCompare(b.username);
      });

      setOnlineUsers(sorted);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const incrementXp = async () => {
    if (user.email === 'dev@gmail.com') return;

    const currentXp = user.total_xp || 0;
    const newXp = currentXp + 1;
    const newWeeklyXp = (user.weekly_xp || 0) + 1;
    const newMonthlyXp = (user.monthly_xp || 0) + 1;

    const { level: oldLevel } = getLevelFromXp(currentXp);
    const { level: newLevel } = getLevelFromXp(newXp);

    const updates: any = {
      total_xp: newXp,
      weekly_xp: newWeeklyXp,
      monthly_xp: newMonthlyXp
    };

    onUpdateUser(updates);

    await supabase.from('profiles').update(updates).eq('id', user.id);

    if (newLevel > oldLevel) {
      await supabase.from('notifications').insert({
        target_id: user.id,
        message: "You leveled up!"
      });
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (user.is_muted && user.mute_expires_at) {
      const muteEnd = new Date(user.mute_expires_at).getTime();
      const now = new Date().getTime();
      if (muteEnd > now) {
        alert(`You are muted. Reason: ${user.mute_reason || 'No reason'}`);
        return;
      } else {
        // Mute expired, update profile
        await supabase.from('profiles').update({ is_muted: false, mute_reason: null, mute_expires_at: null }).eq('id', user.id);
        onUpdateUser({ is_muted: false, mute_reason: undefined, mute_expires_at: undefined });
      }
    }

    const text = inputText.trim();
    if (!text) return;

    if (/@system\b/i.test(text)) {
      alert("You cannot mention the System Bot.");
      return;
    }
    
    setInputText("");

    const addLocalSystemMessage = (textStr: string) => {
      const localMsg: Message = {
        id: "local-sys-" + Date.now() + Math.random(),
        profile_id: "system",
        username: "System",
        pfp: "https://api.dicebear.com/7.x/bottts/svg?seed=system",
        text: textStr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
        rank: 'DEVELOPER'
      };
      setMessages(prev => [...prev, localMsg]);
    };

    if (text.startsWith('/')) {
      const parts = text.split(' ').filter(Boolean);
      const cmd = parts[0].toLowerCase();
      
      const knownCommands = ['/commands', '/clear', '/rank', '/allin', '/dice'];
      if (!knownCommands.includes(cmd)) {
        addLocalSystemMessage(`Unknown command "${cmd}". Type /commands to see all available commands.`);
        return;
      }

      if (cmd === '/commands') {
        addLocalSystemMessage(
          `📜 Chat Commands List:\n` +
          `• /commands - Show this help list (only visible to you).\n` +
          `• /clear - Clear your chat screen locally.\n` +
          `• /rank - Show your current rank and balance details.\n` +
          `• /allin [gold/rubies] - Bet ALL your Gold or Rubies for a multiplier up to x1000!\n` +
          `• /dice [gold/rubies] [amount] - Roll 1-6. Lands on 6 wins up to x1000 multiplier!`
        );
        return;
      }

      if (cmd === '/clear') {
        const userPriority = allRanksInfo[user.rank]?.priority ?? 14;
        const isFounderOrAbove = userPriority <= 2;

        if (isFounderOrAbove) {
          await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('messages').insert([
            {
              profile_id: user.id,
              text: `[SYSTEM] Chat cleared by: ${user.username}`,
              room: 'main'
            }
          ]);
          playAudio('/clear.mp3');
        } else {
          addLocalSystemMessage("You do not have permission to clear the chat. (Founder and above only)");
        }
        return;
      }

      if (cmd === '/rank') {
        if (user.rank === 'DEVELOPER' && parts.length >= 3) {
          const targetUsername = parts[1];
          const newRank = parts[2].toUpperCase();
          if (['USER', 'STAFF', 'DEVELOPER'].includes(newRank)) {
            const { error } = await supabase.from('profiles').update({ rank: newRank }).ilike('username', targetUsername);
            
            await supabase.from('messages').insert({
              profile_id: user.id,
              text: error 
                ? `[SYSTEM] Error updating rank for ${targetUsername}: ${error.message}` 
                : `[SYSTEM] ${targetUsername}'s rank has been updated to ${newRank} by ${user.username}`,
              room: 'main'
            });
            return;
          }
        } else {
          addLocalSystemMessage(
            `📊 Profile Status:\n` +
            `• User: ${user.username}\n` +
            `• Rank: ${user.rank || 'USER'}\n` +
            `• Gold Coins: ${(user.coins ?? 1000).toLocaleString()}\n` +
            `• Rubies: ${(user.rubies ?? 10).toLocaleString()}`
          );
        }
        return;
      }

      if (cmd === '/allin') {
        const currency = (parts[1] || '').toLowerCase();
        if (currency !== 'gold' && currency !== 'rubies') {
          addLocalSystemMessage('Usage: /allin [gold/rubies]');
          return;
        }

        const balance = currency === 'gold' ? (user.coins ?? 1000) : (user.rubies ?? 10);
        if (balance <= 0) {
          addLocalSystemMessage(`You do not have any ${currency} to go all-in!`);
          return;
        }

        const betAmount = balance;
        const winRoll = Math.random();
        const won = winRoll < 0.45; // 45% win chance

        let multiplier = 0;
        let payout = 0;

        if (won) {
          const multRoll = Math.random();
          if (multRoll < 0.75) {
            multiplier = 1.5 + Math.random() * 0.5;
          } else if (multRoll < 0.93) {
            multiplier = 2.1 + Math.random() * 2.9;
          } else if (multRoll < 0.98) {
            multiplier = 5.0 + Math.random() * 15.0;
          } else if (multRoll < 0.998) {
            multiplier = 20.0 + Math.random() * 80.0;
          } else {
            multiplier = 100.0 + Math.random() * 900.0;
          }
          multiplier = Math.round(multiplier * 10) / 10;
          payout = Math.floor(betAmount * multiplier);
        }

        const newBalance = balance - betAmount + payout;

        if (currency === 'gold') {
          await onUpdateUser({ coins: newBalance });
        } else {
          await onUpdateUser({ rubies: newBalance });
        }

        const serialized = `[GAMBLE]:${JSON.stringify({
          command: `/allin ${currency}`,
          currency,
          bet: betAmount,
          won,
          payout,
          multiplier
        })}`;

        const { error } = await supabase.from('messages').insert({
          profile_id: user.id,
          text: serialized,
          room: 'main'
        });

        if (!error) {
          await incrementXp();
        } else {
          console.error("Gamble insert error:", error);
        }
        return;
      }

      if (cmd === '/dice') {
        const currency = (parts[1] || '').toLowerCase();
        if (currency !== 'gold' && currency !== 'rubies') {
          addLocalSystemMessage('Usage: /dice [gold/rubies] [amount]');
          return;
        }

        const amountStr = (parts[2] || '').toLowerCase();
        if (!amountStr) {
          addLocalSystemMessage('Usage: /dice [gold/rubies] [amount]');
          return;
        }

        const balance = currency === 'gold' ? (user.coins ?? 1000) : (user.rubies ?? 10);
        let betAmount = 0;
        if (amountStr === 'all' || amountStr === 'allin') {
          betAmount = balance;
        } else {
          betAmount = parseInt(amountStr, 10);
          if (isNaN(betAmount) || betAmount <= 0) {
            addLocalSystemMessage('Please specify a valid positive amount or "all".');
            return;
          }
        }

        if (betAmount > balance) {
          addLocalSystemMessage(`Insufficient funds! You only have ${balance.toLocaleString()} ${currency}.`);
          return;
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        const won = roll === 6;

        let multiplier = 0;
        let payout = 0;

        if (won) {
          const multRoll = Math.random();
          if (multRoll < 0.75) {
            multiplier = 3.0 + Math.random() * 2.0;
          } else if (multRoll < 0.93) {
            multiplier = 5.1 + Math.random() * 9.9;
          } else if (multRoll < 0.98) {
            multiplier = 15.0 + Math.random() * 35.0;
          } else if (multRoll < 0.998) {
            multiplier = 50.0 + Math.random() * 150.0;
          } else {
            multiplier = 200.0 + Math.random() * 800.0;
          }
          multiplier = Math.round(multiplier * 10) / 10;
          payout = Math.floor(betAmount * multiplier);
        }

        const newBalance = balance - betAmount + payout;

        if (currency === 'gold') {
          await onUpdateUser({ coins: newBalance });
        } else {
          await onUpdateUser({ rubies: newBalance });
        }

        const serialized = `[GAMBLE]:${JSON.stringify({
          command: `/dice ${currency} ${betAmount}`,
          currency,
          bet: betAmount,
          roll,
          won,
          payout,
          multiplier
        })}`;

        const { error } = await supabase.from('messages').insert({
          profile_id: user.id,
          text: serialized,
          room: 'main'
        });

        if (!error) {
          await incrementXp();
        } else {
          console.error("Gamble insert error:", error);
        }
        return;
      }
    }

    const optimisticMsg: Message = {
      id: "temp-" + Date.now(),
      profile_id: user.id,
      username: user.username,
      pfp: user.pfp,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rank: user.rank,
      username_color: user.username_color,
      username_font: user.username_font,
      username_effect: user.username_effect,
      username_format: user.username_format,
      message_color: user.message_color,
      message_font: user.message_font,
      message_effect: user.message_effect,
      message_format: user.message_format
    };
    setMessages(prev => [...prev, optimisticMsg]);

    const { error } = await supabase.from('messages').insert({
      profile_id: user.id,
      text: text,
      room: 'main'
    });
    if (!error) {
      await incrementXp();
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local object URL for instant local feedback
    const localUrl = URL.createObjectURL(file);
    const tempId = "temp-" + Date.now();

    const optimisticMsg: Message = {
      id: tempId,
      profile_id: user.id,
      username: user.username,
      pfp: user.pfp,
      text: "",
      image_url: localUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rank: user.rank,
      username_color: user.username_color,
      username_font: user.username_font,
      username_effect: user.username_effect,
      username_format: user.username_format,
      message_color: user.message_color,
      message_font: user.message_font,
      message_effect: user.message_effect,
      message_format: user.message_format
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      // Upload file to Supabase storage (or fallback base64 if not configured)
      const imageUrl = await uploadImageToStorage(file, 'chat', file.name);

      const { error } = await supabase.from('messages').insert({
        profile_id: user.id,
        text: " ",
        image_url: imageUrl,
        room: 'main'
      });
      
      if (!error) {
        await incrementXp();
      }
    } catch (err) {
      console.error("Failed to upload image:", err);
      // Remove the optimistic message if upload fails completely
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      // Clean up local object URL
      try {
        URL.revokeObjectURL(localUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleProfileClick = (target: UserProfile, mode: "quick" | "view" | "edit" = "quick") => {
    setProfileTarget(target);
    setProfileMode(mode);

    if (target && target.id !== user.id && user.id && user.id !== "system" && !user.isSystem) {
      supabase.from("profile_visits").insert({
        profile_id: target.id,
        visitor_id: user.id,
        visitor_username: user.username,
        visitor_pfp: user.pfp || "",
        visitor_rank: user.rank || "USER",
        created_at: new Date().toISOString()
      }).then(({ error }) => {
        if (error) console.error("Error logging profile visit:", error);
      });
    }
  };

  const handleMention = (username: string) => {
    setInputText((prev) => (prev ? `${prev} @${username}` : `@${username} `));
  };

  const renderMessageText = (text: string, currentUsername: string) => {
    if (!text) return null;
    const parts = text.split(new RegExp(`(@${currentUsername})\\b`, 'gi'));
    return parts.map((part, i) => {
      if (part.toLowerCase() === `@${currentUsername.toLowerCase()}`) {
        return <span key={i} className="bg-yellow-400/20 text-yellow-400 px-1 py-0.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.2)] font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const getGiftStyleConfig = (styleName: string) => {
    switch (styleName) {
      case "Royal":
        return {
          cardBg: "from-purple-900/60 to-indigo-950/80 border-purple-500/40",
          boxColor: "text-purple-400",
          boxBg: "bg-purple-900/30 border-purple-500/30",
          glow: "shadow-purple-500/10",
          ribbonColor: "bg-purple-500",
          accentEmoji: "🎁",
        };
      case "Neon":
        return {
          cardBg: "from-fuchsia-950/60 to-cyan-950/80 border-fuchsia-500/40 shadow-[0_0_15px_rgba(236,72,153,0.15)]",
          boxColor: "text-cyan-400 animate-pulse",
          boxBg: "bg-cyan-900/30 border-cyan-500/30",
          glow: "shadow-cyan-500/20",
          ribbonColor: "bg-fuchsia-500",
          accentEmoji: "✨",
        };
      case "Candy":
        return {
          cardBg: "from-amber-950/60 to-red-950/80 border-amber-500/40",
          boxColor: "text-amber-400",
          boxBg: "bg-amber-900/30 border-amber-500/30",
          glow: "shadow-amber-500/10",
          ribbonColor: "bg-red-400",
          accentEmoji: "🍬",
        };
      case "Ice":
        return {
          cardBg: "from-sky-950/60 to-blue-950/80 border-sky-400/40",
          boxColor: "text-sky-300",
          boxBg: "bg-sky-900/30 border-sky-500/30",
          glow: "shadow-sky-400/10",
          ribbonColor: "bg-sky-400",
          accentEmoji: "❄️",
        };
      case "Dark":
        return {
          cardBg: "from-neutral-900/80 to-stone-950/90 border-stone-700/50",
          boxColor: "text-stone-400",
          boxBg: "bg-stone-900/30 border-stone-700/30",
          glow: "shadow-black/50",
          ribbonColor: "bg-stone-600",
          accentEmoji: "🕷️",
        };
      case "Gold":
        return {
          cardBg: "from-yellow-950/60 to-amber-950/80 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]",
          boxColor: "text-yellow-400 animate-bounce",
          boxBg: "bg-yellow-900/30 border-yellow-500/30",
          glow: "shadow-yellow-500/20",
          ribbonColor: "bg-yellow-500",
          accentEmoji: "🌟",
        };
      case "Love":
        return {
          cardBg: "from-red-950/60 to-pink-950/80 border-red-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
          boxColor: "text-rose-400",
          boxBg: "bg-rose-900/30 border-rose-500/30",
          glow: "shadow-rose-500/10",
          ribbonColor: "bg-rose-500",
          accentEmoji: "💖",
        };
      case "Classic":
      default:
        return {
          cardBg: "from-red-900/60 to-rose-950/80 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
          boxColor: "text-red-400",
          boxBg: "bg-red-900/30 border-red-500/30",
          glow: "shadow-red-500/10",
          ribbonColor: "bg-red-500",
          accentEmoji: "🎁",
        };
    }
  };

  const renderPoll = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[POLL]:', '').trim();
      const poll = JSON.parse(jsonStr);
      
      const question = poll.question || "Untitled Poll";
      const options = poll.options || [];
      const mode = poll.mode || "Normal - show voters";
      const duration = poll.duration || "1 hour";
      const votes = poll.votes || {};
      
      let totalVotes = 0;
      options.forEach((_: any, idx: number) => {
        const optVotes = votes[idx] || [];
        totalVotes += optVotes.length;
      });
      
      let userVotedOptionIndex = -1;
      options.forEach((_: any, idx: number) => {
        const optVotes = votes[idx] || [];
        if (optVotes.includes(user.username)) {
          userVotedOptionIndex = idx;
        }
      });

      const handleVote = async (optionIdx: number) => {
        const updatedVotes = { ...votes };
        
        options.forEach((_: any, idx: number) => {
          if (updatedVotes[idx]) {
            updatedVotes[idx] = updatedVotes[idx].filter((u: string) => u !== user.username);
          } else {
            updatedVotes[idx] = [];
          }
        });
        
        if (userVotedOptionIndex !== optionIdx) {
          updatedVotes[optionIdx].push(user.username);
        }
        
        const updatedPoll = { ...poll, votes: updatedVotes };
        const updatedText = `[POLL]:${JSON.stringify(updatedPoll)}`;
        
        setMessages(prev => prev.map(m => {
          if (m.id === msg.id) {
            return { ...m, text: updatedText };
          }
          return m;
        }));
        
        await supabase
          .from('messages')
          .update({ text: updatedText })
          .eq('id', msg.id);
      };

      return (
        <div className="mt-2 bg-[#120f26]/90 border border-purple-500/30 rounded-2xl p-4 max-w-md w-full shadow-2xl space-y-3.5 text-white animate-in zoom-in-95 duration-150">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <Vote className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white leading-snug break-words tracking-wide">{question}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 tracking-wider">
                  {mode}
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/5 text-purple-400 tracking-wider">
                  ⏱️ {duration}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {options.map((opt: string, idx: number) => {
              const optVotes = votes[idx] || [];
              const count = optVotes.length;
              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const hasVotedThis = userVotedOptionIndex === idx;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleVote(idx)}
                  className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    hasVotedThis
                      ? "border-purple-500 bg-purple-500/10 hover:bg-purple-500/20"
                      : "border-purple-900/20 bg-black/20 hover:border-purple-500/30 hover:bg-black/40 animate-none cursor-pointer"
                  }`}
                >
                  <div 
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-300 -z-10 ${
                      hasVotedThis ? "bg-purple-500/15" : "bg-purple-900/5"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                  
                  <div className="flex justify-between items-center w-full z-10">
                    <span className={`text-xs font-bold leading-normal break-words pr-4 ${hasVotedThis ? "text-purple-300" : "text-white"}`}>
                      {opt}
                    </span>
                    <span className="text-xs font-black text-purple-400 shrink-0">
                      {pct}% <span className="text-[10px] text-purple-500 font-bold ml-1">({count})</span>
                    </span>
                  </div>
                  
                  {mode.toLowerCase().includes("show") && optVotes.length > 0 && (
                    <div className="text-[9px] text-purple-400/70 mt-1 font-semibold leading-normal break-words border-t border-purple-950/10 pt-1 w-full z-10">
                      Voters: {optVotes.join(", ")}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-purple-400/60 font-bold border-t border-purple-950/20 pt-2.5">
            <span>Total votes: {totalVotes}</span>
            {userVotedOptionIndex !== -1 && (
              <span className="text-purple-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> You voted
              </span>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Poll parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Room Poll.</p>;
    }
  };

  const renderGift = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[GIFT]:', '').trim();
      const gift = JSON.parse(jsonStr);
      
      const hiddenMsg = gift.message || "";
      const boxStyle = gift.boxStyle || "Classic";
      const viewers = gift.viewers || [];
      
      const styleConf = getGiftStyleConfig(boxStyle);
      const isViewer = viewers.includes(user.username);
      const viewCount = viewers.length;

      const handleOpenGift = async () => {
        if (isViewer) return;
        
        const updatedViewers = [...viewers, user.username];
        const updatedGift = { ...gift, viewers: updatedViewers };
        const updatedText = `[GIFT]:${JSON.stringify(updatedGift)}`;
        
        playNotifySound();

        setMessages(prev => prev.map(m => {
          if (m.id === msg.id) {
            return { ...m, text: updatedText };
          }
          return m;
        }));
        
        await supabase
          .from('messages')
          .update({ text: updatedText })
          .eq('id', msg.id);
      };

      return (
        <div 
          onClick={handleOpenGift}
          className={`mt-2 bg-gradient-to-br ${styleConf.cardBg} border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${
            !isViewer ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
          } flex flex-col items-center gap-3.5 select-none text-white`}
        >
          {!isViewer ? (
            <div className="flex flex-col items-center py-4 space-y-3.5 w-full">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-white/5 rounded-full blur-xl animate-pulse" />
                <span className="text-5xl drop-shadow-lg transform hover:scale-115 transition-transform duration-200">
                  {styleConf.accentEmoji}
                </span>
              </div>
              
              <div className="text-center">
                <p className="text-xs font-black tracking-widest text-white uppercase">
                  {boxStyle} Gift Box
                </p>
                <p className="text-[10px] text-purple-200/80 font-bold mt-1">
                  Click to unwrap & read the hidden message!
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center py-2 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-purple-300">
                <span>🔓 Revealed Gift Box ({boxStyle})</span>
              </div>
              
              <div className="w-full p-3 bg-black/40 border border-white/5 rounded-xl text-center shadow-inner">
                <p className="text-xs sm:text-sm font-extrabold text-white break-words leading-relaxed animate-in fade-in duration-300">
                  {hiddenMsg}
                </p>
              </div>
            </div>
          )}
          
          <div className="w-full flex justify-between items-center text-[10px] text-purple-300/60 font-black border-t border-white/5 pt-2">
            <span className="flex items-center gap-1 uppercase tracking-wide">
              👁️ Seen by {viewCount} {viewCount === 1 ? "person" : "people"}
            </span>
            {viewCount > 0 && (
              <span className="text-[9px] font-semibold text-purple-400/50 hover:text-purple-300/80 transition-colors" title={viewers.join(", ")}>
                Who seen?
              </span>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Gift parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Gift Box.</p>;
    }
  };

  const renderGamble = (msg: Message) => {
    try {
      const jsonStr = msg.text.replace('[GAMBLE]:', '').trim();
      const gamble = JSON.parse(jsonStr);

      const command = gamble.command || "/allin";
      const currency = gamble.currency || "gold";
      const bet = gamble.bet || 0;
      const roll = gamble.roll;
      const won = gamble.won;
      const payout = gamble.payout || 0;
      const multiplier = gamble.multiplier || 0;

      const isGold = currency.toLowerCase() === "gold";
      const currencyIcon = isGold ? (
        <Coins className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Sparkles className="w-4 h-4 text-pink-400 shrink-0 animate-pulse" />
      );

      const borderClass = won
        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 to-teal-950/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        : "border-rose-500/40 bg-gradient-to-br from-rose-950/40 to-red-950/60 shadow-[0_0_15px_rgba(244,63,94,0.15)]";

      const titleColor = won ? "text-emerald-400" : "text-rose-400";
      const badgeBg = won ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300";

      return (
        <div className={`mt-2 border rounded-2xl p-4 max-w-sm w-full shadow-2xl transition-all duration-300 ${borderClass} text-white space-y-3`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded-md text-purple-300 border border-purple-500/15">
              🎰 Casino Roll
            </span>
            <span className="text-xs font-mono font-bold text-purple-400/80">
              {command}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {/* Bet amount */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">BET:</span>
              <div className="flex items-center gap-1.5 font-black">
                <span className="font-mono">{bet.toLocaleString()}</span>
                {currencyIcon}
                <span className="text-[10px] text-purple-400 font-bold uppercase">({currency})</span>
              </div>
            </div>

            {/* Optional dice roll display */}
            {roll !== undefined && (
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-purple-300 uppercase tracking-wide">DICE ROLL:</span>
                <span className="font-black text-white font-mono text-sm bg-black/30 border border-white/5 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  🎲 {roll} {roll === 6 ? <span className="text-emerald-400 text-xs font-black">(Winner!)</span> : <span className="text-rose-400 text-xs font-black">(No Match)</span>}
                </span>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">WON/LOST:</span>
              <span className={`font-black uppercase text-xs px-2 py-0.5 rounded-md ${badgeBg}`}>
                {won ? "🎉 WON" : "💀 LOST"}
              </span>
            </div>

            {/* Amount won/lost */}
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">
                {won ? "WON:" : "LOST:"}
              </span>
              <div className={`flex items-center gap-1.5 font-black text-sm ${titleColor}`}>
                <span className="font-mono">
                  {won ? `+${(payout - bet).toLocaleString()}` : `-${bet.toLocaleString()}`}
                </span>
                {currencyIcon}
              </div>
            </div>

            {/* Multiplier */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-purple-300 uppercase tracking-wide">MULTIPLIER:</span>
              <span className={`font-black text-sm font-mono ${won ? "text-amber-300 animate-pulse" : "text-gray-500"}`}>
                {won ? `x${multiplier.toFixed(1)}` : "x0.0"}
              </span>
            </div>
          </div>
        </div>
      );
    } catch (err) {
      console.error("Gamble parse error:", err);
      return <p className="text-xs text-red-400 font-bold">Failed to render Gambling receipt.</p>;
    }
  };

  const toggleHideMessage = (msgId: string) => {
    setHiddenMessages(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
    setActiveMessageMenu(null);
  };

  const handleDeleteMessage = async (msgId: string) => {
    await supabase.from('messages').delete().eq('id', msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    setActiveMessageMenu(null);
  };

  const handleReplyMessage = (username: string) => {
    handleMention(username);
    setActiveMessageMenu(null);
    inputRef.current?.focus();
  };

  const computedUsers = useMemo(() => {
    // Determine the viewer's priority
    const viewerPriority = allRanksInfo[user.rank]?.priority ?? 14;
    const isViewerFounderOrAbove = viewerPriority <= 2;

    const list = onlineUsers
      .filter(u => {
        // If they are invisible
        if (u.custom_status === 'invisible') {
          // Only show to themselves and founder+
          return u.id === user.id || isViewerFounderOrAbove;
        }
        return true;
      })
      .map(u => {
        const isActive = onlineUserIds.has(u.id);
        const resolvedStatus = !isActive 
          ? 'offline' 
          : (u.custom_status === 'invisible' ? 'invisible' : (u.custom_status || 'online'));

        const baseUser = u.id === user.id ? { ...u, ...user } : u;
        return {
          ...baseUser,
          status: resolvedStatus as 'online' | 'offline' | 'away' | 'busy' | 'invisible'
        };
      });

    // Inject BOT_USER as always online
    if (!list.some(u => u.id === BOT_USER.id)) {
      list.push({
        ...BOT_USER,
        status: 'online'
      });
    }

    // Sort: Rank priority first, then username alphabetical
    return list.sort((a, b) => {
      const aPriority = allRanksInfo[a.rank]?.priority ?? 14;
      const bPriority = allRanksInfo[b.rank]?.priority ?? 14;
      const rankDiff = aPriority - bPriority;
      if (rankDiff !== 0) return rankDiff;
      return a.username.localeCompare(b.username);
    });
  }, [onlineUsers, onlineUserIds, allRanksInfo, user.id, user.rank]);

  const staffRanksList = useMemo(() => {
    // Collect all ranks where isStaff is true, sorted by priority ascending
    const ranks: { key: string; name: string; icon: string; priority: number }[] = [];
    
    // Default staff ranks from RANKS_INFO
    for (const key in RANKS_INFO) {
      if (RANKS_INFO[key].isStaff) {
        ranks.push({
          key,
          name: RANKS_INFO[key].name,
          icon: RANKS_INFO[key].icon,
          priority: RANKS_INFO[key].priority
        });
      }
    }
    
    // Custom staff ranks
    customRanks.forEach(r => {
      if (r.is_staff && !ranks.some(x => x.key === r.rank_key)) {
        ranks.push({
          key: r.rank_key,
          name: r.name,
          icon: r.icon,
          priority: Number(r.priority)
        });
      }
    });
    
    return ranks.sort((a, b) => a.priority - b.priority);
  }, [customRanks]);

  const staffGrouped = useMemo(() => {
    return staffRanksList.map(rankInfo => {
      const usersInRank = computedUsers.filter(u => u.rank === rankInfo.key);
      const sortedUsers = [...usersInRank].sort((a, b) => {
        if (a.status !== 'offline' && b.status === 'offline') return -1;
        if (a.status === 'offline' && b.status !== 'offline') return 1;
        return a.username.localeCompare(b.username);
      });
      return {
        ...rankInfo,
        users: sortedUsers
      };
    }).filter(group => group.users.length > 0);
  }, [staffRanksList, computedUsers]);

  const renderStatusBadge = (status: string, className = "w-3 h-3") => {
    if (status === 'offline') {
      return (
        <span className={`${className} bg-zinc-600 rounded-full inline-block shrink-0`} />
      );
    }
    if (status === 'invisible') {
      return (
        <span className={`${className} bg-[#52525b] border border-zinc-700 rounded-full inline-block shrink-0`} />
      );
    }
    const iconUrl = status === 'away' 
      ? 'https://drawspace.online/default_images/status/away.svg'
      : status === 'busy'
        ? 'https://drawspace.online/default_images/status/busy.svg'
        : 'https://drawspace.online/default_images/status/online.svg';

    return (
      <img 
        src={iconUrl} 
        alt={status} 
        className={`${className} object-contain shrink-0`} 
        referrerPolicy="no-referrer" 
      />
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    onUpdateUser({ custom_status: newStatus });
    await supabase.from('profiles').update({ custom_status: newStatus }).eq('id', user.id);
  };

  const getMessageStyle = (msg: Message, type: 'username' | 'message') => {
    const liveUser = msg.profile_id === user.id ? user : computedUsers.find(u => u.id === msg.profile_id);
    if (liveUser) {
       return {
          color: type === 'username' ? liveUser.username_color : liveUser.message_color,
          font: type === 'username' ? liveUser.username_font : liveUser.message_font,
          effect: type === 'username' ? liveUser.username_effect : liveUser.message_effect,
          format: type === 'username' ? liveUser.username_format : liveUser.message_format,
       };
    }
    return {
        color: type === 'username' ? msg.username_color : msg.message_color,
        font: type === 'username' ? msg.username_font : msg.message_font,
        effect: type === 'username' ? msg.username_effect : msg.message_effect,
        format: type === 'username' ? msg.username_format : msg.message_format,
    };
  };

  const getStyleClasses = (effect?: string, format?: string) => {
    let classes = "";
    if (format?.includes("bold")) classes += "font-bold ";
    if (format?.includes("italic")) classes += "italic ";
    if (effect === 'neon') classes += "drop-shadow-[0_0_8px_currentColor] ";
    if (effect === 'rainbow') classes += "animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent ";
    if (effect === 'pulse') classes += "animate-pulse ";
    return classes;
  };

  const getStyleInline = (color?: string, font?: string, effect?: string) => {
    return {
      color: effect !== 'rainbow' ? color : undefined,
      fontFamily: (!font || font === 'Default') ? undefined : `"${font}", sans-serif`
    };
  };

  const onlineList = computedUsers.filter(u => u.status !== 'offline');
  const offlineList = computedUsers.filter(u => u.status === 'offline');

  return (
    <div className="h-screen w-full bg-[#090714] text-purple-100 flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* Top Header Bar */}
      <header className="h-14 bg-[#0d0a1c] border-b border-purple-950/40 px-4 flex items-center justify-between z-30 shrink-0">
        
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-950/30 transition-all cursor-pointer"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <img
            src="/logo.png"
            alt="Purplewave Logo"
            className="h-10 sm:h-12 object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
          />
        </div>

        {/* Right Corner Icons & Pfp */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Action icon triggers (Only Online Panel toggle remains) */}
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <button 
              onClick={() => {
                setShowNotificationsModal(true);
                setUnreadNotifications(false);
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer relative ${
                showNotificationsModal 
                  ? "text-purple-300 bg-purple-900/30" 
                  : "text-purple-400 hover:text-white hover:bg-purple-950/20"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse border border-[#0d0a1c]" />
              )}
            </button>

            {/* Admin Panel Button (only for developer) */}
            {(user.email === 'dev@gmail.com' || user.email === 'haydensixseven@gmail.com' || user.email === 'haydensixsevennn@gmail.com' || user.email === 'test@gmail.com') && (
              <button 
                onClick={async () => {
                  setShowAdminModal(true);
                  await fetchAllProfiles();
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  showAdminModal 
                    ? "text-rose-400 bg-rose-950/30 border border-rose-500/20" 
                    : "text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                }`}
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}

            <button 
              onClick={() => {
                const next = !soundsEnabled;
                setSoundsEnabled(next);
                if (next) {
                  playAudio('/message.mp3');
                }
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${soundsEnabled ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20" : "text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"}`}
              title={soundsEnabled ? "Mute Sounds (Click to test/mute)" : "Unmute Sounds (Click to unmute/test)"}
            >
              {soundsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => setIsOnlinePanelOpen(!isOnlinePanelOpen)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${isOnlinePanelOpen ? "text-purple-300 bg-purple-900/30" : "text-purple-400 hover:text-white hover:bg-purple-950/20"}`}
              title="Toggle Online Users Panel"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>

          {/* User profile with green online status dot */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-purple-950/40">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-white max-w-[100px] truncate">{user.username}</span>
              <span className="text-[10px] text-purple-400">Age: {user.age}</span>
            </div>
            
            <div className="relative cursor-pointer" title="Your Profile">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileMenuView('default');
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                }}
                className="w-9 h-9 rounded-full bg-purple-900/50 border border-purple-500/40 p-0.5 overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={user.pfp}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0">
                {renderStatusBadge(user.custom_status || 'online', "w-3 h-3 border-2 border-[#090714] rounded-full shadow-lg")}
              </div>
              
              {isProfileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-[#161226] border border-purple-900/50 rounded-xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                    {profileMenuView === 'default' && (
                      <>
                        <div className="px-3 py-1.5 border-b border-purple-950/50">
                          <p className="text-[10px] uppercase tracking-wider text-purple-400">Signed in as</p>
                          <p className="text-xs font-bold text-white truncate">{user.username}</p>
                        </div>
                        
                        {/* Status Select Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileMenuView('status');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(user.custom_status || 'online', "w-3.5 h-3.5")}
                            <span>Status</span>
                          </div>
                          <span className="text-[10px] text-purple-400 capitalize">{user.custom_status || 'online'}</span>
                        </button>

                        {/* Edit Profile Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileMenuOpen(false);
                            handleProfileClick(user, "edit");
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          <span>Edit Profile</span>
                        </button>

                        {/* Wallet Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileMenuView('wallet');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                            <span>Wallet</span>
                          </div>
                          <span className="text-[10px] text-purple-400">Coins/Rubies</span>
                        </button>

                        {/* Chat Background Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileMenuOpen(false);
                            setChatBgError(null);
                            setShowChatBgModal(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Palette className="w-3.5 h-3.5 text-purple-400" />
                          <span>Chat Background</span>
                        </button>

                        {/* Logout Option */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors flex items-center gap-2 border-t border-purple-950/30 cursor-pointer relative z-50"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Logout
                        </button>
                      </>
                    )}

                    {profileMenuView === 'status' && (() => {
                      const viewerPriority = allRanksInfo[user.rank]?.priority ?? 14;
                      const isFounderAndAbove = viewerPriority <= 2;
                      return (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileMenuView('default');
                            }}
                            className="w-full px-3 py-1.5 border-b border-purple-950/50 text-left text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Status</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus('online');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                          >
                            <img src="https://drawspace.online/default_images/status/online.svg" className="w-4 h-4 object-contain shrink-0" alt="Online" referrerPolicy="no-referrer" />
                            <span className={user.custom_status === 'online' || !user.custom_status ? "font-bold text-white" : ""}>Online</span>
                            {(user.custom_status === 'online' || !user.custom_status) && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus('away');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                          >
                            <img src="https://drawspace.online/default_images/status/away.svg" className="w-4 h-4 object-contain shrink-0" alt="Away" referrerPolicy="no-referrer" />
                            <span className={user.custom_status === 'away' ? "font-bold text-white" : ""}>Away</span>
                            {user.custom_status === 'away' && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus('busy');
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                          >
                            <img src="https://drawspace.online/default_images/status/busy.svg" className="w-4 h-4 object-contain shrink-0" alt="Busy" referrerPolicy="no-referrer" />
                            <span className={user.custom_status === 'busy' ? "font-bold text-white" : ""}>Busy</span>
                            {user.custom_status === 'busy' && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                          </button>

                          {isFounderAndAbove && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus('invisible');
                                setIsProfileMenuOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-purple-200 hover:bg-purple-950/40 hover:text-white transition-colors flex items-center gap-2.5 cursor-pointer"
                            >
                              <span className="w-4 h-4 rounded-full bg-[#52525b] border border-zinc-700 flex-shrink-0" />
                              <span className={user.custom_status === 'invisible' ? "font-bold text-white" : ""}>Invisible</span>
                              {user.custom_status === 'invisible' && <Check className="w-3.5 h-3.5 ml-auto text-purple-400" />}
                            </button>
                          )}
                        </>
                      );
                    })()}

                    {profileMenuView === 'wallet' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileMenuView('default');
                          }}
                          className="w-full px-3 py-1.5 border-b border-purple-950/50 text-left text-xs font-bold text-purple-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Wallet</span>
                        </button>
                        
                        <div className="px-3 py-2.5 space-y-3">
                          {/* Coins / Gold */}
                          <div className="bg-black/30 border border-purple-950/40 p-2 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-400" />
                              <span className="text-xs text-purple-200">Gold Coins</span>
                            </div>
                            <span className="text-xs font-black text-amber-400 font-mono">
                              {(user.coins ?? 1000).toLocaleString()}
                            </span>
                          </div>

                          {/* Rubies */}
                          <div className="bg-black/30 border border-purple-950/40 p-2 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                              <span className="text-xs text-purple-200">Rubies</span>
                            </div>
                            <span className="text-xs font-black text-pink-400 font-mono">
                              {(user.rubies ?? 10).toLocaleString()}
                            </span>
                          </div>

                          {/* Convert Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsProfileMenuOpen(false);
                              setShowConvertModal(true);
                            }}
                            className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                          >
                            🔄 Exchange Currency
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Sidebar Menu Drawer */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative w-72 h-full bg-[#110d24] border-r border-purple-950/60 p-4 flex flex-col animate-in slide-in-from-left duration-250">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-950/40">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Purplewave Logo" className="h-8 object-contain" />
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-purple-400 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <button
                  onClick={() => { setActiveTab("staff"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === "staff" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-purple-300 hover:bg-purple-950/50 hover:text-white"}`}
                >
                  <Crown className="w-5 h-5 shrink-0" />
                  <span>Staff</span>
                </button>
                <button
                  onClick={() => { setActiveTab("rules"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === "rules" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-purple-300 hover:bg-purple-950/50 hover:text-white"}`}
                >
                  <RulesIcon className="w-5 h-5 shrink-0" />
                  <span>Rules</span>
                </button>
                <button
                  onClick={() => { setIsNewsOpen(prev => !prev); setActiveTab("chat"); setIsSidebarOpen(false); }}
                  className={`w-full text-left py-3 px-4 rounded-xl font-bold flex items-center gap-3 transition-all ${isNewsOpen ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20" : "text-purple-300 hover:bg-purple-950/50 hover:text-white"}`}
                >
                  <Newspaper className="w-5 h-5 shrink-0" />
                  <span>News</span>
                </button>
                {activeTab !== "chat" && (
                  <button
                    onClick={() => { setActiveTab("chat"); setIsSidebarOpen(false); }}
                    className="w-full text-left py-3 px-4 rounded-xl font-bold text-purple-400 hover:bg-purple-950/30 hover:text-white flex items-center gap-3 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 shrink-0" />
                    <span>Back to Chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* News Sidebar */}
        {isNewsOpen && activeTab === "chat" && (
          <NewsSidebar 
            user={user}
            onClose={() => setIsNewsOpen(false)}
            allRanksInfo={allRanksInfo}
            computedUsers={computedUsers}
            handleProfileClick={handleProfileClick}
          />
        )}

        {/* Center Screen */}
        <div 
          className="flex-1 flex flex-col min-w-0 bg-[#07050f] relative overflow-hidden"
          style={user.chat_background ? {
            backgroundImage: `url(${user.chat_background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : undefined}
        >
          {activeTab === "chat" ? (
            <>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Permanent Global Announcements */}
                {announcements.map((ann) => (
                  <div key={ann.id} className="bg-gradient-to-r from-purple-950/40 via-amber-950/40 to-purple-950/40 border-b border-amber-500/20 px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-black text-amber-200 tracking-wide text-center">{ann.text}</span>
                    </div>
                    {(user.email === 'dev@gmail.com' || user.email === 'haydensixseven@gmail.com' || user.email === 'haydensixsevennn@gmail.com' || user.email === 'test@gmail.com') && (
                      <button 
                        onClick={async () => {
                          await supabase.from('announcements').delete().eq('id', ann.id);
                        }}
                        className="text-purple-400 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                {messages.map((msg, index) => {
                  if (hiddenMessages.has(msg.id)) return null;
                  
                  if (msg.text?.startsWith('[USERNAME_CHANGE] ')) {
                    const changeText = msg.text.replace('[USERNAME_CHANGE] ', '').trim();
                    return (
                      <div key={msg.id} className="flex gap-2.5 px-4 py-2 border-b border-white/5 bg-purple-950/10 items-center justify-start animate-in fade-in duration-200">
                        <div 
                          className="w-7 h-7 rounded-none bg-purple-950/50 border border-purple-800/40 overflow-hidden shrink-0 shadow-sm cursor-pointer"
                          onClick={() => {
                            handleProfileClick(BOT_USER);
                          }}
                        >
                          <img src="https://musicvibe.io/default_images/avatar/default_system.png" alt="System Bot" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-1.5 flex-wrap">
                          <img 
                            src="https://musicvibe.io/default_images/rank/bot.svg" 
                            alt="Bot" 
                            className="h-3.5 w-auto object-contain shrink-0" 
                            referrerPolicy="no-referrer"
                            title="Bot"
                          />
                          <span 
                            onClick={() => {
                              handleProfileClick(BOT_USER);
                            }}
                            className="text-xs font-black text-rose-400 hover:underline cursor-pointer tracking-wide"
                          >
                            System
                          </span>
                          <span className="text-xs text-purple-200/90 font-bold">{changeText}</span>
                          <span className="text-[9px] text-purple-500 font-medium shrink-0 ml-1">{msg.time}</span>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`group flex gap-3 px-4 py-3 border-b border-white/5 relative ${msg.isSystem ? "bg-purple-950/20" : index % 2 === 0 ? "bg-[#161226]/80" : "bg-[#0d0a1c]/80"}`}
                    >
                      {!msg.isSystem && (
                        <div 
                          className="w-10 h-10 rounded-full bg-purple-950/50 border border-purple-800/40 overflow-hidden shrink-0 shadow-md cursor-pointer"
                          onClick={() => {
                            const foundUser = computedUsers.find(u => (msg.profile_id && u.id === msg.profile_id) || u.username === msg.username);
                            if (foundUser) handleProfileClick(foundUser);
                          }}
                        >
                          <img src={msg.pfp} alt={msg.username} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {msg.isSystem ? (
                          <p className="text-xs text-purple-300/90 leading-relaxed font-medium text-center">{msg.text}</p>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              {msg.rank && (
                                <img 
                                  src={allRanksInfo[msg.rank]?.icon || allRanksInfo['VIP'].icon} 
                                  alt={msg.rank} 
                                  className="h-3 w-auto object-contain shrink-0" 
                                  referrerPolicy="no-referrer"
                                  title={allRanksInfo[msg.rank]?.name || msg.rank}
                                />
                              )}
                              <span 
                                onClick={() => {
                                  const foundUser = computedUsers.find(u => (msg.profile_id && u.id === msg.profile_id) || u.username === msg.username);
                                  if (foundUser) handleProfileClick(foundUser);
                                }}
                                className={`text-sm font-bold hover:underline cursor-pointer transition-colors text-white ${getStyleClasses(getMessageStyle(msg, 'username').effect, getMessageStyle(msg, 'username').format)}`}
                                style={getStyleInline(getMessageStyle(msg, 'username').color, getMessageStyle(msg, 'username').font, getMessageStyle(msg, 'username').effect)}
                              >
                                {msg.username}
                              </span>
                              <span className="text-[10px] text-purple-500 font-medium ml-1 shrink-0">{msg.time}</span>
                            </div>
                            {msg.text?.startsWith('[POLL]:') ? (
                              renderPoll(msg)
                            ) : msg.text?.startsWith('[GIFT]:') ? (
                              renderGift(msg)
                            ) : msg.text?.startsWith('[GAMBLE]:') ? (
                              renderGamble(msg)
                            ) : msg.text && (
                              <p 
                                className={`text-sm text-purple-100 whitespace-pre-wrap break-words leading-relaxed ${getStyleClasses(getMessageStyle(msg, 'message').effect, getMessageStyle(msg, 'message').format)}`}
                                style={getStyleInline(getMessageStyle(msg, 'message').color, getMessageStyle(msg, 'message').font, getMessageStyle(msg, 'message').effect)}
                              >
                                {renderMessageText(msg.text, user.username)}
                              </p>
                            )}
                            {msg.image_url && (
                              <img src={msg.image_url} alt="Shared content" className="mt-2 max-w-xs rounded-lg border border-purple-500/20 shadow-lg" />
                            )}
                          </>
                        )}
                      </div>
                      
                      {!msg.isSystem && (
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="relative">
                            <button
                              onClick={() => setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id)}
                              className="p-1 text-purple-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {activeMessageMenu === msg.id && (
                              <div className="absolute right-0 top-8 w-32 bg-[#161226] border border-purple-900/50 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => handleReplyMessage(msg.username)}
                                  className="w-full px-3 py-1.5 text-left text-xs text-purple-200 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <Reply className="w-3.5 h-3.5" />
                                  <span className="font-bold">Quote</span>
                                </button>
                                <button
                                  onClick={() => toggleHideMessage(msg.id)}
                                  className="w-full px-3 py-1.5 text-left text-xs text-purple-200 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                >
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span className="font-bold">Hide</span>
                                </button>
                                {(msg.profile_id === user.id || user.rank === 'DEVELOPER') && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-white/5 hover:text-rose-300 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="font-bold">Delete</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Message Input Container */}
              <form onSubmit={handleSendMessage} className="p-4 bg-[#0d0a1c] border-t border-purple-950/40 shrink-0 relative">
                {showPlusOptions && (
                  <div className="absolute bottom-full left-4 mb-2 p-3 bg-[#161226] border border-purple-500/40 rounded-none shadow-2xl flex flex-col gap-2 min-w-[220px] animate-in slide-in-from-bottom-2 duration-200 z-50">
                    <p className="text-[10px] text-purple-400 uppercase font-black tracking-wider border-b border-purple-950/40 pb-1.5 mb-1 flex items-center justify-between">
                      <span>Options & Tools</span>
                      <button type="button" onClick={() => setShowPlusOptions(false)} className="text-purple-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </p>
                    
                    {/* Paint option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowPaintModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <Palette className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Paint Canvas</span>
                        <span className="text-[9px] text-purple-500">Draw & share on chat</span>
                      </div>
                    </button>

                    {/* Style Editor option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowStyleModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <Type className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Style Customizer</span>
                        <span className="text-[9px] text-purple-500">Change fonts, colors, neon</span>
                      </div>
                    </button>

                    

                    {/* Image option */}
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <Camera className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Upload Image</span>
                        <span className="text-[9px] text-purple-500">Post images to everyone</span>
                      </div>
                    </button>

                    
                    {/* Gallery option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowGallerySettingsModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Gallery</span>
                        <span className="text-[9px] text-purple-500">Manage your profile photos</span>
                      </div>
                    </button>

                    {/* Secret Message option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSecretMessageModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-purple-950/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group"
                    >
                      <Lock className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Secret Message</span>
                        <span className="text-[9px] text-purple-500">Anonymously whisper users</span>
                      </div>
                    </button>

                    {/* Secret Messages Box option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSecretMessagesListModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group mt-1"
                    >
                      <Unlock className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Secret Inbox</span>
                        <span className="text-[9px] text-purple-400">Read & manage secret whispers</span>
                      </div>
                    </button>

                    {/* Profile Visitors option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileVisitorsModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group mt-1"
                    >
                      <Eye className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Profile Visitors</span>
                        <span className="text-[9px] text-blue-400">See who viewed your profile</span>
                      </div>
                    </button>

                    {/* Profile Decor option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDecorModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group mt-1"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Profile Decor</span>
                        <span className="text-[9px] text-amber-400">Buy Borders & Effects</span>
                      </div>
                    </button>

                    {/* Poll option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowPollModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group mt-1"
                    >
                      <Vote className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Room Poll</span>
                        <span className="text-[9px] text-purple-400">Create interactive poll</span>
                      </div>
                    </button>

                    {/* Gift option */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowGiftModal(true);
                        setShowPlusOptions(false);
                      }}
                      className="flex items-center gap-2.5 px-2 py-1.5 bg-purple-950/30 hover:bg-purple-950/50 border border-purple-900/40 rounded-lg text-left text-xs text-purple-200 hover:text-white transition-all cursor-pointer group mt-1"
                    >
                      <Gift className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Gift Box</span>
                        <span className="text-[9px] text-purple-400">Wrap a message (5 Rubies)</span>
                      </div>
                    </button>
                  </div>
                )}
                {isEmojiPickerOpen && (
                  <div className="absolute bottom-full left-4 mb-2 p-2 bg-[#161226] border border-purple-900/50 rounded-xl shadow-2xl flex gap-2 flex-wrap max-w-xs animate-in zoom-in-95 duration-100">
                    {["😊", "😂", "🥰", "😎", "🤔", "🔥", "✨", "🙌", "💀", "😭", "👍", "❤️"].map(emoji => (
                      <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="text-xl hover:scale-125 transition-transform p-1">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                {inputText.startsWith('/') && (() => {
                  const currentTypedWord = inputText.split(' ')[0].toLowerCase();
                  const knownCommandsList = [
                    { cmd: '/commands', desc: 'Show available commands list', badge: 'Help' },
                    { cmd: '/clear', desc: 'Clear all messages globally', badge: 'Founder+' },
                    { cmd: '/rank', desc: 'View your rank & balance details', badge: 'Info' },
                    { cmd: '/allin', desc: 'Bet all your Gold or Rubies', badge: 'Gamble' },
                    { cmd: '/dice', desc: 'Roll a 1-6 dice to win multiplier', badge: 'Gamble' }
                  ];
                  const matchingCommands = knownCommandsList.filter(c => c.cmd.startsWith(currentTypedWord));
                  if (matchingCommands.length === 0) return null;

                  return (
                    <div className="absolute bottom-full left-4 right-4 mb-2 p-2 bg-[#161226]/95 border border-purple-500/40 rounded-xl shadow-2xl animate-in slide-in-from-bottom-2 duration-150 z-50 max-w-4xl mx-auto space-y-1">
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider px-2 py-1 border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Command Suggestions</span>
                        <span className="text-[9px] text-purple-500 normal-case">Click to auto-fill</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-0.5 animate-in fade-in duration-200">
                        {matchingCommands.map((c) => {
                          const userPriority = allRanksInfo[user.rank]?.priority ?? 14;
                          const isFounderOrAbove = userPriority <= 2;
                          const isDisabled = c.cmd === '/clear' && !isFounderOrAbove;
                          return (
                            <button
                              key={c.cmd}
                              type="button"
                              onClick={() => {
                                if (isDisabled) return;
                                setInputText(c.cmd + " ");
                                inputRef.current?.focus();
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                                isDisabled
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-purple-950/50 cursor-pointer active:scale-[0.99]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-purple-200">{c.cmd}</span>
                                <span className="text-xs text-purple-400/80">{c.desc}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                c.cmd === '/clear'
                                  ? isFounderOrAbove
                                    ? "bg-amber-500/20 text-amber-300 animate-pulse"
                                    : "bg-red-500/20 text-red-300"
                                  : "bg-purple-500/20 text-purple-300"
                              }`}>
                                {c.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                <div className="max-w-4xl mx-auto flex items-center bg-[#131024] border border-purple-950/50 rounded-full px-4 py-1.5 shadow-2xl focus-within:border-purple-600/60 transition-all duration-200">
                  <div className="flex items-center gap-1 sm:gap-2 text-purple-400 shrink-0 pr-2">
                    <button
                      type="button"
                      onClick={() => setShowPlusOptions(!showPlusOptions)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${showPlusOptions ? "bg-purple-900/40 text-white" : "hover:bg-purple-950/40 hover:text-white"}`}
                      title="Options"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${isEmojiPickerOpen ? "bg-purple-900/40 text-white" : "hover:bg-purple-950/40 hover:text-white"}`}
                      title="Insert Emoji"
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type here..."
                    className={`flex-1 bg-transparent border-none text-xs sm:text-sm placeholder-purple-500 focus:outline-none py-1.5 font-medium ${getStyleClasses(user.message_effect, user.message_format)}`}
                    style={getStyleInline(user.message_color, user.message_font, user.message_effect)}
                  />
                  <div className="flex items-center gap-1 text-purple-400 shrink-0 pl-2">
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-full transition-all flex items-center justify-center ${inputText.trim() ? "bg-purple-600 hover:bg-purple-500 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40" : "text-purple-600/40 cursor-not-allowed"}`}
                      title="Send Message"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </form>
            </>
          ) : activeTab === "staff" ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-purple-900/30 pb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-white">Staff Members</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                {computedUsers.filter(u => u.rank !== 'USER').map(staff => (
                  <div 
                    key={staff.username}
                    onClick={() => handleProfileClick(staff)}
                    className="p-4 bg-[#110d24] border border-purple-900/30 rounded-xl flex items-center gap-3 cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-500/30">
                      <img src={staff.pfp} className="w-full h-full object-cover" alt={staff.username} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{staff.username}</h3>
                      <p className={`text-xs font-semibold ${staff.rank === 'DEVELOPER' ? 'text-rose-500' : 'text-purple-400'}`}>{staff.rank}</p>
                      <p className="text-[11px] text-purple-400 mt-0.5">{staff.status === 'online' ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveTab("chat")} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors">Return to Chatroom</button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-purple-900/30 pb-4">
                <RulesIcon className="w-6 h-6 text-rose-500" />
                <h2 className="text-xl font-bold text-white">Community Rules</h2>
              </div>
              <div className="bg-[#110d24] border border-purple-900/30 rounded-xl p-5 max-w-2xl space-y-4">
                <div className="space-y-1"><h3 className="text-sm font-bold text-purple-300">1. Respect all chat members</h3><p className="text-xs text-purple-400 leading-relaxed">Treat others with courtesy and respect. Personal attacks, harassment, and discrimination of any kind are strictly forbidden.</p></div>
                <div className="space-y-1 pt-3 border-t border-purple-950/50"><h3 className="text-sm font-bold text-purple-300">2. No Spamming or Flooding</h3><p className="text-xs text-purple-400 leading-relaxed">Avoid posting the same message repeatedly, using excessive capital letters, or posting random text patterns that disturb the readability of the screen.</p></div>
                <div className="space-y-1 pt-3 border-t border-purple-950/50"><h3 className="text-sm font-bold text-purple-300">3. Underage Safety Policy</h3><p className="text-xs text-purple-400 leading-relaxed">Users of all permitted ages are present here. Ensure all conversation remains strictly appropriate, polite, and safe for minor members of our platform.</p></div>
                <div className="space-y-1 pt-3 border-t border-purple-950/50"><h3 className="text-sm font-bold text-purple-300">4. Free Customization Update</h3><p className="text-xs text-purple-400 leading-relaxed">All profile borders and visual effects have been made completely free for all users! Enjoy designing your unique profile without currency limits.</p></div>
              </div>
              <button onClick={() => setActiveTab("chat")} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors">Accept and Close Rules</button>
            </div>
          )}
        </div>

        {/* Right Side Panel */}
        {isOnlinePanelOpen && (
          <>
            <div className="md:hidden absolute inset-0 bg-black/60 backdrop-blur-xs z-10" onClick={() => setIsOnlinePanelOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 md:relative w-72 bg-[#0c0919] border-l border-purple-950/50 flex flex-col shrink-0 z-20 animate-in slide-in-from-right duration-200 shadow-2xl md:shadow-none">
              {/* Two switch buttons: Online and Staff */}
            <div className="grid grid-cols-2 p-1 bg-[#090714] border-b border-purple-950/40 gap-1 shrink-0">
              <button
                onClick={() => setRightPanelTab("online")}
                className={`py-2 text-[11px] font-black tracking-widest uppercase rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === "online"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                    : "text-purple-400 hover:text-white hover:bg-purple-950/30"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Online</span>
              </button>
              <button
                onClick={() => setRightPanelTab("staff")}
                className={`py-2 text-[11px] font-black tracking-widest uppercase rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightPanelTab === "staff"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-900/40"
                    : "text-purple-400 hover:text-white hover:bg-purple-950/30"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>
            </div>

            {/* Genders Online filter selector (Only shown in Online tab) */}
            {rightPanelTab === "online" && (
              <div className="px-3 py-1.5 bg-[#0e0a20] border-b border-purple-950/35 flex items-center justify-between gap-1 shrink-0">
                <span className="text-[9px] uppercase font-bold text-purple-400">Genders:</span>
                <div className="flex gap-1">
                  {(['ALL', 'MALE', 'FEMALE', 'OTHER'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                        genderFilter === g
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-900/30"
                          : "bg-purple-950/35 text-purple-400 hover:text-white"
                      }`}
                    >
                      {g === 'ALL' ? 'All' : g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {rightPanelTab === "online" ? (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] text-purple-500 uppercase font-bold tracking-widest px-2">Online</p>
                    {onlineList
                      .filter(u => genderFilter === 'ALL' || (u.gender && u.gender.toUpperCase() === genderFilter))
                      .map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleProfileClick(u)}
                          className={`p-2.5 rounded-none flex items-center justify-between transition-all cursor-pointer bg-[#120e24]/60 border ${u.isCurrentUser ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-[#1a1435]/40" : "border-purple-950/40 hover:border-purple-800/40"}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-none bg-purple-950/80 p-0.5 border border-purple-800/20 overflow-hidden shrink-0">
                                <img src={u.pfp} alt={u.username} className="w-full h-full rounded-none object-cover" />
                              </div>
                              <div className="absolute bottom-0 right-0">
                                {renderStatusBadge(u.status || 'online', "w-2.5 h-2.5 border-2 border-[#0c0919] rounded-full")}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span 
                                className={`text-xs font-bold text-white truncate max-w-[120px] flex items-center gap-1 ${getStyleClasses(u.username_effect, u.username_format)}`}
                                style={getStyleInline(u.username_color, u.username_font, u.username_effect)}
                              >
                                {u.username}
                                {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-purple-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <img 
                              src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon} 
                              alt={u.rank} 
                              className="h-3 w-auto object-contain" 
                            />
                          </div>
                        </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-purple-500 uppercase font-bold tracking-widest px-2">Offline</p>
                    {offlineList
                      .filter(u => genderFilter === 'ALL' || (u.gender && u.gender.toUpperCase() === genderFilter))
                      .map((u) => (
                        <div
                          key={u.id}
                          onClick={() => handleProfileClick(u)}
                          className="p-2.5 rounded-none flex items-center justify-between transition-all cursor-pointer bg-[#120e24]/30 border border-purple-950/20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-none bg-purple-950/80 p-0.5 border border-purple-800/20 overflow-hidden shrink-0">
                                <img src={u.pfp} alt={u.username} className="w-full h-full rounded-none object-cover" />
                              </div>
                              <div className="absolute bottom-0 right-0">
                                {renderStatusBadge(u.status || 'offline', "w-2.5 h-2.5 border-2 border-[#0c0919] rounded-full")}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <span 
                                className={`text-xs font-bold text-purple-200 truncate max-w-[120px] flex items-center gap-1 ${getStyleClasses(u.username_effect, u.username_format)}`}
                                style={getStyleInline(u.username_color, u.username_font, u.username_effect)}
                              >
                                {u.username}
                                {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-purple-400 italic truncate max-w-[120px] block">{u.mood || "No mood set"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <img 
                              src={allRanksInfo[u.rank]?.icon || allRanksInfo['VIP'].icon} 
                              alt={u.rank} 
                              className="h-3 w-auto object-contain" 
                            />
                          </div>
                        </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {staffGrouped.map((group) => (
                    <div key={group.key} className="space-y-2 border-b border-purple-950/20 pb-3 last:border-0">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-950/10 border border-purple-900/10">
                        <img 
                          src={group.icon} 
                          alt={group.name} 
                          className="h-3.5 object-contain" 
                        />
                        <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider">
                          {group.name}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {group.users.map((u) => {
                          const isOnline = u.status === 'online';
                          return (
                            <div
                              key={u.id}
                              onClick={() => handleProfileClick(u)}
                              className={`p-2 rounded-none flex items-center justify-between transition-all cursor-pointer border ${
                                isOnline 
                                  ? u.isCurrentUser 
                                    ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-[#1a1435]/40" 
                                    : "border-purple-950/40 hover:border-purple-800/40 bg-[#120e24]/60"
                                  : "border-purple-950/20 bg-[#120e24]/20 opacity-55 grayscale hover:grayscale-0 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-none bg-purple-950/80 p-0.5 border border-purple-800/20 overflow-hidden shrink-0">
                                    <img src={u.pfp} alt={u.username} className="w-full h-full rounded-none object-cover" />
                                  </div>
                                  <span className={`absolute bottom-0 right-0 w-2 h-2 border border-[#0c0919] rounded-full ${isOnline ? "bg-emerald-500" : "bg-gray-500"}`} />
                                </div>
                                <div className="min-w-0">
                                  <span 
                                    className={`text-[11px] font-bold truncate max-w-[120px] flex items-center gap-1 ${isOnline ? "text-white" : "text-purple-300"} ${getStyleClasses(u.username_effect, u.username_format)}`}
                                    style={getStyleInline(u.username_color, u.username_font, u.username_effect)}
                                  >
                                    {u.username}
                                    {u.is_muted && <Hand className="w-3 h-3 text-red-500" title="Muted" />}
                                  </span>
                                  {u.mood && (
                                    <span className="text-[8px] text-purple-400 italic truncate max-w-[120px] block">
                                      {u.mood}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {staffGrouped.length === 0 && (
                    <div className="p-4 text-center">
                      <p className="text-xs italic text-purple-400">No staff members configured</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </>
        )}
      </div>

      {profileTarget && (
        <ProfileModal
          soundsEnabled={soundsEnabled}
          targetUser={profileTarget}
          currentUser={user}
          mode={profileMode}
          onClose={() => setProfileTarget(null)}
          onEdit={() => setProfileMode("edit")}
          onView={() => setProfileMode("view")}
          onMention={handleMention}
          ranksInfo={allRanksInfo}
          onUpdate={async (updated: any) => {
            const mapped: any = {};
            if ('username' in updated) mapped.username = updated.username;
            if ('age' in updated) mapped.age = updated.age;
            if ('gender' in updated) mapped.gender = updated.gender;
            if ('pfp' in updated) mapped.pfp = updated.pfp;
            if ('banner' in updated) mapped.banner = updated.banner === undefined ? null : updated.banner;
            if ('aboutMe' in updated) mapped.about_me = updated.aboutMe === undefined ? null : updated.aboutMe;
            if ('mood' in updated) mapped.mood = updated.mood === undefined ? null : updated.mood;
            if ('language' in updated) mapped.language = updated.language;
            if ('currentRoom' in updated) mapped.current_room = updated.currentRoom;
            if ('border' in updated) mapped.border = updated.border === undefined ? null : updated.border;
            if ('borderThickness' in updated) mapped.border_thickness = updated.borderThickness === undefined ? null : updated.borderThickness;
            if ('cardBg' in updated) mapped.card_bg = updated.cardBg === undefined ? null : updated.cardBg;
            if ('likes' in updated) mapped.likes = updated.likes;
            if ('rank' in updated) mapped.rank = updated.rank;
            if ('effect' in updated) mapped.effect = updated.effect;
            if ('custom_profile_enabled' in updated) mapped.custom_profile_enabled = updated.custom_profile_enabled;
            if ('profile_layout' in updated) mapped.profile_layout = updated.profile_layout;
            if ('profile_locked' in updated) mapped.profile_locked = updated.profile_locked;
            if ('profile_lock_count' in updated) mapped.profile_lock_count = updated.profile_lock_count;
            if ('coins' in updated) mapped.coins = updated.coins;
            if ('rubies' in updated) mapped.rubies = updated.rubies;

            const oldUsername = profileTarget.username;
            const { error } = await supabase.from('profiles').update(mapped).eq('id', profileTarget.id);
            if (!error) {
              if (updated.username !== undefined && updated.username !== oldUsername) {
                await supabase.from('messages').insert({
                  profile_id: profileTarget.id,
                  text: `[USERNAME_CHANGE] ${oldUsername} is now known as ${updated.username}`,
                  room: 'main'
                });
              }
              if (profileTarget.id === user.id) {
                onUpdateUser(updated);
              }
              setProfileTarget({ ...profileTarget, ...updated });
            } else {
              console.error("Profile update error:", error);
            }
          }}
        />
      )}

      {/* Notifications Modal / Popover */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowNotificationsModal(false)}>
          <div className="w-full max-w-md bg-[#161226] border border-purple-500/30 rounded-none shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 border-b border-purple-950/40 flex items-center justify-between bg-purple-950/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-black text-purple-300 uppercase tracking-widest">Your Notifications</h4>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={async () => {
                    await supabase.from('notifications').delete().eq('target_id', user.id);
                    setNotifications([]);
                  }}
                  className="text-[10px] uppercase font-black text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear All
                </button>
                <button onClick={() => setShowNotificationsModal(false)} className="text-purple-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-purple-400/60 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => {
                  const isGlobal = !notif.target_id;
                  const isRevealRequest = notif.message?.includes("[REVEAL_REQUEST:");
                  const isSecretMessageAlert = notif.message?.includes("You received a secret message!");
                  const cleanMessage = isRevealRequest 
                    ? notif.message.replace(/\[REVEAL_REQUEST:[^\]]+\]\s*/, "") 
                    : notif.message;

                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        if (isRevealRequest) {
                          setActiveDecisionNotif(notif);
                          setShowNotificationsModal(false);
                        } else if (isSecretMessageAlert) {
                          setShowSecretMessagesListModal(true);
                          setShowNotificationsModal(false);
                        }
                      }}
                      className={`p-3 border flex flex-col gap-2 rounded-none transition-all ${
                        isGlobal 
                          ? "bg-amber-950/15 border-amber-500/20" 
                          : "bg-[#0c0919]/60 border-purple-950/40"
                      } ${(isRevealRequest || isSecretMessageAlert) ? "hover:border-purple-500 hover:bg-purple-950/20 cursor-pointer" : ""}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notif.sender_pfp ? (
                          <div className="w-8 h-8 bg-purple-950/50 p-0.5 border border-purple-850/40 shrink-0 overflow-hidden">
                            <img src={notif.sender_pfp} alt={notif.sender_username} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-purple-950/80 shrink-0 flex items-center justify-center text-xs text-purple-400 font-bold border border-purple-850/40">
                            PW
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">{notif.sender_username || "System"}</span>
                            {notif.sender_rank && (
                              <img 
                                src={allRanksInfo[notif.sender_rank]?.icon || allRanksInfo['VIP']?.icon} 
                                alt={notif.sender_rank} 
                                className="h-2.5 w-auto object-contain" 
                              />
                            )}
                          </div>
                          <p className="text-xs text-purple-200 mt-1 whitespace-pre-wrap leading-relaxed break-words font-medium">
                            {cleanMessage}
                          </p>
                          {isRevealRequest && (
                            <div className="mt-2.5 flex justify-start">
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm"
                              >
                                View Reveal Options 🔍
                              </button>
                            </div>
                          )}
                          {isSecretMessageAlert && (
                            <div className="mt-2.5 flex justify-start">
                              <button
                                type="button"
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] font-black uppercase tracking-wider rounded-lg shadow-sm"
                              >
                                Open Secret Inbox 🔒
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[9px] text-purple-500/80 self-end font-mono">
                        {notif.created_at && !isNaN(new Date(notif.created_at).getTime()) ? new Date(notif.created_at).toLocaleString() : new Date().toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowAdminModal(false)}>
          <div className="w-full max-w-4xl h-[85vh] bg-[#110e21] border border-rose-500/30 rounded-none overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-4 bg-[#16122a] border-b border-rose-950/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-none bg-rose-500/10 border border-rose-500/30">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Developer Control Panel</h4>
                  <p className="text-[10px] text-rose-400/80">Manage accounts, ranks, announcements & broadcasts</p>
                </div>
              </div>
              <button onClick={() => setShowAdminModal(false)} className="text-purple-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-purple-950/40 bg-purple-950/10 p-1 gap-1">
              <button 
                onClick={() => setAdminTab("accounts")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                  adminTab === "accounts" 
                    ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                    : "text-purple-400 hover:text-white"
                }`}
              >
                Accounts ({allProfiles.length})
              </button>
              <button 
                onClick={() => setAdminTab("ranks")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                  adminTab === "ranks" 
                    ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                    : "text-purple-400 hover:text-white"
                }`}
              >
                Custom Ranks
              </button>
              <button 
                onClick={() => setAdminTab("announcements")}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-all rounded-none ${
                  adminTab === "announcements" 
                    ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                    : "text-purple-400 hover:text-white"
                }`}
              >
                Broadcasts
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* TAB 1: ACCOUNTS */}
              {adminTab === "accounts" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest">Registered User Accounts</h3>
                    <button 
                      onClick={fetchAllProfiles}
                      className="px-3 py-1 bg-purple-900/40 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest text-purple-300 hover:text-white hover:bg-purple-900/60 transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="border border-purple-950/40 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-purple-950/20 border-b border-purple-950/40 text-[10px] font-black text-purple-400 uppercase tracking-wider">
                          <th className="p-3">User</th>
                          <th className="p-3">Gender</th>
                          <th className="p-3">Age</th>
                          <th className="p-3">Rank Assignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-950/30 text-xs text-purple-200">
                        {allProfiles.map((p) => {
                          const isActorDev = ['dev@gmail.com', 'haydensixseven@gmail.com', 'haydensixsevennn@gmail.com', 'test@gmail.com'].includes(user.email || '');
                          const actorPriority = allRanksInfo[user.rank]?.priority ?? 14;
                          const targetPriority = allRanksInfo[p.rank]?.priority ?? 14;
                          
                          // "same rank cant action people, only superadmin (<=3) and above can rank"
                          const canRankTarget = isActorDev || (actorPriority <= 3 && actorPriority < targetPriority && p.id !== user.id);

                          return (
                            <tr key={p.id} className="hover:bg-purple-950/5">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-none border border-purple-950/50 bg-[#161226] p-0.5 overflow-hidden">
                                    <img src={p.pfp} alt={p.username} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                      {p.username}
                                      {p.rank && (
                                        <img 
                                          src={allRanksInfo[p.rank]?.icon || allRanksInfo['VIP']?.icon} 
                                          alt={p.rank} 
                                          className="h-2.5 w-auto object-contain" 
                                        />
                                      )}
                                    </div>
                                    <span className="text-[10px] text-purple-500 block truncate max-w-[150px]">@{p.username}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <select 
                                  value={p.gender}
                                  onChange={async (e) => {
                                    const val = e.target.value;
                                    const { error } = await supabase.from('profiles').update({ gender: val }).eq('id', p.id);
                                    if (!error) {
                                      setAllProfiles(prev => prev.map(u => u.id === p.id ? { ...u, gender: val } : u));
                                    }
                                  }}
                                  className="bg-[#090714] border border-purple-900/30 rounded-none p-1 text-xs text-purple-200 focus:outline-none"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                  <option value="Not specified">Not specified</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  value={p.age} 
                                  onChange={async (e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const { error } = await supabase.from('profiles').update({ age: val }).eq('id', p.id);
                                    if (!error) {
                                      setAllProfiles(prev => prev.map(u => u.id === p.id ? { ...u, age: val } : u));
                                    }
                                  }}
                                  className="w-16 bg-[#090714] border border-purple-900/30 rounded-none p-1 text-center text-xs text-purple-200 focus:outline-none"
                                />
                              </td>
                              <td className="p-3">
                                {canRankTarget ? (
                                  <select 
                                    value={p.rank}
                                    onChange={async (e) => {
                                      const newRank = e.target.value;
                                      const { error } = await supabase.from('profiles').update({ rank: newRank }).eq('id', p.id);
                                      if (!error) {
                                        setAllProfiles(prev => prev.map(u => u.id === p.id ? { ...u, rank: newRank } : u));
                                      } else {
                                        alert("Error: " + error.message);
                                      }
                                    }}
                                    className="bg-rose-950/20 border border-rose-500/30 rounded-none p-1 text-xs text-rose-300 focus:outline-none font-bold"
                                  >
                                    {Object.keys(allRanksInfo)
                                      .filter((rKey) => {
                                        if (isActorDev) return true;
                                        const rPriority = allRanksInfo[rKey]?.priority ?? 14;
                                        return rPriority > actorPriority;
                                      })
                                      .map((rKey) => (
                                        <option key={rKey} value={rKey} className="bg-[#0c0919] text-purple-200">
                                          {allRanksInfo[rKey]?.name || rKey}
                                        </option>
                                      ))}
                                  </select>
                                ) : (
                                  <span className="text-[10px] uppercase font-black text-purple-500 tracking-wider">No Permission</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOM RANKS */}
              {adminTab === "ranks" && (
                <div className="space-y-6">
                  {/* Create rank form */}
                  <div className="bg-[#0c0919]/60 border border-purple-950/40 p-4 space-y-4">
                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest">Create Custom Rank</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block mb-1">Rank Key (Uppercase, unique)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ULTRA-VIP" 
                          value={newRankKey} 
                          onChange={(e) => setNewRankKey(e.target.value)} 
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block mb-1">Display Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Ultra VIP" 
                          value={newRankName} 
                          onChange={(e) => setNewRankName(e.target.value)} 
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block mb-1">Rank Icon URL (.gif, .png, etc.)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. https://github.com/.../gif" 
                          value={newRankIcon} 
                          onChange={(e) => setNewRankIcon(e.target.value)} 
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 uppercase font-black tracking-wider block mb-1">Hierarchy Priority (Lower is higher rank, VIP is 14)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 15" 
                          value={newRankPriority} 
                          onChange={(e) => setNewRankPriority(e.target.value)} 
                          className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-2 text-xs text-purple-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input 
                          type="checkbox" 
                          id="is_staff_chk" 
                          checked={newRankIsStaff} 
                          onChange={(e) => setNewRankIsStaff(e.target.checked)} 
                          className="bg-[#090714] border border-purple-900/30 focus:ring-0"
                        />
                        <label htmlFor="is_staff_chk" className="text-[10px] text-purple-300 uppercase font-black tracking-wider cursor-pointer">Is Staff Rank (Moderation rights)</label>
                      </div>
                    </div>
                    <button 
                      onClick={handleAddCustomRank}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Add Custom Rank to Hierarchy
                    </button>
                  </div>

                  {/* Active ranks overview */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-widest">Dynamic Custom Ranks List</h3>
                    <div className="space-y-2">
                      {customRanks.length === 0 ? (
                        <p className="text-xs text-purple-400/75">No custom ranks created yet.</p>
                      ) : (
                        customRanks.map((cr) => (
                          <div key={cr.id} className="flex items-center justify-between p-3 bg-purple-950/10 border border-purple-950/40">
                            <div className="flex items-center gap-3">
                              <img src={cr.icon} alt={cr.name} className="h-4 object-contain" />
                              <div>
                                <h4 className="text-xs font-bold text-white">{cr.name} <span className="text-[9px] text-purple-500 font-bold ml-1">({cr.rank_key})</span></h4>
                                <p className="text-[9px] text-purple-400 uppercase tracking-widest mt-0.5">Priority: {cr.priority} • {cr.is_staff ? "Staff" : "Member"}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteCustomRank(cr.id)}
                              className="p-1 text-purple-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: BROADCASTS & ANNOUNCEMENTS */}
              {adminTab === "announcements" && (
                <div className="space-y-6">
                  {/* Send permanent announcement form */}
                  <div className="bg-[#0c0919]/60 border border-purple-950/40 p-4 space-y-4">
                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest">Publish Permanent Announcement</h3>
                    <p className="text-[10px] text-purple-400">This will be pinned permanently for everyone at the top of their chat screen stream.</p>
                    <textarea 
                      placeholder="Type your permanent announcement text here..." 
                      value={announcementText} 
                      onChange={(e) => setAnnouncementText(e.target.value)} 
                      rows={3}
                      className="w-full bg-[#090714] border border-purple-900/30 rounded-none p-3 text-xs text-purple-200 focus:outline-none focus:border-purple-500 resize-none"
                    />
                    <button 
                      onClick={async () => {
                        if (!announcementText.trim()) return;
                        const { error } = await supabase.from('announcements').insert({
                          profile_id: user.id,
                          text: announcementText.trim()
                        });
                        if (!error) {
                          setAnnouncementText("");
                          alert("Announcement published!");
                        } else {
                          alert("Error publishing: " + error.message);
                        }
                      }}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Publish Announcement
                    </button>
                  </div>

                  {/* Send global notification form */}
                  <div className="bg-[#0c0919]/60 border border-[#b45309]/30 p-4 space-y-4">
                    <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Broadcast Global Alarm Notification</h3>
                    <p className="text-[10px] text-amber-500/80">Sends a real-time chime notification to every user currently logged in or offline, prompting with notification badge and a loud ringtone chime.</p>
                    <textarea 
                      placeholder="Type your global broadcast notification text..." 
                      value={globalNotifText} 
                      onChange={(e) => setGlobalNotifText(e.target.value)} 
                      rows={3}
                      className="w-full bg-[#090714] border-[#b45309]/30 rounded-none p-3 text-xs text-purple-200 focus:outline-none focus:border-amber-500 resize-none"
                    />
                    <button 
                      onClick={handleSendGlobalNotification}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black uppercase tracking-widest transition-all"
                    >
                      Broadcast Real-time Alarm to All Users
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Custom Chat Background Modal */}
      {showChatBgModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[110] flex items-center justify-center p-4">
          <div className="bg-[#120e24] border border-purple-900/50 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left">
            <button 
              onClick={() => {
                setShowChatBgModal(false);
                setTempBgBase64(null);
              }}
              className="absolute top-4 right-4 text-purple-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              <span>Upload Chat Background</span>
            </h3>
            <p className="text-xs text-purple-300 mb-6 leading-relaxed">
              Choose a custom image to style your chat area. This feature is <strong className="text-emerald-400">100% free</strong> and does not require any coins or rubies!
            </p>

            {/* Preview Box */}
            <div className="w-full h-40 bg-purple-950/20 border border-purple-900/40 rounded-xl mb-6 overflow-hidden flex items-center justify-center relative group">
              {tempBgBase64 || user.chat_background ? (
                <>
                  <img 
                    src={tempBgBase64 || user.chat_background} 
                    alt="Chat Background Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">Preview</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Palette className="w-8 h-8 text-purple-500/40 mx-auto mb-2" />
                  <p className="text-xs text-purple-400 font-bold">No background chosen yet</p>
                </div>
              )}
            </div>

            {chatBgError && (
              <div className="mb-4 p-2.5 bg-rose-950/40 border border-rose-900/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-bold leading-normal animate-in fade-in slide-in-from-top-1 duration-150">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{chatBgError}</span>
              </div>
            )}

            {/* Invisible File Input */}
            <input 
              type="file" 
              ref={bgFileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                setChatBgError(null);
                
                // Prevent .gif files
                if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
                  setChatBgError("GIF backgrounds are not allowed. Please use standard solid images (JPEG, PNG, WEBP).");
                  if (bgFileInputRef.current) bgFileInputRef.current.value = "";
                  return;
                }

                setTempBgFile(file);
                // Create instant object URL for preview without blocking
                const localUrl = URL.createObjectURL(file);
                setTempBgBase64(localUrl);
              }}
              className="hidden"
            />

            <div className="flex gap-3">
              <button
                onClick={() => bgFileInputRef.current?.click()}
                className="flex-1 py-2.5 px-4 bg-purple-950/60 hover:bg-purple-900/50 text-purple-200 hover:text-white border border-purple-800/20 text-xs font-black rounded-xl transition-all cursor-pointer text-center"
              >
                Choose Image
              </button>
              {user.chat_background && (
                <button
                  onClick={async () => {
                    onUpdateUser({ chat_background: "" });
                    await supabase.from('profiles').update({ chat_background: null }).eq('id', user.id);
                    setTempBgBase64(null);
                    setTempBgFile(null);
                    setShowChatBgModal(false);
                  }}
                  className="py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 text-xs font-black rounded-xl transition-all cursor-pointer text-center"
                  title="Remove Current Background"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="flex gap-3 mt-8 border-t border-purple-950/40 pt-4">
              <button
                disabled={isUploadingBg}
                onClick={() => {
                  setShowChatBgModal(false);
                  setTempBgBase64(null);
                  setTempBgFile(null);
                }}
                className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-black rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (tempBgFile) {
                     setIsUploadingBg(true);
                     setChatBgError(null);
                     try {
                       const uploadedUrl = await uploadImageToStorage(tempBgFile, 'backgrounds', tempBgFile.name);
                       onUpdateUser({ chat_background: uploadedUrl });
                       const { error } = await supabase.from('profiles').update({ chat_background: uploadedUrl }).eq('id', user.id);
                       if (error) throw error;
                       
                       setShowChatBgModal(false);
                       setTempBgBase64(null);
                       setTempBgFile(null);
                     } catch (err: any) {
                       console.error(err);
                       setChatBgError("Failed to save background. Please try again.");
                     } finally {
                       setIsUploadingBg(false);
                     }
                  } else if (tempBgBase64) {
                     // Fallback
                     setIsUploadingBg(true);
                     try {
                       onUpdateUser({ chat_background: tempBgBase64 });
                       const { error } = await supabase.from('profiles').update({ chat_background: tempBgBase64 }).eq('id', user.id);
                       if (error) throw error;
                       setShowChatBgModal(false);
                       setTempBgBase64(null);
                     } catch (err: any) {
                       console.error(err);
                       setChatBgError("Failed to save background.");
                     } finally {
                       setIsUploadingBg(false);
                     }
                  }
                }}
                disabled={(!tempBgBase64 && !tempBgFile) || isUploadingBg}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all shadow-lg uppercase tracking-wider cursor-pointer text-center"
              >
                {isUploadingBg ? "Saving..." : "Save Background"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Collaborative Paint Modal */}
      {showPaintModal && (
        <PaintModal
          onClose={() => setShowPaintModal(false)}
          onSend={async (imageUrl) => {
            // Trigger standard message send with the painting URL as image
            try {
              const { error } = await supabase.from("messages").insert({
                profile_id: user.id,
                text: "🎨 shared a canvas painting!",
                image_url: imageUrl,
                room: 'main'
              });
              if (error) throw error;
            } catch (err) {
              console.error("Failed to send painting message:", err);
            }
          }}
        />
      )}

      {showStyleModal && (
        <StyleModal
          user={user}
          onClose={() => setShowStyleModal(false)}
          onUpdate={onUpdateUser}
        />
      )}

      {/* Dynamic Currency Exchange Convert Modal */}
      {showConvertModal && (
        <ConvertModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowConvertModal(false)}
        />
      )}

      
      {/* Dynamic Gallery Settings Modal */}
      {showGallerySettingsModal && (
        <GallerySettingsModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowGallerySettingsModal(false)}
        />
      )}

      {/* Dynamic Secret Message Composer Modal */}
      {showSecretMessageModal && (
        <SecretMessageModal
          user={user}
          onClose={() => setShowSecretMessageModal(false)}
        />
      )}

      {/* Dynamic Secret Messages Inbox List Modal */}
      {showSecretMessagesListModal && (
        <SecretMessagesListModal
          user={user}
          onClose={() => setShowSecretMessagesListModal(false)}
        />
      )}

      {/* Dynamic Reveal Decision Prompt Modal */}
      {activeDecisionNotif && (
        <RevealDecisionModal
          user={user}
          notification={activeDecisionNotif}
          onClose={() => setActiveDecisionNotif(null)}
          onSuccess={() => {
            // Filter from local notification state to immediately remove it
            setNotifications(prev => prev.filter(n => n.id !== activeDecisionNotif.id));
          }}
        />
      )}

      {showProfileVisitorsModal && (
        <ProfileVisitorsModal
          user={user}
          onClose={() => setShowProfileVisitorsModal(false)}
          allRanksInfo={allRanksInfo}
          computedUsers={computedUsers}
          handleProfileClick={handleProfileClick}
          onUserUpdate={onUpdateUser}
        />
      )}

      {showProfileDecorModal && (
        <ProfileDecorModal
          user={user}
          onClose={() => setShowProfileDecorModal(false)}
          onUserUpdate={onUpdateUser}
          onPurchase={() => {
            setShowProfileDecorModal(false);
            setProfileTarget(user);
            setProfileMode("view");
          }}
        />
      )}

      {showPollModal && (
        <PollModal
          user={user}
          onClose={() => setShowPollModal(false)}
          onSend={async (pollData) => {
            try {
              const serialized = `[POLL]:${JSON.stringify({
                question: pollData.question,
                mode: pollData.mode,
                duration: pollData.duration,
                options: pollData.options,
                votes: {},
              })}`;

              const { error } = await supabase.from("messages").insert({
                profile_id: user.id,
                text: serialized,
                room: 'main'
              });

              if (error) throw error;
            } catch (err) {
              console.error("Failed to create room poll:", err);
            }
          }}
        />
      )}

      {showGiftModal && (
        <GiftModal
          user={user}
          onClose={() => setShowGiftModal(false)}
          onSend={async (giftMessage, boxStyle) => {
            try {
              await onUpdateUser({ rubies: (user.rubies ?? 0) - 5 });

              const serialized = `[GIFT]:${JSON.stringify({
                message: giftMessage,
                boxStyle: boxStyle,
                viewers: [],
                senderId: user.id
              })}`;

              const { error } = await supabase.from("messages").insert({
                profile_id: user.id,
                text: serialized,
                room: 'main'
              });

              if (error) throw error;
            } catch (err) {
              console.error("Failed to send gift box:", err);
            }
          }}
        />
      )}
    </div>
  );
}
