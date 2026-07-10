import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup file paths
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer setup for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}_${cleanName}`);
  }
});
const upload = multer({ storage: storageConfig });

// In-memory Database state
interface Database {
  users: any[];
  profiles: any[];
  messages: any[];
  ratings: any[];
  profile_likes: any[];
  notifications: any[];
  custom_ranks: any[];
  announcements: any[];
  secret_messages: any[];
}

let db: Database = {
  users: [],
  profiles: [],
  messages: [],
  ratings: [],
  profile_likes: [],
  notifications: [],
  custom_ranks: [],
  announcements: [],
  secret_messages: []
};

// Initialize connection to real global cloud Key-Value storage (kvdb.io)
// Using our unique Applet ID "aebd893b-e672-40ab-959f-84f3c0e3ebd9"
const KVDB_URL = "https://kvdb.io/aebd893b-e672-40ab-959f-84f3c0e3ebd9/db_state";
let lastCloudFetchTime = 0;
const FETCH_CACHE_TTL = 2500; // 2.5 seconds cache TTL

// Load DB state asynchronously from global cloud storage
async function loadDb() {
  console.log("Loading database state from global cloud storage...");
  try {
    const res = await fetch(KVDB_URL);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        const parsed = JSON.parse(text);
        if (parsed.db) {
          db = {
            users: parsed.db.users || [],
            profiles: parsed.db.profiles || [],
            messages: parsed.db.messages || [],
            ratings: parsed.db.ratings || [],
            profile_likes: parsed.db.profile_likes || [],
            notifications: parsed.db.notifications || [],
            custom_ranks: parsed.db.custom_ranks || [],
            announcements: parsed.db.announcements || [],
            secret_messages: parsed.db.secret_messages || []
          };
        }
        if (parsed.realtimeEvents) {
          realtimeEvents.length = 0;
          realtimeEvents.push(...(parsed.realtimeEvents || []));
        }
        if (parsed.globalEventId !== undefined) {
          globalEventId = parsed.globalEventId;
        }
        if (parsed.activePresences) {
          // Keep our existing local entries if they are newer
          Object.assign(activePresences, parsed.activePresences);
        }
        lastCloudFetchTime = Date.now();
        console.log(`Successfully loaded global state: ${db.users.length} users, ${db.messages.length} messages, ${realtimeEvents.length} events from cloud!`);
        return;
      }
    } else {
      console.log(`No global DB state found in cloud (status ${res.status}). Creating new state...`);
    }
  } catch (err) {
    console.error("Failed to load DB state from global cloud, falling back to local file:", err);
  }

  // Fallback to local file if remote is empty/fails
  if (lastCloudFetchTime === 0 && fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf8");
      const parsed = JSON.parse(raw);
      db = {
        users: parsed.users || [],
        profiles: parsed.profiles || [],
        messages: parsed.messages || [],
        ratings: parsed.ratings || [],
        profile_likes: parsed.profile_likes || [],
        notifications: parsed.notifications || [],
        custom_ranks: parsed.custom_ranks || [],
        announcements: parsed.announcements || [],
        secret_messages: parsed.secret_messages || []
      };
      console.log("Loaded DB state from local fallback file!");
    } catch (err) {
      console.error("Error reading local DB file:", err);
    }
  }
}

let saveTimeout: NodeJS.Timeout | null = null;
let isSaving = false;

function saveDb() {
  // Always write locally as an immediate, fast filesystem fallback/cache
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database locally:", err);
  }

  // Debounce the remote database upload to avoid hitting rate limits or duplicate writes
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    if (isSaving) return;
    isSaving = true;

    try {
      const payload = {
        db: {
          users: db.users,
          profiles: db.profiles,
          messages: db.messages,
          ratings: db.ratings,
          profile_likes: db.profile_likes,
          notifications: db.notifications,
          custom_ranks: db.custom_ranks,
          announcements: db.announcements,
          secret_messages: db.secret_messages
        },
        realtimeEvents,
        globalEventId,
        activePresences
      };

      const serialized = JSON.stringify(payload);

      const res = await fetch(KVDB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: serialized
      });

      if (res.ok) {
        lastCloudFetchTime = Date.now();
        console.log("Successfully updated global database state in cloud storage!");
      } else {
        console.error(`Error updating global database state: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to save database state to global cloud:", err);
    } finally {
      isSaving = false;
    }
  }, 1000);
}

// Automatic cloud synchronization helper
async function syncFromCloudIfNeeded() {
  const now = Date.now();
  if (now - lastCloudFetchTime < FETCH_CACHE_TTL) {
    return;
  }
  await loadDb();
}

