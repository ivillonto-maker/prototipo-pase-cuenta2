import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Copy, MoreVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Modal, box, btn, dmyToISO, useIsAdmin } from "@/components/caso-extras";
import { archiveFamily, refreshStore, recFid, useFamilies, TeamBadge, type Family, type NNACase } from "@/components/sage";

const tag = () => Date.now().toString(36).slice(-5);

/** Copia un NNA completo (datos, actuaciones del PTI y documentos generados) a un nuevo registro. */
async function copyRecord(rec: NNACase, fid: string, label: string, newName: string) {
  const newId = `${rec.id.replace(/-copia-\w+$/, "")}-copia-${tag()}${Math.random().toString(36).slice(2, 4)}`;
  const { data: pa } = await supabase.from("pti_actuaciones").select("*").eq("caso_id", rec.id);
  const hiddenIdx = new Set((pa ?? []).filter(r => r.eliminado && r.base_indice !== null).map(r => r.base_indice));
  const data: NNACase = { ...rec, id: newId, fid, label, nna: newName, acts: rec.acts.filter((_, i) => !hiddenIdx.has(i)) };
  const { error } = await supabase.from("registros_nna").insert({ id: newId, fid, code: rec.code, team: rec.team, label, data: data as never });
  if (error) throw error;
  const custom = (pa ?? []).filter(r => r.base_indice === null && !r.eliminado);
  if (custom.length) await supabase.from("pti_actuaciones").insert(custom.map(r => ({ caso_id: newId, descripcion: r.descripcion, fecha: r.fecha })));
  const { data: docs } = await supabase.from("documentos_generados").select("*").eq("caso_id", rec.id);
  const { data: u } = await supabase.auth.getUser();
  for (const d of docs ?? []) {
    const path = `${crypto.randomUUID()}.docx`;
    const cp = await supabase.storage.from("generados").copy(d.file_path, path);
    if (cp.error) continue;
    await supabase.from("documentos_generados").insert({ caso_id: newId, expediente_codigo: d.expediente_codigo, equipo: d.equipo, nna_nombre: newName, tipo_actuacion: d.tipo_actuacion, modelo_nombre: d.modelo_nombre, nombre_archivo: d.nombre_archivo, file_path: path, autor: d.autor, created_by: u.user?.id ?? null });
  }
  return newId;
}

async function duplicateFamily(f: Family) {
  const fid = `${f.code}|${f.team}|copia-${tag()}`;
  const label = `${f.label} (copia)`;
  for (const r of f.recs) await copyRecord({ ...r, team: f.team }, fid, label, r.nna);
  const { data: ct } = await supabase.from("contactos").select("*").eq("ambito", f.fid).in("tipo", ["telefono", "domicilio"]);
  if (ct?.length) await supabase.from("contactos").insert(ct.map(c => ({ ambito: fid, tipo: c.tipo, valor: c.valor, persona: c.persona, observacion: c.observacion })));
}

type EditForm = { rec: NNACase; nna: string; dni: string; birth: string; mother: string; father: string; responsible: string };

