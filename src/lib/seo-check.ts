import type { Lang } from "./i18n";

export type SeoStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  status: SeoStatus;
  title: Record<Lang, string>;
  hint: Record<Lang, string>;
};

export type SeoReport = {
  score: number;
  checks: SeoCheck[];
};

function make(
  id: string,
  ok: boolean,
  warn: boolean,
  en: string,
  bn: string,
  hintEn: string,
  hintBn: string,
): SeoCheck {
  return {
    id,
    status: ok ? "pass" : warn ? "warn" : "fail",
    title: { en, bn },
    hint: { en: hintEn, bn: hintBn },
  };
}

/**
 * Lightweight static SEO / accessibility review of the generated single-file app.
 * It reads the source text rather than the rendered DOM, so it stays fast and
 * works before the preview finishes booting.
 */
export function runSeoCheck(code: string): SeoReport {
  const src = code ?? "";
  const has = (re: RegExp) => re.test(src);

  const imgs = src.match(/<img\b[^>]*>/gi) ?? [];
  const imgsWithoutAlt = imgs.filter((tag) => !/\balt\s*=/.test(tag));

  const iconOnlyButtons =
    (src.match(/<button\b[^>]*>\s*(<svg|\{<)/gi) ?? []).length > 0 &&
    !has(/aria-label\s*=/);

  const headings = src.match(/<h([1-6])\b/gi) ?? [];
  const h1Count = (src.match(/<h1\b/gi) ?? []).length;

  const checks: SeoCheck[] = [
    make(
      "title",
      has(/document\.title\s*=/) || has(/<title\b/i),
      false,
      "Page title",
      "পেজ টাইটেল",
      "Set document.title so search results and browser tabs show a real name.",
      "document.title সেট করুন যাতে সার্চ রেজাল্ট ও ট্যাবে আসল নাম দেখা যায়।",
    ),
    make(
      "description",
      has(/name\s*=\s*["']description["']/i) || has(/meta\[name=["']description/i),
      false,
      "Meta description",
      "মেটা বর্ণনা",
      "Add a short description meta tag — it becomes the text under your link on Google.",
      "একটি ছোট description মেটা ট্যাগ দিন — গুগলে লিংকের নিচে এটিই দেখায়।",
    ),
    make("h1", h1Count === 1, h1Count > 1, "One main heading (H1)", "একটি প্রধান হেডিং (H1)",
      "Use exactly one <h1> with your app or business name.",
      "আপনার অ্যাপ বা ব্যবসার নাম দিয়ে ঠিক একটি <h1> রাখুন।"),
    make(
      "headings",
      headings.length >= 2,
      headings.length === 1,
      "Heading structure",
      "হেডিং কাঠামো",
      "Break content into sections with <h2>/<h3> headings.",
      "কনটেন্ট <h2>/<h3> হেডিং দিয়ে ভাগ করুন।",
    ),
    make(
      "img-alt",
      imgs.length === 0 || imgsWithoutAlt.length === 0,
      false,
      "Image alt text",
      "ছবির alt টেক্সট",
      `${imgsWithoutAlt.length} image(s) have no alt text. Describe each image briefly.`,
      `${imgsWithoutAlt.length}টি ছবিতে alt টেক্সট নেই। প্রতিটি ছবির সংক্ষিপ্ত বর্ণনা দিন।`,
    ),
    make(
      "landmarks",
      has(/<(main|header|nav|footer|section|article)\b/i),
      false,
      "Semantic sections",
      "সেমান্টিক সেকশন",
      "Use <header>, <main>, <section> and <footer> instead of only <div>.",
      "শুধু <div> না দিয়ে <header>, <main>, <section>, <footer> ব্যবহার করুন।",
    ),
    make(
      "labels",
      !has(/<input\b/i) || has(/<label\b/i) || has(/aria-label\s*=/),
      false,
      "Form field labels",
      "ফর্ম ফিল্ড লেবেল",
      "Every input needs a <label> or aria-label so people know what to type.",
      "প্রতিটি ইনপুটে <label> বা aria-label দিন যাতে কী লিখতে হবে বোঝা যায়।",
    ),
    make(
      "buttons",
      !iconOnlyButtons,
      false,
      "Button names",
      "বাটনের নাম",
      "Icon-only buttons need an aria-label describing the action.",
      "শুধু আইকনের বাটনে কাজ বোঝাতে aria-label দিন।",
    ),
    make(
      "lang",
      has(/lang\s*=\s*["'](bn|en)/i) || !/[\u0980-\u09FF]/.test(src),
      /[\u0980-\u09FF]/.test(src),
      "Language declared",
      "ভাষা ঘোষণা",
      'Bangla content should sit in an element with lang="bn".',
      'বাংলা কনটেন্ট lang="bn" সহ এলিমেন্টে রাখুন।',
    ),
    make(
      "contact",
      has(/tel:|mailto:|href\s*=\s*["']https?:/i),
      false,
      "Contact or links",
      "যোগাযোগ বা লিংক",
      "Add a phone (tel:), email or map link so customers can reach you.",
      "ফোন (tel:), ইমেইল বা ম্যাপ লিংক দিন যাতে গ্রাহক যোগাযোগ করতে পারে।",
    ),
  ];

  const earned = checks.reduce(
    (sum, c) => sum + (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0),
    0,
  );
  const score = checks.length === 0 ? 0 : Math.round((earned / checks.length) * 100);

  return { score, checks };
}

export function seoFixPrompt(report: SeoReport, lang: Lang): string {
  const issues = report.checks
    .filter((c) => c.status !== "pass")
    .map((c) => `- ${c.title[lang]}: ${c.hint[lang]}`)
    .join("\n");

  return lang === "bn"
    ? `অ্যাপটির SEO ও অ্যাক্সেসিবিলিটি ঠিক করো, ডিজাইন বা ফিচার না বদলে:\n${issues}`
    : `Improve this app's SEO and accessibility without changing the design or features:\n${issues}`;
}
