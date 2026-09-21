import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";
import { DEMO_APP, DEMO_INTRO } from "./demo-app";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Version = {
  id: string;
  label: string;
  code: string;
  ts: number;
};

/** One saved project/conversation in the local chat history. */
export type ChatSummary = {
  id: string;
  title: string;
  ts: number;
};

export type State = {
  messages: ChatMessage[];
  isLoading: boolean;
  files: Record<string, string>;
  activeFile: string;
  versions: Version[];
  credits: number | null;
  showPricing: boolean;
  lang: Lang;
  deviceId: string;
  publishedSlug: string | null;
  storageError: boolean;
  chats: ChatSummary[];
  activeChatId: string;
};

const STARTER_APP = `export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0a0a0c",
      color: "#e7e7ee",
      fontFamily: "system-ui, sans-serif",
      textAlign: "center",
      padding: 24
    }}>
      <div>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>তৈরি</div>
        <p style={{ color: "#8b8b9e", marginTop: 8 }}>
          Describe your app in the chat and it appears here.
        </p>
      </div>
    </div>
  );
}
`;

const FREE_CREDITS = 10;
const DEVICE_KEY = "toiri.device";
const LANG_KEY = "toiri.lang";
const PROJECT_KEY = "toiri.project";
const CHATS_KEY = "toiri.chats";
const ACTIVE_KEY = "toiri.activeChat";
const chatKey = (id: string) => `toiri.chat.${id}`;

const uid = () => Math.random().toString(36).slice(2, 10);

let state: State = {
  messages: [],
  isLoading: false,
  files: { "/App.js": STARTER_APP },
  activeFile: "/App.js",
  versions: [],
  credits: null,
  showPricing: false,
  lang: "en",
  deviceId: "",
  publishedSlug: null,
  storageError: false,
  chats: [],
  activeChatId: "",
};

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  persist();
}

function chatPayload() {
  return {
    messages: state.messages.slice(-60),
    files: state.files,
    activeFile: state.activeFile,
    versions: state.versions.slice(-20),
    publishedSlug: state.publishedSlug,
  };
}

function deriveTitle(): string {
  const firstUser = state.messages.find((m) => m.role === "user");
  const text = firstUser?.content.split("\n")[0]?.trim();
  return (text && text.slice(0, 60)) || (state.lang === "bn" ? "নতুন প্রজেক্ট" : "New project");
}

function persist() {
  if (typeof window === "undefined" || !state.activeChatId) return;
  try {
    const chats = state.chats.map((c) =>
      c.id === state.activeChatId ? { ...c, title: deriveTitle(), ts: Date.now() } : c,
    );
    state = { ...state, chats };
    window.localStorage.setItem(chatKey(state.activeChatId), JSON.stringify(chatPayload()));
    window.localStorage.setItem(CHATS_KEY, JSON.stringify(chats.slice(0, 40)));
    window.localStorage.setItem(ACTIVE_KEY, state.activeChatId);
  } catch {
    if (!state.storageError) {
      state = { ...state, storageError: true };
      listeners.forEach((listener) => listener());
    }
  }
}

type SavedChat = {
  messages?: ChatMessage[];
  files?: Record<string, string>;
  activeFile?: string;
  versions?: Version[];
  publishedSlug?: string | null;
};

function readChat(id: string): SavedChat | null {
  try {
    const raw = window.localStorage.getItem(chatKey(id));
    return raw ? (JSON.parse(raw) as SavedChat) : null;
  } catch {
    return null;
  }
}

function applyChat(id: string, saved: SavedChat | null) {
  state = {
    ...state,
    activeChatId: id,
    messages: Array.isArray(saved?.messages) ? saved!.messages : [],
    files:
      saved?.files && typeof saved.files === "object"
        ? saved.files
        : { "/App.js": STARTER_APP },
    activeFile: saved?.activeFile ?? "/App.js",
    versions: Array.isArray(saved?.versions) ? saved!.versions : [],
    publishedSlug: typeof saved?.publishedSlug === "string" ? saved.publishedSlug : null,
  };
}