export function AdminExpedientes() {
  const admin = useIsAdmin();
  const families = useFamilies().filter(f => f.recs.length > 0);
  const [menu, setMenu] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; text: string; ok: string; danger?: boolean; run: () => Promise<void> } | null>(null);
  const [edit, setEdit] = useState<EditForm | null>(null);
  const [codeEdit, setCodeEdit] = useState<{ f: Family; code: string } | null>(null);
  const [add, setAdd] = useState<{ f: Family; nna: string; dni: string; birth: string } | null>(null);

  if (!admin) return <p className="p-6 text-sm text-muted-foreground">Esta sección solo está disponible para la administradora del sistema.</p>;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label); setMsg("");
    try { await fn(); await refreshStore(); setMsg(`${label}: listo.`); } catch (e) { setMsg(`No se pudo completar: ${(e as Error).message}`); }
    setBusy("");
  };
  const isCopyRec = (r: NNACase) => r.id.includes("-copia-") || !!r.fid;
  const Item = ({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) => <button type="button" onClick={() => { setMenu(null); onClick(); }} className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-bold hover:bg-muted ${danger ? "text-danger" : ""}`}>{children}</button>;
  const Dots = ({ id, children }: { id: string; children: React.ReactNode }) => <div className="relative">
    <button type="button" aria-label="Más opciones" onClick={() => setMenu(menu === id ? null : id)} className="grid size-8 place-items-center rounded-md border bg-card hover:bg-muted"><MoreVertical className="size-4" /></button>
    {menu === id && <><button type="button" aria-label="Cerrar" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(null)} /><div className="absolute right-0 z-20 mt-1 w-56 rounded-md border bg-card p-1 shadow-lg">{children}</div></>}
  </div>;

  return <div className="space-y-4 p-5 text-xs">
    <p className="text-muted-foreground">Desde aquí solo usted puede duplicar expedientes, administrar los hermanos y archivar expedientes. Los demás usuarios no ven estas opciones.</p>
    {busy && <p className="rounded-md bg-accent p-2 font-bold">{busy}… por favor espere.</p>}
    {msg && !busy && <p className="rounded-md bg-success-soft p-2 font-bold text-success">{msg}</p>}
    {families.map(f => <div key={f.fid} className={`rounded-lg border ${f.archived ? "bg-muted/60" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <b className="text-sm text-secondary">{f.code}</b><TeamBadge team={f.team} /><span className="font-bold">{f.label}</span>
        {f.archived && <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-extrabold text-muted-foreground">EXPEDIENTE ARCHIVADO</span>}
        <div className="ml-auto"><Dots id={f.fid}>
          <Item onClick={() => setConfirm({ title: `¿Duplicar el expediente ${f.code}?`, text: `Se creará "${f.label} (copia)" con todos sus NNA, datos, actuaciones, documentos y contactos.`, ok: "Duplicar", run: () => run("Duplicando expediente", () => duplicateFamily(f)) })}><Copy className="size-4" />Duplicar expediente</Item>
          {!f.archived && <Item onClick={() => setAdd({ f, nna: "", dni: "", birth: "" })}><Plus className="size-4" />Agregar hermano</Item>}
          {f.isCopy && <Item onClick={() => setCodeEdit({ f, code: f.code })}><Pencil className="size-4" />Cambiar número de expediente</Item>}
          {f.archived
            ? <Item onClick={() => setConfirm({ title: `¿Restaurar el expediente ${f.code}?`, text: "Volverá a aparecer entre los expedientes activos.", ok: "Restaurar", run: () => run("Restaurando", async () => { await supabase.from("expedientes_archivo").delete().eq("fid", f.fid); }) })}><ArchiveRestore className="size-4" />Restaurar a activos</Item>
            : <Item danger onClick={() => setConfirm({ title: `¿Archivar el expediente ${f.code}?`, text: "Pasará a estado Archivado: dejará de aparecer entre los activos y no podrá modificarse. Toda su información se conserva.", ok: "Archivar", danger: true, run: () => run("Archivando", () => archiveFamily(f.fid)) })}><Archive className="size-4" />Archivar expediente</Item>}
          {f.isCopy && <Item danger onClick={() => setConfirm({ title: `¿Eliminar la copia ${f.label}?`, text: "Se eliminará esta copia y sus NNA. El expediente original no cambia.", ok: "Eliminar copia", danger: true, run: () => run("Eliminando copia", async () => { await supabase.from("registros_nna").delete().eq("fid", f.fid); }) })}><Trash2 className="size-4" />Eliminar copia</Item>}
        </Dots></div>
      </div>
      <ul className="divide-y">{f.recs.map(r => <li key={r.id} className="flex items-center gap-2 px-4 py-2">
        <Link to="/expediente" search={{ caso: r.id }} className="min-w-0 flex-1"><b className="block truncate">{r.nna}</b><small className="text-muted-foreground">DNI {r.dni || "—"} · {r.birth || "sin fecha"}</small></Link>
        {!f.archived && <Dots id={r.id}>
          <Item onClick={() => run("Duplicando hermano", async () => { await copyRecord({ ...r, team: f.team }, recFid(r), r.label ?? f.label, `${r.nna} (copia)`); })}><Copy className="size-4" />Duplicar</Item>
          {isCopyRec(r) && <Item onClick={() => setEdit({ rec: r, nna: r.nna, dni: r.dni, birth: r.birth, mother: r.mother, father: r.father, responsible: r.responsible })}><Pencil className="size-4" />Editar datos</Item>}
          <Item danger onClick={() => setConfirm({ title: `¿Quitar a ${r.nna} del expediente?`, text: "Solo se quitará este hermano. Los demás y el expediente no cambian.", ok: "Confirmar", danger: true, run: () => run("Quitando hermano", async () => { if (isCopyRec(r)) await supabase.from("registros_nna").delete().eq("id", r.id); else await supabase.from("nna_registros").insert({ expediente_codigo: f.fid, caso_base: r.id, nombre: r.nna, eliminado: true }); }) })}><Trash2 className="size-4" />Quitar del expediente</Item>
        </Dots>}
      </li>)}</ul>
    </div>)}

    {confirm && <Modal onClose={() => setConfirm(null)}><h3 className="font-extrabold">{confirm.title}</h3><p className="mt-2 text-xs text-muted-foreground">{confirm.text}</p><div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setConfirm(null)}>Cancelar</button><button className={`${btn} ${confirm.danger ? "bg-danger" : "bg-primary"} text-primary-foreground`} onClick={() => { const c = confirm; setConfirm(null); c.run(); }}>{confirm.ok}</button></div></Modal>}

    {edit && <Modal onClose={() => setEdit(null)}><div className="flex items-center justify-between"><h3 className="font-extrabold">Editar datos del NNA</h3><button onClick={() => setEdit(null)}><X className="size-4" /></button></div>
      <div className="mt-3 grid gap-2">
        {([["nna", "Nombres completos"], ["dni", "DNI"], ["birth", "Fecha de nacimiento (dd/mm/aaaa)"], ["mother", "Madre"], ["father", "Padre"], ["responsible", "Responsable actual"]] as const).map(([k, l]) => <label key={k} className="grid gap-1 text-[10px] font-bold text-muted-foreground">{l}<input className={box} value={edit[k]} onChange={e => setEdit({ ...edit, [k]: e.target.value })} /></label>)}
      </div>
      <div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setEdit(null)}>Cancelar</button><button className={`${btn} bg-primary text-primary-foreground`} onClick={() => { const e = edit; setEdit(null); run("Guardando", async () => { const { rec, ...v } = e; const { error } = await supabase.from("registros_nna").update({ data: { ...rec, ...v } as never }).eq("id", rec.id); if (error) throw error; }); }}>Guardar</button></div></Modal>}

    {codeEdit && <Modal onClose={() => setCodeEdit(null)}><h3 className="font-extrabold">Número de expediente de la copia</h3><input className={`${box} mt-3 w-full`} placeholder="2021-0009" value={codeEdit.code} onChange={e => { const d = e.target.value.replace(/\D/g, "").slice(0, 8); setCodeEdit({ ...codeEdit, code: d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d }); }} />
      <div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setCodeEdit(null)}>Cancelar</button><button className={`${btn} bg-primary text-primary-foreground`} onClick={() => { const c = codeEdit; if (!/^\d{4}-\d{4}$/.test(c.code)) return; setCodeEdit(null); run("Cambiando número", async () => { for (const r of c.f.recs) await supabase.from("registros_nna").update({ code: c.code, data: { ...r, code: c.code } as never }).eq("id", r.id); }); }}>Guardar</button></div></Modal>}

    {add && <Modal onClose={() => setAdd(null)}><h3 className="font-extrabold">Agregar hermano a {add.f.code}</h3><p className="mt-1 text-[10px] text-muted-foreground">Se usarán los mismos progenitores, responsable y PTI del expediente; luego puede editarlos.</p>
      <div className="mt-3 grid gap-2"><input className={box} placeholder="Nombres completos" value={add.nna} onChange={e => setAdd({ ...add, nna: e.target.value })} /><input className={box} placeholder="DNI" inputMode="numeric" value={add.dni} onChange={e => setAdd({ ...add, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })} /><input className={box} placeholder="Fecha de nacimiento (dd/mm/aaaa)" value={add.birth} onChange={e => setAdd({ ...add, birth: e.target.value })} /></div>
      <div className="mt-4 flex justify-end gap-2"><button className={`${btn} border`} onClick={() => setAdd(null)}>Cancelar</button><button className={`${btn} bg-primary text-primary-foreground`} onClick={() => { const a = add; if (!a.nna.trim()) return; if (a.birth && !dmyToISO(a.birth)) { alert("Fecha inválida (dd/mm/aaaa)"); return; } setAdd(null); run("Agregando hermano", async () => { const b = a.f.recs[0]!; const fid = a.f.fid; const id = `${fid.split("|")[0]}-${tag()}`; const data: NNACase = { ...b, id, fid, label: a.f.label, team: a.f.team, nna: a.nna.trim(), dni: a.dni, birth: a.birth, age: "", acts: [] }; const { error } = await supabase.from("registros_nna").insert({ id, fid, code: a.f.code, team: a.f.team, label: a.f.label, data: data as never }); if (error) throw error; }); }}>Guardar hermano</button></div></Modal>}
  </div>;
}
