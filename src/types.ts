export interface ElementLayout {
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale?: number;
  rotation?: number;
}

export interface ProfileLayout {
  pfp?: ElementLayout;
  banner?: ElementLayout;
  username?: ElementLayout;
  rank?: ElementLayout;
  infoGrid?: ElementLayout;
  aboutMe?: ElementLayout;
  badges?: ElementLayout;
}

export type UserRank = string;
export interface UserProfile {
  id: string;
  username: string;
  gender: string;
  age: number;
  pfp: string;
  isSystem?: boolean;
  banner?: string;
  aboutMe?: string;
  mood?: string;
  lastOnline?: string;
  createdDate?: string;
  language?: string;
  currentRoom?: string;
  rank: UserRank;
  likes?: number;
  email?: string; // Stored locally to verify dev credentials
  border?: string;
  borderThickness?: string;
  borderStyle?: string;
  profile_effect?: string;
  cardBg?: string;
  coins?: number;
  rubies?: number;
  profile_visits_expires_at?: string;
  total_xp?: number;
  weekly_xp?: number;
  monthly_xp?: number;
  chat_background?: string;
  custom_status?: string;
  is_banned?: boolean;
  ban_reason?: string;
  is_kicked?: boolean;
  kick_reason?: string;
  kick_expires_at?: string;
  is_muted?: boolean;
  mute_reason?: string;
  mute_expires_at?: string;
  username_color?: string;
  username_font?: string;
  username_effect?: string;
  username_format?: string;
  message_color?: string;
  message_font?: string;
  message_effect?: string;
  message_format?: string;
  custom_profile_enabled?: boolean;
  profile_layout?: ProfileLayout;
  profile_locked?: boolean;
  profile_lock_count?: number;
}

export interface Rating {
  id: string;
  target_id: string;
  author_id: string;
  author_username: string;
  author_pfp: string;
  score: number;
  comment: string;
  created_at: string;
}

export interface Message {
  id: string;
  profile_id: string;
  username: string;
  pfp: string;
  text: string;
  time: string;
  isSystem?: boolean;
  image_url?: string;
  rank?: UserRank;
  username_color?: string;
  username_font?: string;
  username_effect?: string;
  username_format?: string;
  message_color?: string;
  message_font?: string;
  message_effect?: string;
  message_format?: string;
}

export interface OnlineUser extends UserProfile {
  isSystem: boolean;
  isCurrentUser?: boolean;
  status: 'online' | 'offline';
}

export interface Notification {
  id: string;
  target_id?: string;
  sender_id?: string;
  sender_username?: string;
  sender_pfp?: string;
  sender_rank?: string;
  message: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  profile_id: string;
  text: string;
  created_at: string;
}

export interface CustomRank {
  id: string;
  rank_key: string;
  name: string;
  icon: string;
  priority: number;
  is_staff: boolean;
  created_at?: string;
}

export const RANKS_INFO: Record<string, { name: string; icon: string; priority: number; isStaff?: boolean }> = {
  'DEVELOPER': {
    name: 'Developer',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/crown_crown.gif',
    priority: 0,
    isStaff: true
  },
  'CO-DEVELOPER': {
    name: 'Co-Developer',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/verified.gif',
    priority: 1,
    isStaff: true
  },
  'FOUNDER': {
    name: 'Founder',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif',
    priority: 2,
    isStaff: true
  },
  'SUPERADMIN': {
    name: 'Superadmin',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png',
    priority: 3,
    isStaff: true
  },
  'ADMIN': {
    name: 'Admin',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/admin.png',
    priority: 4,
    isStaff: true
  },
  'MOD': {
    name: 'Mod',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/mod.png',
    priority: 5,
    isStaff: true
  },
  'BOT': {
    name: 'Bot',
    icon: 'https://musicvibe.io/default_images/rank/bot.svg',
    priority: 5.5,
    isStaff: true
  },
  'MOP': {
    name: 'MoP',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/MoP.gif',
    priority: 6,
    isStaff: true
  },
  'DRAGON': {
    name: 'Dragon',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/dragon.png',
    priority: 7,
    isStaff: false
  },
  'ELITE': {
    name: 'Elite',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/elite.png',
    priority: 8,
    isStaff: false
  },
  'GOLD': {
    name: 'Gold',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/gold.png',
    priority: 9,
    isStaff: false
  },
  'MANTIS': {
    name: 'Mantis',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/mantis.png',
    priority: 10,
    isStaff: false
  },
  'SNAKE': {
    name: 'Snake',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/snake.png',
    priority: 11,
    isStaff: false
  },
  'SUPERVIP': {
    name: 'Super VIP',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/super-vip.gif',
    priority: 12,
    isStaff: false
  },
  'TIGER': {
    name: 'Tiger',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/tiger.png',
    priority: 13,
    isStaff: false
  },
  'VIP': {
    name: 'VIP',
    icon: 'https://raw.githubusercontent.com/nyatter1/ranks/main/vip.gif',
    priority: 14,
    isStaff: false
  }
};

export const mapDbRankToUserRank = (rank: string | undefined): UserRank => {
  if (!rank) return 'VIP';
  const normalized = rank.toUpperCase();
  if (normalized === 'USER') return 'VIP';
  if (normalized === 'STAFF') return 'MOD';
  return normalized;
};

export const getLevelFromXp = (xp: number): { level: number; xpInCurrentLevel: number; xpNeededForNextLevel: number; progress: number; remainingXp: number } => {
  // Developer dev@gmail.com is handled externally if needed, or we can use standard formula
  let level = 1;
  while (true) {
    const cumulativeNeededForNext = 25 * (level + 1) * level;
    if (xp >= cumulativeNeededForNext) {
      level++;
    } else {
      break;
    }
  }
  const currentLevelStartCumulative = 25 * level * (level - 1);
  const xpInCurrentLevel = xp - currentLevelStartCumulative;
  const xpNeededForNextLevel = level * 50;
  const progress = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
  const remainingXp = xpNeededForNextLevel - xpInCurrentLevel;
  return {
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progress,
    remainingXp
  };
};
