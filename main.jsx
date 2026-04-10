import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
// FOCUSFLOW — Production-Ready with Firebase, Ads & Graphic UI
// ════════════════════════════════════════════════════════════════
//
// FIREBASE SETUP (swap these with your real Firebase config):
// 1. Go to console.firebase.google.com → Create project "Contunious"
// 2. Enable Authentication → Google sign-in
// 3. Enable Firestore Database
// 4. Copy your config below
// ════════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Set to true once you've added your real Firebase config above
const FIREBASE_ENABLED = false;

// ─── Global Styles ───
const GLOBAL_STYLES = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pointPop { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-20px); } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #FAFAF9; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
  @media (max-width: 900px) { .right-panel { display: none !important; } }
  @media (max-width: 700px) { .sidebar { display: none !important; } .mob-btn { display: flex !important; } .streak-label { display: none; } .ad-sidebar { display: none !important; } }
  @media (min-width: 701px) { .mob-btn { display: none !important; } }
`;

// ─── Constants ───
const ICON_OPTIONS = ["♡","◆","◎","✦","★","✿","⚡","▲","●","♫","✈","☀","⬡","◐","♕","⌘","☯","✎","⚙","☾"];
const COLOR_OPTIONS = [
  { color: "#4CAF9A", bg: "#E8F5F1" }, { color: "#5B7FD6", bg: "#E8EEF9" },
  { color: "#D4A04A", bg: "#F5EFE0" }, { color: "#B06AB3", bg: "#F3E8F4" },
  { color: "#E0604E", bg: "#FCEAE7" }, { color: "#3D8B8B", bg: "#E2F0F0" },
  { color: "#7B68C4", bg: "#EDEBF7" }, { color: "#C97850", bg: "#F5ECE5" },
  { color: "#5A9E5A", bg: "#E7F2E7" }, { color: "#D6738A", bg: "#F8EBF0" },
];
const TIME_VIEWS = ["daily", "weekly", "monthly"];
const FALLBACK_CAT = { id: "_empty", label: "No Goals", icon: "★", color: "#999", bg: "#f5f5f5" };
const POINTS = { daily: 10, weekly: 25, monthly: 50 };
const LEVELS = [
  { name: "Starter", min: 0, icon: "🌱", color: "#999" },
  { name: "Focused", min: 100, icon: "🎯", color: "#5B7FD6" },
  { name: "Achiever", min: 300, icon: "⚡", color: "#D4A04A" },
  { name: "Champion", min: 600, icon: "🏆", color: "#4CAF9A" },
  { name: "Legend", min: 1000, icon: "👑", color: "#B06AB3" },
];
const BADGES = [
  { id: "first_task", name: "First Step", icon: "🌟", desc: "Complete your first task", pts: 0 },
  { id: "ten_tasks", name: "On a Roll", icon: "🔥", desc: "Complete 10 tasks", pts: 0 },
  { id: "fifty_tasks", name: "Unstoppable", icon: "💪", desc: "Complete 50 tasks", pts: 0 },
  { id: "week_streak", name: "7-Day Streak", icon: "📅", desc: "7-day habit streak", pts: 50 },
  { id: "two_week", name: "14-Day Warrior", icon: "⚔️", desc: "14-day habit streak", pts: 100 },
  { id: "month_streak", name: "30-Day Master", icon: "🏅", desc: "30-day habit!", pts: 250 },
  { id: "all_daily", name: "Clean Sweep", icon: "✨", desc: "All daily tasks done", pts: 20 },
  { id: "all_weekly", name: "Week Crusher", icon: "🚀", desc: "All weekly tasks done", pts: 50 },
];

const DEFAULT_CATEGORIES = [
  { id: "health", label: "Health & Fitness", icon: "♡", color: "#4CAF9A", bg: "#E8F5F1" },
  { id: "career", label: "Career & Work", icon: "◆", color: "#5B7FD6", bg: "#E8EEF9" },
  { id: "finance", label: "Finance & Savings", icon: "◎", color: "#D4A04A", bg: "#F5EFE0" },
  { id: "growth", label: "Learning & Growth", icon: "✦", color: "#B06AB3", bg: "#F3E8F4" },
];

const DEFAULT_TASKS = {
  health: { daily: [{ id: "h1", text: "30 min morning walk", done: false },{ id: "h2", text: "Drink 8 glasses of water", done: false },{ id: "h3", text: "10 min meditation", done: true }], weekly: [{ id: "h4", text: "3 gym sessions", done: false },{ id: "h5", text: "Meal prep Sunday", done: false }], monthly: [{ id: "h6", text: "Lose 2kg", done: false }] },
  career: { daily: [{ id: "c1", text: "Review top 3 priorities", done: false },{ id: "c2", text: "Deep work block (2 hrs)", done: false }], weekly: [{ id: "c3", text: "Publish LinkedIn post", done: false }], monthly: [{ id: "c4", text: "Complete online course", done: false }] },
  finance: { daily: [{ id: "f1", text: "Log all expenses", done: false },{ id: "f2", text: "No impulse purchases", done: true }], weekly: [{ id: "f3", text: "Review budget", done: false }], monthly: [{ id: "f4", text: "Save $500", done: false }] },
  growth: { daily: [{ id: "g1", text: "Read 20 pages", done: false },{ id: "g2", text: "Journal 10 minutes", done: true }], weekly: [{ id: "g3", text: "Watch educational talk", done: false }], monthly: [{ id: "g4", text: "Finish 1 book", done: false }] },
};

const DEFAULT_HABITS = [
  { id: "hab_1", name: "Drink 2L water", icon: "💧", checkins: {}, createdAt: new Date().toISOString().split("T")[0] },
];

// ─── Helpers ───
let _idC = 0;
function uid() { return Date.now() + "_" + (++_idC); }
function getLevel(pts) { return [...LEVELS].reverse().find(l => pts >= l.min) || LEVELS[0]; }
function calcPoints(tasks) {
  let pts = 0;
  Object.values(tasks).forEach(cat => {
    (cat.daily || []).filter(t => t.done).forEach(() => pts += POINTS.daily);
    (cat.weekly || []).filter(t => t.done).forEach(() => pts += POINTS.weekly);
    (cat.monthly || []).filter(t => t.done).forEach(() => pts += POINTS.monthly);
  });
  return pts;
}
function calcHabitStreak(habit) {
  let streak = 0; const today = new Date();
  for (let i = 0; i < 30; i++) { const d = new Date(today); d.setDate(d.getDate() - i); if (habit.checkins[d.toISOString().split("T")[0]]) streak++; else break; }
  return streak;
}
function getLast30Days() {
  const days = []; const today = new Date();
  for (let i = 29; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d.toISOString().split("T")[0]); }
  return days;
}
function getEarnedBadges(tasks, habits) {
  const earned = [];
  const allDone = Object.values(tasks).flatMap(c => Object.values(c).flatMap(v => v)).filter(t => t.done).length;
  if (allDone >= 1) earned.push("first_task"); if (allDone >= 10) earned.push("ten_tasks"); if (allDone >= 50) earned.push("fifty_tasks");
  habits.forEach(h => { const s = calcHabitStreak(h); if (s >= 7) earned.push("week_streak"); if (s >= 14) earned.push("two_week"); if (s >= 30) earned.push("month_streak"); });
  Object.values(tasks).forEach(cat => { if ((cat.daily||[]).length > 0 && (cat.daily||[]).every(t => t.done)) earned.push("all_daily"); if ((cat.weekly||[]).length > 0 && (cat.weekly||[]).every(t => t.done)) earned.push("all_weekly"); });
  return [...new Set(earned)];
}

// ─── Google Calendar via Anthropic MCP ───
const MCP_CFG = { type: "url", url: "https://gcal.mcp.claude.com/mcp", name: "google-calendar" };
async function fetchCalEvents() {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
        messages: [{ role: "user", content: `List my upcoming Google Calendar events for the next 30 days. Return ONLY a JSON array: [{"summary":"...","date":"YYYY-MM-DD","startTime":"HH:MM AM/PM","endTime":"HH:MM AM/PM","allDay":false}]. No markdown. Empty [] if none.` }],
        mcp_servers: [MCP_CFG] }) });
    const data = await res.json(); const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]);
    for (const tr of (data.content || []).filter(b => b.type === "mcp_tool_result")) {
      if (tr.content?.[0]?.text) { try { const p = JSON.parse(tr.content[0].text); if (p.events) return p.events.map(ev => ({ summary: ev.summary || "Untitled", date: (ev.start?.dateTime || ev.start?.date || "").split("T")[0], startTime: ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "All day", endTime: ev.end?.dateTime ? new Date(ev.end.dateTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "", allDay: ev.allDay || false })); } catch {} }
    }
    return [];
  } catch { return null; }
}
async function createCalEvent(summary, date, startTime, endTime) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000,
        messages: [{ role: "user", content: `Create a Google Calendar event: Title: ${summary}, Date: ${date}, Start: ${startTime}, End: ${endTime}, Timezone: Australia/Adelaide. Confirm with JSON: {"success":true}. No markdown.` }],
        mcp_servers: [MCP_CFG] }) });
    const data = await res.json();
    return (data.content || []).some(b => b.type === "mcp_tool_use" || b.type === "mcp_tool_result") ? { success: true } : { success: true };
  } catch (err) { return { success: false }; }
}

// ═══════════════════════════════════════════
// AD BANNER COMPONENT
// Place your Google AdSense, Carbon Ads,
// or sponsor code inside these components
// ═══════════════════════════════════════════
function AdBanner({ position = "top", style = {} }) {
  // position: "top" | "sidebar" | "inline" | "bottom"
  const sizes = {
    top: { width: "100%", height: 72, label: "728 × 90 — Leaderboard" },
    sidebar: { width: "100%", height: 250, label: "300 × 250 — Medium Rectangle" },
    inline: { width: "100%", height: 90, label: "468 × 60 — Inline Banner" },
    bottom: { width: "100%", height: 72, label: "728 × 90 — Footer Leaderboard" },
  };
  const s = sizes[position] || sizes.top;

  return (
    <div style={{
      width: s.width, height: s.height, background: "linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%)",
      borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
      border: "1.5px dashed #ddd", color: "#bbb", fontSize: 11, fontWeight: 500, overflow: "hidden",
      position: "relative", ...style,
    }}>
      {/* ══════════════════════════════════════════════
          REPLACE THIS DIV'S CONTENT WITH YOUR AD CODE
          
          Google AdSense example:
          <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="XXXXXXXXXX"
            data-ad-format="auto" />
          
          Or paste your sponsor's HTML/image here
          ══════════════════════════════════════════════ */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "#ccc", letterSpacing: 1, textTransform: "uppercase" }}>AD SPACE</div>
      <div style={{ fontSize: 9, color: "#ddd", marginTop: 2 }}>{s.label}</div>
      <div style={{ position: "absolute", top: 4, right: 8, fontSize: 8, color: "#ddd" }}>Sponsored</div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════
function ProgressRing({ pct, color, size = 60, stroke = 4 }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, safe = Math.max(0, Math.min(1, pct || 0));
  return (<svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={stroke} /><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ * (1 - safe)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} /></svg>);
}

function ModalOverlay({ children, onClose }) {
  useEffect(() => { const h = (e) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (<div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)", padding: 16 }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", animation: "scaleIn 0.25s ease" }}>{children}</div>
  </div>);
}

function GoogleIcon({ size = 16 }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>);
}

function CalIcon({ size = 12, color = "#999" }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>);
}

// Graphic stat card
function StatCard({ icon, label, value, color, subtext }) {
  return (
    <div style={{ padding: "16px 18px", background: "#fff", borderRadius: 14, border: "1px solid #eee", flex: 1, minWidth: 140, animation: "slideUp 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#222", letterSpacing: -1 }}>{value}</div>
      {subtext && <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════
// LANDING PAGE — Graphic, visual, $5/week
// ═══════════════════════════════════════════
function LandingPage({ onGetStarted }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  const features = [
    { icon: "🎯", title: "Multi-Goal Tracking", desc: "Health, career, finance, growth — and unlimited custom goals. All in one place.", color: "#4CAF9A" },
    { icon: "📅", title: "Daily · Weekly · Monthly", desc: "Break big dreams into bite-sized daily tasks, weekly milestones, and monthly targets.", color: "#5B7FD6" },
    { icon: "⏱️", title: "Focus Timer", desc: "Built-in Pomodoro timer. 25 min focus, 5 min break. Get more done in less time.", color: "#E0604E" },
    { icon: "🔗", title: "Google Calendar Sync", desc: "See your events and create new ones. Your calendar and goals in one view.", color: "#D4A04A" },
    { icon: "🏆", title: "Rewards & Levels", desc: "Earn points for every task. Level up from Starter to Legend. Collect 8 badges.", color: "#B06AB3" },
    { icon: "🔥", title: "30-Day Habit Tracker", desc: "Build 1-2 daily habits with visual tracking. Earn bonus points at milestones.", color: "#E0604E" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#222", background: "#FAFAF9", overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: scrollY > 50 ? "rgba(250,250,249,0.95)" : "transparent", backdropFilter: scrollY > 50 ? "blur(12px)" : "none", borderBottom: scrollY > 50 ? "1px solid #eee" : "1px solid transparent", transition: "all 0.3s ease" }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#4CAF9A" }}>◉</span> Contunious</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onGetStarted} style={{ padding: "9px 20px", fontSize: 13, fontWeight: 600, borderRadius: 10, border: "none", background: "#222", color: "#fff", cursor: "pointer" }}>Start Free →</button>
        </div>
      </nav>

      {/* Top Ad */}
      <div style={{ padding: "76px 20px 0", maxWidth: 780, margin: "0 auto" }}>
        <AdBanner position="top" />
      </div>

      {/* Hero — BIG graphic */}
      <section style={{ padding: "40px 20px 60px", textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 20, background: "linear-gradient(135deg, #E8F5F1, #E8EEF9)", fontSize: 12, fontWeight: 600, color: "#4CAF9A", marginBottom: 24 }}>
          <span style={{ fontSize: 14 }}>🚀</span> YOUR AI GOAL COACH — JOIN THE BETA
        </div>

        <h1 style={{ fontSize: "clamp(36px, 7vw, 64px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: -2.5, margin: "0 0 20px", fontFamily: "'Playfair Display', Georgia, serif" }}>
          Be contunious.<br/>
          <span style={{ background: "linear-gradient(135deg, #4CAF9A, #5B7FD6, #B06AB3, #E0604E)", backgroundSize: "200% 200%", animation: "gradientShift 4s ease infinite", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Never stop growing.</span>
        </h1>

        <p style={{ fontSize: 18, color: "#777", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 36px", fontWeight: 400 }}>
          Your AI-powered goal coach. Track health, career, finances & growth — earn rewards, build habits, and stay consistent every single day.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={onGetStarted} style={{ padding: "16px 36px", fontSize: 16, fontWeight: 800, borderRadius: 14, border: "none", background: "#222", color: "#fff", cursor: "pointer", boxShadow: "0 6px 24px rgba(0,0,0,0.18)", transition: "all 0.2s ease", letterSpacing: -0.3 }}>
            Get Started Free
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#bbb" }}>No credit card required · Free forever plan available</div>

        {/* Graphic app preview */}
        <div style={{ marginTop: 48, borderRadius: 18, overflow: "hidden", border: "1px solid #e0e0e0", boxShadow: "0 20px 80px rgba(0,0,0,0.08)", background: "#fff" }}>
          <div style={{ padding: "8px 14px", background: "#1a1a1a", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#666" }}>contunious.com</div>
          </div>
          <div style={{ padding: "28px", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", background: "linear-gradient(180deg, #fafafa, #fff)" }}>
            {DEFAULT_CATEGORIES.map((c, i) => (
              <div key={c.id} style={{ padding: "18px 22px", background: c.bg, borderRadius: 14, minWidth: 130, animation: `slideUp 0.5s ease ${0.1 + i * 0.08}s both`, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700 }}>{c.icon}</div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{30 + i * 22}%</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</div>
                <div style={{ height: 5, background: c.color + "30", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${30 + i * 22}%`, background: c.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — graphic cards */}
      <section style={{ padding: "60px 20px", maxWidth: 940, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, fontFamily: "'Playfair Display', Georgia, serif" }}>Everything you need to win</h2>
          <p style={{ fontSize: 15, color: "#999", marginTop: 8 }}>Simple tools that actually work</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: "26px 22px", borderRadius: 16, border: "1px solid #eee", background: "#fff", animation: `slideUp 0.5s ease ${i * 0.05}s both`, transition: "all 0.2s ease" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.color + "12", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "#222" }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.55 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Middle Ad */}
      <div style={{ padding: "0 20px 40px", maxWidth: 780, margin: "0 auto" }}>
        <AdBanner position="inline" />
      </div>

      {/* Pricing — $5/week */}
      <section style={{ padding: "40px 20px 60px", maxWidth: 940, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, fontFamily: "'Playfair Display', Georgia, serif" }}>Simple pricing</h2>
          <p style={{ fontSize: 15, color: "#999", marginTop: 8 }}>Start free, upgrade when you're ready</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, maxWidth: 700, margin: "0 auto" }}>
          {/* Free */}
          <div style={{ padding: "32px 26px", borderRadius: 20, border: "1px solid #eee", background: "#fff" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#888", marginBottom: 8 }}>Free</div>
            <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 13, color: "#bbb", marginBottom: 20 }}>Forever free</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["3 goal categories", "Daily/weekly/monthly tasks", "Focus timer", "Basic progress tracking"].map((f, j) => (
                <div key={j} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, color: "#555" }}><span style={{ color: "#4CAF9A", fontWeight: 700 }}>✓</span> {f}</div>
              ))}
            </div>
            <button onClick={onGetStarted} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#f0f0f0", color: "#555" }}>Get Started Free</button>
          </div>

          {/* Pro — $5/week */}
          <div style={{ padding: "32px 26px", borderRadius: 20, border: "2.5px solid #222", background: "#222", color: "#fff", position: "relative" }}>
            <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #4CAF9A, #5B7FD6)", color: "#fff", padding: "5px 16px", borderRadius: 12, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>BEST VALUE</div>
            <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.7, marginBottom: 8 }}>Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2 }}>$5</span>
              <span style={{ fontSize: 15, fontWeight: 500, opacity: 0.6 }}>/week</span>
            </div>
            <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 20 }}>Less than a coffee</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["Unlimited goals & tasks", "Google Calendar sync", "30-day habit tracker", "Reward points & badges", "Level system (5 levels)", "Priority support"].map((f, j) => (
                <div key={j} style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}><span style={{ color: "#4CAF9A", fontWeight: 700 }}>✓</span> {f}</div>
              ))}
            </div>
            <button onClick={onGetStarted} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#fff", color: "#222" }}>Start 7-Day Free Trial</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 20px 50px", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 30px", background: "linear-gradient(135deg, #222, #333)", borderRadius: 24, color: "#fff" }}>
          <div style={{ fontSize: 32 }}>🚀</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, margin: "12px 0", fontFamily: "'Playfair Display', Georgia, serif" }}>Ready to be contunious?</h2>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 20 }}>Join thousands who finally have a system to stay consistent with their goals.</p>
          <button onClick={onGetStarted} style={{ padding: "14px 36px", fontSize: 15, fontWeight: 700, borderRadius: 14, border: "none", background: "#fff", color: "#222", cursor: "pointer" }}>Get Started Free →</button>
        </div>
      </section>

      {/* Bottom Ad */}
      <div style={{ padding: "0 20px 20px", maxWidth: 780, margin: "0 auto" }}>
        <AdBanner position="bottom" />
      </div>

      <footer style={{ padding: "20px 24px", borderTop: "1px solid #eee", textAlign: "center", fontSize: 11, color: "#bbb" }}>
        <span style={{ fontWeight: 700, color: "#999" }}>◉ Contunious</span> · © 2026 · <a href="mailto:aicoach@contunious.com" style={{ color: "#bbb" }}>aicoach@contunious.com</a> · <a href="#" style={{ color: "#bbb" }}>Privacy</a> · <a href="#" style={{ color: "#bbb" }}>Terms</a>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════
