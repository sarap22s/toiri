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
};

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
  persist();
}

const uid = () => Math.random().toString(36).slice(2, 10);

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PROJECT_KEY,
      JSON.stringify({
        messages: state.messages.slice(-60),
        files: state.files,
        activeFile: state.activeFile,
        versions: state.versions.slice(-20),
        publishedSlug: state.publishedSlug,
      }),
    );
  } catch {
    /* storage full or blocked — keep working in memory */
  }
}

function restore() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(PROJECT_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<State>;
    if (saved.files && typeof saved.files === "object") {
      state = {
        ...state,
        files: saved.files as Record<string, string>,
        activeFile: saved.activeFile ?? "/App.js",
        messages: Array.isArray(saved.messages) ? saved.messages : [],
        versions: Array.isArray(saved.versions) ? saved.versions : [],
        publishedSlug:
          typeof saved.publishedSlug === "string" ? saved.publishedSlug : null,
      };
    }
  } catch {
    /* ignore corrupt saves */
  }
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
    set({ lang });
  },
  setCredits(credits: number) {
    set({ credits });
  },

  addMessage(role: ChatMessage["role"], content: string) {
    const message: ChatMessage = { id: uid(), role, content };
    set({ messages: [...state.messages, message] });
    return message;
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
  restoreVersion(id: string) {
    const version = state.versions.find((v) => v.id === id);
    if (!version) return;
    set({ files: { ...state.files, "/App.js": version.code }, activeFile: "/App.js" });
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
    set({
      messages: [],
      files: { "/App.js": STARTER_APP },
      activeFile: "/App.js",
      versions: [],
      publishedSlug: null,
    });
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
