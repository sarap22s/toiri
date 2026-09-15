import { useSyncExternalStore } from "react";
import type { Lang } from "./i18n";
import { DEMO_APP, DEMO_INTRO } from "./demo-app";


export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type State = {
  messages: ChatMessage[];
  isLoading: boolean;
  files: Record<string, string>;
  activeFile: string;
  credits: number | null;
  showPricing: boolean;
  lang: Lang;
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
          Ask on the left and your app appears here.
        </p>
      </div>
    </div>
  );
}
`;

const FREE_CREDITS = 10;
const CREDITS_KEY = "toiri.credits";
const LANG_KEY = "toiri.lang";

let state: State = {
  messages: [],
  isLoading: false,
  files: { "/App.js": STARTER_APP },
  activeFile: "/App.js",
  credits: null,
  showPricing: false,
  lang: "en",
};

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const uid = () => Math.random().toString(36).slice(2, 10);

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
    const rawCredits = window.localStorage.getItem(CREDITS_KEY);
    const credits = rawCredits === null ? FREE_CREDITS : Number(rawCredits);
    window.localStorage.setItem(CREDITS_KEY, String(credits));
    set({ lang, credits: Number.isFinite(credits) ? credits : FREE_CREDITS });
  },
  setLang(lang: Lang) {
    if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, lang);
    set({ lang });
  },
  setCredits(credits: number) {
    if (typeof window !== "undefined")
      window.localStorage.setItem(CREDITS_KEY, String(credits));
    set({ credits });
  },
  spendCredit() {
    const next = Math.max(0, (state.credits ?? 0) - 1);
    store.setCredits(next);
  },
  resetFreeCredits() {
    store.setCredits(FREE_CREDITS);
  },
  addMessage(role: ChatMessage["role"], content: string) {
    const message: ChatMessage = { id: uid(), role, content };
    set({ messages: [...state.messages, message] });
    return message;
  },
  setLoading(isLoading: boolean) {
    set({ isLoading });
  },
  setShowPricing(showPricing: boolean) {
    set({ showPricing });
  },
  writeFile(path: string, content: string) {
    set({ files: { ...state.files, [path]: content }, activeFile: path });
  },
  loadDemo() {
    const intro = DEMO_INTRO[state.lang];
    set({
      files: { ...state.files, "/App.js": DEMO_APP },
      activeFile: "/App.js",
      messages: [
        ...state.messages,
        { id: uid(), role: "assistant" as const, content: intro },
      ],
    });
  },
  reset() {
    set({ messages: [], files: { "/App.js": STARTER_APP }, activeFile: "/App.js" });
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
