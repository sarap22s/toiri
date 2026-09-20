export type Lang = "en" | "bn";

type Dict = Record<string, string>;

export const STRINGS: Record<Lang, Dict> = {
  en: {
    tagline: "AI app builder for Bangladesh",
    assistantLabel: "Assistant",
    newChat: "New chat",
    whatToBuild: "What should we build?",
    chatIntro: "Describe an app in Bangla or English and watch it appear in the live preview.",
    thinking: "Thinking…",
    composerPlaceholder: "Build a todo app with a dark theme…",
    disclaimer: "Toiri builds a single-file React app in the live preview.",
    creditsLabel: "credits",
    previewTitle: "Live preview",
    previewApp: "App",
    previewCode: "Code",
    you: "You",
    updatedFile: "Updated",
    pricingTitle: "Credit packs",
    close: "Close",
    genericError: "Something went wrong. Please try again.",
    stop: "Stop",
    stopped: "Stopped.",
    retry: "Try again",
    offlineError: "No internet connection. Check your network and try again.",
    networkError: "Could not reach Toiri. Check your connection and try again.",
    comingSoon: "Payments coming soon",
    trySample: "Load a sample app (Bangla bakery chatbot)",
    copyCode: "Copy code",
    copied: "Copied",
    download: "Download",
    history: "History",
    restore: "Restore",
    noVersions: "No versions yet — build something first.",
    versionsTitle: "Version history",
    publish: "Publish",
    republish: "Update link",
    publishing: "Publishing…",
    publishedTitle: "Toiri app",
    shareTitle: "Your app is live",
    shareHint: "Anyone with this link can open your app.",
    copyLink: "Copy link",
    openLink: "Open",
    attach: "Attach files",
    importGithub: "Import from GitHub",
    githubTitle: "Import from GitHub",
    githubHint:
      "Paste a public repository link. Toiri pulls the code files in so you can preview and change them by chatting.",
    githubNote: "Public repositories only for now. Large repos are trimmed to the main code files.",
    importRepo: "Import repository",
    importing: "Importing…",
    attachedFiles: "Attached",
    removeFile: "Remove",
    fileTooBig: "is too large (max 200 KB).",
    fileUnsupported: "is not a text or code file.",
    pickCategory: "Pick what you want to build",
    promptHint:
      "Tap any idea — it sends a full, detailed description, so you don't have to know the steps. You can change anything afterwards by chatting.",


    comingSoonBody:
      "Paid packs via bKash, Nagad, Rocket and cards are on the way. For now every browser gets free credits.",
  },
  bn: {
    tagline: "বাংলাদেশের জন্য এআই অ্যাপ বিল্ডার",
    assistantLabel: "সহকারী",
    newChat: "নতুন চ্যাট",
    whatToBuild: "কী বানাবো?",
    chatIntro: "বাংলা বা ইংরেজিতে অ্যাপের বর্ণনা দিন, ডানপাশে সঙ্গে সঙ্গে দেখুন।",
    thinking: "ভাবছি…",
    composerPlaceholder: "একটি ডার্ক থিমের টু-ডু অ্যাপ বানাও…",
    disclaimer: "তৈরি লাইভ প্রিভিউতে একটি সিঙ্গেল-ফাইল রিঅ্যাক্ট অ্যাপ বানায়।",
    creditsLabel: "ক্রেডিট",
    previewTitle: "লাইভ প্রিভিউ",
    previewApp: "অ্যাপ",
    previewCode: "কোড",
    you: "আপনি",
    updatedFile: "আপডেট হয়েছে",
    pricingTitle: "ক্রেডিট প্যাক",
    close: "বন্ধ",
    genericError: "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    stop: "থামান",
    stopped: "থামানো হয়েছে।",
    retry: "আবার চেষ্টা করুন",
    offlineError: "ইন্টারনেট সংযোগ নেই। সংযোগ দেখে আবার চেষ্টা করুন।",
    networkError: "তৈরি-র সাথে সংযোগ করা যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন।",
    comingSoon: "পেমেন্ট শীঘ্রই আসছে",
    trySample: "স্যাম্পল অ্যাপ দেখুন (বাংলা বেকারি চ্যাটবট)",
    copyCode: "কোড কপি",
    copied: "কপি হয়েছে",
    download: "ডাউনলোড",
    history: "হিস্ট্রি",
    restore: "ফিরিয়ে আনুন",
    noVersions: "এখনো কোনো ভার্সন নেই — আগে কিছু বানান।",
    versionsTitle: "ভার্সন হিস্ট্রি",
    publish: "পাবলিশ",
    republish: "লিংক আপডেট",
    publishing: "পাবলিশ হচ্ছে…",
    publishedTitle: "তৈরি অ্যাপ",
    shareTitle: "আপনার অ্যাপ লাইভ",
    shareHint: "এই লিংক যার কাছে থাকবে সে অ্যাপটি খুলতে পারবে।",
    copyLink: "লিংক কপি",
    openLink: "খুলুন",
    pickCategory: "কী বানাতে চান বেছে নিন",
    promptHint:
      "যেকোনো আইডিয়ায় চাপ দিন — পুরো বিস্তারিত বর্ণনা নিজেই চলে যাবে, ধাপগুলো জানার দরকার নেই। পরে চ্যাটে বলে যেকোনো কিছু বদলাতে পারবেন।",


    comingSoonBody:
      "বিকাশ, নগদ, রকেট ও কার্ডে পেইড প্যাক শীঘ্রই আসছে। আপাতত প্রতিটি ব্রাউজার ফ্রি ক্রেডিট পাবে।",
  },
};

export function t(lang: Lang, key: string): string {
  return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}

export const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    "A pomodoro timer with a circular progress ring",
    "A tuition fee calculator for Dhaka students",
    "A prayer times card with a clean dark layout",
  ],
  bn: [
    "গোলাকার প্রোগ্রেস রিং সহ একটি পোমোডোরো টাইমার",
    "ঢাকার শিক্ষার্থীদের জন্য টিউশন ফি ক্যালকুলেটর",
    "পরিষ্কার ডার্ক লেআউটে নামাজের সময়সূচি কার্ড",
  ],
};

export function outOfCreditsText(lang: Lang): string {
  return lang === "bn"
    ? "আপনার ক্রেডিট শেষ। ফ্রি ক্রেডিট রিসেট করতে বা প্যাক দেখতে ক্রেডিট বাটনে চাপ দিন।"
    : "You're out of credits. Tap the credits button to see packs or reset your free credits.";
}

export function creditsLeftText(lang: Lang, credits: number | null): string {
  const n = credits ?? 0;
  return lang === "bn" ? `আপনার আছে ${n} ক্রেডিট।` : `You have ${n} credits left.`;
}

export const CREDIT_PACKS = [
  { id: "starter", name: "Starter", nameBn: "স্টার্টার", credits: 50, amountBDT: 200 },
  { id: "builder", name: "Builder", nameBn: "বিল্ডার", credits: 150, amountBDT: 500 },
  { id: "studio", name: "Studio", nameBn: "স্টুডিও", credits: 400, amountBDT: 1200 },
];
