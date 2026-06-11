import { useState, useEffect, useMemo, useRef } from "react";
import { Trophy, Lock, Download, Trash2, Users, Clock, CheckCircle2, AlertCircle, Calendar, MapPin, Shield, Loader2, Send, Eye, EyeOff, Star, Dices, Copy, Upload } from "lucide-react";

/* ============ PALETA / CONSTANTES ============ */
const C = {
  bg: "#03071a",
  heroFrom: "#001060",
  heroTo: "#1a5aff",
  blue: "#1a5aff",
  navy: "#001060",
  yellow: "#FFE033",
  red: "#e23b3b",
  green: "#2bd47a",
  card: "#0a1230",
  cardSoft: "#0d1740",
  border: "#1c2a5a",
  borderSoft: "#16204a",
  text: "#e8ecff",
  muted: "#8a97c9",
};

const FONT = { fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" };

const MATCHES = [
  { id: 1, num: "Partido 1", rival: "Uzbekistán", rivalFlag: "🇺🇿", date: "Miércoles 17 junio", time: "9:00 p.m. COL", stadium: "Estadio Azteca", city: "Ciudad de México 🇲🇽" },
  { id: 2, num: "Partido 2", rival: "RD Congo", rivalFlag: "🇨🇩", date: "Martes 23 junio", time: "9:00 p.m. COL", stadium: "Estadio Akron", city: "Guadalajara 🇲🇽" },
  { id: 3, num: "Partido 3", rival: "Portugal", rivalFlag: "🇵🇹", date: "Sábado 27 junio", time: "6:30 p.m. COL", stadium: "Hard Rock Stadium", city: "Miami 🇺🇸" },
];

const DEADLINE = new Date("2026-06-12T23:59:59-05:00");
const ADMIN_PW = "sincosoft2026";
const K_PART = "polla:participants";
const K_RES = "polla:results";
const K_RAFFLE = "polla:raffle";
/* La inscripción de cada participante se entrega como archivo .txt (JSON)
   que el participante envía al administrador; ya no se usa Microsoft Forms. */

/* ============ STORAGE HELPERS ============ */
/* Datos compartidos (solo lectura): archivos JSON publicados en el repositorio (public/data/).
   El admin los actualiza con el botón "Exportar JSON" y subiéndolos a GitHub.
   Datos locales (escritura): localStorage del navegador (tu inscripción y los borradores del admin). */
const DATA_BASE = `${import.meta.env.BASE_URL}data/`;

async function fetchShared(file) {
  try {
    const res = await fetch(`${DATA_BASE}${file}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
function readLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { console.error("save", key, e); return false; }
}

async function loadParticipants() {
  const remote = (await fetchShared("participants.json")) || [];
  const local = readLocal(K_PART, []);
  const seen = new Set(remote.map((p) => p.email.toLowerCase()));
  return [...remote, ...local.filter((p) => !seen.has(p.email.toLowerCase()))];
}
async function saveParticipants(list) {
  return writeLocal(K_PART, list);
}
async function loadResults() {
  const remote = (await fetchShared("results.json")) || { 1: null, 2: null, 3: null };
  const local = readLocal(K_RES, null);
  if (!local) return remote;
  const merged = { ...remote };
  for (const k of [1, 2, 3]) if (local[k]) merged[k] = local[k];
  return merged;
}
async function saveResults(obj) {
  return writeLocal(K_RES, obj);
}
async function loadRaffle() {
  const local = readLocal(K_RAFFLE, null);
  if (local) return local;
  return await fetchShared("raffle.json");
}
async function saveRaffle(obj) {
  return writeLocal(K_RAFFLE, obj);
}

/* ============ UTILIDADES ============ */
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const fmtTime = (ts) =>
  new Date(ts).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });

const sgn = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

/* Puntos por partido:
   5 = marcador exacto
   2 = acierta el resultado (gana/empata/pierde) sin marcador exacto
   +1 = acierta los goles de uno de los dos equipos (se suma a los 2) */
function pointsForMatch(pred, real) {
  if (!real || !pred) return null;
  const pc = Number(pred.col), pr = Number(pred.riv);
  const rc = Number(real.col), rr = Number(real.riv);
  if (pc === rc && pr === rr) return 5;
  let pts = 0;
  if (sgn(pc, pr) === sgn(rc, rr)) pts += 2;
  if (pc === rc || pr === rr) pts += 1;
  return pts;
}

function scoreFor(p, results) {
  let points = 0, considered = 0, exacts = 0;
  MATCHES.forEach((m) => {
    const r = results[m.id];
    if (r) {
      considered++;
      const pm = pointsForMatch(p.predictions[m.id], r);
      points += pm;
      if (pm === 5) exacts++;
    }
  });
  return { points, considered, exacts };
}

/* ============ CONFETTI ============ */
function Confetti() {
  const pieces = useMemo(() => {
    const cols = [C.yellow, C.blue, "#ffffff", C.green, C.red];
    return Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      dur: 2.2 + Math.random() * 1.8,
      color: cols[i % cols.length],
      size: 6 + Math.random() * 8,
      rot: Math.random() * 360,
    }));
  }, []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5 }}>
      <style>{`@keyframes pollaFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(420px) rotate(540deg);opacity:0}}`}</style>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute", top: 0, left: `${p.left}%`, width: p.size, height: p.size * 0.5,
          background: p.color, borderRadius: 2, transform: `rotate(${p.rot}deg)`,
          animation: `pollaFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

/* ============ SVG BARRIL ASADOR (estilo foto: barril vertical con escudo COL) ============ */
function BarrelGrill() {
  return (
    <svg viewBox="0 0 300 260" width="100%" style={{ maxWidth: 340, display: "block", margin: "0 auto" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="steelV" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7e8aa6" />
          <stop offset="18%" stopColor="#cdd6e6" />
          <stop offset="45%" stopColor="#f4f7fc" />
          <stop offset="72%" stopColor="#aab4ca" />
          <stop offset="100%" stopColor="#6b7794" />
        </linearGradient>
        <linearGradient id="lidV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#cdd6e6" />
          <stop offset="100%" stopColor="#8e9ab6" />
        </linearGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a35c" />
          <stop offset="100%" stopColor="#9c6a2f" />
        </linearGradient>
      </defs>
      <g fill="#aab4d4">
        <circle cx="150" cy="26" r="9" opacity="0.35" />
        <circle cx="160" cy="14" r="6" opacity="0.28" />
        <circle cx="141" cy="11" r="5" opacity="0.22" />
        <circle cx="152" cy="40" r="7" opacity="0.4" />
      </g>
      <rect x="126" y="48" width="48" height="9" rx="4.5" fill="url(#wood)" stroke="#6e4a1e" strokeWidth="1" />
      <rect x="130" y="55" width="6" height="12" fill="#8e9ab6" />
      <rect x="164" y="55" width="6" height="12" fill="#8e9ab6" />
      <path d="M92 84 a58 22 0 0 1 116 0 z" fill="url(#lidV)" stroke="#6b7794" strokeWidth="2" />
      <ellipse cx="150" cy="84" rx="58" ry="9" fill="#8e9ab6" opacity="0.6" />
      <path d="M92 84 q-6 60 4 122 a54 16 0 0 0 108 0 q10 -62 4 -122 z" fill="url(#steelV)" stroke="#6b7794" strokeWidth="2" />
      <path d="M90 116 q60 12 120 0" fill="none" stroke="#6b7794" strokeWidth="2" opacity="0.7" />
      <path d="M88 176 q62 13 124 0" fill="none" stroke="#6b7794" strokeWidth="2" opacity="0.7" />
      <circle cx="122" cy="100" r="8" fill="#1b2440" stroke="#6b7794" strokeWidth="1.5" />
      <line x1="122" y1="100" x2="126" y2="95" stroke="#FFE033" strokeWidth="1.5" />
      <rect x="124" y="128" width="52" height="44" rx="6" fill="#f4f7fc" stroke="#9aa6c0" strokeWidth="1.5" />
      <circle cx="150" cy="146" r="12" fill="#e23b3b" />
      <circle cx="150" cy="146" r="12" fill="none" stroke="#FFE033" strokeWidth="2.5" />
      <circle cx="150" cy="146" r="5" fill="#ffffff" opacity="0.9" />
      <rect x="136" y="160" width="28" height="3" rx="1.5" fill="#FFE033" />
      <rect x="136" y="164" width="28" height="2.2" rx="1.1" fill="#1a5aff" />
      <rect x="136" y="167" width="28" height="2.2" rx="1.1" fill="#e23b3b" />
      <g>
        <rect x="62" y="118" width="26" height="8" rx="4" fill="url(#wood)" stroke="#6e4a1e" strokeWidth="1" transform="rotate(-18 75 122)" />
        <rect x="212" y="112" width="26" height="8" rx="4" fill="url(#wood)" stroke="#6e4a1e" strokeWidth="1" transform="rotate(18 225 116)" />
        <rect x="66" y="196" width="24" height="7" rx="3.5" fill="url(#wood)" stroke="#6e4a1e" strokeWidth="1" transform="rotate(-14 78 199)" />
        <rect x="210" y="192" width="24" height="7" rx="3.5" fill="url(#wood)" stroke="#6e4a1e" strokeWidth="1" transform="rotate(14 222 195)" />
      </g>
      <g fill="#1b2440" opacity="0.55">
        <circle cx="118" cy="206" r="6" />
        <circle cx="182" cy="206" r="6" />
      </g>
      <text x="150" y="211" textAnchor="middle" fontSize="11" fill="#6b7794" fontWeight="bold">10</text>
      <rect x="112" y="228" width="7" height="22" rx="3" fill="#8e9ab6" transform="rotate(10 115 239)" />
      <rect x="181" y="228" width="7" height="22" rx="3" fill="#8e9ab6" transform="rotate(-10 184 239)" />
      <rect x="147" y="230" width="7" height="22" rx="3" fill="#8e9ab6" />
    </svg>
  );
}

/* ============ FOTO DEL BARRIL ============ */
/* Busca public/barril.jpg en el sitio; si no existe, muestra el barril dibujado en SVG. */
function BarrelPhoto() {
  const [err, setErr] = useState(false);

  if (err) return <div style={{ padding: 16 }}><BarrelGrill /></div>;
  return (
    <img
      src={`${import.meta.env.BASE_URL}barril.jpg`}
      alt="Barril asador parrillero en acero inoxidable con escudo de Colombia"
      onError={() => setErr(true)}
      style={{ width: "100%", display: "block" }}
    />
  );
}

/* ============ SELECTOR DE MARCADOR ============ */
function ScoreSelect({ value, onChange, label, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{label}</span>
      <select
        value={value === null || value === undefined ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        style={{
          width: 56, padding: "8px 6px", textAlign: "center", fontWeight: 800, fontSize: 18,
          background: C.cardSoft, color: accent || C.text, border: `2px solid ${C.border}`,
          borderRadius: 10, outline: "none", appearance: "none", cursor: "pointer",
        }}
      >
        <option value="">–</option>
        {Array.from({ length: 10 }).map((_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
    </div>
  );
}

/* ============ TARJETA DE PARTIDO ============ */
function MatchHeader({ m }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🇨🇴</span>
          <strong style={{ fontSize: 15 }}>Colombia</strong>
          <span style={{ color: C.muted, fontWeight: 700 }}>vs</span>
          <strong style={{ fontSize: 15 }}>{m.rival}</strong>
          <span style={{ fontSize: 22 }}>{m.rivalFlag}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: C.bg, background: C.yellow, padding: "3px 9px", borderRadius: 999 }}>{m.num}</span>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 12, color: C.muted }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={13} /> {m.date} · {m.time}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {m.stadium} · {m.city}</span>
      </div>
    </div>
  );
}

/* ============ COUNTDOWN ============ */
function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = DEADLINE.getTime() - now;
  const closed = diff <= 0;
  const isToday = new Date(now).toDateString() === DEADLINE.toDateString();
  const d = Math.max(0, Math.floor(diff / 86400000));
  const h = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mi = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const s = Math.max(0, Math.floor((diff % 60000) / 1000));
  return { closed, isToday, d, h, mi, s };
}

/* ============ APP ============ */
export default function App() {
  const [view, setView] = useState("participant");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [results, setResults] = useState({ 1: null, 2: null, 3: null });
  const [raffle, setRaffle] = useState(null);

  useEffect(() => {
    (async () => {
      const [p, r, rf] = await Promise.all([loadParticipants(), loadResults(), loadRaffle()]);
      setParticipants(p);
      setResults(r);
      setRaffle(rf);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ ...FONT, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`select option{background:${C.cardSoft};color:${C.text}}`}</style>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(3,7,26,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.borderSoft}` }}>
        <div className="mx-auto" style={{ maxWidth: 920, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
            <span style={{ fontSize: 18 }}>⚽</span> <span style={{ fontSize: 14 }}>Polla Sincosoft</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <NavBtn active={view === "participant"} onClick={() => setView("participant")} icon={<Users size={14} />} label="Participar" />
            <NavBtn active={view === "admin"} onClick={() => setView("admin")} icon={<Shield size={14} />} label="Admin" />
          </div>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 920, padding: "0 16px 60px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "80px 0", color: C.muted }}>
            <Loader2 className="animate-spin" size={22} /> Cargando datos de la polla…
          </div>
        ) : view === "participant" ? (
          <ParticipantView participants={participants} setParticipants={setParticipants} />
        ) : (
          <AdminView participants={participants} setParticipants={setParticipants}
            results={results} setResults={setResults} raffle={raffle} setRaffle={setRaffle} />
        )}
      </div>

      <footer style={{ textAlign: "center", padding: "0 16px 28px", color: C.muted, fontSize: 11 }}>
        🌎 El ranking y los resultados oficiales se publican aquí y son visibles para todos los participantes de la polla.
      </footer>
    </div>
  );
}

function NavBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, cursor: "pointer",
      fontWeight: 700, fontSize: 13, border: `1px solid ${active ? C.blue : C.border}`,
      background: active ? C.blue : "transparent", color: active ? "#fff" : C.muted,
    }}>{icon}{label}</button>
  );
}

/* ============ VISTA PARTICIPANTE ============ */
function ParticipantView({ participants, setParticipants }) {
  const cd = useCountdown();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preds, setPreds] = useState({ 1: { col: null, riv: null }, 2: { col: null, riv: null }, 3: { col: null, riv: null } });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);

  const setScore = (mid, side, val) =>
    setPreds((p) => ({ ...p, [mid]: { ...p[mid], [side]: val } }));

  /* La inscripción se entrega como archivo .txt con el JSON; el participante
     se lo envía al administrador (Teams o correo) y este lo importa en el panel Admin. */
  const downloadEntry = (entry) => {
    const safe = entry.name.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const blob = new Blob([JSON.stringify(entry, null, 2)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inscripcion-${safe || "participante"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyEntry = async (entry) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* sin permiso de portapapeles: queda la descarga */ }
  };

  const handleSubmit = async () => {
    setError("");
    if (cd.closed) { setError("Las inscripciones están cerradas (cierre: 12 de junio de 2026)."); return; }
    if (!name.trim()) { setError("Ingresa tu nombre completo."); return; }
    if (!emailOk(email.trim())) { setError("Ingresa un correo electrónico válido."); return; }
    for (const m of MATCHES) {
      const pr = preds[m.id];
      if (pr.col === null || pr.riv === null) { setError(`Completa el marcador del ${m.num} (Colombia vs ${m.rival}).`); return; }
    }
    if (participants.some((p) => p.email.toLowerCase() === email.trim().toLowerCase())) {
      setError("Este correo ya está inscrito. Cada correo solo puede participar una vez."); return;
    }

    setSaving(true);
    const entry = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      email: email.trim(),
      predictions: { 1: { ...preds[1] }, 2: { ...preds[2] }, 3: { ...preds[3] } },
      timestamp: Date.now(),
    };
    const next = [...participants, entry];
    const ok = await saveParticipants(next);
    setSaving(false);
    if (!ok) { setError("No se pudo guardar tu inscripción. Intenta de nuevo."); return; }
    setParticipants(next);
    setDone(entry);
    downloadEntry(entry);
  };

  if (done) {
    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.blue}`, borderRadius: 18, padding: 28, textAlign: "center", position: "relative", overflow: "hidden" }}>
          <CheckCircle2 size={52} color={C.yellow} style={{ margin: "0 auto" }} />
          <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 12 }}>¡Inscripción registrada! 🔥</h2>
          <p style={{ color: C.muted, marginTop: 6 }}>Tu pronóstico es definitivo y no se puede modificar.</p>

          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {MATCHES.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px" }}>
                <span style={{ fontSize: 13 }}>🇨🇴 Colombia vs {m.rival} {m.rivalFlag}</span>
                <strong style={{ fontSize: 18, color: C.yellow }}>{done.predictions[m.id].col} – {done.predictions[m.id].riv}</strong>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 13, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
            <span><strong style={{ color: C.text }}>{done.name}</strong> · {done.email}</span>
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
              <Clock size={13} /> Hora de inscripción registrada: <strong style={{ color: C.text }}>{fmtTime(done.timestamp)}</strong>
            </span>
          </div>

          {/* Entrega de la inscripción al administrador */}
          <div style={{ marginTop: 22, background: C.cardSoft, border: `1px solid ${C.yellow}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontWeight: 900, color: C.yellow, fontSize: 14 }}>📝 Paso final: envía tu inscripción</div>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>
              Tu inscripción se descargó como un archivo <strong style={{ color: C.text }}>.txt</strong>.
              Envíaselo al <strong style={{ color: C.text }}>administrador de la polla</strong> por Teams o correo para quedar oficialmente inscrito.
              Si no ves la descarga, usa los botones:
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              <button onClick={() => downloadEntry(done)} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: C.blue, color: "#fff", fontWeight: 800, fontSize: 14,
                padding: "12px 20px", borderRadius: 12, border: "none", cursor: "pointer",
              }}>
                <Download size={16} /> Descargar mi inscripción (.txt)
              </button>
              <button onClick={() => copyEntry(done)} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "transparent", color: copied ? C.green : C.text, fontWeight: 800, fontSize: 14,
                padding: "12px 20px", borderRadius: 12, border: `1px solid ${copied ? C.green : C.border}`, cursor: "pointer",
              }}>
                {copied ? <><CheckCircle2 size={16} /> ¡Copiada!</> : <><Copy size={16} /> Copiar inscripción</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* HERO */}
      <div style={{ marginTop: 18, borderRadius: 20, padding: "30px 22px", textAlign: "center", background: `linear-gradient(135deg, ${C.heroFrom}, ${C.heroTo})`, border: `1px solid ${C.border}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.25)", padding: "5px 14px", borderRadius: 999, fontWeight: 800, fontSize: 12, color: C.yellow, border: `1px solid ${C.yellow}` }}>
          🏆 FIFA WORLD CUP 2026
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginTop: 14, lineHeight: 1.05 }}>Polla Mundialista <span style={{ color: C.yellow }}>Sincosoft</span></h1>
        <p style={{ marginTop: 8, color: "#cdd9ff", fontWeight: 600 }}>⚽ Pronostica · 🌎 Compite · 🔥 Gana el premio</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, background: "rgba(255,255,255,0.08)", padding: "6px 14px", borderRadius: 12, fontWeight: 800, letterSpacing: 1 }}>
          <span style={{ display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 7, background: C.yellow, color: C.navy }}>S</span>
          SINCOSOFT
        </div>
      </div>

      {/* DEADLINE / COUNTDOWN */}
      <div style={{ marginTop: 16, background: C.card, border: `1px solid ${cd.closed ? C.red : cd.isToday ? C.yellow : C.border}`, borderRadius: 16, padding: 16, textAlign: "center" }}>
        {cd.closed ? (
          <strong style={{ color: C.red }}>⛔ Inscripciones cerradas — el cierre fue el viernes 12 de junio de 2026</strong>
        ) : cd.isToday ? (
          <div>
            <span style={{ background: C.yellow, color: C.bg, padding: "4px 14px", borderRadius: 999, fontWeight: 900, fontSize: 14 }}>⏰ ¡CIERRA HOY!</span>
            <div style={{ marginTop: 10, fontVariantNumeric: "tabular-nums", fontWeight: 900, fontSize: 26, color: C.yellow }}>
              {String(cd.h).padStart(2, "0")}:{String(cd.mi).padStart(2, "0")}:{String(cd.s).padStart(2, "0")}
            </div>
            <span style={{ fontSize: 12, color: C.muted }}>Cierre: viernes 12 de junio de 2026, 11:59 p.m. COL</span>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>⏳ Cierra el viernes 12 de junio de 2026</span>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
              {[["DÍAS", cd.d], ["HORAS", cd.h], ["MIN", cd.mi], ["SEG", cd.s]].map(([l, v]) => (
                <div key={l} style={{ background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", minWidth: 56 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.yellow, fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PREMIOS */}
      <Section title="🏆 Los Premios" sub="¡Esto es lo que está en juego!">
        <div style={{ marginBottom: 14, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
          <BarrelPhoto />
        </div>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr" }}>
          <div style={{ background: C.card, border: `2px solid ${C.yellow}`, borderRadius: 16, padding: 18 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.yellow, color: C.navy, fontWeight: 900, fontSize: 13, padding: "4px 12px", borderRadius: 999 }}>🥇 PRIMER PUESTO</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: C.yellow, marginTop: 12 }}>Barril Asador + Kit Parrillero + Cervezas 🔥🍺</h3>
            <p style={{ color: C.muted, marginTop: 6 }}>Barril parrillero en acero inoxidable, acompañado de un kit parrillero completo y cervezas frías para celebrar como se debe. 🇨🇴⚽</p>
          </div>
          <div style={{ background: C.card, border: "1px solid #9aa6c0", borderRadius: 16, padding: 18 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c4cde0", color: C.navy, fontWeight: 900, fontSize: 13, padding: "4px 12px", borderRadius: 999 }}>🥈 SEGUNDO PUESTO</div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "#dbe4ff", marginTop: 12 }}>Barril Asador 🔥</h3>
            <p style={{ color: C.muted, marginTop: 6 }}>Barril parrillero en acero inoxidable para el subcampeón de la polla. ¡También para encender la parrilla! 🍖</p>
          </div>
        </div>
      </Section>

      {/* FIXTURE */}
      <Section title="📅 Fixture Colombia — Grupo K" sub="Los 3 partidos de la fase de grupos">
        <div style={{ display: "grid", gap: 12 }}>
          {MATCHES.map((m) => <MatchHeader key={m.id} m={m} />)}
        </div>
      </Section>

      {/* REGLAS Y PUNTAJE */}
      <Section title="📋 Reglas y puntaje" sub="Sistema de puntos por partido">
        <div style={{ background: C.card, border: `1px solid ${C.yellow}`, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 900, color: C.yellow, marginBottom: 12, fontSize: 14 }}>⚽ ¿Cómo se ganan puntos? (en cada partido)</div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              ["5", "Marcador EXACTO (aciertas los goles de Colombia y los del rival).", C.yellow],
              ["2", "Aciertas solo el resultado (gana / empata / pierde) sin el marcador exacto.", C.green],
              ["+1", "Aciertas la cantidad de goles de uno de los dos equipos.", "#7fb3ff"],
            ].map(([pts, txt, color], i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ flexShrink: 0, minWidth: 46, textAlign: "center", background: color, color: C.bg, fontWeight: 900, padding: "7px 8px", borderRadius: 10, fontSize: 15 }}>{pts}</span>
                <span style={{ fontSize: 13, color: C.text, lineHeight: 1.35 }}>{txt}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 12 }}>💡 El “+1” se suma a los 2 puntos del resultado (máx. 3 pts si no es exacto). El marcador exacto otorga 5 pts, el máximo por partido.</p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            "Inscríbete y anota tus marcadores para los 3 partidos antes del cierre.",
            "Cada partido otorga puntos según la tabla de arriba; al final se suman los 3 partidos.",
            "El ranking ordena de mayor a menor puntaje total. En caso de empate en puntos, se realizará un sorteo interno 🎲 para definir al ganador.",
            "Los pronósticos son definitivos: no se pueden cambiar después del envío.",
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14 }}>
              <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: C.yellow, color: C.navy, fontWeight: 900, display: "grid", placeItems: "center" }}>{i + 1}</span>
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>{r}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* FORMULARIO */}
      <Section title="✍️ Inscríbete y pronostica" sub="Completa todos los campos. Al enviar se descarga tu inscripción en un archivo .txt: envíaselo al administrador para quedar oficialmente inscrito.">
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 20, opacity: cd.closed ? 0.6 : 1 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Nombre completo *">
              <input value={name} onChange={(e) => setName(e.target.value)} disabled={cd.closed} placeholder="Tu nombre y apellido" style={inputStyle} />
            </Field>
            <Field label="Correo electrónico *">
              <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={cd.closed} placeholder="tucorreo@sincosoft.com" style={inputStyle} />
            </Field>

            <div style={{ display: "grid", gap: 12, marginTop: 4 }}>
              {MATCHES.map((m) => (
                <div key={m.id} style={{ background: C.cardSoft, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>{m.num} · {m.date}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                    <ScoreSelect label="🇨🇴 Colombia" value={preds[m.id].col} accent={C.yellow} onChange={(v) => setScore(m.id, "col", v)} />
                    <span style={{ fontWeight: 900, color: C.muted, fontSize: 18 }}>×</span>
                    <ScoreSelect label={`${m.rivalFlag} ${m.rival}`} value={preds[m.id].riv} onChange={(v) => setScore(m.id, "riv", v)} />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(226,59,59,0.12)", border: `1px solid ${C.red}`, color: "#ffb4b4", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={cd.closed || saving} style={{
              marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: cd.closed ? C.border : C.yellow, color: cd.closed ? C.muted : C.navy, fontWeight: 900,
              padding: "14px", borderRadius: 14, border: "none", cursor: cd.closed ? "not-allowed" : "pointer", fontSize: 16,
            }}>
              {saving ? <><Loader2 className="animate-spin" size={18} /> Guardando…</> : <><Send size={18} /> Enviar mi pronóstico</>}
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "12px 14px", background: C.cardSoft, color: C.text,
  border: `1px solid ${C.border}`, borderRadius: 12, outline: "none", fontSize: 15, boxSizing: "border-box",
};

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

function Section({ title, sub, children }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={{ fontSize: 20, fontWeight: 900 }}>{title}</h2>
      {sub && <p style={{ color: C.muted, fontSize: 13, marginTop: 2, marginBottom: 14 }}>{sub}</p>}
      {children}
    </div>
  );
}

/* ============ VISTA ADMIN ============ */
function AdminView({ participants, setParticipants, results, setResults, raffle, setRaffle }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(() => ({ ...results }));
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef(null);

  useEffect(() => { setDraft({ ...results }); }, [results]);

  const tryAuth = () => {
    if (pw === ADMIN_PW) { setAuthed(true); setAuthErr(""); }
    else setAuthErr("Contraseña incorrecta.");
  };

  if (!authed) {
    return (
      <div style={{ marginTop: 60, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 28, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.navy, display: "grid", placeItems: "center", margin: "0 auto" }}>
            <Lock size={26} color={C.yellow} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 14 }}>Panel de Administrador 🔒</h2>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Ingresa la contraseña para gestionar la polla.</p>
          <div style={{ position: "relative", marginTop: 18 }}>
            <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryAuth()} placeholder="Contraseña" style={{ ...inputStyle, paddingRight: 44, textAlign: "center" }} />
            <button onClick={() => setShowPw((s) => !s)} style={{ position: "absolute", right: 10, top: 11, background: "none", border: "none", color: C.muted, cursor: "pointer" }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {authErr && <div style={{ color: "#ffb4b4", fontSize: 13, marginTop: 10 }}>{authErr}</div>}
          <button onClick={tryAuth} style={{ marginTop: 16, width: "100%", background: C.blue, color: "#fff", fontWeight: 800, padding: 13, borderRadius: 12, border: "none", cursor: "pointer" }}>
            Ingresar
          </button>
        </div>
      </div>
    );
  }

  const setDraftScore = (mid, side, val) =>
    setDraft((d) => ({ ...d, [mid]: { ...(d[mid] || { col: null, riv: null }), [side]: val } }));

  const saveMatchResult = async (mid) => {
    const r = draft[mid];
    if (!r || r.col === null || r.riv === null) return;
    setBusy(true);
    const next = { ...results, [mid]: { col: Number(r.col), riv: Number(r.riv) } };
    const ok = await saveResults(next);
    setBusy(false);
    if (ok) setResults(next);
  };
  const clearMatchResult = async (mid) => {
    setBusy(true);
    const next = { ...results, [mid]: null };
    const ok = await saveResults(next);
    setBusy(false);
    if (ok) { setResults(next); setDraft((d) => ({ ...d, [mid]: { col: null, riv: null } })); }
  };

  const doReset = async () => {
    setBusy(true);
    await saveParticipants([]);
    await saveResults({ 1: null, 2: null, 3: null });
    await saveRaffle(null);
    setBusy(false);
    setParticipants([]);
    setResults({ 1: null, 2: null, 3: null });
    setRaffle(null);
    setConfirmReset(false);
  };

  /* ----- ranking por puntos ----- */
  const enriched = participants.map((p) => ({ ...p, ...scoreFor(p, results) }));
  const leaderboard = [...enriched].sort((a, b) => (b.points - a.points) || (a.timestamp - b.timestamp));
  const allResultsIn = MATCHES.every((m) => results[m.id]);

  /* ----- podio con sorteo interno en empates ----- */
  const resultsKey = JSON.stringify(results);
  const raffleGroups = raffle && raffle.resultsKey === resultsKey && raffle.groups ? raffle.groups : {};

  let first = null, second = null, noWinner = false, pendingRaffle = null;
  if (allResultsIn && participants.length > 0) {
    const eligible = leaderboard.filter((p) => p.points > 0);
    if (!eligible.length) noWinner = true;
    else {
      const groups = [];
      eligible.forEach((p) => {
        const g = groups[groups.length - 1];
        if (g && g.points === p.points) g.members.push(p);
        else groups.push({ points: p.points, members: [p] });
      });
      const ordered = [];
      for (const g of groups) {
        if (ordered.length >= 2) break;
        if (g.members.length === 1) {
          ordered.push({ ...g.members[0], byRaffle: false });
        } else {
          const idsNow = g.members.map((m) => m.id).sort().join("|");
          const stored = raffleGroups[g.points];
          const valid = Array.isArray(stored) && [...stored].sort().join("|") === idsNow;
          if (valid) {
            stored.forEach((id) => {
              const m = g.members.find((x) => x.id === id);
              if (m) ordered.push({ ...m, byRaffle: true });
            });
          } else {
            pendingRaffle = g;
            break;
          }
        }
      }
      first = ordered[0] || null;
      second = ordered[1] || null;
    }
  }

  const runRaffle = async () => {
    if (!pendingRaffle) return;
    setBusy(true);
    const ids = pendingRaffle.members.map((m) => m.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    const next = { resultsKey, groups: { ...raffleGroups, [pendingRaffle.points]: ids } };
    const ok = await saveRaffle(next);
    setBusy(false);
    if (ok) setRaffle(next);
  };

  const exportCSV = () => {
    const head = ["Pos", "Nombre", "Correo", "P1", "Pts1", "P2", "Pts2", "P3", "Pts3", "Total", "Hora inscripcion"];
    const rows = leaderboard.map((p, i) => {
      const pm = MATCHES.map((m) => (results[m.id] ? pointsForMatch(p.predictions[m.id], results[m.id]) : ""));
      return [
        i + 1, `"${p.name.replace(/"/g, '""')}"`, p.email,
        `${p.predictions[1].col}-${p.predictions[1].riv}`, pm[0],
        `${p.predictions[2].col}-${p.predictions[2].riv}`, pm[1],
        `${p.predictions[3].col}-${p.predictions[3].riv}`, pm[2],
        p.points, `"${fmtTime(p.timestamp)}"`,
      ].join(",");
    });
    const csv = [head.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "polla_sincosoft_2026.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* Importa las inscripciones .txt (JSON) que los participantes env\u00EDan al administrador.
     Acepta varios archivos a la vez; cada uno puede traer una inscripci\u00F3n o un arreglo de ellas.
     Deserializa, valida y descarta duplicados por correo. */
  const importFiles = async (ev) => {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;
    let added = 0, dup = 0, bad = 0;
    const next = [...participants];
    for (const f of files) {
      try {
        const parsed = JSON.parse(await f.text());
        const list = Array.isArray(parsed) ? parsed : [parsed];
        for (const e of list) {
          const okPreds = e && e.predictions && [1, 2, 3].every((k) => e.predictions[k] && e.predictions[k].col != null && e.predictions[k].riv != null);
          if (!e || !e.name || !emailOk(String(e.email || "")) || !okPreds) { bad++; continue; }
          if (next.some((p) => p.email.toLowerCase() === String(e.email).toLowerCase())) { dup++; continue; }
          next.push({
            id: e.id || Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            name: String(e.name).trim(),
            email: String(e.email).trim(),
            predictions: {
              1: { col: Number(e.predictions[1].col), riv: Number(e.predictions[1].riv) },
              2: { col: Number(e.predictions[2].col), riv: Number(e.predictions[2].riv) },
              3: { col: Number(e.predictions[3].col), riv: Number(e.predictions[3].riv) },
            },
            timestamp: Number(e.timestamp) || Date.now(),
          });
          added++;
        }
      } catch { bad++; }
    }
    if (added > 0) {
      await saveParticipants(next);
      setParticipants(next);
    }
    setImportMsg(`Importadas: ${added} \u00B7 duplicadas: ${dup} \u00B7 con errores: ${bad}`);
    ev.target.value = "";
  };

  /* Descarga los 3 archivos de datos compartidos, listos para subirlos a public/data/ en GitHub.
     Al subirlos, la p\u00E1gina se vuelve a publicar y todos los participantes ven los mismos datos. */
  const downloadJSON = (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportShared = () => {
    downloadJSON("participants.json", participants);
    downloadJSON("results.json", results);
    downloadJSON("raffle.json", raffle);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>🛠️ Administración</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${C.border}`, padding: "8px 14px", borderRadius: 12 }}>
          <Users size={16} color={C.yellow} />
          <strong style={{ fontSize: 16 }}>{participants.length}</strong>
          <span style={{ color: C.muted, fontSize: 13 }}>participantes</span>
        </div>
      </div>

      {/* SORTEO PENDIENTE */}
      {pendingRaffle && (
        <div style={{ marginTop: 18, background: "rgba(255,224,51,0.08)", border: `2px dashed ${C.yellow}`, borderRadius: 16, padding: 20, textAlign: "center" }}>
          <Dices size={36} color={C.yellow} style={{ margin: "0 auto" }} />
          <h3 style={{ fontSize: 18, fontWeight: 900, marginTop: 8 }}>¡Empate con {pendingRaffle.points} pts! 🎲</h3>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
            {pendingRaffle.members.length} participantes empatados: <strong style={{ color: C.text }}>{pendingRaffle.members.map((m) => m.name).join(", ")}</strong>.
            Según las reglas, el orden se define por sorteo interno.
          </p>
          <button onClick={runRaffle} disabled={busy} style={{
            marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
            background: C.yellow, color: C.navy, fontWeight: 900, fontSize: 15,
            padding: "12px 22px", borderRadius: 12, border: "none", cursor: "pointer",
          }}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : <Dices size={18} />} Realizar sorteo interno
          </button>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>El resultado del sorteo queda guardado y no cambia al recargar. Si modificas los resultados oficiales, el sorteo se invalida automáticamente.</p>
        </div>
      )}

      {/* GANADORES */}
      {first && (
        <div style={{ position: "relative", marginTop: 18, overflow: "hidden", borderRadius: 18, padding: 26, textAlign: "center", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, border: `2px solid ${C.yellow}` }}>
          <Confetti />
          <div style={{ position: "relative", zIndex: 6 }}>
            <Trophy size={48} color={C.yellow} style={{ margin: "0 auto" }} />
            <div style={{ fontSize: 12, fontWeight: 800, color: C.yellow, letterSpacing: 2, marginTop: 6 }}>
              🥇 PRIMER PUESTO · {first.points} PTS{first.byRaffle ? " · 🎲 SORTEO" : ""}
            </div>
            <h3 style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{first.name}</h3>
            <p style={{ color: "#dbe4ff", marginTop: 4 }}>{first.email}</p>
            <p style={{ color: "#dbe4ff", fontSize: 13, marginTop: 8, display: "inline-flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
              <Clock size={13} /> Inscrito: {fmtTime(first.timestamp)} · {first.exacts} marcador(es) exacto(s)
            </p>
            <p style={{ color: C.yellow, fontSize: 12, marginTop: 10, fontWeight: 800 }}>🎁 Barril asador + kit parrillero + cervezas 🍺</p>
          </div>
        </div>
      )}
      {second && (
        <div style={{ marginTop: 12, borderRadius: 18, padding: 20, textAlign: "center", background: C.card, border: "2px solid #9aa6c0" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#c4cde0", letterSpacing: 2 }}>
            🥈 SEGUNDO PUESTO · {second.points} PTS{second.byRaffle ? " · 🎲 SORTEO" : ""}
          </div>
          <h3 style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{second.name}</h3>
          <p style={{ color: C.muted, marginTop: 2, fontSize: 13 }}>{second.email} · {fmtTime(second.timestamp)}</p>
          <p style={{ color: "#c4cde0", fontSize: 12, marginTop: 8, fontWeight: 800 }}>🎁 Barril asador</p>
        </div>
      )}
      {noWinner && (
        <div style={{ marginTop: 18, background: C.card, border: `1px solid ${C.red}`, borderRadius: 14, padding: 16, textAlign: "center", color: "#ffb4b4" }}>
          Nadie sumó puntos. Sin ganadores según los resultados ingresados. 😕
        </div>
      )}

      {/* RESULTADOS REALES */}
      <Section title="⚽ Resultados oficiales" sub="Ingresa los marcadores reales. Puedes hacerlo parcialmente; el ranking se recalcula al instante.">
        <div style={{ display: "grid", gap: 12 }}>
          {MATCHES.map((m) => {
            const set = results[m.id];
            return (
              <div key={m.id} style={{ background: C.card, border: `1px solid ${set ? C.yellow : C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>🇨🇴 Colombia vs {m.rival} {m.rivalFlag}
                    {set && <span style={{ marginLeft: 8, fontSize: 11, background: C.yellow, color: C.navy, padding: "2px 8px", borderRadius: 999, fontWeight: 800 }}>OFICIAL {set.col}–{set.riv}</span>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <ScoreSelect label="🇨🇴" value={draft[m.id]?.col ?? null} accent={C.yellow} onChange={(v) => setDraftScore(m.id, "col", v)} />
                    <span style={{ fontWeight: 900, color: C.muted }}>×</span>
                    <ScoreSelect label={m.rivalFlag} value={draft[m.id]?.riv ?? null} onChange={(v) => setDraftScore(m.id, "riv", v)} />
                    <button onClick={() => saveMatchResult(m.id)} disabled={busy || draft[m.id]?.col == null || draft[m.id]?.riv == null}
                      style={{ background: C.blue, color: "#fff", fontWeight: 800, padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13 }}>
                      Guardar
                    </button>
                    {set && <button onClick={() => clearMatchResult(m.id)} disabled={busy} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, padding: "9px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13 }}>Borrar</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* RANKING / TABLA */}
      <Section title="📊 Ranking de participantes" sub={allResultsIn ? "Resultados completos — ranking definitivo." : "Ranking parcial (según los partidos con resultado oficial)."}>
        {participants.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 30, textAlign: "center", color: C.muted }}>
            Aún no hay inscritos. 🕳️
          </div>
        ) : (
          <div style={{ overflowX: "auto", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 680 }}>
              <thead>
                <tr style={{ background: C.cardSoft, color: C.muted, textAlign: "left" }}>
                  <th style={th}>#</th><th style={th}>Nombre</th><th style={th}>Correo</th>
                  <th style={thC}>P1</th><th style={thC}>P2</th><th style={thC}>P3</th>
                  <th style={thC}>Puntos</th><th style={th}>Hora inscripción</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((p, i) => {
                  const place = first && first.id === p.id ? 1 : second && second.id === p.id ? 2 : 0;
                  const medal = place === 1 ? "🥇 " : place === 2 ? "🥈 " : "";
                  return (
                    <tr key={p.id} style={{ borderTop: `1px solid ${C.borderSoft}`, background: place === 1 ? "rgba(255,224,51,0.12)" : place === 2 ? "rgba(154,166,192,0.12)" : "transparent" }}>
                      <td style={td}>{place === 1 ? <Star size={14} color={C.yellow} fill={C.yellow} /> : place === 2 ? <Star size={14} color="#c4cde0" fill="#c4cde0" /> : i + 1}</td>
                      <td style={{ ...td, fontWeight: 700 }}>{medal}{p.name}</td>
                      <td style={{ ...td, color: C.muted }}>{p.email}</td>
                      {MATCHES.map((m) => {
                        const pr = p.predictions[m.id]; const r = results[m.id];
                        const pm = r ? pointsForMatch(pr, r) : null;
                        const color = pm === null ? C.text : pm === 5 ? C.green : pm > 0 ? C.yellow : "#ff7a7a";
                        return (
                          <td key={m.id} style={{ ...tdC, color, fontWeight: 700 }}>
                            {pr.col}–{pr.riv}
                            {pm !== null && <span style={{ display: "block", fontSize: 10, color: C.muted, fontWeight: 700 }}>+{pm}</span>}
                          </td>
                        );
                      })}
                      <td style={{ ...tdC, fontWeight: 900, color: C.yellow, fontSize: 16 }}>{p.points}</td>
                      <td style={{ ...td, color: C.muted, whiteSpace: "nowrap", fontSize: 12 }}>{fmtTime(p.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ACCIONES */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <input ref={fileRef} type="file" accept=".txt,.json,text/plain,application/json" multiple
            style={{ display: "none" }} onChange={importFiles} />
          <button onClick={() => fileRef.current && fileRef.current.click()}
            title="Selecciona los archivos .txt de inscripción que te enviaron los participantes"
            style={actBtn(C.yellow, C.navy)}>
            <Upload size={16} /> Importar inscripciones (.txt)
          </button>
          <button onClick={exportCSV} disabled={participants.length === 0} style={actBtn(C.blue)}>
            <Download size={16} /> Exportar CSV
          </button>
          <button onClick={exportShared} title="Descarga participants.json, results.json y raffle.json para subirlos a la carpeta public/data/ del repositorio en GitHub"
            style={actBtn("transparent", C.green)}>
            <Download size={16} /> Exportar JSON (publicar en GitHub)
          </button>
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)} style={actBtn("transparent", C.red)}>
              <Trash2 size={16} /> Resetear todo
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(226,59,59,0.12)", border: `1px solid ${C.red}`, borderRadius: 12, padding: "6px 12px" }}>
              <span style={{ fontSize: 13, color: "#ffb4b4" }}>¿Borrar TODOS los datos?</span>
              <button onClick={doReset} disabled={busy} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 8, padding: "7px 12px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                {busy ? "…" : "Sí, borrar"}
              </button>
              <button onClick={() => setConfirmReset(false)} style={{ background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 13 }}>Cancelar</button>
            </div>
          )}
        </div>
        {importMsg && (
          <p style={{ marginTop: 10, fontSize: 13, color: C.muted }}>📥 {importMsg}</p>
        )}
      </Section>
    </div>
  );
}

const th = { padding: "12px 12px", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" };
const thC = { ...th, textAlign: "center" };
const td = { padding: "11px 12px", verticalAlign: "middle" };
const tdC = { ...td, textAlign: "center" };
const actBtn = (bg, color) => ({
  display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 14,
  padding: "11px 16px", borderRadius: 12, cursor: "pointer",
  background: bg === "transparent" ? "transparent" : bg,
  color: color || "#fff", border: `1px solid ${color || bg}`,
});
