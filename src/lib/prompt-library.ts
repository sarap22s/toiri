import type { Lang } from "./i18n";

export type PromptIdea = {
  id: string;
  title: Record<Lang, string>;
  summary: Record<Lang, string>;
  prompt: Record<Lang, string>;
};

export type PromptCategory = {
  id: string;
  label: Record<Lang, string>;
  emoji: string;
  ideas: PromptIdea[];
};

/**
 * Detailed, ready-to-send starter prompts for people who do not yet know
 * what to ask for. Each prompt names the screens, the features and the
 * sample data, so a first-time user gets a finished-looking app in one go.
 */
export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "shop",
    emoji: "🛍️",
    label: { en: "Shop & business", bn: "দোকান ও ব্যবসা" },
    ideas: [
      {
        id: "shop-order",
        title: { en: "Online order page for a local shop", bn: "দোকানের অনলাইন অর্ডার পেজ" },
        summary: {
          en: "Menu, cart, delivery form, bKash-style checkout",
          bn: "মেনু, কার্ট, ডেলিভারি ফর্ম, বিকাশ-স্টাইল চেকআউট",
        },
        prompt: {
          en: "Build a single-page online ordering app for a small grocery shop in Dhaka called 'Rahman Store'. Show a header with the shop name, open hours and a phone number. Below it show 8 product cards (rice, lentils, sugar, soybean oil, eggs, tea, biscuits, soap) with photo-less coloured tiles, Bangla+English names and prices in ৳. Each card has plus/minus quantity buttons. A sticky cart bar at the bottom shows total items and total ৳ and opens a checkout panel with name, phone, address and a payment choice of bKash, Nagad or cash on delivery. On submit show an order confirmation with an order number and estimated delivery time. Dark modern design, mobile friendly.",
          bn: "ঢাকার ছোট মুদি দোকান 'রহমান স্টোর'-এর জন্য এক পেজের অনলাইন অর্ডার অ্যাপ বানাও। উপরে দোকানের নাম, খোলার সময় ও ফোন নম্বর। নিচে ৮টি পণ্যের কার্ড (চাল, ডাল, চিনি, সয়াবিন তেল, ডিম, চা, বিস্কুট, সাবান) — বাংলা নাম ও ৳ দামসহ, প্রতিটিতে প্লাস/মাইনাস বাটন। নিচে স্টিকি কার্ট বার-এ মোট আইটেম ও মোট ৳ দেখাবে এবং চেকআউট প্যানেল খুলবে: নাম, ফোন, ঠিকানা এবং বিকাশ/নগদ/ক্যাশ অন ডেলিভারি অপশন। সাবমিট করলে অর্ডার নম্বর ও আনুমানিক ডেলিভারি সময়সহ কনফার্মেশন দেখাবে। সব লেখা বাংলায়, ডার্ক ও মোবাইল ফ্রেন্ডলি ডিজাইন।",
        },
      },
      {
        id: "shop-khata",
        title: { en: "Digital khata (credit ledger)", bn: "ডিজিটাল খাতা (বাকির হিসাব)" },
        summary: {
          en: "Customer list, due amounts, payment history",
          bn: "কাস্টমার তালিকা, বাকি টাকা, লেনদেনের হিসাব",
        },
        prompt: {
          en: "Build a digital khata app for a shopkeeper to track customer credit. Show a list of customers with name, phone and current due in ৳, sorted by highest due. A button adds a new customer. Tapping a customer opens their page with a transaction history (date, note, amount, credit or payment) and two buttons: 'Bakite dilam' (add due) and 'Taka pelam' (record payment), each opening a small form. Show total outstanding across all customers at the top. Bangla labels, clean card layout, works on a phone.",
          bn: "দোকানদারের জন্য বাকির হিসাব রাখার ডিজিটাল খাতা অ্যাপ বানাও। কাস্টমারের নাম, ফোন ও বর্তমান বাকি ৳ সহ তালিকা দেখাবে, বেশি বাকি আগে। নতুন কাস্টমার যোগ করার বাটন থাকবে। কাস্টমারে চাপ দিলে তার পেজে লেনদেনের হিস্ট্রি (তারিখ, নোট, টাকা, বাকি না জমা) এবং দুটি বাটন: 'বাকিতে দিলাম' ও 'টাকা পেলাম' — ছোট ফর্মসহ। উপরে সব কাস্টমারের মোট বাকি দেখাবে। সব লেখা বাংলায়, পরিষ্কার কার্ড লেআউট, মোবাইলে ভালো চলবে।",
        },
      },
      {
        id: "shop-chatbot",
        title: { en: "Bangla chatbot for a business", bn: "ব্যবসার জন্য বাংলা চ্যাটবট" },
        summary: {
          en: "Answers common questions, takes an order",
          bn: "সাধারণ প্রশ্নের উত্তর দেয়, অর্ডার নেয়",
        },
        prompt: {
          en: "Build a Bangla customer-service chatbot page for a bakery. A chat window greets the customer in Bangla, shows 4 quick-reply buttons (menu, price, delivery, order). Replies come from a built-in rule set: menu shows a list of 6 cakes and snacks with ৳ prices, delivery explains areas and charges, order collects item, quantity, name and phone step by step and ends with a confirmation summary. Show typing dots before each reply. Warm colours, rounded bubbles, Bangla text everywhere.",
          bn: "একটি বেকারির জন্য বাংলা কাস্টমার-সার্ভিস চ্যাটবট পেজ বানাও। চ্যাট উইন্ডো বাংলায় স্বাগত জানাবে এবং ৪টি কুইক-রিপ্লাই বাটন থাকবে (মেনু, দাম, ডেলিভারি, অর্ডার)। উত্তর আসবে বিল্ট-ইন নিয়ম থেকে: মেনুতে ৬টি কেক ও নাশতার তালিকা ৳ দামসহ, ডেলিভারিতে এলাকা ও চার্জ, অর্ডারে ধাপে ধাপে আইটেম, পরিমাণ, নাম ও ফোন নিয়ে শেষে সামারি দেখাবে। প্রতিটি উত্তরের আগে টাইপিং ডট দেখাবে। উষ্ণ রঙ, গোল বাবল, সব লেখা বাংলায়।",
        },
      },
    ],
  },
  {
    id: "education",
    emoji: "📚",
    label: { en: "Education & tuition", bn: "শিক্ষা ও টিউশন" },
    ideas: [
      {
        id: "edu-tuition",
        title: { en: "Tuition batch manager", bn: "টিউশন ব্যাচ ম্যানেজার" },
        summary: {
          en: "Students, attendance, monthly fee status",
          bn: "শিক্ষার্থী, হাজিরা, মাসিক ফি-এর অবস্থা",
        },
        prompt: {
          en: "Build an app for a private tutor in Bangladesh to manage batches. Top shows 3 batches (Class 8 Math, Class 9 Physics, HSC Chemistry) as tabs. Each batch lists students with name, class, monthly fee in ৳ and a paid/unpaid chip that can be toggled. A daily attendance row lets the tutor mark present/absent for today with one tap per student. Show a summary card: total students, collected ৳ this month, pending ৳. Bangla labels, calm light-on-dark design.",
          bn: "বাংলাদেশের প্রাইভেট টিউটরের জন্য ব্যাচ ম্যানেজ করার অ্যাপ বানাও। উপরে ৩টি ব্যাচ ট্যাব (ক্লাস ৮ গণিত, ক্লাস ৯ পদার্থ, এইচএসসি রসায়ন)। প্রতিটি ব্যাচে শিক্ষার্থীর নাম, ক্লাস, মাসিক ফি ৳ এবং পরিশোধিত/বাকি চিপ — ট্যাপে পরিবর্তন হবে। আজকের হাজিরার সারিতে প্রতিটি শিক্ষার্থীর জন্য উপস্থিত/অনুপস্থিত এক ট্যাপে দেওয়া যাবে। উপরে সামারি কার্ড: মোট শিক্ষার্থী, এ মাসে আদায় ৳, বাকি ৳। সব লেখা বাংলায়, ডার্ক ও পরিচ্ছন্ন ডিজাইন।",
        },
      },
      {
        id: "edu-quiz",
        title: { en: "MCQ practice for admission test", bn: "ভর্তি পরীক্ষার এমসিকিউ প্র্যাকটিস" },
        summary: {
          en: "Timed quiz, score, answer review",
          bn: "সময়সহ কুইজ, স্কোর, উত্তর রিভিউ",
        },
        prompt: {
          en: "Build an MCQ practice app for university admission preparation in Bangladesh. Include 10 sample questions across Bangla, English and General Knowledge, each with 4 options and one correct answer. Show one question at a time with a 30-second countdown, a progress bar and next button. After the last question show the score out of 10, time taken and a review list marking each answer right or wrong with the correct option highlighted. A restart button shuffles the questions. Bangla question text, exam-like clean design.",
          bn: "বাংলাদেশের বিশ্ববিদ্যালয় ভর্তি প্রস্তুতির জন্য এমসিকিউ প্র্যাকটিস অ্যাপ বানাও। বাংলা, ইংরেজি ও সাধারণ জ্ঞান মিলিয়ে ১০টি প্রশ্ন থাকবে, প্রতিটিতে ৪টি অপশন ও একটি সঠিক উত্তর। একবারে একটি প্রশ্ন, ৩০ সেকেন্ডের কাউন্টডাউন, প্রোগ্রেস বার ও পরবর্তী বাটন। শেষে ১০-এ স্কোর, সময় এবং প্রতিটি উত্তর সঠিক/ভুলসহ রিভিউ তালিকা — সঠিক অপশন হাইলাইট করা। রিস্টার্ট বাটনে প্রশ্ন এলোমেলো হবে। প্রশ্ন বাংলায়, পরীক্ষার মতো পরিচ্ছন্ন ডিজাইন।",
        },
      },
      {
        id: "edu-routine",
        title: { en: "Class routine & exam countdown", bn: "ক্লাস রুটিন ও পরীক্ষার কাউন্টডাউন" },
        summary: {
          en: "Weekly routine grid plus days-left cards",
          bn: "সাপ্তাহিক রুটিন ও কত দিন বাকি কার্ড",
        },
        prompt: {
          en: "Build a student routine app. Show a weekly grid (Sunday to Thursday) with 5 periods per day filled with sample subjects and teacher names, highlighting today's column. Below it show exam countdown cards for 3 upcoming exams with subject, date and days remaining, turning red when under 7 days. Add a small 'today's tasks' checklist the student can tick. Bangla labels, dark theme with one accent colour.",
          bn: "শিক্ষার্থীর রুটিন অ্যাপ বানাও। রবিবার থেকে বৃহস্পতিবার পর্যন্ত সাপ্তাহিক গ্রিডে দিনে ৫টি পিরিয়ড, নমুনা বিষয় ও শিক্ষকের নামসহ — আজকের কলাম হাইলাইট থাকবে। নিচে ৩টি আসন্ন পরীক্ষার কাউন্টডাউন কার্ড: বিষয়, তারিখ ও কত দিন বাকি; ৭ দিনের কম হলে লাল হবে। সঙ্গে 'আজকের কাজ' চেকলিস্ট যেখানে টিক দেওয়া যাবে। সব লেখা বাংলায়, ডার্ক থিম ও একটি অ্যাকসেন্ট রঙ।",
        },
      },
    ],
  },
  {
    id: "daily",
    emoji: "🕌",
    label: { en: "Daily life", bn: "দৈনন্দিন জীবন" },
    ideas: [
      {
        id: "daily-prayer",
        title: { en: "Prayer times & tasbih counter", bn: "নামাজের সময় ও তসবিহ কাউন্টার" },
        summary: {
          en: "Five prayers, next-prayer timer, digital tasbih",
          bn: "পাঁচ ওয়াক্ত, পরবর্তী নামাজের সময়, ডিজিটাল তসবিহ",
        },
        prompt: {
          en: "Build a prayer companion app for Dhaka. Show today's five prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) as fixed sample times, highlight the next prayer and show a live countdown to it. Below add a digital tasbih counter with a large tap area, count, target of 33 and a reset button, plus three preset dhikr chips. Show the Bangla date line at the top. Deep green and gold palette, Bangla text, calm and uncluttered.",
          bn: "ঢাকার জন্য নামাজ সহায়ক অ্যাপ বানাও। আজকের পাঁচ ওয়াক্তের সময় (ফজর, জোহর, আসর, মাগরিব, এশা) নমুনা সময়সহ দেখাবে, পরবর্তী ওয়াক্ত হাইলাইট ও তার লাইভ কাউন্টডাউন থাকবে। নিচে ডিজিটাল তসবিহ কাউন্টার: বড় ট্যাপ এরিয়া, গণনা, ৩৩ টার্গেট ও রিসেট বাটন, সঙ্গে তিনটি জিকির চিপ। উপরে বাংলা তারিখ। গাঢ় সবুজ ও সোনালি রঙ, সব লেখা বাংলায়, শান্ত ডিজাইন।",
        },
      },
      {
        id: "daily-budget",
        title: { en: "Monthly family budget tracker", bn: "মাসিক পারিবারিক বাজেট ট্র্যাকার" },
        summary: {
          en: "Income, expense categories, remaining balance",
          bn: "আয়, খরচের খাত, অবশিষ্ট টাকা",
        },
        prompt: {
          en: "Build a monthly household budget app for a Bangladeshi family. Top card shows income in ৳, total spent and remaining. Add an expense form with amount, category (bazar, house rent, transport, electricity, education, medical, mobile recharge, other) and a note. Show the expense list newest first with delete, and a simple bar breakdown per category with percentages. Store everything in memory. Bangla labels, ৳ formatting, clear dark cards.",
          bn: "বাংলাদেশি পরিবারের জন্য মাসিক বাজেট অ্যাপ বানাও। উপরের কার্ডে আয় ৳, মোট খরচ ও অবশিষ্ট দেখাবে। খরচ যোগ করার ফর্মে টাকা, খাত (বাজার, বাড়িভাড়া, যাতায়াত, বিদ্যুৎ, শিক্ষা, চিকিৎসা, মোবাইল রিচার্জ, অন্যান্য) ও নোট থাকবে। খরচের তালিকা নতুন আগে, ডিলিট অপশনসহ, এবং প্রতিটি খাতের শতাংশসহ সাধারণ বার চার্ট। সব ডেটা মেমোরিতে থাকবে। সব লেখা বাংলায়, ৳ ফরম্যাট, পরিষ্কার ডার্ক কার্ড।",
        },
      },
      {
        id: "daily-health",
        title: { en: "Medicine reminder card", bn: "ওষুধের রিমাইন্ডার কার্ড" },
        summary: {
          en: "Doses by time of day with taken marks",
          bn: "সময় অনুযায়ী ডোজ ও খাওয়ার টিক",
        },
        prompt: {
          en: "Build a medicine reminder app for an elderly family member. Group doses into morning, noon and night sections; each medicine shows name, dose (e.g. 1 tablet), before/after meal and a big 'taken' toggle for today. Show a progress ring of doses taken today. Add a form to add a new medicine. Include 5 sample medicines with Bangla names. Large readable type, high contrast, Bangla labels.",
          bn: "বয়স্ক পরিবারের সদস্যের জন্য ওষুধের রিমাইন্ডার অ্যাপ বানাও। ডোজগুলো সকাল, দুপুর ও রাত ভাগে সাজাবে; প্রতিটি ওষুধে নাম, ডোজ (যেমন ১টি ট্যাবলেট), খাবারের আগে/পরে এবং আজকের জন্য বড় 'খেয়েছি' টগল। আজ কত ডোজ নেওয়া হয়েছে তার প্রোগ্রেস রিং দেখাবে। নতুন ওষুধ যোগ করার ফর্ম থাকবে। বাংলা নামসহ ৫টি নমুনা ওষুধ দাও। বড় পড়ার মতো লেখা, হাই কনট্রাস্ট, সব লেখা বাংলায়।",
        },
      },
    ],
  },
  {
    id: "freelance",
    emoji: "💼",
    label: { en: "Freelance & portfolio", bn: "ফ্রিল্যান্সিং ও পোর্টফোলিও" },
    ideas: [
      {
        id: "free-portfolio",
        title: { en: "Freelancer portfolio page", bn: "ফ্রিল্যান্সার পোর্টফোলিও পেজ" },
        summary: {
          en: "Hero, skills, projects, contact form",
          bn: "হিরো, স্কিল, প্রজেক্ট, যোগাযোগ ফর্ম",
        },
        prompt: {
          en: "Build a one-page portfolio for a Bangladeshi freelance web developer named Tanvir Ahmed. Sections: hero with name, tagline and two buttons (hire me, see work); about paragraph; skills grid of 8 tech chips; 4 project cards with title, short description, tech tags and a fake link; a client review slider with 3 quotes; and a contact form with name, email, budget range in USD and message that shows a thank-you state on submit. Modern dark design, smooth hover effects, English text.",
          bn: "তানভীর আহমেদ নামের বাংলাদেশি ফ্রিল্যান্স ওয়েব ডেভেলপারের জন্য এক পেজের পোর্টফোলিও বানাও। সেকশন: নাম, ট্যাগলাইন ও দুটি বাটনসহ হিরো (হায়ার মি, কাজ দেখুন); সম্পর্কে অনুচ্ছেদ; ৮টি স্কিল চিপের গ্রিড; ৪টি প্রজেক্ট কার্ড (শিরোনাম, সংক্ষিপ্ত বর্ণনা, টেক ট্যাগ, লিংক); ৩টি ক্লায়েন্ট রিভিউর স্লাইডার; এবং নাম, ইমেইল, বাজেট (USD) ও বার্তাসহ যোগাযোগ ফর্ম — সাবমিটে ধন্যবাদ বার্তা। আধুনিক ডার্ক ডিজাইন, স্মুথ হোভার ইফেক্ট।",
        },
      },
      {
        id: "free-invoice",
        title: { en: "Invoice maker for clients", bn: "ক্লায়েন্টের জন্য ইনভয়েস মেকার" },
        summary: {
          en: "Line items, totals in ৳ and USD, print view",
          bn: "আইটেম, ৳ ও USD মোট, প্রিন্ট ভিউ",
        },
        prompt: {
          en: "Build an invoice maker for a freelancer. Left side is a form: client name, invoice number, date, currency (BDT or USD) and a repeatable list of line items with description, quantity and rate, plus an add-item button. Right side shows a live invoice preview with the freelancer's details, the items table, subtotal, 5% platform fee, and the grand total. A print button opens the browser print view of just the invoice. Clean professional look.",
          bn: "ফ্রিল্যান্সারের জন্য ইনভয়েস মেকার বানাও। বাঁ পাশে ফর্ম: ক্লায়েন্টের নাম, ইনভয়েস নম্বর, তারিখ, মুদ্রা (৳ বা USD) এবং বর্ণনা, পরিমাণ ও রেটসহ আইটেমের তালিকা, নতুন আইটেম যোগের বাটনসহ। ডান পাশে লাইভ ইনভয়েস প্রিভিউ: ফ্রিল্যান্সারের তথ্য, আইটেম টেবিল, সাবটোটাল, ৫% ফি ও সর্বমোট। প্রিন্ট বাটনে শুধু ইনভয়েসের প্রিন্ট ভিউ খুলবে। পরিচ্ছন্ন পেশাদার ডিজাইন।",
        },
      },
      {
        id: "free-cv",
        title: { en: "CV builder with live preview", bn: "লাইভ প্রিভিউসহ সিভি বিল্ডার" },
        summary: {
          en: "Fill a form, see a formatted CV",
          bn: "ফর্ম পূরণ করলেই সাজানো সিভি",
        },
        prompt: {
          en: "Build a CV builder. A form collects name, title, phone, email, address, a short objective, three education entries, three experience entries and a comma-separated skills list. The right panel renders a clean A4-style CV that updates as the user types, with section headings and a coloured sidebar. Prefill it with a sample Bangladeshi graduate's details. Add a print button. Simple, readable typography.",
          bn: "সিভি বিল্ডার বানাও। ফর্মে নাম, পদবি, ফোন, ইমেইল, ঠিকানা, সংক্ষিপ্ত উদ্দেশ্য, তিনটি শিক্ষাগত যোগ্যতা, তিনটি অভিজ্ঞতা ও কমা দিয়ে লেখা স্কিল নেবে। ডান পাশে A4-স্টাইলের পরিচ্ছন্ন সিভি টাইপ করার সঙ্গে সঙ্গে আপডেট হবে — সেকশন হেডিং ও রঙিন সাইডবারসহ। একজন বাংলাদেশি গ্র্যাজুয়েটের নমুনা তথ্য আগে থেকে বসানো থাকবে। প্রিন্ট বাটন যোগ করো। সহজ ও পড়ার মতো টাইপোগ্রাফি।",
        },
      },
    ],
  },
  {
    id: "service",
    emoji: "🛵",
    label: { en: "Service & booking", bn: "সেবা ও বুকিং" },
    ideas: [
      {
        id: "svc-doctor",
        title: { en: "Doctor appointment booking", bn: "ডাক্তারের অ্যাপয়েন্টমেন্ট বুকিং" },
        summary: {
          en: "Doctor list, time slots, confirmation slip",
          bn: "ডাক্তারের তালিকা, সময়, কনফার্মেশন স্লিপ",
        },
        prompt: {
          en: "Build a doctor appointment booking app for a chamber in Chattogram. Show 4 doctors with name, speciality (medicine, gynae, child, orthopedics), chamber time and visit fee in ৳. Selecting a doctor shows tomorrow's time slots as buttons, with some marked already booked. After picking a slot, a form takes patient name, age, phone and problem, and on submit shows a serial number, doctor, time and fee as a confirmation slip. Bangla labels, trustworthy blue-and-white health design.",
          bn: "চট্টগ্রামের একটি চেম্বারের জন্য ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং অ্যাপ বানাও। ৪ জন ডাক্তারের নাম, বিশেষত্ব (মেডিসিন, গাইনি, শিশু, অর্থোপেডিক্স), চেম্বারের সময় ও ভিজিট ফি ৳ দেখাবে। ডাক্তার নির্বাচন করলে আগামীকালের সময়গুলো বাটন আকারে আসবে, কিছু 'বুকড' দেখাবে। সময় নির্বাচনের পর রোগীর নাম, বয়স, ফোন ও সমস্যা নেবে এবং সাবমিটে সিরিয়াল নম্বর, ডাক্তার, সময় ও ফি সহ কনফার্মেশন স্লিপ দেখাবে। সব লেখা বাংলায়, নীল-সাদা স্বাস্থ্যসেবা ডিজাইন।",
        },
      },
      {
        id: "svc-delivery",
        title: { en: "Parcel delivery tracker", bn: "পার্সেল ডেলিভারি ট্র্যাকার" },
        summary: {
          en: "Tracking ID search, status timeline",
          bn: "ট্র্যাকিং আইডি সার্চ, স্ট্যাটাস টাইমলাইন",
        },
        prompt: {
          en: "Build a parcel tracking page for a courier service. A search box accepts a tracking ID; include 3 sample IDs that work. Results show a vertical status timeline (picked up, at Dhaka hub, in transit, out for delivery, delivered) with dates, the current step highlighted, plus sender, receiver, weight, COD amount in ৳ and the rider's phone. Unknown IDs show a friendly not-found message. Bangla labels, bold delivery-brand colours.",
          bn: "কুরিয়ার সার্ভিসের জন্য পার্সেল ট্র্যাকিং পেজ বানাও। সার্চ বক্সে ট্র্যাকিং আইডি দেওয়া যাবে; ৩টি নমুনা আইডি কাজ করবে। ফলাফলে উল্লম্ব স্ট্যাটাস টাইমলাইন (পিকআপ, ঢাকা হাব, ট্রানজিট, ডেলিভারির পথে, ডেলিভার্ড) তারিখসহ, বর্তমান ধাপ হাইলাইট, সঙ্গে প্রেরক, প্রাপক, ওজন, ক্যাশ অন ডেলিভারি ৳ ও রাইডারের ফোন। ভুল আইডিতে বন্ধুত্বপূর্ণ বার্তা দেখাবে। সব লেখা বাংলায়, উজ্জ্বল ডেলিভারি রঙ।",
        },
      },
      {
        id: "svc-event",
        title: { en: "Community event registration", bn: "কমিউনিটি ইভেন্ট রেজিস্ট্রেশন" },
        summary: {
          en: "Event details, seat count, signup form",
          bn: "ইভেন্টের তথ্য, আসন সংখ্যা, রেজিস্ট্রেশন ফর্ম",
        },
        prompt: {
          en: "Build a registration page for a free tech meetup in Dhaka. Show a hero with event name, date, time, venue and a countdown to the event. Add sections for the agenda (4 talks with speaker names and times), speakers as cards, and a seats-remaining counter starting at 50. A registration form takes name, email, phone, profession and t-shirt size; on submit the seat count drops, the form is replaced by a ticket card with a registration ID, and registered names appear in a live attendee list. Energetic modern design, English with Bangla subtitles.",
          bn: "ঢাকায় একটি ফ্রি টেক মিটআপের রেজিস্ট্রেশন পেজ বানাও। হিরোতে ইভেন্টের নাম, তারিখ, সময়, ভেন্যু ও কাউন্টডাউন। এজেন্ডা সেকশনে ৪টি সেশন (বক্তার নাম ও সময়সহ), বক্তাদের কার্ড এবং ৫০ থেকে শুরু হওয়া আসন বাকির কাউন্টার। রেজিস্ট্রেশন ফর্মে নাম, ইমেইল, ফোন, পেশা ও টি-শার্ট সাইজ; সাবমিটে আসন কমবে, ফর্মের জায়গায় রেজিস্ট্রেশন আইডিসহ টিকিট কার্ড আসবে এবং নাম অ্যাটেন্ডি তালিকায় যোগ হবে। প্রাণবন্ত আধুনিক ডিজাইন, বাংলা লেখাসহ।",
        },
      },
    ],
  },
  {
    id: "tools",
    emoji: "🧰",
    label: { en: "Handy tools", bn: "কাজের টুল" },
    ideas: [
      {
        id: "tool-emi",
        title: { en: "Loan EMI & savings calculator", bn: "লোন ইএমআই ও সঞ্চয় ক্যালকুলেটর" },
        summary: {
          en: "Sliders for amount, rate, tenure, monthly result",
          bn: "টাকা, সুদ, মেয়াদের স্লাইডার ও মাসিক কিস্তি",
        },
        prompt: {
          en: "Build a loan EMI calculator for Bangladesh. Sliders set loan amount (৳50,000 to ৳50,00,000), interest rate (6% to 18%) and tenure (1 to 20 years). Show the monthly EMI, total interest and total payable in big numbers that update instantly, plus a simple year-by-year repayment table. Add a second tab for a DPS savings calculator: monthly deposit, rate and years giving maturity value. Bangla labels, ৳ formatting with comma grouping, calm finance design.",
          bn: "বাংলাদেশের জন্য লোন ইএমআই ক্যালকুলেটর বানাও। স্লাইডারে লোনের পরিমাণ (৳৫০,০০০ থেকে ৳৫০,০০,০০০), সুদের হার (৬% থেকে ১৮%) ও মেয়াদ (১ থেকে ২০ বছর)। মাসিক কিস্তি, মোট সুদ ও মোট পরিশোধ বড় সংখ্যায় সঙ্গে সঙ্গে আপডেট হবে, সঙ্গে বছরভিত্তিক পরিশোধের টেবিল। দ্বিতীয় ট্যাবে ডিপিএস সঞ্চয় ক্যালকুলেটর: মাসিক জমা, হার ও বছর দিয়ে মেয়াদ শেষে প্রাপ্য টাকা। সব লেখা বাংলায়, ৳ কমা ফরম্যাট, শান্ত ফিনান্স ডিজাইন।",
        },
      },
      {
        id: "tool-bill",
        title: { en: "Bill split & mess manager", bn: "বিল ভাগ ও মেস ম্যানেজার" },
        summary: {
          en: "Members, meals, bazar cost, per-head total",
          bn: "সদস্য, মিল, বাজার খরচ, মাথাপিছু হিসাব",
        },
        prompt: {
          en: "Build a mess manager app for bachelors sharing a flat in Dhaka. Add members with names. Record each person's meal count for the month and each bazar expense (who paid, amount in ৳, note). Calculate meal rate (total bazar ÷ total meals), each member's meal cost, what they paid, and who owes or gets back how much, shown in a settlement list. Include 4 sample members with data. Bangla labels, tidy tables, dark theme.",
          bn: "ঢাকায় ফ্ল্যাটে থাকা ব্যাচেলরদের জন্য মেস ম্যানেজার অ্যাপ বানাও। সদস্যদের নাম যোগ করা যাবে। প্রত্যেকের মাসের মিল সংখ্যা এবং প্রতিটি বাজার খরচ (কে দিয়েছে, ৳ কত, নোট) রেকর্ড হবে। মিল রেট (মোট বাজার ÷ মোট মিল), প্রত্যেকের মিল খরচ, তার দেওয়া টাকা এবং কে কত পাবে বা দেবে — সেটেলমেন্ট তালিকায় দেখাবে। ৪ জন নমুনা সদস্যের ডেটা দাও। সব লেখা বাংলায়, পরিপাটি টেবিল, ডার্ক থিম।",
        },
      },
      {
        id: "tool-qr",
        title: { en: "Shop QR menu & price list", bn: "দোকানের কিউআর মেনু ও মূল্য তালিকা" },
        summary: {
          en: "Searchable menu with categories and offers",
          bn: "ক্যাটাগরি ও অফারসহ সার্চযোগ্য মেনু",
        },
        prompt: {
          en: "Build a digital menu page a restaurant can show behind a QR code. Categories as sticky tabs (breakfast, rice & curry, kebab, drinks, dessert) with 5 items each: Bangla name, short description, ৳ price and a spicy or popular badge. Add a search box that filters items live, and a top banner showing today's offer. Tapping an item opens a detail sheet with a bigger description and an 'add to order' button that builds a simple order summary. Appetising warm design, Bangla text.",
          bn: "কিউআর কোডের পেছনে দেখানোর জন্য রেস্টুরেন্টের ডিজিটাল মেনু পেজ বানাও। স্টিকি ট্যাবে ক্যাটাগরি (নাশতা, ভাত ও তরকারি, কাবাব, পানীয়, ডেজার্ট), প্রতিটিতে ৫টি আইটেম: বাংলা নাম, সংক্ষিপ্ত বর্ণনা, ৳ দাম ও ঝাল/জনপ্রিয় ব্যাজ। লাইভ ফিল্টার করা সার্চ বক্স এবং উপরে আজকের অফারের ব্যানার থাকবে। আইটেমে চাপ দিলে বিস্তারিত শিট খুলবে, সঙ্গে 'অর্ডারে যোগ করুন' বাটন যা সাধারণ অর্ডার সামারি বানাবে। লোভনীয় উষ্ণ ডিজাইন, সব লেখা বাংলায়।",
        },
      },
    ],
  },
];