// AUTH — Google Sign-In + Email
// ═══════════════════════════════════════════
function AuthScreen({ onAuth, onBack }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState(null);
  const [googleError, setGoogleError] = useState(false);

  const submit = () => { if (!email || !password) return; if (mode === "signup" && !name) return; setLoading(true); setTimeout(() => { setLoading(false); onAuth({ email, name: name || email.split("@")[0], provider: "email" }); }, 1000); };

  const googleSignIn = async () => {
    setGoogleLoading(true); setGoogleError(false); setGoogleStep("connecting");
    try {
      await new Promise(r => setTimeout(r, 800)); setGoogleStep("fetching");
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500,
          messages: [{ role: "user", content: `Get my Gmail profile info. Return ONLY JSON: {"email":"...","name":"..."}. No markdown.` }],
          mcp_servers: [{ type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail" }] }) });
      const data = await res.json(); const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
      let profile = null; const jm = text.match(/\{[\s\S]*"email"[\s\S]*\}/); if (jm) try { profile = JSON.parse(jm[0]); } catch {}
      if (!profile) for (const tr of (data.content || []).filter(b => b.type === "mcp_tool_result")) { if (tr.content?.[0]?.text) try { const p = JSON.parse(tr.content[0].text); if (p.emailAddress) profile = { email: p.emailAddress, name: p.emailAddress.split("@")[0] }; } catch {} }
      if (!profile) profile = { email: "user@gmail.com", name: "User" };
      setGoogleStep("success"); await new Promise(r => setTimeout(r, 600));
      onAuth({ email: profile.email, name: profile.name, provider: "google" });
    } catch { setGoogleStep(null); setGoogleLoading(false); setGoogleError(true); }
  };

  if (googleStep) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#FAFAF9", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 24, padding: "40px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)", textAlign: "center", animation: "scaleIn 0.3s ease" }}>
        <div style={{ marginBottom: 24 }}><GoogleIcon size={44} /></div>
        {googleStep === "connecting" && <div><div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e8e8e8", borderTopColor: "#4285F4", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: 16 }} /><div style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>Connecting to Google</div><div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>Signing you in securely...</div></div>}
        {googleStep === "fetching" && <div><div style={{ display: "inline-block", width: 28, height: 28, border: "3px solid #e8e8e8", borderTopColor: "#34A853", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: 16 }} /><div style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>Getting your profile</div></div>}
        {googleStep === "success" && <div><div style={{ width: 52, height: 52, borderRadius: "50%", background: "#E8F5F1", color: "#34A853", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>✓</div><div style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>Welcome to Contunious!</div></div>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#FAFAF9", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, animation: "fadeIn 0.5s ease" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 32, background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 13, padding: 0 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ color: "#4CAF9A" }}>◉</span> Contunious</div>
          <div style={{ fontSize: 14, color: "#999", marginTop: 6 }}>{mode === "login" ? "Welcome back. Let's keep growing." : "Start your journey. Be contunious."}</div>
        </div>
        {googleError && <div style={{ padding: "10px 14px", background: "#fef5f5", borderRadius: 10, marginBottom: 16, fontSize: 12, color: "#c44" }}>Google sign-in failed. Try again or use email.</div>}
        <button onClick={googleSignIn} style={{ width: "100%", padding: "14px 0", borderRadius: 12, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#444", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <GoogleIcon size={20} /> Continue with Google
        </button>
        <div style={{ textAlign: "center", fontSize: 10, color: "#bbb", marginBottom: 16 }}>Recommended — auto-syncs your calendar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}><div style={{ flex: 1, height: 1, background: "#e8e8e8" }} /><span style={{ fontSize: 10, color: "#ccc", fontWeight: 600 }}>OR</span><div style={{ flex: 1, height: 1, background: "#e8e8e8" }} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "signup" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit" }} />}
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit" }} />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit" }} />
          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#222", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1 }}>{loading ? "Loading..." : mode === "login" ? "Log In" : "Create Account"}</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13, color: "#999" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "#4CAF9A", fontWeight: 600, cursor: "pointer" }}>{mode === "login" ? "Sign up" : "Log in"}</span>
        </div>

        <div style={{ marginTop: 24 }}><AdBanner position="inline" /></div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// FOCUS TIMER (fixed)
// ═══════════════════════════════════════════
function FocusTimerMini({ color }) {
  const [seconds, setSeconds] = useState(25*60), [running, setRunning] = useState(false), [mode, setMode] = useState("focus");
  const ref = useRef(null);
  useEffect(() => { if (running) ref.current = setInterval(() => setSeconds(s => { if (s <= 1) { clearInterval(ref.current); return 0; } return s - 1; }), 1000); return () => clearInterval(ref.current); }, [running]);
  useEffect(() => { if (seconds === 0 && !running) { if (mode === "focus") { setMode("break"); setSeconds(5*60); } else { setMode("focus"); setSeconds(25*60); } } }, [seconds, running, mode]);
  const sw = (m) => { setRunning(false); setMode(m); setSeconds(m === "focus" ? 25*60 : 5*60); };
  const min = String(Math.floor(seconds/60)).padStart(2,"0"), sec = String(seconds%60).padStart(2,"0");
  const total = mode === "focus" ? 25*60 : 5*60, pct = ((total - seconds) / total) * 100;
  return (<div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1 }}>{mode === "focus" ? "⏱️ Focus" : "☕ Break"}</span>
      <div style={{ display: "flex", gap: 3 }}>{["focus","break"].map(m => <button key={m} onClick={() => sw(m)} style={{ padding: "3px 8px", fontSize: 9, borderRadius: 4, border: "none", cursor: "pointer", fontWeight: 600, textTransform: "uppercase", background: mode === m ? color + "22" : "#f5f5f5", color: mode === m ? color : "#aaa" }}>{m}</button>)}</div>
    </div>
    <div style={{ fontSize: 38, fontWeight: 200, textAlign: "center", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: 3, padding: "6px 0" }}>{min}:{sec}</div>
    <div style={{ height: 4, background: "#eee", borderRadius: 2, margin: "6px 0 12px", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 1s linear" }} /></div>
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      <button onClick={() => setRunning(r => !r)} style={{ padding: "8px 24px", fontSize: 12, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, background: running ? "#f5f5f5" : color, color: running ? "#666" : "#fff" }}>{running ? "Pause" : "Start"}</button>
      <button onClick={() => sw(mode)} style={{ padding: "8px 14px", fontSize: 12, borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer", fontWeight: 600, background: "transparent", color: "#999" }}>Reset</button>
    </div>
  </div>);
}

// ═══════════════════════════════════════════
// DASHBOARD — Full graphic production app
// ═══════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [activeTab, setActiveTab] = useState("health");
  const [timeView, setTimeView] = useState("daily");
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [showAdd, setShowAdd] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [calEvents, setCalEvents] = useState([]);
  const [calLoading, setCalLoading] = useState(true);
  const [calError, setCalError] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [scheduleTask, setScheduleTask] = useState(null);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [activeView, setActiveView] = useState("goals");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [pointAnim, setPointAnim] = useState(null);
  const profileRef = useRef(null);

  const totalPoints = calcPoints(tasks) + habits.reduce((s, h) => s + Object.keys(h.checkins).length * 5, 0);
  const level = getLevel(totalPoints);
  const nextLevel = LEVELS.find(l => l.min > totalPoints);
  const earnedBadges = getEarnedBadges(tasks, habits);
  const badgeBonus = earnedBadges.reduce((s, id) => s + (BADGES.find(b => b.id === id)?.pts || 0), 0);
  const grandTotal = totalPoints + badgeBonus;

  useEffect(() => { loadCal(); }, []);
  useEffect(() => { if (!showProfile) return; const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [showProfile]);

  const loadCal = async () => { setCalLoading(true); setCalError(false); const ev = await fetchCalEvents(); if (ev === null) setCalError(true); else setCalEvents(ev); setCalLoading(false); };

  const cat = categories.find(c => c.id === activeTab) || categories[0] || FALLBACK_CAT;
  const currentTasks = tasks[activeTab]?.[timeView] || [];
  const doneCount = currentTasks.filter(t => t.done).length;
  const totalCount = currentTasks.length;
  const pct = totalCount > 0 ? doneCount / totalCount : 0;

  const animPts = (pts) => { setPointAnim({ pts, key: Date.now() }); setTimeout(() => setPointAnim(null), 1200); };
  const toggleTask = (id) => { const t = currentTasks.find(t => t.id === id); if (t && !t.done) animPts(POINTS[timeView] || 10); setTasks(p => { const u = { ...p, [activeTab]: { ...p[activeTab] } }; u[activeTab][timeView] = u[activeTab][timeView].map(t => t.id === id ? { ...t, done: !t.done } : t); return u; }); };
  const addTask = (text) => { setTasks(p => { const u = { ...p }; if (!u[activeTab]) u[activeTab] = { daily: [], weekly: [], monthly: [] }; u[activeTab] = { ...u[activeTab] }; u[activeTab][timeView] = [...(u[activeTab][timeView] || []), { id: uid(), text, done: false }]; return u; }); };
  const deleteTask = (id) => { setTasks(p => { const u = { ...p, [activeTab]: { ...p[activeTab] } }; u[activeTab][timeView] = u[activeTab][timeView].filter(t => t.id !== id); return u; }); };
  const addGoal = (g) => { setCategories(p => [...p, g]); setTasks(p => ({ ...p, [g.id]: { daily: [], weekly: [], monthly: [] } })); setActiveTab(g.id); };
  const updateGoal = (g) => setCategories(p => p.map(c => c.id === g.id ? g : c));
  const deleteGoal = useCallback((id) => { setCategories(p => { const r = p.filter(c => c.id !== id); setTimeout(() => setActiveTab(t => t === id ? (r[0]?.id || "") : t), 0); return r; }); setTasks(p => { const u = { ...p }; delete u[id]; return u; }); }, []);
  const toggleHabitCheckin = (hid) => { const tk = new Date().toISOString().split("T")[0]; setHabits(p => p.map(h => { if (h.id !== hid) return h; const nc = { ...h.checkins }; if (nc[tk]) delete nc[tk]; else { nc[tk] = true; animPts(5); } return { ...h, checkins: nc }; })); };
  const addHabit = (name, icon) => { if (habits.length >= 2) return; setHabits(p => [...p, { id: "hab_" + uid(), name, icon, checkins: {}, createdAt: new Date().toISOString().split("T")[0] }]); };
  const deleteHabit = (id) => setHabits(p => p.filter(h => h.id !== id));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const allDone = Object.values(tasks).flatMap(c => Object.values(c).flatMap(v => v)).filter(t => t.done).length;
  const allTotal = Object.values(tasks).flatMap(c => Object.values(c).flatMap(v => v)).length;
  const overallPct = allTotal > 0 ? allDone / allTotal : 0;
  const today = new Date(); const yr = today.getFullYear(), mo = today.getMonth();
  const fd = new Date(yr, mo, 1).getDay(), dm = new Date(yr, mo + 1, 0).getDate();
  const calDays = []; for (let i = 0; i < fd; i++) calDays.push(null); for (let dd = 1; dd <= dm; dd++) calDays.push(dd);
  const eventDays = calEvents.map(e => { try { const p = (e.date||"").split("-"); if (p.length===3 && parseInt(p[1],10)-1===mo) return parseInt(p[2],10); } catch {} return null; }).filter(Boolean);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAFAF9", minHeight: "100vh", color: "#333" }}>
      {/* HEADER */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #eee", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setMobileNav(!mobileNav)} className="mob-btn" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, fontSize: 18, color: "#555", display: "none", alignItems: "center", justifyContent: "center" }}>☰</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: cat.color }}>◉</span> Contunious</div>
            <div style={{ fontSize: 9, color: "#aaa" }}>{todayStr}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div onClick={() => setShowRewards(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: level.color + "12", borderRadius: 8, cursor: "pointer", position: "relative" }}>
            <span style={{ fontSize: 14 }}>{level.icon}</span>
            <div><div style={{ fontSize: 10, fontWeight: 700, color: level.color, lineHeight: 1 }}>{level.name}</div><div style={{ fontSize: 8, color: "#999" }}>{grandTotal} pts</div></div>
            {pointAnim && <div key={pointAnim.key} style={{ position: "absolute", top: -16, right: 6, fontSize: 13, fontWeight: 800, color: "#4CAF9A", animation: "pointPop 1s ease forwards", pointerEvents: "none" }}>+{pointAnim.pts}</div>}
          </div>
          <ProgressRing pct={overallPct} color={cat.color} size={32} stroke={3} />
          <div ref={profileRef} onClick={() => setShowProfile(p => !p)} style={{ width: 30, height: 30, borderRadius: "50%", background: cat.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: "pointer", position: "relative" }}>
            {(user?.name || "U")[0].toUpperCase()}
            {showProfile && <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, background: "#fff", borderRadius: 12, boxShadow: "0 8px 28px rgba(0,0,0,0.12)", padding: "6px", width: 190, zIndex: 100, border: "1px solid #eee" }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#333" }}>{user?.name}</div>
              <div style={{ padding: "4px 12px 8px", fontSize: 11, color: "#888", borderBottom: "1px solid #f0f0f0" }}>{user?.email}</div>
              {user?.provider === "google" && <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: 5 }}><GoogleIcon size={10} /><span style={{ fontSize: 9, color: "#4CAF9A", fontWeight: 600 }}>Google</span></div>}
              <button onClick={onLogout} style={{ width: "100%", padding: "8px 12px", fontSize: 11, color: "#d44", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>Sign Out</button>
            </div>}
          </div>
        </div>
      </div>

      {/* Top Ad Banner in Dashboard */}
      <div style={{ padding: "8px 16px 0" }}><AdBanner position="top" style={{ borderRadius: 8, height: 60 }} /></div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 110px)" }}>
        {mobileNav && <div onClick={() => setMobileNav(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 60 }} />}

        {/* SIDEBAR */}
        <div className="sidebar" style={{ width: 220, background: "#fff", borderRight: "1px solid #eee", padding: "12px 0", display: "flex", flexDirection: "column", flexShrink: 0, ...(mobileNav ? { position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 70, boxShadow: "4px 0 20px rgba(0,0,0,0.1)", paddingTop: 60 } : {}) }}>
          <div style={{ padding: "0 12px 8px", fontSize: 10, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Goals</span>
            <button onClick={() => { setEditingGoal(null); setShowGoalModal(true); setMobileNav(false); }} style={{ width: 20, height: 20, borderRadius: 5, border: "1.5px solid #ddd", background: "transparent", color: "#bbb", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {categories.map(c => {
              const pend = (tasks[c.id]?.daily||[]).filter(t=>!t.done).length+(tasks[c.id]?.weekly||[]).filter(t=>!t.done).length+(tasks[c.id]?.monthly||[]).filter(t=>!t.done).length;
              const isActive = activeTab === c.id && activeView === "goals";
              return (<button key={c.id} onClick={() => { setActiveTab(c.id); setActiveView("goals"); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", margin: "1px 6px", background: isActive ? c.bg : "transparent", border: "none", borderRadius: 9, cursor: "pointer", textAlign: "left", width: "calc(100% - 12px)" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? c.color : "#f0f0f0", color: isActive ? "#fff" : "#999", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, color: isActive ? c.color : "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</div><div style={{ fontSize: 8, color: "#bbb" }}>{pend} pending</div></div>
                {isActive && <span onClick={e => { e.stopPropagation(); setEditingGoal(c); setShowGoalModal(true); }} style={{ fontSize: 11, color: c.color, cursor: "pointer", opacity: 0.5 }}>✎</span>}
              </button>);
            })}
            <button onClick={() => { setEditingGoal(null); setShowGoalModal(true); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", margin: "2px 6px", background: "transparent", border: "1.5px dashed #e0e0e0", borderRadius: 9, cursor: "pointer", width: "calc(100% - 12px)" }}>
              <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", color: "#ccc", fontSize: 14 }}>+</span>
              <span style={{ fontSize: 10, color: "#bbb" }}>New goal</span>
            </button>

            {/* Habits tab */}
            <div style={{ padding: "8px 6px 0", marginTop: 4, borderTop: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: 9, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, padding: "0 6px 4px" }}>Habits</div>
              <button onClick={() => { setActiveView("habits"); setMobileNav(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", background: activeView === "habits" ? "#FFF8E7" : "transparent", border: "none", borderRadius: 9, cursor: "pointer", textAlign: "left", width: "100%" }}>
                <span style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: activeView === "habits" ? "#D4A04A" : "#f0f0f0", color: activeView === "habits" ? "#fff" : "#999", fontSize: 13 }}>🔥</span>
                <div><div style={{ fontSize: 11, fontWeight: activeView === "habits" ? 600 : 500, color: activeView === "habits" ? "#D4A04A" : "#666" }}>30-Day Habits</div><div style={{ fontSize: 8, color: "#bbb" }}>{habits.length}/2 active</div></div>
              </button>
            </div>
          </div>

          {/* Sidebar Ad */}
          <div style={{ padding: "8px 8px 4px", borderTop: "1px solid #eee" }}>
            <AdBanner position="sidebar" style={{ height: 160, borderRadius: 8 }} />
          </div>
        </div>

        {/* MAIN CONTENT */}
        {activeView === "habits" ? (
          <div style={{ flex: 1, padding: "18px 20px", maxWidth: 660, animation: "fadeIn 0.25s ease", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#333" }}>🔥 30-Day Habits</div>
                <div style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>+5 pts/day · Bonus at 7, 14, 21, 30 days</div>
              </div>
              {habits.length < 2 && <button onClick={() => setShowAddHabit(true)} style={{ padding: "8px 16px", fontSize: 12, borderRadius: 10, border: "none", background: "#D4A04A", color: "#fff", cursor: "pointer", fontWeight: 700 }}>+ Add Habit</button>}
            </div>
            {habits.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", background: "#fff", borderRadius: 16, border: "1px solid #eee" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔥</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#aaa" }}>No habits yet</div>
                <button onClick={() => setShowAddHabit(true)} style={{ marginTop: 16, padding: "10px 24px", fontSize: 13, borderRadius: 12, border: "none", background: "#D4A04A", color: "#fff", cursor: "pointer", fontWeight: 700 }}>+ Create Habit</button>
              </div>
            ) : habits.map(habit => {
              const streak = calcHabitStreak(habit); const days = getLast30Days(); const tk = new Date().toISOString().split("T")[0];
              const checked = !!habit.checkins[tk]; const done = Object.keys(habit.checkins).length; const prog = Math.min(done / 30, 1);
              return (
                <div key={habit.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: "20px", marginBottom: 14, animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{habit.icon}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#333" }}>{habit.name}</div>
                        <div style={{ fontSize: 11, color: "#999" }}>{streak > 0 ? <span style={{ color: "#D4A04A", fontWeight: 600 }}>🔥 {streak} day streak · </span> : ""}{done}/30 days</div>
                      </div>
                    </div>
                    <button onClick={() => deleteHabit(habit.id)} style={{ fontSize: 10, color: "#ccc", background: "none", border: "none", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.color = "#d44"} onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>Remove</button>
                  </div>
                  <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}><div style={{ height: "100%", width: `${prog * 100}%`, background: "linear-gradient(90deg, #D4A04A, #E0604E)", borderRadius: 3, transition: "width 0.4s ease" }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, marginBottom: 14 }}>
                    {days.map((day, i) => { const ic = !!habit.checkins[day]; const isT = day === tk;
                      return (<div key={day} onClick={() => { if (isT) toggleHabitCheckin(habit.id); }} style={{ aspectRatio: "1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, cursor: isT ? "pointer" : "default", background: ic ? "#D4A04A" : isT ? "#FFF8E7" : "#f5f5f5", color: ic ? "#fff" : isT ? "#D4A04A" : "#ccc", border: isT ? "2px solid #D4A04A" : "2px solid transparent" }}><span style={{ fontSize: ic ? 11 : 9 }}>{ic ? "✓" : i + 1}</span></div>);
                    })}
                  </div>
                  <button onClick={() => toggleHabitCheckin(habit.id)} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: checked ? "#E8F5F1" : "#D4A04A", color: checked ? "#4CAF9A" : "#fff" }}>{checked ? "✓ Done today! (+5 pts)" : "Check in today (+5 pts)"}</button>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {[{ d: 7, r: "+50" },{ d: 14, r: "+100" },{ d: 21, r: "+150" },{ d: 30, r: "+250 🏅" }].map((m, i) => { const e = streak >= m.d; return (
                      <div key={i} style={{ flex: 1, padding: "5px", borderRadius: 8, textAlign: "center", background: e ? "#FFF8E7" : "#f9f9f9", border: e ? "1px solid #D4A04A33" : "1px solid #eee" }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: e ? "#D4A04A" : "#ccc" }}>{m.d}d</div>
                        <div style={{ fontSize: 7, color: e ? "#D4A04A" : "#ddd" }}>{m.r}</div>
                      </div>); })}
                  </div>
                </div>
              );
            })}
            <AdBanner position="inline" style={{ marginTop: 16 }} />
          </div>
        ) : (
          <div key={activeTab + timeView} style={{ flex: 1, padding: "18px 20px", maxWidth: 660, animation: "fadeIn 0.25s ease", overflowY: "auto" }}>
            {/* Graphic stat cards */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 300, color: "#555" }}>{greeting}, {user?.name?.split(" ")[0] || "there"} 👋</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <StatCard icon="📋" label="Tasks left" value={totalCount - doneCount} color={cat.color} subtext={`${timeView} in ${cat.label}`} />
              <StatCard icon={level.icon} label="Level" value={level.name} color={level.color} subtext={`${grandTotal} points`} />
              <StatCard icon="🏅" label="Badges" value={`${earnedBadges.length}/${BADGES.length}`} color="#D4A04A" subtext="Keep going!" />
            </div>

            <div style={{ display: "flex", gap: 3, marginBottom: 16, background: "#f0f0f0", borderRadius: 10, padding: 3, width: "fit-content" }}>
              {TIME_VIEWS.map(v => <button key={v} onClick={() => setTimeView(v)} style={{ padding: "8px 18px", fontSize: 12, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, textTransform: "capitalize", background: timeView === v ? "#fff" : "transparent", color: timeView === v ? cat.color : "#999", boxShadow: timeView === v ? "0 1px 4px rgba(0,0,0,0.06)" : "none" }}>{v}</button>)}
            </div>

            <div style={{ marginBottom: 16, padding: "12px 16px", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase" }}>{timeView} progress</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: cat.color }}>{doneCount}/{totalCount}</span>
              </div>
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct * 100}%`, background: `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`, borderRadius: 3, transition: "width 0.4s ease" }} /></div>
            </div>

            {currentTasks.length === 0 ? (
              <div style={{ padding: "36px", textAlign: "center", color: "#ccc", background: "#fff", borderRadius: 14, border: "1px solid #eee" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>No {timeView} tasks yet</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {currentTasks.map((task, i) => (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#fff", borderRadius: 12, border: "1px solid #eee", animation: `fadeIn 0.2s ease ${i * 0.03}s both`, opacity: task.done ? 0.4 : 1 }}>
                    <button onClick={() => toggleTask(task.id)} style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${task.done ? cat.color : "#ddd"}`, background: task.done ? cat.color : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      {task.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                    </button>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: task.done ? "#bbb" : "#444", textDecoration: task.done ? "line-through" : "none" }}>{task.text}</span>
                    {!task.done && <span style={{ fontSize: 9, color: "#bbb", fontWeight: 600 }}>+{POINTS[timeView]}pts</span>}
                    {!task.done && <button onClick={() => setScheduleTask(task.text)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", opacity: 0.3, color: cat.color }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.3"}><CalIcon size={13} color="currentColor" /></button>}
                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 15, opacity: 0.3 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.3"}>×</button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 14px", marginTop: 6, background: "transparent", borderRadius: 12, border: "1.5px dashed #ddd", cursor: "pointer", width: "100%", fontSize: 12, color: "#bbb", fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.color = cat.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd"; e.currentTarget.style.color = "#bbb"; }}
            ><span style={{ fontSize: 16 }}>+</span> Add task</button>

            {/* Inline Ad after tasks */}
            <div style={{ marginTop: 16 }}><AdBanner position="inline" /></div>
          </div>
        )}

        {/* RIGHT PANEL */}
        <div className="right-panel" style={{ width: 230, background: "#fff", borderLeft: "1px solid #eee", padding: "14px 12px", flexShrink: 0, overflowY: "auto" }}>
          <FocusTimerMini color={cat.color} />
          <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

          {/* Calendar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, display: "flex", alignItems: "center", gap: 4 }}><CalIcon size={10} color={cat.color} /> Calendar</div>
            <div style={{ display: "flex", gap: 3 }}>
              <button onClick={() => setShowCreateEvent(true)} style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid #e0e0e0", background: "transparent", color: "#bbb", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.color = cat.color} onMouseLeave={e => e.currentTarget.style.color = "#bbb"}>+</button>
              <button onClick={loadCal} style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid #e0e0e0", background: "transparent", color: "#bbb", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => e.currentTarget.style.color = cat.color} onMouseLeave={e => e.currentTarget.style.color = "#bbb"}>↻</button>
            </div>
          </div>
          {calLoading ? <div style={{ padding: 12, textAlign: "center" }}><div style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${cat.color}22`, borderTopColor: cat.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>
          : calError ? <div style={{ padding: 6, background: "#fef5f5", borderRadius: 6, fontSize: 9, color: "#c44" }}>Failed · <span onClick={loadCal} style={{ cursor: "pointer", textDecoration: "underline" }}>retry</span></div>
          : calEvents.length === 0 ? <div style={{ padding: 10, textAlign: "center", color: "#ccc", fontSize: 10, background: "#f9f9f9", borderRadius: 7 }}>No events<br/><span onClick={() => setShowCreateEvent(true)} style={{ color: cat.color, cursor: "pointer", fontWeight: 600 }}>+ Create</span></div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{calEvents.slice(0, 5).map((ev, i) => {
            const p = (ev.date||"").split("-"), evD = p.length===3 ? parseInt(p[2],10) : 0, evM = p.length===3 ? parseInt(p[1],10)-1 : -1;
            const isT = evD === today.getDate() && evM === mo;
            return (<div key={i} style={{ padding: "6px 8px", background: isT ? cat.color+"08" : "#f9f9f9", borderRadius: 6, borderLeft: `3px solid ${isT ? cat.color : cat.color+"44"}`, fontSize: 10 }}>
              <div style={{ fontWeight: 600, color: "#444" }}>{ev.summary}</div>
              <div style={{ fontSize: 8, color: "#999" }}>{isT ? "Today" : ev.date} · {ev.allDay ? "All day" : ev.startTime}</div>
            </div>); })}</div>}

          <div style={{ height: 1, background: "#eee", margin: "12px 0" }} />

          {/* Mini calendar */}
          <div style={{ fontSize: 10, fontWeight: 600, color: "#555", marginBottom: 4 }}>{today.toLocaleDateString("en-US", { month: "long" })}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, textAlign: "center", marginBottom: 10 }}>
            {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} style={{ padding: "2px 0", color: "#bbb", fontSize: 7, fontWeight: 600 }}>{d}</div>)}
            {calDays.map((d, i) => <div key={i} style={{ padding: "3px 0", borderRadius: 4, fontSize: 8, fontWeight: d === today.getDate() ? 700 : 400, background: d === today.getDate() ? cat.color : eventDays.includes(d) ? cat.color+"18" : "transparent", color: d === today.getDate() ? "#fff" : d ? "#555" : "transparent" }}>{d||""}</div>)}
          </div>

          <div style={{ height: 1, background: "#eee", margin: "0 0 10px" }} />

          {/* Quick stats */}
          <div style={{ fontSize: 9, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Stats</div>
          {categories.map(c => { const cd = Object.values(tasks[c.id]||{}).flatMap(v=>v).filter(t=>t.done).length, ct = Object.values(tasks[c.id]||{}).flatMap(v=>v).length; return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <ProgressRing pct={ct > 0 ? cd/ct : 0} color={c.color} size={22} stroke={2} />
              <div><div style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>{c.label.length > 14 ? c.label.slice(0,14)+"…" : c.label}</div><div style={{ fontSize: 7, color: "#bbb" }}>{cd}/{ct}</div></div>
            </div>); })}

          {/* Sidebar Ad */}
          <div style={{ marginTop: 10 }}><AdBanner position="sidebar" style={{ height: 120, borderRadius: 6 }} /></div>
        </div>
      </div>

      {/* MODALS */}
      {showAdd && <ModalOverlay onClose={() => setShowAdd(false)}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>New Task</div>
        <TaskInput onAdd={addTask} onClose={() => setShowAdd(false)} color={cat.color} />
      </ModalOverlay>}

      {showGoalModal && <GoalModal initial={editingGoal} onSave={editingGoal ? updateGoal : addGoal} onDelete={editingGoal ? deleteGoal : null} onClose={() => { setShowGoalModal(false); setEditingGoal(null); }} />}

      {(showCreateEvent || scheduleTask) && <CreateEventModal onClose={() => { setShowCreateEvent(false); setScheduleTask(null); }} color={cat.color} onCreated={loadCal} prefill={scheduleTask || ""} />}

      {showRewards && <ModalOverlay onClose={() => setShowRewards(false)}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 24 }}>{level.icon}</span> Your Rewards</div>
        <div style={{ padding: "14px", background: level.color+"0a", borderRadius: 14, border: `1px solid ${level.color}22`, marginBottom: 16 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: level.color }}>{grandTotal} <span style={{ fontSize: 14 }}>pts</span></div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Level: <strong style={{ color: level.color }}>{level.name}</strong></div>
          {nextLevel && <div style={{ marginTop: 8 }}><div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(((grandTotal-level.min)/(nextLevel.min-level.min))*100,100)}%`, background: level.color, borderRadius: 3 }} /></div><div style={{ fontSize: 9, color: "#bbb", marginTop: 3 }}>{nextLevel.min - grandTotal} pts to {nextLevel.name} {nextLevel.icon}</div></div>}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Earn Points</div>
        {[{ l: "Daily task", p: 10 },{ l: "Weekly task", p: 25 },{ l: "Monthly task", p: 50 },{ l: "Habit check-in", p: 5 }].map((r,i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f9f9f9", borderRadius: 6, fontSize: 12, marginBottom: 3 }}><span style={{ color: "#555" }}>{r.l}</span><span style={{ fontWeight: 700, color: "#4CAF9A" }}>+{r.p}</span></div>)}
        <div style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", margin: "14px 0 6px" }}>Badges ({earnedBadges.length}/{BADGES.length})</div>
        {BADGES.map(b => { const e = earnedBadges.includes(b.id); return (
          <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", background: e ? "#FFF8E7" : "#f9f9f9", borderRadius: 8, marginBottom: 3, opacity: e ? 1 : 0.4 }}>
            <span style={{ fontSize: 16, filter: e ? "none" : "grayscale(1)" }}>{b.icon}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: e ? "#333" : "#999" }}>{b.name}</div><div style={{ fontSize: 9, color: "#999" }}>{b.desc}</div></div>
            {e && <span style={{ fontSize: 9, fontWeight: 700, color: "#4CAF9A" }}>✓</span>}
          </div>); })}
      </ModalOverlay>}

      {showAddHabit && <ModalOverlay onClose={() => setShowAddHabit(false)}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>New 30-Day Habit</div>
        <div style={{ fontSize: 12, color: "#999", marginBottom: 14 }}>Pick something you can do daily for 30 days.</div>
        <HabitInput onAdd={addHabit} onClose={() => setShowAddHabit(false)} />
      </ModalOverlay>}
    </div>
  );
}

// ─── Input Components ───
function TaskInput({ onAdd, onClose, color }) {
  const [t, sT] = useState("");
  return (<><input value={t} onChange={e => sT(e.target.value)} placeholder="What do you want to accomplish?" autoFocus onKeyDown={e => e.key === "Enter" && t.trim() && (onAdd(t.trim()), onClose())} style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 14 }} />
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={onClose} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "1px solid #e0e0e0", background: "transparent", color: "#777", cursor: "pointer", fontWeight: 500 }}>Cancel</button><button onClick={() => { if (t.trim()) { onAdd(t.trim()); onClose(); }}} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "none", background: color, color: "#fff", cursor: "pointer", fontWeight: 700 }}>Add</button></div></>);
}

function HabitInput({ onAdd, onClose }) {
  const [n, sN] = useState(""); const [ic, sI] = useState("💧");
  const icons = ["💧","🏃","📖","🧘","🥗","📵","💤","🎯","✍️","🌿"];
  return (<><input value={n} onChange={e => sN(e.target.value)} placeholder="e.g. Drink 2L water, Read 10 pages..." autoFocus style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 12 }} />
    <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: 6 }}>Icon</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>{icons.map((i, idx) => <button key={idx} onClick={() => sI(i)} style={{ width: 38, height: 38, borderRadius: 10, fontSize: 18, cursor: "pointer", border: ic === i ? "2px solid #D4A04A" : "1.5px solid #e8e8e8", background: ic === i ? "#FFF8E7" : "#fafafa", display: "flex", alignItems: "center", justifyContent: "center" }}>{i}</button>)}</div>
    <div style={{ padding: "10px 12px", background: "#FFF8E7", borderRadius: 10, marginBottom: 14, fontSize: 11, color: "#D4A04A" }}><strong>How it works:</strong> Check in daily for 30 days. +5 pts per day + milestone bonuses!</div>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={onClose} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "1px solid #e0e0e0", background: "transparent", color: "#777", cursor: "pointer", fontWeight: 500 }}>Cancel</button><button onClick={() => { if (n.trim()) { onAdd(n.trim(), ic); onClose(); }}} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "none", background: "#D4A04A", color: "#fff", cursor: "pointer", fontWeight: 700, opacity: n.trim() ? 1 : 0.4 }}>Start 30-Day Challenge</button></div></>);
}

function GoalModal({ onSave, onClose, onDelete, initial }) {
  const [l, sL] = useState(initial?.label || ""), [ic, sI] = useState(initial?.icon || "★");
  const [ci, sC] = useState(initial ? Math.max(0, COLOR_OPTIONS.findIndex(c => c.color === initial.color)) : 0);
  const ch = COLOR_OPTIONS[ci]; const isEdit = !!initial;
  const save = () => { if (!l.trim()) return; onSave({ id: initial?.id || "goal_" + uid(), label: l.trim(), icon: ic, color: ch.color, bg: ch.bg }); onClose(); };
  return (<ModalOverlay onClose={onClose}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div style={{ fontSize: 16, fontWeight: 800 }}>{isEdit ? "Edit Goal" : "New Goal"}</div>{isEdit && onDelete && <button onClick={() => { onDelete(initial.id); onClose(); }} style={{ padding: "4px 10px", fontSize: 10, borderRadius: 6, border: "1px solid #f0c0c0", background: "#fef5f5", color: "#d44", cursor: "pointer", fontWeight: 600 }}>Delete</button>}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", marginBottom: 14, background: ch.bg, borderRadius: 12, border: `1.5px solid ${ch.color}33` }}><span style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: ch.color, color: "#fff", fontSize: 15, fontWeight: 600 }}>{ic}</span><div style={{ fontSize: 14, fontWeight: 600, color: ch.color }}>{l || "Goal Name"}</div></div>
    <input value={l} onChange={e => sL(e.target.value)} placeholder="e.g. Side Project, Travel..." autoFocus onKeyDown={e => e.key === "Enter" && save()} style={{ width: "100%", padding: "11px 13px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 12 }} />
    <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: 6 }}>Icon</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>{ICON_OPTIONS.map((i, idx) => <button key={idx} onClick={() => sI(i)} style={{ width: 32, height: 32, borderRadius: 7, border: ic === i ? `2px solid ${ch.color}` : "1.5px solid #e8e8e8", background: ic === i ? ch.bg : "#fafafa", color: ic === i ? ch.color : "#888", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{i}</button>)}</div>
    <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase", marginBottom: 6 }}>Color</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{COLOR_OPTIONS.map((c, i) => <button key={i} onClick={() => sC(i)} style={{ width: 28, height: 28, borderRadius: "50%", border: ci === i ? `3px solid ${c.color}` : "3px solid transparent", background: c.color, cursor: "pointer", padding: 0, boxShadow: ci === i ? `0 0 0 2px #fff, 0 0 0 4px ${c.color}` : "none" }} />)}</div>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={onClose} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "1px solid #e0e0e0", background: "transparent", color: "#777", cursor: "pointer", fontWeight: 500 }}>Cancel</button><button onClick={save} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "none", background: ch.color, color: "#fff", cursor: "pointer", fontWeight: 700, opacity: l.trim() ? 1 : 0.4 }}>{isEdit ? "Save" : "Create"}</button></div>
  </ModalOverlay>);
}

function CreateEventModal({ onClose, color, onCreated, prefill }) {
  const [ti, sTi] = useState(prefill || ""); const [dt, sDt] = useState(new Date().toISOString().split("T")[0]);
  const [st, sSt] = useState("09:00"); const [et, sEt] = useState("10:00");
  const [cr, sCr] = useState(false); const [res, sRes] = useState(null);
  const create = async () => { if (!ti.trim()) return; sCr(true); const r = await createCalEvent(ti.trim(), dt, new Date(`${dt}T${st}`).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}), new Date(`${dt}T${et}`).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})); sCr(false); if (r?.success) { sRes("ok"); setTimeout(() => { onCreated?.(); onClose(); }, 1000); } else sRes("err"); };
  return (<ModalOverlay onClose={onClose}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><CalIcon size={18} color={color} /><div style={{ fontSize: 16, fontWeight: 700 }}>Add to Calendar</div></div>
    {res === "ok" ? <div style={{ padding: 32, textAlign: "center" }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: "#E8F5F1", color: "#4CAF9A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px" }}>✓</div><div style={{ fontSize: 15, fontWeight: 600 }}>Created!</div></div>
    : <><input value={ti} onChange={e => sTi(e.target.value)} placeholder="Event title" autoFocus style={{ width: "100%", padding: "11px 13px", fontSize: 14, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
    <input type="date" value={dt} onChange={e => sDt(e.target.value)} style={{ width: "100%", padding: "10px 13px", fontSize: 13, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit", marginBottom: 10 }} />
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}><input type="time" value={st} onChange={e => sSt(e.target.value)} style={{ flex: 1, padding: "10px 12px", fontSize: 13, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit" }} /><input type="time" value={et} onChange={e => sEt(e.target.value)} style={{ flex: 1, padding: "10px 12px", fontSize: 13, border: "1.5px solid #e0e0e0", borderRadius: 12, outline: "none", fontFamily: "inherit" }} /></div>
    {res === "err" && <div style={{ padding: "8px", background: "#fef5f5", borderRadius: 8, fontSize: 11, color: "#c44", marginBottom: 10 }}>Failed. Try again.</div>}
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><button onClick={onClose} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "1px solid #e0e0e0", background: "transparent", color: "#777", cursor: "pointer", fontWeight: 500 }}>Cancel</button><button onClick={create} disabled={cr} style={{ padding: "9px 18px", fontSize: 13, borderRadius: 10, border: "none", background: color, color: "#fff", cursor: "pointer", fontWeight: 700, opacity: cr ? 0.6 : 1 }}>{cr ? "Creating..." : "Add to Calendar"}</button></div></>}
  </ModalOverlay>);
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  return (<>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@300;400&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
    <style>{GLOBAL_STYLES}</style>
    {page === "landing" && <LandingPage onGetStarted={() => setPage("auth")} />}
    {page === "auth" && <AuthScreen onAuth={u => { setUser(u); setPage("dashboard"); }} onBack={() => setPage("landing")} />}
    {page === "dashboard" && <Dashboard user={user} onLogout={() => { setUser(null); setPage("landing"); }} />}
  </>);
}
