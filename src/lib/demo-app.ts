// A ready-made sample app loaded into the Toiri preview so anyone can walk
// through the full flow: see an app, chat to change it, and try a checkout.
export const DEMO_APP = `import React, { useState, useRef, useEffect } from "react";

const MENU = [
  { id: "cake", name: "চকলেট কেক", en: "Chocolate cake", price: 850 },
  { id: "patties", name: "চিকেন প্যাটিস", en: "Chicken patties", price: 60 },
  { id: "bread", name: "মিল্ক ব্রেড", en: "Milk bread", price: 75 },
  { id: "tea", name: "মালাই চা", en: "Malai tea", price: 40 },
];

const REPLIES = [
  {
    match: ["দাম", "price", "কত", "মেনু", "menu"],
    reply: "আমাদের আজকের মেনু পাশে দেওয়া আছে। চকলেট কেক ৮৫০৳, প্যাটিস ৬০৳, মিল্ক ব্রেড ৭৫৳, মালাই চা ৪০৳।",
  },
  {
    match: ["ডেলিভারি", "delivery", "পৌঁছ"],
    reply: "ঢাকার ভিতরে ৪৫–৬০ মিনিটে ডেলিভারি। ধানমন্ডি, মোহাম্মদপুর ও মিরপুরে ডেলিভারি ফ্রি।",
  },
  {
    match: ["সময়", "খোলা", "open", "hours"],
    reply: "আমরা প্রতিদিন সকাল ৮টা থেকে রাত ১১টা পর্যন্ত খোলা থাকি।",
  },
  {
    match: ["অর্ডার", "order", "কিনব", "নিব"],
    reply: "দারুণ! ডান পাশ থেকে আইটেম যোগ করুন, তারপর নিচের চেকআউট বাটনে চাপ দিন।",
  },
];

function answer(text) {
  const lower = text.toLowerCase();
  const hit = REPLIES.find((r) => r.match.some((m) => lower.includes(m)));
  return hit
    ? hit.reply
    : "আমি রহিম বেকারির সহকারী। মেনু, দাম, ডেলিভারি বা অর্ডার নিয়ে যেকোনো প্রশ্ন করুন।";
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "আসসালামু আলাইকুম! রহিম বেকারিতে স্বাগতম। কী নিতে চান?" },
  ]);
  const [input, setInput] = useState("");
  const [cart, setCart] = useState([]);
  const [stage, setStage] = useState("shop");
  const [phone, setPhone] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const add = (item) => {
    setCart((c) => {
      const found = c.find((i) => i.id === item.id);
      if (found) return c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...item, qty: 1 }];
    });
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setTimeout(() => setMessages((m) => [...m, { role: "bot", text: answer(text) }]), 400);
  };

  const S = {
    page: {
      minHeight: "100vh",
      background: "#0b0b10",
      color: "#ececf3",
      fontFamily: "'Noto Sans Bengali', system-ui, sans-serif",
      padding: 20,
      boxSizing: "border-box",
    },
    shell: { maxWidth: 860, margin: "0 auto" },
    head: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18 },
    logo: {
      width: 42, height: 42, borderRadius: 12, background: "#c8ff4d",
      color: "#12130f", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18,
    },
    grid: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 },
    card: { background: "#131320", border: "1px solid #24243a", borderRadius: 16, padding: 14 },
    chat: { height: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 4 },
    bubbleBot: { alignSelf: "flex-start", background: "#1d1d30", padding: "9px 12px", borderRadius: 14, maxWidth: "85%", fontSize: 14, lineHeight: 1.6 },
    bubbleUser: { alignSelf: "flex-end", background: "#6c5cff", color: "#fff", padding: "9px 12px", borderRadius: 14, maxWidth: "85%", fontSize: 14, lineHeight: 1.6 },
    row: { display: "flex", gap: 8, marginTop: 12 },
    input: { flex: 1, background: "#0e0e18", border: "1px solid #2a2a44", color: "#ececf3", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none", fontFamily: "inherit" },
    btn: { background: "#6c5cff", color: "#fff", border: 0, borderRadius: 10, padding: "10px 16px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 },
    lime: { background: "#c8ff4d", color: "#12130f", border: 0, borderRadius: 10, padding: "12px 16px", fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit", fontSize: 15 },
    item: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #212134", fontSize: 14 },
    add: { background: "#21213a", color: "#ececf3", border: 0, borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit" },
  };

  if (stage === "paid") {
    return (
      <div style={S.page}>
        <div style={{ ...S.shell, maxWidth: 440, marginTop: 60, textAlign: "center" }}>
          <div style={{ ...S.card, padding: 28 }}>
            <div style={{ fontSize: 40 }}>✅</div>
            <h2 style={{ margin: "10px 0 6px" }}>পেমেন্ট সফল হয়েছে</h2>
            <p style={{ color: "#9a9ab5", fontSize: 14, lineHeight: 1.7 }}>
              অর্ডার #{Math.floor(Math.random() * 9000) + 1000} নিশ্চিত হয়েছে।<br />
              মোট {total}৳ — {phone || "আপনার নম্বরে"} কল করে ডেলিভারি জানানো হবে।
            </p>
            <button style={{ ...S.lime, marginTop: 16 }} onClick={() => { setStage("shop"); setCart([]); }}>
              আবার অর্ডার করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "checkout") {
    return (
      <div style={S.page}>
        <div style={{ ...S.shell, maxWidth: 440, marginTop: 40 }}>
          <div style={S.card}>
            <h2 style={{ marginTop: 0 }}>চেকআউট</h2>
            {cart.map((i) => (
              <div key={i.id} style={S.item}>
                <span>{i.name} × {i.qty}</span>
                <span>{i.price * i.qty}৳</span>
              </div>
            ))}
            <div style={{ ...S.item, borderBottom: 0, fontWeight: 700 }}>
              <span>মোট</span><span>{total}৳</span>
            </div>
            <input
              style={{ ...S.input, width: "100%", boxSizing: "border-box", marginTop: 10 }}
              placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              {["বিকাশ", "নগদ", "কার্ড"].map((m) => (
                <div key={m} style={{ flex: 1, textAlign: "center", padding: "9px 0", border: "1px solid #2a2a44", borderRadius: 10, fontSize: 13 }}>{m}</div>
              ))}
            </div>
            <button style={{ ...S.lime, marginTop: 14 }} onClick={() => setStage("paid")}>
              {total}৳ পরিশোধ করুন
            </button>
            <button
              style={{ ...S.btn, background: "transparent", color: "#9a9ab5", width: "100%", marginTop: 8 }}
              onClick={() => setStage("shop")}
            >
              ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.shell}>
        <div style={S.head}>
          <div style={S.logo}>র</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>রহিম বেকারি</div>
            <div style={{ color: "#9a9ab5", fontSize: 13 }}>ধানমন্ডি, ঢাকা · সকাল ৮টা – রাত ১১টা</div>
          </div>
        </div>

        <div style={S.grid}>
          <div style={S.card}>
            <div style={S.chat}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === "bot" ? S.bubbleBot : S.bubbleUser}>{m.text}</div>
              ))}
              <div ref={endRef} />
            </div>
            <div style={S.row}>
              <input
                style={S.input}
                value={input}
                placeholder="যেমন: ডেলিভারি কতক্ষণে?"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button style={S.btn} onClick={send}>পাঠান</button>
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>আজকের মেনু</div>
            {MENU.map((m) => (
              <div key={m.id} style={S.item}>
                <div>
                  <div>{m.name}</div>
                  <div style={{ color: "#9a9ab5", fontSize: 12 }}>{m.price}৳</div>
                </div>
                <button style={S.add} onClick={() => add(m)}>যোগ</button>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 14 }}>
              কার্ট: {cart.reduce((n, i) => n + i.qty, 0)} আইটেম · <b>{total}৳</b>
            </div>
            <button
              style={{ ...S.lime, marginTop: 10, opacity: cart.length ? 1 : 0.4 }}
              disabled={!cart.length}
              onClick={() => cart.length && setStage("checkout")}
            >
              চেকআউটে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

export const DEMO_INTRO = {
  en: "Loaded a sample app: **Rahim Bakery** — a Bangla chatbot for a local bakery with a menu, cart and a working checkout flow. Try it on the right, then ask me to change anything (colours, menu items, delivery areas).",
  bn: "একটি স্যাম্পল অ্যাপ লোড হয়েছে: **রহিম বেকারি** — মেনু, কার্ট ও চেকআউট সহ একটি বাংলা চ্যাটবট। ডানপাশে চালিয়ে দেখুন, তারপর যা খুশি বদলাতে বলুন (রঙ, মেনু, ডেলিভারি এলাকা)।",
};
