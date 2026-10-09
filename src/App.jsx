import { useEffect, useMemo, useRef, useState } from "react";
import { BLOCKS, WEEK, RULES } from "./data.js";

const KEY = "hostel-planner-v1"; // localStorage: { "YYYY-MM-DD": {done:{}, notes:{}, water:0, mistakes:"", project:"", tomorrow:""} }
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const shift = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d); };
const fmt = (m) => { const h = Math.floor(m / 60) % 24, ap = h >= 12 ? "PM" : "AM"; return `${h % 12 || 12}:${pad(m % 60)} ${ap}`; };
const empty = () => ({ done: {}, notes: {}, water: 0, mistakes: "", project: "", tomorrow: "" });
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const pct = (day) => day ? Math.round((BLOCKS.filter((b) => day.done?.[b.id]).length / BLOCKS.length) * 100) : 0;

function Ring({ value }) {
  const r = 54, c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 130 130" aria-label={`${value}% done`}>
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb86b" /><stop offset="1" stopColor="#ff5d8f" /></linearGradient></defs>
      <circle cx="65" cy="65" r={r} className="ring-bg" />
      <circle cx="65" cy="65" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} />
      <text x="65" y="63" textAnchor="middle" className="ring-n">{value}%</text>
      <text x="65" y="84" textAnchor="middle" className="ring-l">of today</text>
    </svg>
  );
}

export default function App() {
  const today = iso(new Date());
  const [store, setStore] = useState(load);
  const [date, setDate] = useState(today);
  const [view, setView] = useState("day");
  const [now, setNow] = useState(new Date());
  const fileRef = useRef();

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(store)); }, [store]);
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const day = store[date] || empty();
  const dow = fromIso(date).getDay();
  const plan = WEEK[dow];
  const value = pct(day);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = date === today;
  const isPast = date < today;

  const update = (patch) => setStore((s) => ({ ...s, [date]: { ...empty(), ...(s[date] || {}), ...patch } }));
  const toggle = (id) => update({ done: { ...day.done, [id]: !day.done[id] } });

  // streak = consecutive days (ending today/yesterday) with >= 70% done
  const streak = useMemo(() => {
    let n = 0, d = today;
    if (pct(store[d]) < 70) d = shift(d, -1);
    while (pct(store[d]) >= 70) { n++; d = shift(d, -1); }
    return n;
  }, [store, today]);

  const history = Object.keys(store).sort().reverse();
  const yesterday = store[shift(date, -1)];

  const exportData = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 2)], { type: "application/json" }));
    a.download = `planner-backup-${today}.json`; a.click();
  };
  const importData = (e) => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { setStore({ ...store, ...JSON.parse(t) }); } catch { alert("That file isn't a valid planner backup."); } });
  };

  return (
    <div className="app">
      <div className="sky" aria-hidden><i /><i /><i /></div>

      <header className="top">
        <div>
          <h1>{plan.day}<span> {fromIso(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span></h1>
          <p className="sub">{isToday ? "Today" : isPast ? "Past day (editable)" : "Upcoming day"} · 🔥 {streak}-day streak</p>
        </div>
        <Ring value={value} />
      </header>

      <nav className="bar">
        <button onClick={() => setDate(shift(date, -1))}>← Previous day</button>
        <button onClick={() => setDate(today)} disabled={isToday}>Today</button>
        <button onClick={() => setDate(shift(date, 1))}>Next day →</button>
        <span className="sp" />
        <button className={view === "day" ? "on" : ""} onClick={() => setView("day")}>Plan</button>
        <button className={view === "history" ? "on" : ""} onClick={() => setView("history")}>History</button>
      </nav>

      {view === "day" ? (
        <main className="grid">
          <section className="col">
            {yesterday && (
              <div className="card recap">
                <h3>Yesterday: {pct(yesterday)}% done</h3>
                {yesterday.mistakes && <p><b>Mistakes to revise:</b> {yesterday.mistakes}</p>}
                {yesterday.tomorrow && <p><b>You planned for today:</b> {yesterday.tomorrow}</p>}
                {!yesterday.mistakes && !yesterday.tomorrow && <p>No notes saved yesterday.</p>}
              </div>
            )}
            <ul className="list">
              {BLOCKS.map((b, i) => {
                const live = isToday && nowMin >= b.s && nowMin < b.e;
                const note = b.id === "prep" ? `Focus: ${plan.prep}` : b.id === "cs" ? `Focus: ${plan.cs}` : null;
                return (
                  <li key={b.id} className={`blk ${day.done[b.id] ? "done" : ""} ${live ? "live" : ""}`} style={{ "--i": i }}>
                    <button className="chk" onClick={() => toggle(b.id)} aria-pressed={!!day.done[b.id]} aria-label={`Mark ${b.t} done`}>
                      <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </button>
                    <div className="body">
                      <div className="time">{fmt(b.s)} – {fmt(b.e)}{live && <em>now</em>}</div>
                      <h3><span>{b.icon}</span> {b.t}</h3>
                      <p>{b.d}</p>
                      {note && <p className="focus">{note}</p>}
                      <input placeholder="Add a note for this block…" value={day.notes[b.id] || ""} onChange={(e) => update({ notes: { ...day.notes, [b.id]: e.target.value } })} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="col">
            <div className="card">
              <h3>Water</h3>
              <div className="water">
                {Array.from({ length: 8 }).map((_, i) => (
                  <button key={i} className={i < day.water ? "full" : ""} onClick={() => update({ water: day.water === i + 1 ? i : i + 1 })} aria-label={`${i + 1} glasses`} />
                ))}
              </div>
              <p className="sub">{day.water} / 8 glasses</p>
            </div>
            <div className="card">
              <h3>Backend project</h3>
              <textarea rows="3" placeholder="What did you build / push today?" value={day.project} onChange={(e) => update({ project: e.target.value })} />
            </div>
            <div className="card">
              <h3>Mistakes to revise</h3>
              <textarea rows="3" placeholder="Coding or concept mistakes…" value={day.mistakes} onChange={(e) => update({ mistakes: e.target.value })} />
            </div>
            <div className="card">
              <h3>Plan for tomorrow</h3>
              <textarea rows="3" placeholder="Subjects, backend task, workout…" value={day.tomorrow} onChange={(e) => update({ tomorrow: e.target.value })} />
            </div>
            <div className="card rules">
              <h3>Rules</h3>
              <ul>{RULES.map((r) => <li key={r}>{r}</li>)}</ul>
            </div>
          </aside>
        </main>
      ) : (
        <main className="card hist">
          <h3>All saved days</h3>
          {history.length === 0 && <p className="sub">Nothing saved yet. Tick a block on the Plan tab and it appears here.</p>}
          {history.map((d) => (
            <button key={d} className="row" onClick={() => { setDate(d); setView("day"); }}>
              <span>{fromIso(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
              <span className="meter"><i style={{ width: pct(store[d]) + "%" }} /></span>
              <b>{pct(store[d])}%</b>
            </button>
          ))}
          <div className="bar">
            <button onClick={exportData}>Download backup</button>
            <button onClick={() => fileRef.current.click()}>Restore backup</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          </div>
        </main>
      )}
    </div>
  );
}
