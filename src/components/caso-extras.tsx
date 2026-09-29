import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Cake, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Fechas y edades ----------
export function parseDMY(s: string): Date | null {
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null;
}
export function ageOn(birth: Date, today = new Date()) {
  let a = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) a--;
  return a;
}
export function ageText(birthDMY: string) { const d = parseDMY(birthDMY); return d ? `${ageOn(d)} años` : ""; }
/** Reemplaza "dd/mm/aaaa (NN años)" por la edad calculada hoy. */
export function withAges(s: string) {
  return s.replace(/(\d{2}\/\d{2}\/\d{4})(\s*\(\d+ años\))?/g, (_m, d) => { const b = parseDMY(d); return b ? `${d} (${ageOn(b)} años)` : d; });
}
export const isoToDMY = (iso: string | null) => { if (!iso) return ""; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
export const dmyToISO = (s: string) => { const d = parseDMY(s); return d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null; };

export function useToday() { const [t, setT] = useState<Date | null>(null); useEffect(() => setT(new Date()), []); return t; }

export function useIsAdmin() {
  const [admin, setAdmin] = useState(false);
  useEffect(() => { (async () => {
    const { data } = await supabase.auth.getUser(); if (!data.user) return;
    const { data: r } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" }); setAdmin(!!r);
  })(); }, []);
  return admin;
}

export const box = "rounded-md border bg-input px-3 py-2 text-xs outline-none";
export const btn = "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold";
export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={onClose}><div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-xl" onClick={e => e.stopPropagation()}>{children}</div></div>;
}

// ---------- 1. Hermanos (solo lectura; se administran en el panel de control) ----------
type BaseSib = { id: string; nna: string; dni: string; birth: string };
export function SiblingsPanel({ currentId, base }: { currentId: string; base: BaseSib[] }) {
  const list = base.filter(s => s.id !== currentId);
  return <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="border-b px-5 py-4"><h2 className="text-sm font-extrabold">Hermanos en el expediente ({list.length})</h2><p className="mt-1 text-[10px] text-muted-foreground">Se administran desde el panel de control.</p></div>
    <div className="space-y-2 p-5 text-xs">
      {list.map(s => <Link key={s.id} to="/expediente" search={{ caso: s.id }} className="flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-muted"><span><b className="block">{s.nna}</b><small className="text-muted-foreground">DNI {s.dni || "—"} · {ageText(s.birth) || "sin fecha"}</small></span><ChevronRight className="size-4 shrink-0 text-secondary" /></Link>)}
      {list.length === 0 && <p className="text-muted-foreground">No hay hermanos registrados.</p>}
    </div>
  </section>;
}