// Trigger DB load immediately upon server boot
loadDb().then(() => {
  // Seed default ranks if empty after loading
  if (db.custom_ranks.length === 0) {
    db.custom_ranks = [
      { id: "rank-dev-1", rank_key: "DEVELOPER", name: "Developer", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/crown_crown.gif", priority: 0, is_staff: true },
      { id: "rank-codev-1", rank_key: "CO-DEVELOPER", name: "Co-Developer", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/verified.gif", priority: 1, is_staff: true },
      { id: "rank-founder-1", rank_key: "FOUNDER", name: "Founder", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/founder.gif", priority: 2, is_staff: true },
      { id: "rank-superadmin-1", rank_key: "SUPERADMIN", name: "Superadmin", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/superadmin.png", priority: 3, is_staff: true },
      { id: "rank-admin-1", rank_key: "ADMIN", name: "Admin", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/admin.png", priority: 4, is_staff: true },
      { id: "rank-mod-1", rank_key: "MOD", name: "Mod", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/mod.png", priority: 5, is_staff: true },
      { id: "rank-bot-1", rank_key: "BOT", name: "Bot", icon: "https://musicvibe.io/default_images/rank/bot.svg", priority: 5.5, is_staff: true },
      { id: "rank-mop-1", rank_key: "MOP", name: "MoP", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/MoP.gif", priority: 6, is_staff: true },
      { id: "rank-vip-1", rank_key: "VIP", name: "VIP", icon: "https://raw.githubusercontent.com/nyatter1/ranks/main/vip.gif", priority: 14, is_staff: false }
    ];
    saveDb();
  }
});

// Real-time Event Queue
interface RealtimeEvent {
  id: number;
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: any;
  old: any;
}

let globalEventId = 0;
const realtimeEvents: RealtimeEvent[] = [];

function pushEvent(table: string, eventType: "INSERT" | "UPDATE" | "DELETE", newVal: any, oldVal: any) {
  globalEventId++;
  realtimeEvents.push({
    id: globalEventId,
    table,
    eventType,
    new: newVal,
    old: oldVal
  });

  if (realtimeEvents.length > 3000) {
    realtimeEvents.shift();
  }
}

// Presence Tracker
interface PresenceTrack {
  userId: string;
  username: string;
  online_at: string;
  last_ping: number;
}

const activePresences: Record<string, PresenceTrack> = {};

// Clean inactive presences every 10 seconds
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const key in activePresences) {
    if (now - activePresences[key].last_ping > 15000) {
      delete activePresences[key];
      changed = true;
    }
  }
  if (changed) {
    saveDb();
  }
}, 5000);

// Helper to generate UUIDs
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Token Authenticator
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: missing token" });
  }

  if (token.startsWith("token_")) {
    const userId = token.replace("token_", "");
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(403).json({ error: "Forbidden: invalid session" });
    }
    req.user = user;
    return next();
  }

  return res.status(403).json({ error: "Forbidden: invalid token format" });
}

// Middleware to automatically sync state from the global cloud store for all API calls
app.use(async (req: any, res: any, next: any) => {
  if (req.path.startsWith("/api/")) {
    try {
      await syncFromCloudIfNeeded();
    } catch (err) {
      console.error("Error in cloud sync middleware:", err);
    }
  }
  next();
});

// API Routes

// 1. Auth Signup
app.post("/api/auth/signup", (req, res) => {
  const { email, password, username, gender, age } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const emailLower = email.toLowerCase().trim();
  const usernameClean = username.trim();

  const userExists = db.users.some(u => u.email.toLowerCase() === emailLower || u.user_metadata?.username.toLowerCase() === usernameClean.toLowerCase());
  if (userExists) {
    return res.status(400).json({ error: "Email or username already exists" });
  }

  const userId = generateUUID();
  const user = {
    id: userId,
    email: emailLower,
    password: password,
    user_metadata: {
      username: usernameClean,
      gender: gender || "OTHER",
      age: Number(age) || 18
    }
  };

  db.users.push(user);

  const profile = {
    id: userId,
    username: usernameClean,
    pfp: `https://api.dicebear.com/7.x/adventurer/svg?seed=${usernameClean}`,
    banner: "",
    about_me: "",
    mood: "",
    last_online: new Date().toISOString(),
    language: "en",
    current_room: "main",
    rank: ["haydensixseven@gmail.com", "test@gmail.com", "dev@gmail.com"].includes(emailLower) ? "DEVELOPER" : "USER",
    likes: 0,
    effect: "none",
    border: "none",
    border_thickness: "2px",
    card_bg: "",
    email: emailLower,
    coins: 1000,
    rubies: 10,
    total_xp: 0,
    weekly_xp: 0,
    monthly_xp: 0,
    chat_background: "",
    custom_status: "online",
    custom_profile_enabled: false
  };

  db.profiles.push(profile);
  saveDb();

  pushEvent("profiles", "INSERT", profile, null);

  const token = `token_${userId}`;
  res.json({
    session: {
      access_token: token,
      user: {
        id: userId,
        email: emailLower,
        user_metadata: user.user_metadata
      }
    }
  });
});

// 2. Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const emailLower = email.toLowerCase().trim();
  let user = db.users.find(u => 
    u.email.toLowerCase() === emailLower || 
    (u.user_metadata?.username && u.user_metadata.username.toLowerCase() === emailLower)
  );

  // Auto-provision developer accounts to ensure instant and smooth login
  if (!user && ["haydensixseven@gmail.com", "test@gmail.com", "dev@gmail.com"].includes(emailLower)) {
    const userId = generateUUID();
    const username = emailLower.split("@")[0];
    user = {
      id: userId,
      email: emailLower,
      password: password,
      user_metadata: {
        username: username,
        gender: "OTHER",
        age: 18
      }
    };
    db.users.push(user);

    const profile = {
      id: userId,
      username: username,
      pfp: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      banner: "",
      about_me: "",
      mood: "",
      last_online: new Date().toISOString(),
      language: "en",
      current_room: "main",
      rank: "DEVELOPER",
      likes: 0,
      effect: "none",
      border: "none",
      border_thickness: "2px",
      card_bg: "",
      email: emailLower,
      coins: 1000,
      rubies: 10,
      total_xp: 0,
      weekly_xp: 0,
      monthly_xp: 0,
      chat_background: "",
      custom_status: "online",
      custom_profile_enabled: false
    };

    db.profiles.push(profile);
    saveDb();
    pushEvent("profiles", "INSERT", profile, null);
  }

  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Invalid email/username or password" });
  }

  const token = `token_${user.id}`;
  res.json({
    session: {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      }
    }
  });
});

