import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updatePassword 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  onSnapshot 
} from "firebase/firestore";

// Your web app's Firebase configuration explicitly provided by user
const firebaseConfig = {
  apiKey: "AIzaSyCLok-pR5pCHnuR6Oynlo6eLb2VUaPwFCw",
  authDomain: "purple-wave-60c0f.firebaseapp.com",
  projectId: "purple-wave-60c0f",
  storageBucket: "purple-wave-60c0f.firebasestorage.app",
  messagingSenderId: "247000284825",
  appId: "1:247000284825:web:ae902df03ac25d404ac208",
  measurementId: "G-FWMDMB9346"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Wait for Firebase Auth to finish restoring the session state on page load/refresh
const authReadyPromise = new Promise<void>((resolve) => {
  let resolved = false;
  const safeResolve = () => {
    if (!resolved) {
      resolved = true;
      resolve();
    }
  };
  const unsub = onAuthStateChanged(auth, () => {
    safeResolve();
    unsub();
  });
  setTimeout(safeResolve, 1500); // safety timeout
});

function sanitizeForFirestore(val: any): any {
  if (val === undefined) return null;
  if (val === null) return null;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  if (typeof val === "object") {
    const sanitized: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        const cleaned = sanitizeForFirestore(val[key]);
        if (cleaned !== undefined) {
          sanitized[key] = cleaned;
        }
      }
    }
    return sanitized;
  }
  return val;
}

function getStoredToken() {
  if (typeof window === "undefined") return "";
  const sessStr = localStorage.getItem("mock_musicvibe_session");
  if (sessStr) {
    try {
      const session = JSON.parse(sessStr);
      return session.access_token || "";
    } catch (e) {
      return "";
    }
  }
  return "";
}