// ---------- 5. Actuaciones del PTI ----------
type PA = { id: string; descripcion: string; fecha: string; base_indice: number | null; eliminado: boolean; created_at: string };
export function usePtiActs(casoId: string, base: string[]) {
  const [rows, setRows] = useState<PA[]>([]);
  const load = useCallback(async () => { const { data } = await supabase.from("pti_actuaciones").select("*").eq("caso_id", casoId).order("created_at"); setRows((data ?? []) as PA[]); }, [casoId]);
  useEffect(() => { load(); }, [load]);
  const hidden = new Set(rows.filter(r => r.eliminado && r.base_indice !== null).map(r => r.base_indice));
  const items = [
    ...base.map((t, i) => ({ key: `b${i}`, text: t, fecha: "", baseIdx: i as number | null, id: null as string | null })).filter(x => !hidden.has(x.baseIdx)),
    ...rows.filter(r => r.base_indice === null && !r.eliminado).map(r => ({ key: r.id, text: r.descripcion, fecha: isoToDMY(r.fecha), baseIdx: null, id: r.id })),
  ];
  return { items, load };
}
export function PtiActsPanel({ casoId, acts, readOnly }: { casoId: string; acts: ReturnType<typeof usePtiActs>; readOnly?: boolean }) {
  const { items, load } = acts;
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState(""); const [fecha, setFecha] = useState("");
  const [del, setDel] = useState<(typeof items)[number] | null>(null);
  const save = async () => { if (!text.trim()) return; await supabase.from("pti_actuaciones").insert({ caso_id: casoId, descripcion: text.trim(), ...(fecha ? { fecha } : {}) }); setText(""); setFecha(""); setAdding(false); load(); };
  const remove = async () => { if (!del) return; if (del.id) await supabase.from("pti_actuaciones").delete().eq("id", del.id); else await supabase.from("pti_actuaciones").insert({ caso_id: casoId, base_indice: del.baseIdx, eliminado: true, descripcion: del.text }); setDel(null); load(); };
  return <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="flex items-center justify-between gap-2 border-b px-5 py-4"><h2 className="text-sm font-extrabold">Actuaciones del PTI ({items.length})</h2>{!readOnly && <button onClick={() => setAdding(v => !v)} className={`${btn} bg-primary text-primary-foreground`}><Plus className="size-3.5" />Agregar</button>}</div>
    <div className="p-5 text-xs">
      {adding && <div className="mb-3 grid gap-2 rounded-md border border-dashed p-3 sm:grid-cols-[1fr_150px]">
        <input className={box} placeholder="Ej.: Resolución de Mayoría de Edad" value={text} onChange={e => setText(e.target.value)} />
        <input className={box} type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
        <div className="flex justify-end gap-2 sm:col-span-2"><button className={`${btn} border`} onClick={() => setAdding(false)}>Cancelar</button><button className={`${btn} bg-primary text-primary-foreground`} onClick={save}>Guardar actuación</button></div>
      </div>}
      <ol className="max-h-96 list-decimal space-y-1.5 overflow-y-auto pl-5 pr-2">{items.map(a => <li key={a.key} className="border-b pb-1.5 last:border-0"><div className="flex items-start justify-between gap-2"><span>{a.text}{a.fecha && <small className="ml-2 text-muted-foreground">{a.fecha}</small>}</span>{!readOnly && <button aria-label="Eliminar actuación" className="shrink-0 text-muted-foreground hover:text-danger" onClick={() => setDel(a)}><Trash2 className="size-3.5" /></button>}</div></li>)}</ol>
    </div>
    {del && <Modal onClose={() => setDel(null)}><h3 className="font-extrabold">¿Está seguro de que desea eliminar esta actuación?</h3><p className="mt-2 rounded-md bg-muted p-2 text-xs">{del.text}</p><div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setDel(null)}>Cancelar</button><button className={`${btn} bg-danger text-primary-foreground`} onClick={remove}>Confirmar eliminación</button></div></Modal>}
  </section>;
}

