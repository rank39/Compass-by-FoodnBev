import { useState, useMemo, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  BRAND TOKENS                                                       */
/* ------------------------------------------------------------------ */
const C = {
  navy: "#0D47A1",
  navyDeep: "#0A3578",
  red: "#D32F2F",
  gold: "#FFA000",
  bg: "#FAFAFA",
  white: "#FFFFFF",
  ink: "#212121",
  gray: "#757575",
  line: "#E0E0E0",
  navyTint: "#E3EDFA",
  goldTint: "#FFF3DC",
  redTint: "#FCE8E8",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Figtree:wght@400;500;600&display=swap');
.compass { font-family: 'Figtree', system-ui, sans-serif; color: ${C.ink}; background: ${C.bg}; line-height: 1.5; }
.compass h1, .compass h2, .compass h3, .compass .display { font-family: 'Bricolage Grotesque', 'Figtree', system-ui, sans-serif; letter-spacing: -0.02em; }
.compass button { cursor: pointer; font-family: inherit; }
.compass button:focus-visible, .compass input:focus-visible, .compass a:focus-visible { outline: 3px solid ${C.gold}; outline-offset: 2px; }
.compass .btn-red { background: ${C.red}; color: #fff; font-weight: 600; border-radius: 999px; padding: 0.7rem 1.4rem; border: 0; transition: background .15s; }
.compass .btn-red:hover { background: #B71C1C; }
.compass .btn-red:disabled { background: ${C.line}; color: ${C.gray}; cursor: not-allowed; }
.compass .btn-ghost { background: #fff; color: ${C.navy}; font-weight: 600; border-radius: 999px; padding: 0.6rem 1.2rem; border: 2px solid ${C.navy}; transition: background .15s; }
.compass .btn-ghost:hover { background: ${C.navyTint}; }
.compass .card { background: #fff; border: 1px solid ${C.line}; border-radius: 16px; }
.compass .pill { border: 1.5px solid ${C.line}; background: #fff; border-radius: 999px; padding: 0.35rem 0.85rem; font-size: 0.875rem; font-weight: 500; color: ${C.ink}; transition: all .12s; }
.compass .pill[aria-pressed="true"] { background: ${C.navy}; border-color: ${C.navy}; color: #fff; }
.compass .pill:hover:not([aria-pressed="true"]) { border-color: ${C.navy}; }
.compass .bar-fill { transition: width .35s ease, height .35s ease; }
.compass .curve { transition: all .35s ease; }
@media (prefers-reduced-motion: reduce) { .compass *, .compass *::before { transition: none !important; animation: none !important; } }
`;

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */
// per = values per pack. full = typical calories of the full-size equivalent a person would eat.
const PRODUCTS = [
  { id: "proteinsnaq", cat: "protein", name: "ProteinSnaq", tag: "10g protein per bite", flavors: ["Dark Chocolate Peanut Butter", "Salted Caramel"], per: { cal: 80, protein: 10, water: 0, fiber: 1, gut: 0 }, full: 220, vs: "protein bar" },
  { id: "healthychips", cat: "crunch", name: "HealthyChips", tag: "Air-popped vegetable chips", flavors: ["Sea Salt", "Zesty Lime"], per: { cal: 70, protein: 1, water: 0, fiber: 2, gut: 0 }, full: 240, vs: "chip bag" },
  { id: "rusticcrisp", cat: "crunch", name: "RusticCrisp", tag: "100-calorie single-serve pack", flavors: ["Original"], per: { cal: 100, protein: 2, water: 0, fiber: 2, gut: 0 }, full: 280, vs: "cracker box" },
  { id: "crispycrunch", cat: "crunch", name: "CrispyCrunch", tag: "100-calorie single-serve pack", flavors: ["Original"], per: { cal: 100, protein: 2, water: 0, fiber: 1, gut: 0 }, full: 270, vs: "snack bag" },
  { id: "fizzwater", cat: "hydration", name: "FizzWater", tag: "Zero-sugar sparkling", flavors: ["Lemon-Lime", "Berry Blast"], per: { cal: 0, protein: 0, water: 12, fiber: 0, gut: 0 }, full: 140, vs: "soda" },
  { id: "sportswater", cat: "hydration", name: "SportsWater", tag: "Electrolyte-infused", flavors: ["Lemon-Lime", "Berry Blast"], per: { cal: 10, protein: 0, water: 16, fiber: 0, gut: 0 }, full: 120, vs: "sports drink" },
  { id: "scobypop", cat: "gut", name: "ScobyPop Kombucha", tag: "Low sugar, digestive support", flavors: ["Ginger Lemon", "Passionfruit"], per: { cal: 30, protein: 0, water: 8, fiber: 0, gut: 1 }, full: 110, vs: "bottled kombucha" },
];

const CATS = {
  protein: { label: "Protein anchor", why: "Protects muscle when appetite is low" },
  crunch: { label: "Crunch & permitted favorites", why: "Portion-controlled so cravings stay manageable" },
  hydration: { label: "Hydration boost", why: "Dehydration often shows up as fatigue or nausea" },
  gut: { label: "Gut health & digestion", why: "Supports digestion while things slow down" },
};
const CAT_ORDER = ["protein", "crunch", "hydration", "gut"];
const byId = (id) => PRODUCTS.find((p) => p.id === id);

const PHASES = [
  {
    id: "low", range: "Days 1–3", title: "Low appetite", sub: "High protein & hydration",
    tint: C.navyTint, ink: C.navy, days: [1, 2, 3],
    blurb: "Medication is at its peak, so hunger is quiet. Small, protein-dense bites and steady fluids matter more than volume.",
    plan: [
      { when: "On waking", cat: "hydration", note: "Sip before you feel hungry" },
      { when: "Mid-morning", cat: "protein", note: "One bite is enough to start" },
      { when: "Afternoon", cat: "protein", note: "Pair with fluids" },
      { when: "Evening", cat: "gut", note: "Easy on the stomach" },
    ],
    preset: { protein: ["proteinsnaq", 0, 7], crunch: ["healthychips", 0, 2], hydration: ["sportswater", 0, 7], gut: ["scobypop", 0, 3] },
  },
  {
    id: "micro", range: "Days 4–5", title: "Microdose snacking", sub: "Small portions, often",
    tint: C.goldTint, ink: "#8A5600", days: [4, 5],
    blurb: "Appetite starts to wake up. Planned mini-portions keep you ahead of hunger instead of reacting to it.",
    plan: [
      { when: "Morning", cat: "protein", note: "Anchor the day with protein" },
      { when: "Late morning", cat: "crunch", note: "One mini bag, no refills" },
      { when: "Afternoon", cat: "hydration", note: "Bubbles help you feel full" },
      { when: "Evening", cat: "gut", note: "Digestive support" },
    ],
    preset: { protein: ["proteinsnaq", 1, 5], crunch: ["healthychips", 1, 6], hydration: ["fizzwater", 0, 5], gut: ["scobypop", 1, 4] },
  },
  {
    id: "fav", range: "Days 6–7", title: "Permitted favorites", sub: "Cravings management",
    tint: C.redTint, ink: "#9B1C1C", days: [6, 7],
    blurb: "Cravings peak as the medication wears off. Enjoy something crunchy on purpose, in a portion that ends when the pack does.",
    plan: [
      { when: "Morning", cat: "protein", note: "Start steady to blunt the afternoon dip" },
      { when: "Craving window", cat: "crunch", note: "Eat it from the pack, then close the bag" },
      { when: "Afternoon", cat: "hydration", note: "Try a drink first, wait 10 minutes" },
      { when: "Evening", cat: "crunch", note: "Second pack is part of the plan" },
    ],
    preset: { protein: ["proteinsnaq", 1, 4], crunch: ["rusticcrisp", 0, 8], hydration: ["fizzwater", 1, 4], gut: ["scobypop", 0, 3] },
  },
];
const MAINT = {
  id: "maint", range: "Steady", title: "Maintenance mode", sub: "Balanced week, no cycle tuning",
  tint: C.navyTint, ink: C.navy,
  blurb: "You're tapering or off medication. Portions stay right-sized and your favorites stay in the box, with no weekly swings.",
  plan: [
    { when: "Morning", cat: "protein", note: "Protein first" },
    { when: "Snack time", cat: "crunch", note: "Your favorite, one pack" },
    { when: "Through the day", cat: "hydration", note: "Keep fluids steady" },
    { when: "Evening", cat: "gut", note: "Digestive support" },
  ],
  preset: { protein: ["proteinsnaq", 1, 5], crunch: ["rusticcrisp", 0, 7], hydration: ["fizzwater", 0, 5], gut: ["scobypop", 1, 3] },
};

// Appetite level by cycle day (1 = quiet, 5 = strong). Illustrative.
const APPETITE = [1.2, 1.0, 1.6, 2.8, 3.6, 4.5, 4.8];

const GOALS = { cal: 1400, protein: 70, water: 64, fiber: 25 };
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TODAY = 4; // Friday
const SEED = [
  { cal: 1180, protein: 62, water: 58, fiber: 19, gut: 1, saved: 410 },
  { cal: 1250, protein: 66, water: 61, fiber: 21, gut: 2, saved: 470 },
  { cal: 1310, protein: 58, water: 52, fiber: 18, gut: 1, saved: 380 },
  { cal: 1290, protein: 69, water: 66, fiber: 22, gut: 2, saved: 520 },
  { cal: 420, protein: 24, water: 20, fiber: 6, gut: 0, saved: 150 },
  null, null,
];

const FREQ = ["Weekly", "Bi-weekly", "Monthly"];
const addInterval = (d, freq) => {
  const n = new Date(d);
  if (freq === "Weekly") n.setDate(n.getDate() + 7);
  else if (freq === "Bi-weekly") n.setDate(n.getDate() + 14);
  else n.setMonth(n.getMonth() + 1);
  return n;
};
const fmtDate = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const REF_LINK = "https://compass.foodnbev.com/r/COMPASS-FRIEND15";

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */
function Meter({ label, value, goal, unit, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">{label}</span>
        <span style={{ color: C.gray }} className="text-sm">
          <b style={{ color: C.ink }}>{value}</b> / {goal} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-3 w-full overflow-hidden" style={{ background: C.line, borderRadius: 999 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} progress`}>
        <div className="bar-fill h-full" style={{ width: `${pct}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function Stepper({ value, onChange, label }) {
  return (
    <div className="inline-flex items-center" style={{ border: `1.5px solid ${C.line}`, borderRadius: 999 }}>
      <button aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(0, value - 1))} className="w-9 h-9 text-lg" style={{ background: "none", border: 0, color: C.navy }}>−</button>
      <span className="w-8 text-center font-semibold" aria-live="polite">{value}</span>
      <button aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(14, value + 1))} className="w-9 h-9 text-lg" style={{ background: "none", border: 0, color: C.navy }}>+</button>
    </div>
  );
}

function SectionTitle({ id, title, children }) {
  return (
    <div className="mb-5">
      <h2 id={id} className="text-2xl md:text-3xl font-extrabold" style={{ color: C.navy, scrollMarginTop: 90 }}>{title}</h2>
      {children && <p className="mt-1" style={{ color: C.gray, maxWidth: 620 }}>{children}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP                                                                */
/* ------------------------------------------------------------------ */
export default function CompassApp() {
  /* --- tabs --- */
  const [tab, setTab] = useState("cycle");

  /* --- cycle --- */
  const [cycleDay, setCycleDay] = useState(2);
  const [maintenance, setMaintenance] = useState(false);
  const phase = maintenance ? MAINT : PHASES.find((p) => p.days.includes(cycleDay));

  /* --- box --- */
  const buildBox = (preset) =>
    Object.fromEntries(CAT_ORDER.map((c) => { const [id, f, q] = preset[c]; return [c, { id, flavor: f, qty: q }]; }));
  const [box, setBox] = useState(() => buildBox(PHASES[0].preset));
  const [boxSaved, setBoxSaved] = useState(true);

  const updateBox = (cat, patch) => { setBox((b) => ({ ...b, [cat]: { ...b[cat], ...patch } })); setBoxSaved(false); };
  const pickProduct = (cat, id) => updateBox(cat, { id, flavor: 0 });

  const boxTotals = useMemo(() => {
    let cal = 0, protein = 0, packs = 0, saved = 0;
    CAT_ORDER.forEach((c) => {
      const p = byId(box[c].id), q = box[c].qty;
      cal += p.per.cal * q; protein += p.per.protein * q; packs += q; saved += (p.full - p.per.cal) * q;
    });
    return { cal, protein, packs, saved };
  }, [box]);

  /* --- tracker --- */
  const [log, setLog] = useState(SEED);
  const [view, setView] = useState("daily");
  const [metric, setMetric] = useState("protein");

  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ name: "", cal: "", protein: "", water: "", fiber: "" });
  const [formErr, setFormErr] = useState("");

  const shiftToday = (d, sign) =>
    setLog((l) => l.map((t, i) => {
      if (i !== TODAY) return sign > 0 ? (t || { cal: 0, protein: 0, water: 0, fiber: 0, gut: 0, saved: 0 }) : t;
      const base = t || { cal: 0, protein: 0, water: 0, fiber: 0, gut: 0, saved: 0 };
      const f = (k) => Math.max(0, base[k] + sign * d[k]);
      return { cal: f("cal"), protein: f("protein"), water: f("water"), fiber: f("fiber"), gut: f("gut"), saved: f("saved") };
    }));
  const addEntry = (name, d) => {
    setEntries((e) => [{ id: Date.now() + Math.random(), name, ...d }, ...e]);
    shiftToday(d, 1);
  };
  const removeEntry = (en) => {
    setEntries((e) => e.filter((x) => x.id !== en.id));
    shiftToday(en, -1);
    toast(`Removed ${en.name}.`);
  };
  const logItem = (cat) => {
    const p = byId(box[cat].id);
    addEntry(`${p.name} (${p.flavors[box[cat].flavor]})`, { cal: p.per.cal, protein: p.per.protein, water: p.per.water, fiber: p.per.fiber, gut: p.per.gut, saved: p.full - p.per.cal });
  };
  const num = (v) => (v === "" ? 0 : Number(v));
  const submitManual = () => {
    const vals = [form.cal, form.protein, form.water, form.fiber];
    if (form.cal === "" || vals.some((v) => v !== "" && (isNaN(Number(v)) || Number(v) < 0))) {
      setFormErr("Enter calories as a number (0 or more). The other fields can stay blank.");
      return;
    }
    if (num(form.cal) > 5000) { setFormErr("That's over 5,000 calories. Check the number and try again."); return; }
    addEntry(form.name.trim() || "Custom entry", { cal: Math.round(num(form.cal)), protein: num(form.protein), water: num(form.water), fiber: num(form.fiber), gut: 0, saved: 0 });
    setForm({ name: "", cal: "", protein: "", water: "", fiber: "" });
    setFormErr("");
    toast(`Added ${Math.round(num(form.cal))} calories.`);
  };
  const today = log[TODAY];
  const week = useMemo(() => log.reduce((a, d) => d ? { cal: a.cal + d.cal, protein: a.protein + d.protein, water: a.water + d.water, fiber: a.fiber + d.fiber, gut: a.gut + d.gut, saved: a.saved + d.saved } : a, { cal: 0, protein: 0, water: 0, fiber: 0, gut: 0, saved: 0 }), [log]);
  const daysLogged = log.filter(Boolean).length;

  /* --- delivery --- */
  const [freq, setFreq] = useState("Weekly");
  const [nextDate, setNextDate] = useState(new Date(2026, 9, 19));
  const [skipped, setSkipped] = useState(null);
  const [paused, setPaused] = useState(false);

  const skip = () => { setSkipped(nextDate); setNextDate(addInterval(nextDate, freq)); toast(`Skipped ${fmtDate(nextDate)}. Next box arrives ${fmtDate(addInterval(nextDate, freq))}.`); };
  const undoSkip = () => { setNextDate(skipped); setSkipped(null); toast("Skip undone. Your box is back on."); };

  /* --- referral --- */
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [invites, setInvites] = useState([]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(REF_LINK); }
    catch { const t = document.createElement("textarea"); t.value = REF_LINK; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } document.body.removeChild(t); }
    setCopied(true); setTimeout(() => setCopied(false), 2200);
  };
  const sendInvite = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setEmailErr("Enter a full email address, like friend@email.com."); return; }
    setInvites((i) => [email.trim(), ...i]); setEmail(""); setEmailErr(""); toast("Invite sent.");
  };

  /* --- toast --- */
  const [msg, setMsg] = useState("");
  const tRef = useRef(null);
  function toast(m) { setMsg(m); clearTimeout(tRef.current); tRef.current = setTimeout(() => setMsg(""), 3200); }

  const matchBox = () => { setBox(buildBox(phase.preset)); setBoxSaved(false); toast(`Box tuned to ${phase.title.toLowerCase()}. Review and save.`); };
  const saveBox = () => { setBoxSaved(true); toast(`Saved. Your ${freq.toLowerCase()} box ships ${fmtDate(nextDate)}.`); };

  /* --- chart helpers --- */
  const METRICS = { protein: { label: "Protein", unit: "g", goal: GOALS.protein, color: C.navy }, water: { label: "Hydration", unit: "oz", goal: GOALS.water, color: C.navy }, fiber: { label: "Fiber", unit: "g", goal: GOALS.fiber, color: C.gold }, cal: { label: "Calories", unit: "kcal", goal: GOALS.cal, color: C.red } };
  const m = METRICS[metric];

  /* --- curve geometry --- */
  const W = 700, H = 150, colW = W / 7;
  const pts = APPETITE.map((v, i) => [(i + 0.5) * colW, H - 20 - (v / 5) * (H - 45)]);
  const curvePath = pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = pts[i - 1]; const cx = (px + x) / 2;
    return `${d} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, "");
  const [mx, my] = pts[cycleDay - 1];

  const navLinks = [["cycle", "My Cycle"], ["box", "Next Box"], ["tracker", "Nutrients"], ["delivery", "Delivery"], ["refer", "Refer a Friend"]];

  return (
    <div className="compass min-h-screen">
      <style>{css}</style>

      {/* ---------- NAV ---------- */}
      <header className="sticky top-0 z-30" style={{ background: C.navy }}>
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-4" style={{ height: 60 }}>
          <div className="flex items-baseline gap-2 shrink-0">
            <span className="display text-2xl font-extrabold text-white">Compass</span>
            <span className="text-xs font-semibold px-2 py-0.5" style={{ background: C.gold, color: C.ink, borderRadius: 999 }}>by FoodnBev</span>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section style={{ background: C.navy, color: "#fff" }}>
        <div className="max-w-5xl mx-auto px-4 pt-10 pb-24 md:pt-14 md:pb-28">
          <h1 className="display font-extrabold" style={{ fontSize: "clamp(2.4rem, 7vw, 4.4rem)", lineHeight: 1.02, maxWidth: 760 }}>
            Evolving With Your Cravings
          </h1>
          <p className="mt-5 text-base md:text-lg" style={{ maxWidth: 640, opacity: 0.92 }}>
            Your GLP-1 hunger moves in cycles—from lower appetite early in the week to emerging cravings as your medication wears off. We curate microdose snacking and right-sized portions tailored to where you are in your weekly cycle.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 pb-20" style={{ marginTop: -72 }}>
        {/* ---------- TABS ---------- */}
        <div className="card p-1.5 flex gap-1 overflow-x-auto" role="tablist" aria-label="Compass sections" style={{ boxShadow: "0 8px 30px rgba(13,71,161,.14)" }}>
          {navLinks.map(([id, l]) => (
            <button key={id} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}
              className="flex-1 px-4 py-2.5 text-sm font-bold whitespace-nowrap"
              style={{ border: 0, borderRadius: 12, background: tab === id ? C.navy : "transparent", color: tab === id ? "#fff" : C.navy }}>
              {l}
            </button>
          ))}
        </div>
        {/* ---------- 1. CYCLE ---------- */}
        {tab === "cycle" && (
        <section id="panel-cycle" role="tabpanel" aria-labelledby="tab-cycle" className="card p-4 md:p-6 mt-5" style={{ boxShadow: "0 8px 30px rgba(13,71,161,.14)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="cycle" className="text-xl md:text-2xl font-extrabold" style={{ color: C.navy, scrollMarginTop: 90 }}>Where are you in your week?</h2>
              <p className="text-sm" style={{ color: C.gray }}>Pick your day since your last dose. Your snack plan updates to match.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer select-none">
              <input type="checkbox" checked={maintenance} onChange={(e) => { setMaintenance(e.target.checked); toast(e.target.checked ? "Maintenance mode on. Cycle tuning is paused." : "Maintenance mode off. Cycle tuning is back."); }} style={{ width: 18, height: 18, accentColor: C.navy }} />
              Maintenance mode
            </label>
          </div>

          {/* curve */}
          <div className="mt-5" style={{ opacity: maintenance ? 0.4 : 1 }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Appetite rises from low early in the week to high at the end of the week">
              {PHASES.map((p) => {
                const x0 = (p.days[0] - 1) * colW, w = p.days.length * colW;
                return <rect key={p.id} className="curve" x={x0} y={0} width={w} height={H} fill={p.tint} opacity={!maintenance && phase.id === p.id ? 1 : 0.45} />;
              })}
              <path d={curvePath} fill="none" stroke={C.navy} strokeWidth="4" strokeLinecap="round" />
              <text x="8" y="16" fontSize="12" fill={C.gray}>Appetite</text>
              <line x1={mx} x2={mx} y1={my} y2={H} stroke={C.red} strokeWidth="2" strokeDasharray="4 4" className="curve" />
              <circle className="curve" cx={mx} cy={my} r="9" fill={C.red} stroke="#fff" strokeWidth="3" />
            </svg>
            <div className="grid grid-cols-7" role="group" aria-label="Day in cycle">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button key={d} aria-pressed={cycleDay === d} disabled={maintenance} onClick={() => setCycleDay(d)}
                  className="py-2 font-semibold text-sm"
                  style={{ background: cycleDay === d ? C.red : "transparent", color: cycleDay === d ? "#fff" : C.ink, border: 0, borderRadius: 10, margin: "0 2px" }}>
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          {/* phase buttons */}
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {PHASES.map((p) => {
              const active = !maintenance && phase.id === p.id;
              return (
                <button key={p.id} disabled={maintenance} onClick={() => setCycleDay(p.days[0])} aria-pressed={active}
                  className="text-left p-3"
                  style={{ background: active ? p.tint : "#fff", border: `2px solid ${active ? p.ink : C.line}`, borderRadius: 12, opacity: maintenance ? 0.5 : 1 }}>
                  <div className="font-bold" style={{ color: p.ink }}>{p.range}: {p.title}</div>
                  <div className="text-sm" style={{ color: C.gray }}>{p.sub}</div>
                </button>
              );
            })}
          </div>

          {/* daily plan */}
          <div className="mt-5 p-4" style={{ background: phase.tint, borderRadius: 14 }}>
            <h3 className="text-lg font-extrabold" style={{ color: phase.ink }}>
              {maintenance ? "Your steady-state day" : `Day ${cycleDay}: ${phase.title}`}
            </h3>
            <p className="text-sm mt-1" style={{ maxWidth: 640 }}>{phase.blurb}</p>
            <ul className="mt-3 grid gap-2 md:grid-cols-2" style={{ listStyle: "none", padding: 0 }}>
              {phase.plan.map((s, i) => {
                const p = byId(box[s.cat].id);
                return (
                  <li key={i} className="flex gap-3 p-3" style={{ background: "#fff", borderRadius: 10 }}>
                    <div className="shrink-0 font-semibold text-sm" style={{ width: 92, color: C.gray }}>{s.when}</div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm" style={{ color: C.gray }}>{s.note}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button className="btn-red mt-4" onClick={matchBox}>Tune my next box to this phase</button>
          </div>
        </section>
        )}

        {/* ---------- 2. BOX ---------- */}
        {tab === "box" && (
        <section id="panel-box" role="tabpanel" aria-labelledby="tab-box" className="mt-5">
          <SectionTitle id="box" title="Next week's snack box">Swap products, pick flavors, and set how many packs you want. Nothing ships until you save.</SectionTitle>

          <div className="grid gap-4 md:grid-cols-2">
            {CAT_ORDER.map((cat) => {
              const options = PRODUCTS.filter((p) => p.cat === cat);
              const sel = box[cat], p = byId(sel.id);
              return (
                <div key={cat} className="card p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold" style={{ color: C.navy }}>{CATS[cat].label}</h3>
                    <p className="text-sm" style={{ color: C.gray }}>{CATS[cat].why}</p>
                  </div>

                  {options.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`${CATS[cat].label} product`}>
                      {options.map((o) => <button key={o.id} className="pill" aria-pressed={sel.id === o.id} onClick={() => pickProduct(cat, o.id)}>{o.name}</button>)}
                    </div>
                  )}

                  <div>
                    <div className="font-bold text-lg">{p.name}</div>
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 mt-1" style={{ background: C.goldTint, color: "#8A5600", borderRadius: 999 }}>{p.tag}</span>
                  </div>

                  <div>
                    <div className="text-sm font-semibold mb-1.5">Flavor</div>
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`${p.name} flavor`}>
                      {p.flavors.map((f, i) => <button key={f} className="pill" aria-pressed={sel.flavor === i} onClick={() => updateBox(cat, { flavor: i })}>{f}</button>)}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-auto pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                    <div className="text-sm" style={{ color: C.gray }}>
                      Per pack: <b style={{ color: C.ink }}>{p.per.cal} cal</b>
                      {p.per.protein >= 5 && <>, <b style={{ color: C.ink }}>{p.per.protein}g protein</b></>}
                      {p.per.water > 0 && <>, <b style={{ color: C.ink }}>{p.per.water} oz</b></>}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs" style={{ color: C.gray }}>Packs per week</span>
                      <Stepper value={sel.qty} onChange={(q) => updateBox(cat, { qty: q })} label={p.name} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card mt-4 p-4 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: C.navy, borderWidth: 2 }}>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div><div className="display text-2xl font-extrabold" style={{ color: C.navy }}>{boxTotals.packs}</div><div className="text-sm" style={{ color: C.gray }}>packs</div></div>
              <div><div className="display text-2xl font-extrabold" style={{ color: C.navy }}>{boxTotals.protein}g</div><div className="text-sm" style={{ color: C.gray }}>protein in the box</div></div>
              <div><div className="display text-2xl font-extrabold" style={{ color: C.navy }}>{boxTotals.cal}</div><div className="text-sm" style={{ color: C.gray }}>calories in the box</div></div>
              <div><div className="display text-2xl font-extrabold" style={{ color: "#8A5600" }}>{boxTotals.saved}</div><div className="text-sm" style={{ color: C.gray }}>fewer calories than full-size</div></div>
            </div>
            <button className="btn-red" disabled={boxSaved} onClick={saveBox}>{boxSaved ? "Box saved" : "Save my box"}</button>
          </div>
        </section>
        )}

        {/* ---------- 3. TRACKER ---------- */}
        {tab === "tracker" && (
        <section id="panel-tracker" role="tabpanel" aria-labelledby="tab-tracker" className="mt-5">
          <SectionTitle id="tracker" title="Calories & Nutrients">Protein, hydration, and fiber matter most on GLP-1. Log a pack from your box, or add anything else you ate.</SectionTitle>

          <div className="card p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex p-1" style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 999 }} role="group" aria-label="Tracker view">
                {[["daily", "Today"], ["weekly", "This week"]].map(([k, l]) => (
                  <button key={k} onClick={() => setView(k)} aria-pressed={view === k} className="px-4 py-1.5 text-sm font-semibold" style={{ border: 0, borderRadius: 999, background: view === k ? C.navy : "transparent", color: view === k ? "#fff" : C.ink }}>{l}</button>
                ))}
              </div>
              <div className="text-sm" style={{ color: C.gray }}>Goals are sample defaults: {GOALS.protein}g protein, {GOALS.water} oz fluids, {GOALS.fiber}g fiber.</div>
            </div>

            {view === "daily" ? (
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Meter label="Protein" value={today.protein} goal={GOALS.protein} unit="g" color={C.navy} />
                  <Meter label="Hydration" value={today.water} goal={GOALS.water} unit="oz" color={C.navy} />
                  <Meter label="Fiber" value={today.fiber} goal={GOALS.fiber} unit="g" color={C.gold} />
                  <Meter label="Calories" value={today.cal} goal={GOALS.cal} unit="kcal" color={C.red} />
                  <div className="flex gap-3">
                    <div className="flex-1 p-3" style={{ background: C.navyTint, borderRadius: 12 }}>
                      <div className="display text-2xl font-extrabold" style={{ color: C.navy }}>{today.gut}</div>
                      <div className="text-sm">gut-health servings today</div>
                    </div>
                    <div className="flex-1 p-3" style={{ background: C.goldTint, borderRadius: 12 }}>
                      <div className="display text-2xl font-extrabold" style={{ color: "#8A5600" }}>{today.saved}</div>
                      <div className="text-sm">calories saved vs. full-size</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg" style={{ color: C.navy }}>Log a pack</h3>
                  <p className="text-sm mb-3" style={{ color: C.gray }}>Uses the flavors in your box.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CAT_ORDER.map((c) => {
                      const p = byId(box[c].id);
                      return (
                        <button key={c} onClick={() => logItem(c)} className="text-left p-3" style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 12 }}>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-xs" style={{ color: C.gray }}>{p.flavors[box[c].flavor]}</div>
                          <div className="text-xs mt-1 font-semibold" style={{ color: C.navy }}>+{p.per.cal} cal{p.per.protein >= 5 ? `, ${p.per.protein}g protein` : ""}{p.per.water ? `, ${p.per.water} oz` : ""}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4" style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 14 }}>
                    <h3 className="font-extrabold text-lg" style={{ color: C.navy }}>Add your own intake</h3>
                    <p className="text-sm mb-3" style={{ color: C.gray }}>Ate something that isn't in your box? Log the calories here.</p>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label htmlFor="f-name" className="text-sm font-semibold block mb-1">What did you have? (optional)</label>
                        <input id="f-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onKeyDown={(e) => e.key === "Enter" && submitManual()} placeholder="Greek yogurt with berries" className="w-full px-3" style={{ height: 42, borderRadius: 10, border: `1.5px solid ${C.line}` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[["cal", "Calories", "kcal"], ["protein", "Protein", "g"], ["water", "Fluids", "oz"], ["fiber", "Fiber", "g"]].map(([k, l, u]) => (
                          <div key={k}>
                            <label htmlFor={`f-${k}`} className="text-sm font-semibold block mb-1">{l} ({u}){k === "cal" ? " *" : ""}</label>
                            <input id={`f-${k}`} type="number" inputMode="decimal" min="0" value={form[k]} onChange={(e) => { setForm({ ...form, [k]: e.target.value }); setFormErr(""); }} onKeyDown={(e) => e.key === "Enter" && submitManual()} placeholder="0" className="w-full px-3" style={{ height: 42, borderRadius: 10, border: `1.5px solid ${k === "cal" && formErr ? C.red : C.line}` }} />
                          </div>
                        ))}
                      </div>
                      <div className="text-sm" style={{ color: C.red, minHeight: formErr ? 20 : 0 }} role="alert">{formErr}</div>
                      <button className="btn-red" onClick={submitManual}>Add to today</button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-extrabold text-lg" style={{ color: C.navy }}>Today's log</h3>
                    {entries.length === 0 ? (
                      <p className="text-sm mt-1" style={{ color: C.gray }}>Nothing logged yet today. Packs and custom entries will show up here.</p>
                    ) : (
                      <ul className="mt-2" style={{ listStyle: "none", padding: 0 }}>
                        {entries.map((en) => (
                          <li key={en.id} className="flex items-center justify-between gap-3 py-2" style={{ borderTop: `1px solid ${C.line}` }}>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{en.name}</div>
                              <div className="text-xs" style={{ color: C.gray }}>
                                {en.cal} cal{en.protein ? `, ${en.protein}g protein` : ""}{en.water ? `, ${en.water} oz` : ""}{en.fiber ? `, ${en.fiber}g fiber` : ""}
                              </div>
                            </div>
                            <button onClick={() => removeEntry(en)} aria-label={`Remove ${en.name}`} className="text-sm font-semibold shrink-0" style={{ background: "none", border: 0, color: C.red }}>Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Chart metric">
                  {Object.entries(METRICS).map(([k, v]) => <button key={k} className="pill" aria-pressed={metric === k} onClick={() => setMetric(k)}>{v.label}</button>)}
                </div>

                <div className="relative" style={{ height: 150 }}>
                  <div className="absolute left-0 right-0 flex items-center" style={{ bottom: 104, transform: "translateY(50%)" }}>
                    <div className="flex-1" style={{ borderTop: `2px dashed ${C.gold}` }} />
                    <span className="text-xs font-semibold pl-2" style={{ color: "#8A5600", background: "#fff" }}>Goal {m.goal}{m.unit}</span>
                  </div>
                  <div className="absolute inset-0 grid grid-cols-7 gap-2 items-end">
                    {WEEKDAYS.map((d, i) => {
                      const v = log[i] ? log[i][metric] : 0;
                      const h = Math.min(130, Math.round((v / (m.goal * 1.25)) * 130));
                      return (
                        <div key={d} className="flex flex-col items-center justify-end h-full">
                          <span className="text-xs font-semibold mb-1" style={{ color: C.gray }}>{log[i] ? v : ""}</span>
                          <div className="bar-fill w-full" style={{ height: log[i] ? Math.max(h, 4) : 0, background: i === TODAY ? C.red : m.color, borderRadius: "8px 8px 0 0", opacity: i === TODAY ? 1 : 0.85 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mt-1.5" style={{ borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
                  {WEEKDAYS.map((d, i) => <span key={d} className="text-xs text-center font-semibold" style={{ color: i === TODAY ? C.red : C.gray }}>{d}</span>)}
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Avg protein", `${Math.round(week.protein / daysLogged)}g`, C.navyTint, C.navy],
                    ["Avg hydration", `${Math.round(week.water / daysLogged)} oz`, C.navyTint, C.navy],
                    ["Gut servings", `${week.gut}`, C.goldTint, "#8A5600"],
                    ["Calories saved", `${week.saved.toLocaleString()}`, C.redTint, "#9B1C1C"],
                  ].map(([l, v, bg, fg]) => (
                    <div key={l} className="p-3" style={{ background: bg, borderRadius: 12 }}>
                      <div className="display text-2xl font-extrabold" style={{ color: fg }}>{v}</div>
                      <div className="text-sm">{l}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-3" style={{ color: C.gray }}>
                  Calories saved compares each microdose pack with the full-size version people typically eat (a standard protein bar, chip bag, soda, and so on).
                </p>
              </div>
            )}
          </div>
        </section>
        )}

        {/* ---------- 4. DELIVERY ---------- */}
        {tab === "delivery" && (
        <section id="panel-delivery" role="tabpanel" aria-labelledby="tab-delivery" className="mt-5">
          <SectionTitle id="delivery" title="Delivery & schedule">Change your plan any time. No calls, no penalties.</SectionTitle>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="card p-5 md:col-span-2 flex flex-col justify-between" style={{ background: paused ? C.bg : C.navy, color: paused ? C.ink : "#fff", borderColor: paused ? C.line : C.navy }}>
              <div>
                <div className="text-sm font-semibold" style={{ opacity: 0.85 }}>{paused ? "Subscription paused" : "Next delivery"}</div>
                <div className="display font-extrabold mt-1" style={{ fontSize: "1.9rem", lineHeight: 1.1 }}>
                  {paused ? "No boxes scheduled" : fmtDate(nextDate)}
                </div>
                <div className="text-sm mt-2" style={{ opacity: 0.85 }}>
                  {paused ? "You won't be charged until you resume." : `${freq} · ${boxTotals.packs} packs${maintenance ? " · Maintenance mode" : ""}`}
                </div>
              </div>
              {skipped && !paused && (
                <div className="mt-4 text-sm p-2.5" style={{ background: "rgba(255,255,255,.14)", borderRadius: 10 }}>
                  Skipped {fmtDate(skipped)}. <button onClick={undoSkip} style={{ background: "none", border: 0, color: C.gold, fontWeight: 700, textDecoration: "underline", padding: 0 }}>Undo</button>
                </div>
              )}
            </div>

            <div className="card p-5 md:col-span-3 flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost" onClick={skip} disabled={paused} style={{ opacity: paused ? 0.4 : 1 }}>Skip next delivery</button>
                <button className={paused ? "btn-red" : "btn-ghost"} onClick={() => { setPaused(!paused); toast(paused ? "Subscription resumed." : "Subscription paused."); }}>{paused ? "Resume subscription" : "Pause subscription"}</button>
              </div>

              <div>
                <div className="font-semibold mb-2">Delivery frequency</div>
                <div className="inline-flex p-1" style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 999 }} role="group" aria-label="Delivery frequency">
                  {FREQ.map((f) => (
                    <button key={f} aria-pressed={freq === f} onClick={() => { setFreq(f); toast(`Now delivering ${f.toLowerCase()}.`); }} className="px-4 py-1.5 text-sm font-semibold" style={{ border: 0, borderRadius: 999, background: freq === f ? C.navy : "transparent", color: freq === f ? "#fff" : C.ink }}>{f}</button>
                  ))}
                </div>
              </div>

              <div className="p-4" style={{ background: maintenance ? C.goldTint : C.bg, border: `1px solid ${maintenance ? C.gold : C.line}`, borderRadius: 12 }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={maintenance} onChange={(e) => { setMaintenance(e.target.checked); toast(e.target.checked ? "Maintenance mode on." : "Maintenance mode off."); }} style={{ width: 20, height: 20, marginTop: 2, accentColor: C.navy }} />
                  <span>
                    <span className="font-bold block">Maintenance mode</span>
                    <span className="text-sm" style={{ color: C.gray }}>For tapering or coming off GLP-1 medication. Keeps your favorites coming in steady, right-sized portions, with no weekly cycle swings. Switch back any time.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ---------- 5. REFERRAL ---------- */}
        {tab === "refer" && (
        <section id="panel-refer" role="tabpanel" aria-labelledby="tab-refer" className="mt-5">
          <div className="p-6 md:p-8 grid gap-6 md:grid-cols-2" style={{ background: C.navy, color: "#fff", borderRadius: 20 }}>
            <div>
              <h2 id="refer" className="display text-3xl md:text-4xl font-extrabold" style={{ scrollMarginTop: 90, lineHeight: 1.05 }}>Give $15, Get $15</h2>
              <p className="mt-3" style={{ opacity: 0.92, maxWidth: 420 }}>Share the Compass Companion Box with a friend on their GLP-1 journey. They save $15 on their first box, and you get $15 off yours when it ships.</p>
              <div className="mt-5 flex items-stretch gap-2">
                <input readOnly value={REF_LINK} aria-label="Your referral link" onFocus={(e) => e.target.select()} className="flex-1 min-w-0 px-4 text-sm" style={{ borderRadius: 999, border: 0, background: "#fff", color: C.ink, height: 44 }} />
                <button className="btn-red" onClick={copy} style={{ whiteSpace: "nowrap" }}>{copied ? "Copied" : "Copy link"}</button>
              </div>
            </div>

            <div className="p-5" style={{ background: "#fff", color: C.ink, borderRadius: 16 }}>
              <label htmlFor="inv" className="font-bold block">Invite by email</label>
              <div className="mt-2 flex gap-2">
                <input id="inv" type="email" value={email} placeholder="friend@email.com" onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }} onKeyDown={(e) => e.key === "Enter" && sendInvite()}
                  className="flex-1 min-w-0 px-4" style={{ height: 44, borderRadius: 999, border: `1.5px solid ${emailErr ? C.red : C.line}` }} aria-invalid={!!emailErr} aria-describedby="inv-err" />
                <button className="btn-red" onClick={sendInvite}>Send invite</button>
              </div>
              <div id="inv-err" className="text-sm mt-2" style={{ color: C.red, minHeight: 20 }} role="alert">{emailErr}</div>
              {invites.length > 0 ? (
                <ul className="mt-2 text-sm" style={{ listStyle: "none", padding: 0 }}>
                  {invites.map((e, i) => <li key={i} className="py-1.5 flex justify-between" style={{ borderTop: `1px solid ${C.line}` }}><span>{e}</span><span style={{ color: C.gray }}>Invited</span></li>)}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: C.gray }}>Friends you invite will show up here.</p>
              )}
            </div>
          </div>
        </section>
        )}

        <footer className="mt-12 text-sm text-center" style={{ color: C.gray }}>
          Compass by FoodnBev prototype. Nutrition values and goals are sample data. Check your targets with your healthcare provider.
        </footer>
      </main>

      {/* ---------- TOAST ---------- */}
      <div aria-live="polite" className="fixed left-0 right-0 flex justify-center px-4 pointer-events-none" style={{ bottom: 20, zIndex: 50 }}>
        {msg && <div className="px-5 py-3 font-semibold text-sm" style={{ background: C.ink, color: "#fff", borderRadius: 999, boxShadow: "0 6px 24px rgba(0,0,0,.25)" }}>{msg}</div>}
      </div>
    </div>
  );
}