class QueryBuilder {
  private table: string;
  private method: "select" | "insert" | "update" | "delete" = "select";
  private selectCols: string = "*";
  private payload: any = null;
  private filters: Array<{ field: string; op: string; value: any }> = [];
  private orFilter: string | null = null;
  private orderCol: string | null = null;
  private isAscending: boolean = true;
  private isSingle: boolean = false;
  private limitCount: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string = "*") {
    this.method = "select";
    this.selectCols = cols;
    return this;
  }

  insert(data: any) {
    this.method = "insert";
    this.payload = data;
    return this;
  }

  update(data: any) {
    this.method = "update";
    this.payload = data;
    return this;
  }

  delete() {
    this.method = "delete";
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, op: "eq", value });
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push({ field, op: "neq", value });
    return this;
  }

  ilike(field: string, value: any) {
    this.filters.push({ field, op: "ilike", value });
    return this;
  }

  or(filterStr: string) {
    this.orFilter = filterStr;
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col;
    this.isAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async execute() {
    try {
      await authReadyPromise;
      const colRef = collection(firestore, this.table);

      // --- INSERT ---
      if (this.method === "insert") {
        const itemsToInsert = Array.isArray(this.payload) ? this.payload : [this.payload];
        const insertedItems: any[] = [];

        for (const item of itemsToInsert) {
          const newItem = { ...item };
          if (!newItem.id) {
            newItem.id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              const v = c === "x" ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }
          if (!newItem.created_at) {
            newItem.created_at = new Date().toISOString();
          }

          if (this.table === "profiles") {
            newItem.coins = newItem.coins ?? 1000;
            newItem.rubies = newItem.rubies ?? 10;
            newItem.likes = newItem.likes ?? 0;
            newItem.total_xp = newItem.total_xp ?? 0;
            newItem.border = newItem.border ?? "none";
            newItem.border_thickness = newItem.border_thickness ?? "2px";
            newItem.custom_status = newItem.custom_status ?? "online";
          }

          await setDoc(doc(firestore, this.table, newItem.id), sanitizeForFirestore(newItem));
          insertedItems.push(newItem);
        }

        if (this.isSingle) {
          return { data: insertedItems[0] || null, error: null };
        }
        return { data: Array.isArray(this.payload) ? insertedItems : (insertedItems[0] || null), error: null };
      }

      // --- SELECT ---
      if (this.method === "select") {
        const qSnap = await getDocs(colRef);
        let list = qSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        let matched = list.filter(row => {
          if (this.filters && this.filters.length > 0) {
            for (const f of this.filters) {
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

          if (this.orFilter) {
            const conditions = this.orFilter.split(",");
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

        if (this.orderCol) {
          matched.sort((a, b) => {
            const valA = a[this.orderCol!];
            const valB = b[this.orderCol!];
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            
            let cmp = 0;
            if (typeof valA === "number" && typeof valB === "number") {
              cmp = valA - valB;
            } else {
              cmp = String(valA).localeCompare(String(valB));
            }
            return this.isAscending ? cmp : -cmp;
          });
        }

        if (this.limitCount !== undefined && this.limitCount !== null) {
          matched = matched.slice(0, Number(this.limitCount));
        }

        // Handle nested relation queries (e.g. *, profiles(...) or *, profiles:author_id(...))
        const relationMatch = this.selectCols ? this.selectCols.match(/(\w+)(?:\s*:\s*(\w+))?\s*\(([^)]+)\)/) : null;
        if (relationMatch) {
          const relationCollection = relationMatch[1];
          const foreignKeyField = relationMatch[2] || "profile_id";
          const relationPropName = relationMatch[1];
          const subFields = relationMatch[3].split(",").map(f => f.trim());

          const idsToFetch = Array.from(new Set(
            matched
              .map(row => row[foreignKeyField])
              .filter(id => typeof id === "string" && id !== "")
          ));

          const fetchedDataMap: { [id: string]: any } = {};
          await Promise.all(idsToFetch.map(async (id) => {
            try {
              const docSnap = await getDoc(doc(firestore, relationCollection, id));
              if (docSnap.exists()) {
                const fullData = docSnap.data();
                if (subFields.length > 0 && !subFields.includes("*")) {
                  const filtered: any = {};
                  for (const f of subFields) {
                    if (fullData[f] !== undefined) {
                      filtered[f] = fullData[f];
                    }
                  }
                  fetchedDataMap[id] = filtered;
                } else {
                  fetchedDataMap[id] = fullData;
                }
              }
            } catch (err) {
              console.warn(`Failed to join ${relationCollection} for id ${id}:`, err);
            }
          }));

          matched = matched.map(row => {
            const fkValue = row[foreignKeyField];
            return {
              ...row,
              [relationPropName]: fkValue ? (fetchedDataMap[fkValue] || null) : null
            };
          });
        }

        if (this.selectCols && this.selectCols !== "*" && this.selectCols !== "" && !this.selectCols.includes("*") && !this.selectCols.includes("(")) {
          const colFields = this.selectCols.split(",").map((f: string) => f.trim());
          matched = matched.map(row => {
            const mappedRow: any = {};
            for (const f of colFields) {
              mappedRow[f] = row[f];
            }
            return mappedRow;
          });
        }

        if (this.isSingle) {
          return { data: matched[0] || null, error: null };
        }
        return { data: matched, error: null };
      }

      // --- UPDATE ---
      if (this.method === "update") {
        if (!this.filters || this.filters.length === 0) {
          return { data: null, error: { message: "Update method requires filters (eq) to protect data" } };
        }

        const qSnap = await getDocs(colRef);
        const list = qSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        const updatedItems: any[] = [];

        for (const row of list) {
          let matchesAllFilters = true;
          for (const f of this.filters) {
            if (f.op === "eq") {
              if (String(row[f.field]) !== String(f.value)) {
                matchesAllFilters = false;
                break;
              }
            }
          }

          if (matchesAllFilters) {
            const updatedRow = { ...row, ...this.payload };
            await setDoc(doc(firestore, this.table, row.id), sanitizeForFirestore(updatedRow));
            updatedItems.push(updatedRow);
          }
        }

        if (this.isSingle) {
          return { data: updatedItems[0] || null, error: null };
        }
        return { data: updatedItems, error: null };
      }

      // --- DELETE ---
      if (this.method === "delete") {
        if (!this.filters || this.filters.length === 0) {
          return { data: null, error: { message: "Delete method requires filters to prevent complete wipe" } };
        }

        const qSnap = await getDocs(colRef);
        const list = qSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        const deletedItems: any[] = [];

        for (const row of list) {
          let matchesAllFilters = true;
          for (const f of this.filters) {
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
            await deleteDoc(doc(firestore, this.table, row.id));
            deletedItems.push(row);
          }
        }

        return { data: deletedItems, error: null };
      }

      return { data: null, error: { message: `Unsupported method: ${this.method}` } };
    } catch (err: any) {
      return { data: null, error: { message: err.message || String(err) } };
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

class Channel {
  name: string;
  config: any;
  listeners: Array<{
    type: string;
    filter: any;
    callback: (payload: any) => void;
  }> = [];
  presenceCallbacks: Array<{ event: string; callback: (payload?: any) => void }> = [];
  lastPresenceState: any = {};
  trackedInfo: any = null;
  private unsubscribeFunctions: Array<() => void> = [];

  constructor(name: string, config?: any) {
    this.name = name;
    this.config = config;
  }

  on(type: string, filter: any, callback: (payload: any) => void) {
    if (type === "postgres_changes") {
      this.listeners.push({ type, filter, callback });
    } else if (type === "presence") {
      this.presenceCallbacks.push({ event: filter.event || "sync", callback: callback || (filter as any) });
    }
    return this;
  }

  presenceState() {
    return this.lastPresenceState;
  }

  async track(info: any) {
    this.trackedInfo = info;
    const sessionStr = localStorage.getItem("mock_musicvibe_session");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const presenceDocRef = doc(firestore, "presences", userId);
      await setDoc(presenceDocRef, sanitizeForFirestore({
        userId,
        username: info?.username || session?.user?.user_metadata?.username || "User",
        online_at: info?.online_at || new Date().toISOString(),
        last_ping: Date.now()
      }));
    } catch (e) {
      console.error("Presence track error:", e);
    }
  }

  async untrack() {
    this.trackedInfo = null;
    const sessionStr = localStorage.getItem("mock_musicvibe_session");
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const presenceDocRef = doc(firestore, "presences", userId);
      await deleteDoc(presenceDocRef);
    } catch (e) {
      console.error("Presence untrack error:", e);
    }
  }

  subscribe(callback?: (status: string) => void) {
    // Listen to real-time events on Firestore collection snapshots
    for (const listener of this.listeners) {
      if (listener.type === "postgres_changes") {
        const table = listener.filter.table;
        const colRef = collection(firestore, table);
        
        let isFirst = true;
        const unsub = onSnapshot(colRef, (snapshot) => {
          if (isFirst) {
            isFirst = false;
            return; // Skip initial load to mimic real-time events
          }

          snapshot.docChanges().forEach((change) => {
            const row = { id: change.doc.id, ...change.doc.data() };
            let eventType: "INSERT" | "UPDATE" | "DELETE" = "INSERT";
            let newVal: any = row;
            let oldVal: any = null;

            if (change.type === "added") {
              eventType = "INSERT";
              newVal = row;
            } else if (change.type === "modified") {
              eventType = "UPDATE";
              newVal = row;
            } else if (change.type === "removed") {
              eventType = "DELETE";
              newVal = null;
              oldVal = row;
            }

            if (listener.filter && listener.filter.event && listener.filter.event !== '*') {
              if (listener.filter.event !== eventType) {
                return;
              }
            }

            listener.callback({
              eventType,
              new: newVal,
              old: oldVal
            });
          });
        });

        this.unsubscribeFunctions.push(unsub);
      }
    }

    // Subscribe to presence
    const presencesRef = collection(firestore, "presences");
    const presenceUnsub = onSnapshot(presencesRef, (snapshot) => {
      const now = Date.now();
      const state: any = {};

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        if (now - (data.last_ping || 0) < 30000) {
          state[data.userId] = [{
            username: data.username,
            online_at: data.online_at,
            last_ping: data.last_ping
          }];
        }
      });

      // Track joins and leaves for callback correctness
      const joinedIds = Object.keys(state).filter(id => !this.lastPresenceState[id]);
      const leftIds = Object.keys(this.lastPresenceState).filter(id => !state[id]);

      this.lastPresenceState = state;
      for (const pCallback of this.presenceCallbacks) {
        try {
          if (pCallback.event === "sync") {
            pCallback.callback();
          } else if (pCallback.event === "join" && joinedIds.length > 0) {
            for (const id of joinedIds) {
              pCallback.callback({ key: id, newPresences: state[id] });
            }
          } else if (pCallback.event === "leave" && leftIds.length > 0) {
            for (const id of leftIds) {
              pCallback.callback({ key: id, leftPresences: this.lastPresenceState[id] || [] });
            }
          }
        } catch (e) {
          console.error("Presence sync callback error:", e);
        }
      }
    });

    this.unsubscribeFunctions.push(presenceUnsub);

    if (callback) {
      setTimeout(() => callback("SUBSCRIBED"), 5);
    }
    return this;
  }

  unsubscribe() {
    this.unsubscribeFunctions.forEach(unsub => {
      try {
        unsub();
      } catch (e) {
        console.error("Unsubscribe error:", e);
      }
    });
    this.unsubscribeFunctions = [];
  }
}

class StorageBucketBuilder {
  private bucketName: string;

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async upload(filePath: string, file: File, options?: any) {
    // Explicitly throw an error to trigger the robust automatic base64 fallback
    // defined inside src/lib/storage.ts
    return { data: null, error: { message: "Triggering automatic base64 fallback" } };
  }

  getPublicUrl(filePath: string) {
    return { data: { publicUrl: `/uploads/${filePath}` } };
  }
}

const authListeners = new Set<(event: string, session: any) => void>();

export const supabase = {
  auth: {
    async getSession() {
      if (typeof window === "undefined") return { data: { session: null }, error: null };
      const sessStr = localStorage.getItem("mock_musicvibe_session");
      const session = sessStr ? JSON.parse(sessStr) : null;
      return { data: { session }, error: null };
    },

    async getUser() {
      if (typeof window === "undefined") return { data: { user: null }, error: null };
      const sessStr = localStorage.getItem("mock_musicvibe_session");
      const session = sessStr ? JSON.parse(sessStr) : null;
      return { data: { user: session?.user || null }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);
      
      if (typeof window !== "undefined") {
        const sessStr = localStorage.getItem("mock_musicvibe_session");
        const session = sessStr ? JSON.parse(sessStr) : null;
        setTimeout(() => {
          callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
        }, 5);
      }

      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            }
          }
        }
      };
    },

    async signUp({ email, password, options }: any) {
      try {
        const username = options?.data?.username || email.split("@")[0];
        const gender = options?.data?.gender || "OTHER";
        const age = options?.data?.age || 18;

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userObj = userCredential.user;

        const profilePayload = {
          id: userObj.uid,
          username,
          pfp: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          banner: "",
          about_me: "",
          mood: "",
          last_online: new Date().toISOString(),
          language: "en",
          current_room: "main",
          rank: ["haydensixseven@gmail.com", "test@gmail.com", "dev@gmail.com", "haydensixsevennn@gmail.com"].includes(email.toLowerCase().trim()) ? "DEVELOPER" : "USER",
          likes: 0,
          effect: "none",
          border: "none",
          border_thickness: "2px",
          card_bg: "",
          email: email.toLowerCase().trim(),
          coins: 1000,
          rubies: 10,
          total_xp: 0,
          weekly_xp: 0,
          monthly_xp: 0,
          chat_background: "",
          custom_status: "online",
          custom_profile_enabled: false,
          age: Number(age),
          gender: gender
        };
        await setDoc(doc(firestore, "profiles", userObj.uid), sanitizeForFirestore(profilePayload));

        const session = {
          access_token: userObj.uid,
          user: {
            id: userObj.uid,
            email: userObj.email,
            user_metadata: {
              username,
              gender,
              age: Number(age)
            }
          }
        };

        localStorage.setItem("mock_musicvibe_session", JSON.stringify(session));
        for (const listener of authListeners) {
          listener("SIGNED_IN", session);
        }
        return { data: { user: session.user, session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || String(err) } };
      }
    },

    async signInWithPassword({ email, password }: any) {
      try {
        let emailToUse = email;
        if (!email.includes("@")) {
          // If a username was entered instead of email, lookup email from profiles collection
          const profilesRef = collection(firestore, "profiles");
          // Use query and where which we need to import or use from the SDK
          // We can just use the getDocs without query if we don't have query imported, but let's just use query
          const qSnap = await getDocs(profilesRef);
          const found = qSnap.docs.find(d => {
            const data = d.data();
            return data?.username?.toLowerCase() === email.toLowerCase();
          });
          if (found && found.data().email) {
            emailToUse = found.data().email;
          } else {
            return { data: { user: null, session: null }, error: { message: "Username not found" } };
          }
        }

        const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
        const userObj = userCredential.user;

        const profileDoc = await getDoc(doc(firestore, "profiles", userObj.uid));
        const profileData = profileDoc.exists() ? profileDoc.data() : null;

        const session = {
          access_token: userObj.uid,
          user: {
            id: userObj.uid,
            email: userObj.email,
            user_metadata: {
              username: profileData?.username || email.split("@")[0],
              gender: profileData?.gender || "OTHER",
              age: profileData?.age || 18
            }
          }
        };

        localStorage.setItem("mock_musicvibe_session", JSON.stringify(session));
        for (const listener of authListeners) {
          listener("SIGNED_IN", session);
        }
        return { data: { user: session.user, session }, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: { message: err.message || String(err) } };
      }
    },

    async signOut() {
      try {
        const sessionStr = localStorage.getItem("mock_musicvibe_session");
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          const userId = session?.user?.id;
          if (userId) {
            const presenceDocRef = doc(firestore, "presences", userId);
            await deleteDoc(presenceDocRef);
          }
        }
        await signOut(auth);
      } catch (e) {
        console.warn("Sign out presence cleanup failed:", e);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_musicvibe_session");
      }
      for (const listener of authListeners) {
        listener("SIGNED_OUT", null);
      }
      return { error: null };
    },

    async updateUser({ password }: any) {
      try {
        const user = auth.currentUser;
        if (user && password) {
          await updatePassword(user, password);
        }
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message || String(err) } };
      }
    }
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  channel(name: string, config?: any) {
    return new Channel(name, config);
  },

  removeChannel(channel: Channel) {
    channel.unsubscribe();
  },

  storage: {
    from(bucketName: string) {
      return new StorageBucketBuilder(bucketName);
    },
    async createBucket(bucketName: string, options?: any) {
      return { data: { name: bucketName }, error: null };
    }
  }
};