// 3. Auth Update Password
app.post("/api/auth/update", authenticateToken, (req: any, res: any) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  req.user.password = password;
  saveDb();
  res.json({ success: true });
});

// 4. General DB Engine
app.post("/api/db", authenticateToken, (req: any, res: any) => {
  const {
    table,
    method,
    selectCols,
    payload,
    filters,
    orFilter,
    orderCol,
    isAscending,
    isSingle,
    limitCount
  } = req.body;

  if (!table) {
    return res.status(400).json({ error: "Missing table name" });
  }

  if (!db[table as keyof Database]) {
    (db as any)[table] = [];
  }

  const list = (db as any)[table] as any[];

  // --- SELECT ---
  if (method === "select") {
    let matched = list.filter(row => {
      if (filters && filters.length > 0) {
        for (const f of filters) {
          const val = row[f.field];
          if (f.op === "eq") {
            if (String(val) !== String(f.value)) return false;
          } else if (f.op === "neq") {
            if (String(val) === String(f.value)) return false;
          } else if (f.op === "ilike") {
            if (!String(val || "").toLowerCase().includes(String(f.value || "").toLowerCase())) return false;
          }
        }
      }

      if (orFilter) {
        const conditions = orFilter.split(",");
        let matchesOr = false;
        for (const cond of conditions) {
          if (cond.includes(".is.null")) {
            const field = cond.split(".is.null")[0];
            if (row[field] === null || row[field] === undefined) {
              matchesOr = true;
            }
          } else if (cond.includes(".eq.")) {
            const parts = cond.split(".eq.");
            const field = parts[0];
            const val = parts[1];
            if (String(row[field]) === String(val)) {
              matchesOr = true;
            }
          }
        }
        if (!matchesOr) return false;
      }

      return true;
    });

    if (orderCol) {
      matched.sort((a, b) => {
        const valA = a[orderCol];
        const valB = b[orderCol];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        
        let cmp = 0;
        if (typeof valA === "number" && typeof valB === "number") {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB));
        }
        return isAscending ? cmp : -cmp;
      });
    }

    if (limitCount !== undefined && limitCount !== null) {
      matched = matched.slice(0, Number(limitCount));
    }

    if (selectCols && selectCols !== "*" && selectCols !== "") {
      const colFields = selectCols.split(",").map((f: string) => f.trim());
      matched = matched.map(row => {
        const mappedRow: any = {};
        for (const f of colFields) {
          mappedRow[f] = row[f];
        }
        return mappedRow;
      });
    }

    if (isSingle) {
      return res.json({ data: matched[0] || null });
    }
    return res.json({ data: matched });
  }

  // --- INSERT ---
  if (method === "insert") {
    const itemsToInsert = Array.isArray(payload) ? payload : [payload];
    const insertedItems: any[] = [];

    for (const item of itemsToInsert) {
      const newItem = { ...item };
      if (!newItem.id) {
        newItem.id = generateUUID();
      }
      if (!newItem.created_at) {
        newItem.created_at = new Date().toISOString();
      }

      if (table === "profiles") {
        newItem.coins = newItem.coins ?? 1000;
        newItem.rubies = newItem.rubies ?? 10;
        newItem.likes = newItem.likes ?? 0;
        newItem.total_xp = newItem.total_xp ?? 0;
        newItem.border = newItem.border ?? "none";
        newItem.border_thickness = newItem.border_thickness ?? "2px";
        newItem.custom_status = newItem.custom_status ?? "online";
      }

      list.push(newItem);
      insertedItems.push(newItem);

      pushEvent(table, "INSERT", newItem, null);
    }

    saveDb();
    
    if (isSingle) {
      return res.json({ data: insertedItems[0] || null });
    }
    return res.json({ data: Array.isArray(payload) ? insertedItems : (insertedItems[0] || null) });
  }

  // --- UPDATE ---
  if (method === "update") {
    if (!filters || filters.length === 0) {
      return res.status(400).json({ error: "Update method requires filters (eq) to protect data" });
    }

    const updatedItems: any[] = [];

    for (let i = 0; i < list.length; i++) {
      let matchesAllFilters = true;
      for (const f of filters) {
        if (f.op === "eq") {
          if (String(list[i][f.field]) !== String(f.value)) {
            matchesAllFilters = false;
            break;
          }
        }
      }

      if (matchesAllFilters) {
        const oldVal = { ...list[i] };
        list[i] = { ...list[i], ...payload };
        updatedItems.push(list[i]);
        pushEvent(table, "UPDATE", list[i], oldVal);
      }
    }

    if (updatedItems.length > 0) {
      saveDb();
    }

    if (isSingle) {
      return res.json({ data: updatedItems[0] || null });
    }
    return res.json({ data: updatedItems });
  }

  // --- DELETE ---
  if (method === "delete") {
    if (!filters || filters.length === 0) {
      return res.status(400).json({ error: "Delete method requires filters to prevent complete wipe" });
    }

    const remaining: any[] = [];
    const deletedItems: any[] = [];

    for (const row of list) {
      let matchesAllFilters = true;
      for (const f of filters) {
        if (f.op === "eq") {
          if (String(row[f.field]) !== String(f.value)) {
            matchesAllFilters = false;
            break;
          }
        } else if (f.op === "neq") {
          if (String(row[f.field]) === String(f.value)) {
            matchesAllFilters = false;
            break;
          }
        }
      }

      if (matchesAllFilters) {
        deletedItems.push(row);
        pushEvent(table, "DELETE", null, row);
      } else {
        remaining.push(row);
      }
    }

    if (deletedItems.length > 0) {
      (db as any)[table] = remaining;
      saveDb();
    }

    return res.json({ data: deletedItems });
  }

  return res.status(400).json({ error: `Unsupported method: ${method}` });
});

