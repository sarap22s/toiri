import type { Lang } from "./i18n";

export type BuildSummary = {
  path: string;
  lines: number;
  features: string[];
};

type Rule = { key: string; test: RegExp; label: Record<Lang, string> };

const RULES: Rule[] = [
  {
    key: "form",
    test: /<(input|textarea|select)\b|onSubmit/i,
    label: { en: "Form with validation", bn: "ফর্ম ও যাচাই" },
  },
  {
    key: "cart",
    test: /cart|কার্ট|basket/i,
    label: { en: "Cart", bn: "কার্ট" },
  },
  {
    key: "checkout",
    test: /checkout|order|চেকআউট|অর্ডার/i,
    label: { en: "Order / checkout", bn: "অর্ডার ও চেকআউট" },
  },
  {
    key: "payment",
    test: /bkash|nagad|বিকাশ|নগদ|cash on delivery|ক্যাশ অন ডেলিভারি/i,
    label: { en: "Local payment options", bn: "স্থানীয় পেমেন্ট অপশন" },
  },
  {
    key: "state",
    test: /useState|useReducer/,
    label: { en: "Interactive state", bn: "ইন্টার‍্যাক্টিভ কাজ" },
  },
  {
    key: "bangla",
    test: /[\u0980-\u09FF]/,
    label: { en: "Bangla text", bn: "বাংলা লেখা" },
  },
  {
    key: "responsive",
    test: /flexWrap|minmax|auto-fit|@media|maxWidth/i,
    label: { en: "Mobile friendly layout", bn: "মোবাইল ফ্রেন্ডলি লেআউট" },
  },
  {
    key: "a11y",
    test: /aria-|htmlFor|alt=/,
    label: { en: "Accessible labels", bn: "অ্যাক্সেসিবল লেবেল" },
  },
  {
    key: "search",
    test: /filter\(|search|খুঁজ/i,
    label: { en: "Search / filtering", bn: "সার্চ ও ফিল্টার" },
  },
  {
    key: "chat",
    test: /chat|message|চ্যাট|বার্তা/i,
    label: { en: "Chat / messages", bn: "চ্যাট ও বার্তা" },
  },
];

export function summarizeBuild(path: string, code: string): BuildSummary {
  const features = RULES.filter((r) => r.test.test(code)).map((r) => r.key);
  return {
    path,
    lines: code.split("\n").length,
    features: features.slice(0, 6),
  };
}

export function featureLabel(key: string, lang: Lang): string {
  return RULES.find((r) => r.key === key)?.label[lang] ?? key;
}
