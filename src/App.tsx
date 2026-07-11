import { useState, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import ChatRoom from "./components/ChatRoom";
import { UserProfile } from "./types";
import { supabase } from "./lib/supabase";

const LANGUAGES = [
  { code: "en", name: "English (US)", flagUrl: "/america.png" },
  { code: "es", name: "Español", flagUrl: "https://flagcdn.com/w40/es.png" },
  { code: "fr", name: "Français", flagUrl: "https://flagcdn.com/w40/fr.png" },
  { code: "de", name: "Deutsch", flagUrl: "https://flagcdn.com/w40/de.png" },
  { code: "it", name: "Italiano", flagUrl: "https://flagcdn.com/w40/it.png" },
  { code: "pt", name: "Português", flagUrl: "https://flagcdn.com/w40/br.png" },
  { code: "jp", name: "日本語", flagUrl: "https://flagcdn.com/w40/jp.png" },
  { code: "cn", name: "简体中文", flagUrl: "https://flagcdn.com/w40/cn.png" },
  { code: "ar", name: "العربية", flagUrl: "https://flagcdn.com/w40/sa.png" },
  { code: "kr", name: "한국어", flagUrl: "https://flagcdn.com/w40/kr.png" },
];

export default function App() {
  const [activeModal, setActiveModal] = useState<"none" | "login" | "register">("none");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);
  
  // Local session state for the logged-in user
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const unlockAudio = () => {
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      audio.play().catch(() => {});
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    let { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: { user: authUser } } = await supabase.auth.getUser();

    // If profile doesn't exist, create one (fallback for race conditions or existing auth users without profiles)
    if (error && error.code === 'PGRST116') {
      if (authUser) {
        const username = authUser.user_metadata?.username || `User_${authUser.id.slice(0, 5)}`;
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            username: username,
            gender: authUser.user_metadata?.gender || 'OTHER',
            age: authUser.user_metadata?.age || 18,
            pfp: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
            rank: ['haydensixseven@gmail.com', 'test@gmail.com', 'dev@gmail.com'].includes(authUser.email || '') ? 'DEVELOPER' : 'USER',
            email: authUser.email || ''
          })
          .select()
          .single();
        
        if (!createError) data = newProfile;
      }
    } else if (data && authUser) {
      const isDevEmail = ['haydensixseven@gmail.com', 'test@gmail.com', 'dev@gmail.com'].includes(authUser.email || '');
      const updates: any = {};
      let needsUpdate = false;
      if (isDevEmail && data.rank !== 'DEVELOPER') {
        updates.rank = 'DEVELOPER';
        needsUpdate = true;
      }
      if (!data.email && authUser.email) {
        updates.email = authUser.email;
        needsUpdate = true;
      }
      if (needsUpdate) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        if (!updateError && updatedProfile) {
          data = updatedProfile;
        }
      }
    }

    if (data) {
      let is_kicked = data.is_kicked;
      let is_muted = data.is_muted;
      const now = new Date().getTime();

      if (is_kicked && data.kick_expires_at) {
        if (new Date(data.kick_expires_at).getTime() <= now) {
          is_kicked = false;
          await supabase.from('profiles').update({ is_kicked: false, kick_reason: null, kick_expires_at: null }).eq('id', data.id);
          await supabase.from('notifications').insert({ target_id: data.id, sender_username: "System", message: `You have been unkicked at ${new Date().toLocaleTimeString()}.` });
        }
      }

      if (is_muted && data.mute_expires_at) {
        if (new Date(data.mute_expires_at).getTime() <= now) {
          is_muted = false;
          await supabase.from('profiles').update({ is_muted: false, mute_reason: null, mute_expires_at: null }).eq('id', data.id);
          await supabase.from('notifications').insert({ target_id: data.id, sender_username: "System", message: `You have been unmuted at ${new Date().toLocaleTimeString()}.` });
        }
      }

      const isDev = (authUser?.email === 'dev@gmail.com');
      setUser({
        id: data.id,
        username: data.username,
        gender: data.gender || "Not specified",
        age: data.age || 0,
        pfp: data.pfp || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.username}`,
        banner: data.banner,
        aboutMe: data.about_me,
        mood: data.mood,
        createdDate: data.created_at && !isNaN(new Date(data.created_at).getTime()) ? new Date(data.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
        language: data.language,
        currentRoom: data.current_room,
        rank: data.rank || 'USER',
        email: authUser?.email || '',
        effect: data.effect || 'none',
        border: data.border || 'none',
        borderThickness: data.border_thickness || '2px',
        cardBg: data.card_bg || undefined,
        coins: isDev ? 100000000 : (data.coins !== undefined ? data.coins : 1000),
        rubies: isDev ? 1000000 : (data.rubies !== undefined ? data.rubies : 10),
        total_xp: isDev ? 24975000 : (data.total_xp || 0),
        weekly_xp: isDev ? 24975000 : (data.weekly_xp || 0),
        monthly_xp: isDev ? 24975000 : (data.monthly_xp || 0),
        chat_background: data.chat_background || "",
        custom_status: data.custom_status || "online",
        is_banned: data.is_banned,
        ban_reason: data.ban_reason,
        is_kicked: is_kicked,
        kick_reason: data.kick_reason,
        kick_expires_at: data.kick_expires_at,
        is_muted: is_muted,
        mute_reason: data.mute_reason,
        mute_expires_at: data.mute_expires_at,
        username_color: data.username_color || '#ffffff',
        username_font: data.username_font || 'Inter',
        username_effect: data.username_effect || 'none',
        username_format: data.username_format || 'normal',
        message_color: data.message_color || '#e9d5ff',
        message_font: data.message_font || 'Inter',
        message_effect: data.message_effect || 'none',
        message_format: data.message_format || 'normal',
        custom_profile_enabled: data.custom_profile_enabled,
        profile_layout: data.profile_layout,
        profile_locked: data.profile_locked,
        profile_lock_count: data.profile_lock_count,
        gallery: data.gallery || [],
        profile_music_url: data.profile_music_url,
        profile_music_visualizer: data.profile_music_visualizer || 'bars'
      });
    }
    setLoading(false);
  };

  const handleUpdateUser = async (updatedUser: Partial<UserProfile>) => {
    if (!user) return;

    // Map types to database columns
    const dbUpdate: any = {};
    if ('username' in updatedUser) dbUpdate.username = updatedUser.username;
    if ('age' in updatedUser) dbUpdate.age = updatedUser.age;
    if ('gender' in updatedUser) dbUpdate.gender = updatedUser.gender;
    if ('pfp' in updatedUser) dbUpdate.pfp = updatedUser.pfp;
    if ('banner' in updatedUser) dbUpdate.banner = updatedUser.banner === undefined ? null : updatedUser.banner;
    if ('aboutMe' in updatedUser) dbUpdate.about_me = updatedUser.aboutMe === undefined ? null : updatedUser.aboutMe;
    if ('mood' in updatedUser) dbUpdate.mood = updatedUser.mood === undefined ? null : updatedUser.mood;
    if ('language' in updatedUser) dbUpdate.language = updatedUser.language;
    if ('currentRoom' in updatedUser) dbUpdate.current_room = updatedUser.currentRoom;
    if ('border' in updatedUser) dbUpdate.border = updatedUser.border === undefined ? null : updatedUser.border;
    if ('borderThickness' in updatedUser) dbUpdate.border_thickness = updatedUser.borderThickness === undefined ? null : updatedUser.borderThickness;
    if ('cardBg' in updatedUser) dbUpdate.card_bg = updatedUser.cardBg === undefined ? null : updatedUser.cardBg;
    if ('coins' in updatedUser) dbUpdate.coins = updatedUser.coins;
    if ('rubies' in updatedUser) dbUpdate.rubies = updatedUser.rubies;
    if ('total_xp' in updatedUser) dbUpdate.total_xp = updatedUser.total_xp;
    if ('weekly_xp' in updatedUser) dbUpdate.weekly_xp = updatedUser.weekly_xp;
    if ('monthly_xp' in updatedUser) dbUpdate.monthly_xp = updatedUser.monthly_xp;
    if ('chat_background' in updatedUser) dbUpdate.chat_background = updatedUser.chat_background === undefined ? "" : updatedUser.chat_background;
    if ('custom_status' in updatedUser) dbUpdate.custom_status = updatedUser.custom_status;
    if ('username_color' in updatedUser) dbUpdate.username_color = updatedUser.username_color;
    if ('username_font' in updatedUser) dbUpdate.username_font = updatedUser.username_font;
    if ('username_effect' in updatedUser) dbUpdate.username_effect = updatedUser.username_effect;
    if ('username_format' in updatedUser) dbUpdate.username_format = updatedUser.username_format;
    if ('message_color' in updatedUser) dbUpdate.message_color = updatedUser.message_color;
    if ('message_font' in updatedUser) dbUpdate.message_font = updatedUser.message_font;
    if ('message_effect' in updatedUser) dbUpdate.message_effect = updatedUser.message_effect;
    if ('message_format' in updatedUser) dbUpdate.message_format = updatedUser.message_format;
    if ('custom_profile_enabled' in updatedUser) dbUpdate.custom_profile_enabled = updatedUser.custom_profile_enabled;
    if ('profile_layout' in updatedUser) dbUpdate.profile_layout = updatedUser.profile_layout;
    if ('profile_locked' in updatedUser) dbUpdate.profile_locked = updatedUser.profile_locked;
    if ('profile_lock_count' in updatedUser) dbUpdate.profile_lock_count = updatedUser.profile_lock_count;
    if ('gallery' in updatedUser) dbUpdate.gallery = updatedUser.gallery;
    if ('profile_music_url' in updatedUser) dbUpdate.profile_music_url = updatedUser.profile_music_url;
    if ('profile_music_visualizer' in updatedUser) dbUpdate.profile_music_visualizer = updatedUser.profile_music_visualizer;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdate)
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#090714] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is logged in, show the interactive Chat Room layout
  if (user) {
    if (user.is_banned) {
      localStorage.setItem('device_banned', 'true');
      return (
        <div className="h-screen w-full bg-[#090714] flex flex-col items-center justify-center p-4">
          <div className="bg-[#161226] border border-red-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
            <h1 className="text-3xl font-bold text-red-500 mb-4">YOU HAVE BEEN BANNED</h1>
            <p className="text-purple-200 mb-6 font-medium">REASON: {user.ban_reason || 'No reason provided'}</p>
            <button 
              onClick={handleLogout}
              className="bg-red-900/50 hover:bg-red-800/50 text-white px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      );
    }

    if (user.is_kicked && user.kick_expires_at) {
      const kickEnd = new Date(user.kick_expires_at).getTime();
      const now = new Date().getTime();
      if (kickEnd > now) {
        localStorage.setItem('device_kicked_until', user.kick_expires_at);
        return (
          <div className="h-screen w-full bg-[#090714] flex flex-col items-center justify-center p-4">
            <div className="bg-[#161226] border border-orange-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
              <h1 className="text-3xl font-bold text-orange-500 mb-4">YOU HAVE BEEN KICKED</h1>
              <p className="text-purple-200 mb-2 font-medium">REASON: {user.kick_reason || 'No reason provided'}</p>
              <p className="text-purple-300 text-sm mb-6">You will be unkicked at {new Date(user.kick_expires_at).toLocaleString()}</p>
              <button 
                onClick={handleLogout}
                className="bg-orange-900/50 hover:bg-orange-800/50 text-white px-6 py-2 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        );
      }
    }

    return (
      <ChatRoom 
        user={user} 
        onLogout={handleLogout} 
        onUpdateUser={handleUpdateUser} 
      />
    );
  }

  const isDeviceBanned = localStorage.getItem('device_banned') === 'true';
  const deviceKickedUntil = localStorage.getItem('device_kicked_until');
  const isDeviceKicked = deviceKickedUntil && new Date(deviceKickedUntil).getTime() > new Date().getTime();

  if (isDeviceBanned) {
    return (
      <div className="h-screen w-full bg-[#090714] flex flex-col items-center justify-center p-4">
        <div className="bg-[#161226] border border-red-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
          <h1 className="text-3xl font-bold text-red-500 mb-4">YOU HAVE BEEN BANNED</h1>
          <p className="text-purple-200 mb-6 font-medium">This device is banned.</p>
        </div>
      </div>
    );
  }

  if (isDeviceKicked) {
    return (
      <div className="h-screen w-full bg-[#090714] flex flex-col items-center justify-center p-4">
        <div className="bg-[#161226] border border-orange-900/50 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
          <h1 className="text-3xl font-bold text-orange-500 mb-4">YOU HAVE BEEN KICKED</h1>
          <p className="text-purple-300 text-sm mb-6">You will be unkicked at {new Date(deviceKickedUntil).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <main 
      id="app-root"
      className="min-h-screen w-full bg-[#090714] text-purple-100 font-sans flex flex-col justify-center items-center relative overflow-hidden p-4 select-none animate-fade-in"
    >
      {/* Dynamic atmospheric ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[30%] h-[30%] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none" />

      {/* Flag / Language Selector (Top Right) */}
      <div className="absolute top-6 right-6 z-40 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-2 bg-[#120e24]/85 border border-purple-950/60 rounded-lg p-1.5 hover:border-purple-600/60 hover:bg-[#191433] transition-all duration-200 cursor-pointer shadow-md"
            title="Switch Language"
          >
            <img
              src={currentLanguage.flagUrl}
              alt={`${currentLanguage.name} Flag`}
              className="w-6 h-4 object-cover rounded-xs"
              referrerPolicy="no-referrer"
            />
            <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
          </button>

          {/* Simple Mock Language dropdown */}
          {showLanguageMenu && (
            <div className="absolute right-0 mt-1.5 w-44 bg-[#161226] border border-purple-900/40 rounded-lg shadow-2xl overflow-hidden py-1 z-50">
              <div className="max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-900">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-colors duration-150 ${
                      currentLanguage.code === lang.code
                        ? "bg-purple-600/30 text-white border-l-2 border-purple-500"
                        : "text-purple-300 hover:bg-purple-950 hover:text-white"
                    }`}
                  >
                    <img
                      src={lang.flagUrl}
                      alt={`${lang.name} Flag`}
                      className="w-5 h-3.5 object-cover rounded-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Landing Panel Container */}
      <div className="w-full max-w-xl text-center z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Custom Logo Image replacement */}
        <div id="app-logo-area" className="mb-8">
          <img
            src="/logo.png"
            alt="VelvetChat Logo"
            className="h-24 sm:h-28 object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title text */}
        <h1 
          id="welcome-title"
          className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mb-3"
        >
          Welcome To The Chat
        </h1>

        {/* Informative description block */}
        <p 
          id="welcome-description"
          className="text-purple-300/70 text-sm sm:text-base font-medium max-w-md mx-auto leading-relaxed mb-8 px-4"
        >
          Our chat community gives you the opportunity of making new friends and sharing fun moments with other people.
        </p>

        {/* Action Buttons Section */}
        <div className="flex flex-col items-center gap-5 w-full max-w-xs">
          
          {/* Main Action Login Button */}
          <button
            type="button"
            id="main-login-btn"
            onClick={() => setActiveModal("login")}
            className="w-48 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            {/* Custom Send icon from svgrepo, inverted to pure white */}
            <img
              src="https://www.svgrepo.com/show/412272/send.svg"
              alt="Login Send Icon"
              className="w-4 h-4 invert"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm tracking-wide">Login</span>
          </button>

          {/* Register Secondary Trigger Link */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-purple-500 font-medium">New here?</span>
            <button
              type="button"
              id="main-register-btn"
              onClick={() => setActiveModal("register")}
              className="text-lg font-bold text-purple-200 hover:text-white underline hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              Register now
            </button>
          </div>
        </div>
      </div>

      {/* Render Login Modal */}
      {activeModal === "login" && (
        <LoginModal
          onClose={() => setActiveModal("none")}
          onSwitchToRegister={() => setActiveModal("register")}
        />
      )}

      {/* Render Register Modal */}
      {activeModal === "register" && (
        <RegisterModal
          onClose={() => setActiveModal("none")}
          onSwitchToLogin={() => setActiveModal("login")}
        />
      )}
    </main>
  );
}