// 5. Presence Track
app.post("/api/presence/track", authenticateToken, (req: any, res: any) => {
  const { key, info } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Presence key required" });
  }

  activePresences[key] = {
    userId: req.user.id,
    username: info?.username || req.user.user_metadata?.username || "User",
    online_at: info?.online_at || new Date().toISOString(),
    last_ping: Date.now()
  };

  saveDb();
  res.json({ success: true });
});

// 6. Presence Untrack
app.post("/api/presence/untrack", authenticateToken, (req: any, res: any) => {
  let changed = false;
  for (const key in activePresences) {
    if (activePresences[key].userId === req.user.id) {
      delete activePresences[key];
      changed = true;
    }
  }
  if (changed) {
    saveDb();
  }
  res.json({ success: true });
});

// 7. Realtime events polling
app.get("/api/realtime/events", (req, res) => {
  const lastEventId = Number(req.query.lastEventId) || 0;
  const events = realtimeEvents.filter(ev => ev.id > lastEventId);

  const presenceState: Record<string, any[]> = {};
  for (const key in activePresences) {
    const track = activePresences[key];
    presenceState[track.userId] = [{
      username: track.username,
      online_at: track.online_at
    }];
  }

  res.json({
    events,
    presenceState
  });
});

// 8. Upload File
app.post("/api/upload", upload.single("file"), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const publicUrl = `/uploads/${req.file.filename}`;
  res.json({
    data: {
      path: publicUrl
    }
  });
});

app.use("/uploads", express.static(UPLOADS_DIR));

// Integrate Vite Middleware
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error(err);
      res.status(500).send(err.message);
    });

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on port ${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on port ${PORT}`);
  });
}