// ---------- 2. Mayoría de edad ----------
export function MajorityAlert({ casoId, birth, name, resolved }: { casoId: string; birth: string; name: string; resolved: boolean }) {
  const today = useToday();
  const [open, setOpen] = useState(false);
  const b = parseDMY(birth);
  const adult = !!(today && b && ageOn(b, today) >= 18);
  const key = `sage-mayoria-vista-${casoId}`;
  useEffect(() => { if (adult) { try { if (!localStorage.getItem(key)) setOpen(true); } catch { setOpen(true); } } }, [adult, key]);
  if (!adult) return null;
  const label = `🔴 Cumplió 18 años – Resolución ${resolved ? "registrada" : "pendiente"}`;
  return <>
    <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-danger bg-danger-soft p-4 text-danger"><AlertTriangle className="size-5 shrink-0" /><div className="text-xs"><b className="block text-sm">Ya egresa / sale del expediente</b><p className="mt-1 font-bold">{label}</p>{!resolved && <p className="mt-1 text-foreground">Registre la "Resolución de Mayoría de Edad" en Actuaciones del PTI.</p>}</div></div>
    {open && <Modal><div className="text-center"><AlertTriangle className="mx-auto size-10 text-danger" /><h3 className="mt-2 text-lg font-extrabold text-danger">Ya egresa / sale del expediente</h3><p className="mt-1 text-sm">{name}</p><p className="mt-3 rounded-md bg-danger-soft p-2 text-sm font-bold text-danger">{label}</p><button className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-bold text-primary-foreground" onClick={() => { try { localStorage.setItem(key, "1"); } catch { /* */ } setOpen(false); }}>Aceptar</button></div></Modal>}
  </>;
}
export const hasMajorityResolution = (texts: string[]) => texts.some(t => /mayor[ií]a de edad/i.test(t));

// ---------- 6. Números de contacto y domicilios (generales del expediente) ----------
type CT = { id: string; ambito: string; persona: string; tipo: string; valor: string; observacion: string; created_at: string };
type CForm = { tipo: "telefono" | "domicilio"; id?: string; valor: string; persona: string; observacion: string };
export function ContactsPanel({ ambito, readOnly }: { ambito: string; readOnly?: boolean }) {
  const [rows, setRows] = useState<CT[]>([]);
  const [form, setForm] = useState<CForm | null>(null);
  const [del, setDel] = useState<CT | null>(null);
  const load = useCallback(async () => { const { data } = await supabase.from("contactos").select("*").eq("ambito", ambito).in("tipo", ["telefono", "domicilio"]).order("created_at"); setRows((data ?? []) as CT[]); }, [ambito]);
  useEffect(() => { load(); }, [load]);
  const save = async () => {
    if (!form || !form.valor.trim()) return;
    const v = { valor: form.valor.trim(), persona: form.persona.trim() || "Sin indicar", observacion: form.observacion.trim() };
    if (form.id) await supabase.from("contactos").update(v).eq("id", form.id);
    else await supabase.from("contactos").insert({ ambito, tipo: form.tipo, ...v });
    setForm(null); load();
  };
  const remove = async () => { if (!del) return; await supabase.from("contactos").delete().eq("id", del.id); setDel(null); load(); };
  const tel = rows.filter(r => r.tipo === "telefono"), dom = rows.filter(r => r.tipo === "domicilio");
  const actions = (r: CT) => readOnly ? null : <div className="flex shrink-0 gap-1"><button className={`${btn} border`} onClick={() => setForm({ tipo: r.tipo as CForm["tipo"], id: r.id, valor: r.valor, persona: r.persona, observacion: r.observacion })}><Pencil className="size-3" />Editar</button><button aria-label="Eliminar" className={`${btn} border text-danger`} onClick={() => setDel(r)}><Trash2 className="size-3" /></button></div>;
  const head = (title: string, tipo: CForm["tipo"], label: string) => <div className="mb-2 flex items-center justify-between gap-2"><b className="text-[11px] uppercase text-muted-foreground">{title}</b>{!readOnly && <button className={`${btn} bg-primary text-primary-foreground`} onClick={() => setForm({ tipo, valor: "", persona: "", observacion: "" })}><Plus className="size-3" />{label}</button>}</div>;
  return <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="border-b px-5 py-4"><h2 className="text-sm font-extrabold">Domicilios y números de contacto</h2><p className="mt-1 text-xs text-muted-foreground">Información general del expediente.</p></div>
    <div className="space-y-5 p-5 text-xs">
      <div>{head("Números de contacto", "telefono", "Agregar número")}
        {tel.length === 0 ? <p className="text-muted-foreground">Sin números registrados.</p> : <ul className="space-y-2">{tel.map(r => <li key={r.id} className="flex items-start justify-between gap-2 rounded-md border p-3"><div className="grid gap-0.5"><span><b className="text-[10px] text-muted-foreground">Número: </b><b className="text-sm">{r.valor}</b></span><span><b className="text-[10px] text-muted-foreground">¿De quién es?: </b>{r.persona}</span></div>{actions(r)}</li>)}</ul>}</div>
      <div>{head("Domicilios", "domicilio", "Agregar domicilio")}
        {dom.length === 0 ? <p className="text-muted-foreground">Sin domicilios registrados.</p> : <ul className="space-y-2">{dom.map(r => <li key={r.id} className="flex items-start justify-between gap-2 rounded-md border p-3"><div className="grid gap-0.5"><span><b className="text-[10px] text-muted-foreground">Domicilio: </b><b>{r.valor}</b></span><span><b className="text-[10px] text-muted-foreground">¿De quién es el domicilio?: </b>{r.persona}</span><span><b className="text-[10px] text-muted-foreground">¿Quiénes viven allí?: </b>{r.observacion || "—"}</span></div>{actions(r)}</li>)}</ul>}</div>
    </div>
    {form && <Modal onClose={() => setForm(null)}><div className="flex items-center justify-between"><h3 className="font-extrabold">{form.id ? "Editar" : "Agregar"} {form.tipo === "telefono" ? "número de contacto" : "domicilio"}</h3><button onClick={() => setForm(null)}><X className="size-4" /></button></div>
      <div className="mt-3 grid gap-2">{form.tipo === "telefono" ? <>
        <input autoFocus className={box} placeholder="Número de teléfono (9XX XXX XXX)" inputMode="tel" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
        <input className={box} placeholder="¿De quién es? (mamá, papá, tía, abuela, responsable…)" value={form.persona} onChange={e => setForm({ ...form, persona: e.target.value })} />
      </> : <>
        <input autoFocus className={box} placeholder="Domicilio (Jr. _____ N.° ___)" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
        <input className={box} placeholder="¿De quién es el domicilio?" value={form.persona} onChange={e => setForm({ ...form, persona: e.target.value })} />
        <textarea className={box} rows={2} placeholder="¿Quiénes se encuentran viviendo allí?" value={form.observacion} onChange={e => setForm({ ...form, observacion: e.target.value })} />
      </>}</div>
      <div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setForm(null)}>Cancelar</button><button className={`${btn} bg-primary text-primary-foreground`} onClick={save}>Guardar</button></div></Modal>}
    {del && <Modal onClose={() => setDel(null)}><h3 className="font-extrabold">¿Está seguro de que desea eliminar este registro?</h3><p className="mt-2 rounded-md bg-muted p-2 text-xs">{del.valor} — {del.persona}</p><div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setDel(null)}>Cancelar</button><button className={`${btn} bg-danger text-primary-foreground`} onClick={remove}>Confirmar eliminación</button></div></Modal>}
  </section>;
}