function restore() {
  if (typeof window === "undefined") return;
  let chats: ChatSummary[] = [];
  try {
    const raw = window.localStorage.getItem(CHATS_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatSummary[]) : [];
    if (Array.isArray(parsed)) chats = parsed.filter((c) => c && typeof c.id === "string");
  } catch {
    chats = [];
  }

  // Migrate a single legacy project into the new chat history.
  if (!chats.length) {
    const legacyRaw = (() => {
      try {
        return window.localStorage.getItem(PROJECT_KEY);
      } catch {
        return null;
      }
    })();
    const id = uid();
    let saved: SavedChat | null = null;
    if (legacyRaw) {
      try {
        saved = JSON.parse(legacyRaw) as SavedChat;
      } catch {
        saved = null;
      }
    }
    chats = [{ id, title: "", ts: Date.now() }];
    state = { ...state, chats };
    applyChat(id, saved);
    state = { ...state, chats: [{ id, title: deriveTitle(), ts: Date.now() }] };
    return;
  }

  const activeId = window.localStorage.getItem(ACTIVE_KEY);
  const active = chats.find((c) => c.id === activeId) ?? chats[0]!;
  state = { ...state, chats };
  applyChat(active.id, readChat(active.id));
}

function readDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing && /^[a-zA-Z0-9-]{8,64}$/.test(existing)) return existing;
  const fresh =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${uid()}${uid()}${uid()}`;
  window.localStorage.setItem(DEVICE_KEY, fresh);
  return fresh;
}

export const store = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hydrate() {
    if (typeof window === "undefined") return;
    const rawLang = window.localStorage.getItem(LANG_KEY);
    const lang: Lang = rawLang === "bn" ? "bn" : "en";
    const deviceId = readDeviceId();
    restore();
    set({ lang, deviceId });
    void store.refreshCredits();
  },
  async refreshCredits() {
    if (!state.deviceId) return;
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: state.deviceId }),
      });
      const data = (await res.json()) as { credits?: number };
      if (typeof data.credits === "number") set({ credits: data.credits });
    } catch {
      /* keep the last known balance */
    }
  },
  setLang(lang: Lang) {
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, lang);
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    set({ lang });
  },
  setCredits(credits: number) {
    set({ credits });
  },

  /** Starts a fresh project and keeps the current one in history. */
  newChat() {
    persist();
    const id = uid();
    const chats = [
      { id, title: state.lang === "bn" ? "নতুন প্রজেক্ট" : "New project", ts: Date.now() },
      ...state.chats,
    ].slice(0, 40);
    state = { ...state, chats };
    applyChat(id, null);
    listeners.forEach((l) => l());
    persist();
    return id;
  },
  openChat(id: string) {
    if (id === state.activeChatId) return;
    persist();
    applyChat(id, readChat(id));
    listeners.forEach((l) => l());
    persist();
  },
  deleteChat(id: string) {
    try {
      window.localStorage.removeItem(chatKey(id));
    } catch {
      /* ignore */
    }
    const chats = state.chats.filter((c) => c.id !== id);
    if (id === state.activeChatId) {
      if (chats.length) {
        state = { ...state, chats };
        applyChat(chats[0]!.id, readChat(chats[0]!.id));
        listeners.forEach((l) => l());
        persist();
      } else {
        state = { ...state, chats: [] };
        store.newChat();
      }
      return;
    }
    set({ chats });
  },

  addMessage(role: ChatMessage["role"], content: string) {
    const message: ChatMessage = { id: uid(), role, content };
    set({ messages: [...state.messages, message] });
    return message;
  },
  /** Drops trailing assistant replies and returns the last user prompt. */
  rewindToLastUser(): string | null {
    const idx = [...state.messages].map((m) => m.role).lastIndexOf("user");
    if (idx === -1) return null;
    set({ messages: state.messages.slice(0, idx + 1) });
    return state.messages[idx]?.content ?? null;
  },
  updateMessage(id: string, content: string) {
    set({
      messages: state.messages.map((m) => (m.id === id ? { ...m, content } : m)),
    });
  },
  setPublishedSlug(publishedSlug: string | null) {
    set({ publishedSlug });
  },
  async publish(title: string) {
    const code = state.files["/App.js"] ?? "";
    if (state.activeFile !== "/App.js" && state.files[state.activeFile] !== code) {
      throw new Error(
        state.lang === "bn"
          ? "ইমপোর্ট করা প্রজেক্টটি এখনও এক ফাইলের পাবলিশ ফরম্যাটে প্রস্তুত নয়। চ্যাটে বলে /App.js ফাইলে রূপান্তর করুন।"
          : "This imported project is not ready for single-file publishing. Ask Toiri to convert it into /App.js first.",
      );
    }
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceId: state.deviceId,
        code,
        title,
        slug: state.publishedSlug,
      }),
    });
    const data = (await res.json()) as { slug?: string; error?: string };
    if (!res.ok || !data.slug) throw new Error(data.error || "Could not publish.");
    set({ publishedSlug: data.slug });
    return data.slug;
  },
  setLoading(isLoading: boolean) {
    set({ isLoading });
  },
  setShowPricing(showPricing: boolean) {
    set({ showPricing });
  },
  writeFile(path: string, content: string, label?: string) {
    const version: Version = {
      id: uid(),
      label: label?.slice(0, 70) || path,
      code: content,
      ts: Date.now(),
    };
    set({
      files: { ...state.files, [path]: content },
      activeFile: path,
      versions: [...state.versions, version].slice(-20),
    });
  },
  /** Adds a batch of files (uploaded or imported from GitHub) to the project. */
  importFiles(incoming: { path: string; content: string }[], label?: string) {
    if (!incoming.length) return;
    const files = { ...state.files };
    for (const f of incoming) {
      const path = f.path.startsWith("/") ? f.path : `/${f.path}`;
      files[path] = f.content;
    }
    const preferred =
      incoming.find((f) => /App\.(jsx?|tsx?)$/i.test(f.path))?.path ??
      incoming.find((f) => /\.(jsx|tsx)$/i.test(f.path))?.path ??
      incoming[0]!.path;
    const activeFile = preferred.startsWith("/") ? preferred : `/${preferred}`;
    const version: Version = {
      id: uid(),
      label: (label ?? "Imported files").slice(0, 70),
      code: files["/App.js"] ?? state.files["/App.js"] ?? "",
      ts: Date.now(),
    };
    set({
      files,
      activeFile,
      versions: [...state.versions, version].slice(-20),
    });
  },
  restoreVersion(id: string) {
    const version = state.versions.find((v) => v.id === id);
    if (!version) return;
    const current = state.files["/App.js"] ?? "";
    const undo: Version = {
      id: uid(),
      label: state.lang === "bn" ? "রিস্টোরের আগের সংস্করণ" : "Before version restore",
      code: current,
      ts: Date.now(),
    };
    set({
      files: { ...state.files, "/App.js": version.code },
      activeFile: "/App.js",
      versions: [...state.versions, undo].slice(-20),
    });
  },
  loadDemo() {
    const intro = DEMO_INTRO[state.lang];
    set({
      files: { ...state.files, "/App.js": DEMO_APP },
      activeFile: "/App.js",
      versions: [
        ...state.versions,
        { id: uid(), label: "Sample bakery app", code: DEMO_APP, ts: Date.now() },
      ].slice(-20),
      messages: [
        ...state.messages,
        { id: uid(), role: "assistant" as const, content: intro },
      ],
    });
  },
  reset() {
    store.newChat();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}

export const FREE_CREDIT_COUNT = FREE_CREDITS;