// Auto-run presence heartbeat & cleanup in the background
if (typeof window !== "undefined") {
  setInterval(async () => {
    // Only run heartbeat if the user is authenticated in Firebase Auth
    if (!auth.currentUser) return;

    const sessionStr = localStorage.getItem("mock_musicvibe_session");
    if (!sessionStr) return;
    try {
      const session = JSON.parse(sessionStr);
      const userId = session?.user?.id;
      if (!userId || auth.currentUser.uid !== userId) return;

      const presenceDocRef = doc(firestore, "presences", userId);
      const docSnap = await getDoc(presenceDocRef);
      if (docSnap.exists()) {
        await updateDoc(presenceDocRef, {
          last_ping: Date.now()
        });
      }
    } catch (e) {
      console.warn("Heartbeat update failed:", e);
    }
  }, 10000);
}

// Seed custom ranks if the Firestore database is completely empty
async function seedDefaultRanksIfNeeded() {
  try {
    const ranksRef = collection(firestore, "custom_ranks");
    const qSnap = await getDocs(ranksRef);
    if (qSnap.empty) {
      console.log("Seeding default ranks to Firestore...");
      const defaultRanks = [
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
      for (const r of defaultRanks) {
        await setDoc(doc(firestore, "custom_ranks", r.id), sanitizeForFirestore(r));
      }
      console.log("Default ranks successfully seeded!");
    }
  } catch (err) {
    console.error("Failed to seed default ranks:", err);
  }
}
seedDefaultRanksIfNeeded();