// ---------- 4. Cumpleaños ----------
export type Person = { name: string; role: string; birth: string; code: string; caso?: string };
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export function BirthdaysPanel({ people }: { people: Person[] }) {
  const today = useToday();
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [day, setDay] = useState<number | null>(null);
  useEffect(() => { if (today && !view) { setView({ y: today.getFullYear(), m: today.getMonth() }); setDay(today.getDate()); } }, [today, view]);
  const parsed = useMemo(() => people.map(p => ({ ...p, d: parseDMY(p.birth)! })).filter(p => p.d), [people]);
  if (!today || !view) return <section className="rounded-lg border bg-card p-5 text-xs text-muted-foreground">Cargando cumpleaños…</section>;
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const next = (d: Date) => { let n = new Date(t0.getFullYear(), d.getMonth(), d.getDate()); if (n < t0) n = new Date(t0.getFullYear() + 1, d.getMonth(), d.getDate()); return n; };
  const withNext = parsed.map(p => { const n = next(p.d); return { ...p, n, turns: n.getFullYear() - p.d.getFullYear(), days: Math.round((n.getTime() - t0.getTime()) / 864e5) }; });
  const hoy = withNext.filter(p => p.days === 0);
  const prox = withNext.filter(p => p.days > 0 && p.days <= 60).sort((a, b) => a.days - b.days);
  const inMonth = parsed.filter(p => p.d.getMonth() === view.m);
  const first = new Date(view.y, view.m, 1).getDay(); const offset = (first + 6) % 7; const dim = new Date(view.y, view.m + 1, 0).getDate();
  const onDay = inMonth.filter(p => p.d.getDate() === day);
  const shift = (k: number) => { const d = new Date(view.y, view.m + k, 1); setView({ y: d.getFullYear(), m: d.getMonth() }); setDay(null); };
  const Line = ({ p, extra }: { p: (typeof withNext)[number] | (typeof parsed)[number] & { turns?: number }; extra?: string }) => <li className="flex items-center justify-between gap-2 border-b py-2 last:border-0"><span className="min-w-0"><b className="block truncate">{p.name}</b><small className="text-muted-foreground">{p.role} · Exp. {p.caso ? <Link to="/expediente" search={{ caso: p.caso }} className="font-bold text-secondary">{p.code}</Link> : p.code}</small></span><span className="shrink-0 text-right"><b className="block text-primary">{p.turns} años</b><small className="text-muted-foreground">{extra ?? `${String(p.d.getDate()).padStart(2, "0")}/${String(p.d.getMonth() + 1).padStart(2, "0")}`}</small></span></li>;
  return <section className="mt-5 min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="flex items-center gap-2 border-b px-5 py-4"><Cake className="size-4 text-primary" /><h2 className="text-sm font-extrabold">Cumpleaños</h2><span className="text-xs text-muted-foreground">NNA, madres, padres y responsables</span></div>
    <div className="grid gap-5 p-5 text-xs lg:grid-cols-[1fr_1fr_1.2fr]">
      <div><h3 className="mb-2 font-extrabold text-danger">🎂 Cumpleaños de hoy</h3>{hoy.length ? <ul>{hoy.map(p => <Line key={p.name + p.code} p={p} extra="Hoy" />)}</ul> : <p className="text-muted-foreground">Nadie cumple años hoy.</p>}</div>
      <div><h3 className="mb-2 font-extrabold">Próximos cumpleaños (60 días)</h3>{prox.length ? <ul className="max-h-72 overflow-y-auto pr-1">{prox.map(p => <Line key={p.name + p.code} p={p} extra={`${String(p.n.getDate()).padStart(2, "0")}/${String(p.n.getMonth() + 1).padStart(2, "0")} · en ${p.days} d`} />)}</ul> : <p className="text-muted-foreground">Sin cumpleaños próximos.</p>}</div>
      <div>
        <div className="mb-2 flex items-center justify-between"><button aria-label="Mes anterior" onClick={() => shift(-1)}><ChevronLeft className="size-4" /></button><b>{MONTHS[view.m]} {view.y}</b><button aria-label="Mes siguiente" onClick={() => shift(1)}><ChevronRight className="size-4" /></button></div>
        <div className="grid grid-cols-7 gap-1 text-center">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i} className="text-[10px] font-bold text-muted-foreground">{d}</span>)}
          {Array.from({ length: offset }).map((_, i) => <span key={"e" + i} />)}
          {Array.from({ length: dim }, (_, i) => i + 1).map(d => { const has = inMonth.some(p => p.d.getDate() === d); const isToday = view.y === t0.getFullYear() && view.m === t0.getMonth() && d === t0.getDate(); return <button key={d} onClick={() => setDay(d)} className={`relative rounded-md py-1.5 text-[11px] ${day === d ? "bg-secondary text-primary-foreground" : has ? "bg-primary/15 font-extrabold text-primary" : "hover:bg-muted"} ${isToday ? "ring-2 ring-danger" : ""}`}>{d}{has && <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-danger" />}</button>; })}
        </div>
        <div className="mt-3 rounded-md bg-muted p-3">{day ? onDay.length ? <ul>{onDay.map(p => <Line key={p.name + p.code} p={{ ...p, turns: view.y - p.d.getFullYear() }} />)}</ul> : <p className="text-muted-foreground">Nadie cumple años el {day} de {(MONTHS[view.m]??"").toLowerCase()}.</p> : <p className="text-muted-foreground">Seleccione un día marcado.</p>}</div>
      </div>
    </div>
  </section>;
}
