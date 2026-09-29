import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { CheckCircle2, Download, FileText, Folder, FolderOpen, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/* ---------- Sesión ---------- */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    supabase.auth.getSession().then(({ data: d }) => { setSession(d.session); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, ready };
}
export function useRequireSession() {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  useEffect(() => { if (ready && !session) navigate({ to: "/" }); }, [ready, session, navigate]);
  const name = (session?.user.user_metadata?.["full_name"] as string | undefined) || session?.user.email || "";
  return { session, ready, name };
}
const authorName = async () => {
  const { data } = await supabase.auth.getUser();
  return (data.user?.user_metadata?.["full_name"] as string | undefined) || data.user?.email || "";
};

/* ---------- Datos que se reemplazan en el modelo ---------- */
export type CaseData = {
  caso_id: string; code: string; team: string; nna: string; dni: string; birth: string; age: string;
  mother: string; father: string; responsible: string; siblings: string; ptiGeneral: string;
};
export const PLACEHOLDERS: [string, string][] = [
  ["EXPEDIENTE", "Número de expediente"], ["EQUIPO", "Riesgo o Desprotección"], ["NOMBRE_NNA", "Nombre completo del NNA"],
  ["DNI_NNA", "DNI del NNA"], ["FECHA_NACIMIENTO", "Fecha de nacimiento"], ["EDAD", "Edad"], ["MADRE", "Datos de la madre"],
  ["PADRE", "Datos del padre"], ["RESPONSABLE", "Responsable actual"], ["HERMANOS", "Otros NNA del expediente"],
  ["OBJETIVO_GENERAL", "Objetivo general del PTI"], ["FECHA_HOY", "Fecha de hoy"], ["USUARIO", "Quien genera el documento"],
];
function valuesFor(c: CaseData, user: string): Record<string, string> {
  return {
    EXPEDIENTE: c.code, EQUIPO: c.team, NOMBRE_NNA: c.nna.toUpperCase(), DNI_NNA: c.dni, FECHA_NACIMIENTO: c.birth, EDAD: c.age,
    MADRE: c.mother, PADRE: c.father, RESPONSABLE: c.responsible, HERMANOS: c.siblings || "—", OBJETIVO_GENERAL: c.ptiGeneral,
    FECHA_HOY: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" }), USUARIO: user,
  };
}
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const safe = (s: string) => s.replace(/[\\/:*?"<>|]/g, "-");

/* ---------- UI helpers ---------- */
const btn = "inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-bold transition disabled:opacity-50";
const Box = ({ title, sub, children, action }: { title: string; sub?: string; children: ReactNode; action?: ReactNode }) =>
  <section className="min-w-0 overflow-hidden rounded-lg border bg-card shadow-sm"><div className="flex items-start justify-between gap-3 border-b px-5 py-4"><div><h2 className="text-sm font-extrabold">{title}</h2>{sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}</div>{action}</div><div className="p-5">{children}</div></section>;

type Modelo = Tables<"modelos">;

/* ---------- Carpetas de modelos + generación ---------- */
export function ModelGenerator({ types, selected, onSelect, caseData }: {
  types: readonly (readonly [string, unknown])[]; selected: string; onSelect: (t: string) => void; caseData: CaseData | null;
}) {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modelId, setModelId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [generated, setGenerated] = useState<{ blob: Blob; name: string; modelo: string } | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("modelos").select("*").order("nombre");
    setModelos(data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setModelId(""); setGenerated(null); setSavedId(null); }, [selected, caseData?.caso_id]);

  const inFolder = modelos.filter(m => m.tipo_actuacion === selected);
  const count = (t: string) => modelos.filter(m => m.tipo_actuacion === t).length;

  const upload = async (file: File, replace?: Modelo) => {
    if (!file.name.toLowerCase().endsWith(".docx")) { setMsg({ ok: false, text: "El modelo debe ser un archivo Word (.docx)." }); return; }
    setBusy(true); setMsg(null);
    const path = replace?.file_path ?? `${crypto.randomUUID()}.docx`;
    const { error } = await supabase.storage.from("modelos").upload(path, file, { upsert: true, contentType: DOCX });
    if (error) { setBusy(false); setMsg({ ok: false, text: "No se pudo subir el modelo: " + error.message }); return; }
    const res = replace
      ? await supabase.from("modelos").update({ nombre: file.name.replace(/\.docx$/i, "") }).eq("id", replace.id)
      : await supabase.from("modelos").insert({ tipo_actuacion: selected, nombre: file.name.replace(/\.docx$/i, ""), file_path: path });
    setBusy(false);
    if (res.error) { setMsg({ ok: false, text: "No se pudo registrar el modelo: " + res.error.message }); return; }
    setMsg({ ok: true, text: replace ? "Modelo actualizado." : `Modelo agregado a la carpeta ${selected}.` });
    load();
  };
  const removeModel = async (m: Modelo) => {
    if (!confirm(`¿Eliminar el modelo "${m.nombre}"?`)) return;
    await supabase.storage.from("modelos").remove([m.file_path]);
    await supabase.from("modelos").delete().eq("id", m.id);
    if (modelId === m.id) setModelId("");
    load();
  };

  const generate = async () => {
    const m = modelos.find(x => x.id === modelId);
    if (!m || !caseData) return;
    setBusy(true); setMsg(null); setSavedId(null);
    try {
      const { data, error } = await supabase.storage.from("modelos").download(m.file_path);
      if (error || !data) throw new Error(error?.message || "no se pudo leer el modelo");
      const doc = new Docxtemplater(new PizZip(await data.arrayBuffer()), { paragraphLoop: true, linebreaks: true, nullGetter: () => "" });
      doc.render(valuesFor(caseData, await authorName()));
      const blob = doc.getZip().generate({ type: "blob", mimeType: DOCX }) as Blob;
      const name = safe(`${selected} - ${m.nombre} - ${caseData.code} - ${caseData.nna}.docx`);
      setGenerated({ blob, name, modelo: m.nombre });
      saveBlob(blob, name);
      setMsg({ ok: true, text: "Documento generado y descargado. Ábrelo en Word para revisarlo o corregirlo." });
    } catch (e) {
      setMsg({ ok: false, text: "No se pudo generar el documento. Revisa que las marcas del modelo estén bien escritas, por ejemplo {NOMBRE_NNA}. Detalle: " + (e instanceof Error ? e.message : String(e)) });
    }
    setBusy(false);
  };

  const saveToActs = async () => {
    if (!generated || !caseData) return;
    setBusy(true);
    const autor = await authorName();
    const path = `${caseData.caso_id}/${crypto.randomUUID()}.docx`;
    const up = await supabase.storage.from("generados").upload(path, generated.blob, { contentType: DOCX });
    if (up.error) { setBusy(false); setMsg({ ok: false, text: "No se pudo guardar: " + up.error.message }); return; }
    const { data: u } = await supabase.auth.getUser();
    const ins = await supabase.from("documentos_generados").insert({
      caso_id: caseData.caso_id, expediente_codigo: caseData.code, equipo: caseData.team, nna_nombre: caseData.nna,
      tipo_actuacion: selected, modelo_nombre: generated.modelo, nombre_archivo: generated.name, file_path: path, autor, created_by: u.user?.id ?? null,
    }).select("id").single();
    if (ins.error) { setBusy(false); setMsg({ ok: false, text: "No se pudo guardar: " + ins.error.message }); return; }
    await supabase.from("registro_documentos").insert({ caso_id: caseData.caso_id, expediente_codigo: caseData.code, accion: "Generado", detalle: `${selected} — ${generated.name}`, autor, user_id: u.user?.id ?? null });
    setSavedId(ins.data.id); setBusy(false);
    setMsg({ ok: true, text: `Guardado en Actuaciones del expediente ${caseData.code} (${caseData.nna}).` });
  };

  return <div className="mb-4 space-y-4">
    <Box title="Tipo de Actuación" sub="Cada tipo es una carpeta con sus modelos Word. Selecciona una carpeta para ver, subir o actualizar sus modelos.">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{types.map(([label]) => {
        const on = selected === label; const Icon = on ? FolderOpen : Folder;
        return <button type="button" key={label} onClick={() => onSelect(label)} className={`flex min-h-20 items-center gap-3 rounded-md border p-3 text-left text-xs font-bold transition ${on ? "border-primary bg-accent text-accent-foreground" : "bg-card hover:bg-muted"}`}><Icon className="size-6 shrink-0 text-primary" /><span className="min-w-0"><span className="block">{label}</span><small className="font-semibold text-muted-foreground">{count(label)} modelo(s)</small></span></button>;
      })}</div>
    </Box>

    <Box title={`Modelos de la carpeta: ${selected}`} sub="Elige el modelo a usar. Tú y el equipo pueden agregar nuevos o actualizar los existentes."
      action={<label className={`${btn} cursor-pointer bg-primary text-primary-foreground`}><Upload className="size-4" />Subir modelo<input type="file" accept=".docx" className="sr-only" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} /></label>}>
      {inFolder.length === 0 ? <p className="rounded-md border border-dashed bg-muted p-4 text-center text-xs text-muted-foreground">Esta carpeta aún no tiene modelos. Sube un Word (.docx) con marcas como {"{NOMBRE_NNA}"}. <a href="/modelo-ejemplo.docx" download className="font-bold text-secondary underline">Descargar modelo de ejemplo</a></p>
        : <ul className="space-y-2">{inFolder.map(m => <li key={m.id} className={`flex flex-wrap items-center gap-3 rounded-md border p-3 text-xs ${modelId === m.id ? "border-primary bg-accent" : ""}`}>
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"><input type="radio" name="modelo" checked={modelId === m.id} onChange={() => setModelId(m.id)} /><FileText className="size-5 shrink-0 text-secondary" /><span className="min-w-0"><b className="block truncate">{m.nombre}</b><small className="text-muted-foreground">Actualizado {new Date(m.updated_at).toLocaleDateString("es-PE")}</small></span></label>
          <label className={`${btn} cursor-pointer border`} title="Reemplazar por una versión nueva"><RefreshCw className="size-4" />Actualizar<input type="file" accept=".docx" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, m); e.target.value = ""; }} /></label>
          <button type="button" onClick={() => removeModel(m)} className={`${btn} border text-danger`}><Trash2 className="size-4" />Eliminar</button>
        </li>)}</ul>}
      <details className="mt-4 text-xs"><summary className="cursor-pointer font-bold text-secondary">Marcas que puedes usar en tus modelos</summary><div className="mt-2 grid gap-1 sm:grid-cols-2">{PLACEHOLDERS.map(([k, d]) => <p key={k}><code className="rounded bg-muted px-1 font-bold">{`{${k}}`}</code> {d}</p>)}</div></details>
    </Box>

    <Box title="Generar documento" sub="El sistema toma los datos del expediente buscado y los coloca en el modelo elegido.">
      {!caseData ? <p className="text-xs text-muted-foreground">Primero busca el expediente y elige el NNA en la sección de arriba.</p>
        : <div className="space-y-3 text-xs">
          <p>Se usarán los datos de <b>{caseData.nna}</b> · Expediente <b className="text-secondary">{caseData.code}</b> ({caseData.team}) · Responsable: {caseData.responsible}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!modelId || busy} onClick={generate} className={`${btn} bg-secondary text-secondary-foreground`}><Download className="size-4" />Generar Word (.docx)</button>
            {generated && <button type="button" onClick={() => saveBlob(generated.blob, generated.name)} className={`${btn} border`}><Download className="size-4" />Descargar de nuevo</button>}
            {generated && <button type="button" disabled={busy || !!savedId} onClick={saveToActs} className={`${btn} bg-primary text-primary-foreground`}><Save className="size-4" />{savedId ? "Guardado en Actuaciones" : "Guardar en Actuaciones"}</button>}
          </div>
          {!modelId && <p className="text-muted-foreground">Selecciona un modelo de la carpeta.</p>}
        </div>}
      {msg && <p role="status" className={`mt-3 flex items-start gap-2 rounded-md p-3 text-xs font-bold ${msg.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>{msg.ok && <CheckCircle2 className="size-4 shrink-0" />}{msg.text}</p>}
    </Box>
  </div>;
}

/* ---------- Documentos guardados en el expediente ---------- */
type Gen = Tables<"documentos_generados">; type Reg = Tables<"registro_documentos">;
export function SavedDocuments({ casoId, code, readOnly }: { casoId: string; code: string; readOnly?: boolean }) {
  const [docs, setDocs] = useState<Gen[]>([]); const [log, setLog] = useState<Reg[]>([]);
  const load = useCallback(async () => {
    const [d, l] = await Promise.all([
      supabase.from("documentos_generados").select("*").eq("caso_id", casoId).order("created_at", { ascending: false }),
      supabase.from("registro_documentos").select("*").eq("caso_id", casoId).order("created_at", { ascending: false }).limit(30),
    ]);
    setDocs(d.data ?? []); setLog(l.data ?? []);
  }, [casoId]);
  useEffect(() => { load(); }, [load]);
  const record = async (accion: string, detalle: string) => {
    const autor = await authorName(); const { data: u } = await supabase.auth.getUser();
    await supabase.from("registro_documentos").insert({ caso_id: casoId, expediente_codigo: code, accion, detalle, autor, user_id: u.user?.id ?? null });
  };
  const download = async (g: Gen) => { const { data } = await supabase.storage.from("generados").download(g.file_path); if (data) saveBlob(data, g.nombre_archivo); };
  const replace = async (g: Gen, f: File) => {
    const { error } = await supabase.storage.from("generados").upload(g.file_path, f, { upsert: true, contentType: DOCX });
    if (error) { alert("No se pudo subir la versión corregida: " + error.message); return; }
    await record("Versión corregida", g.nombre_archivo); load();
  };
  const remove = async (g: Gen) => {
    if (!confirm(`¿Eliminar "${g.nombre_archivo}" de este expediente?`)) return;
    await supabase.storage.from("generados").remove([g.file_path]);
    const { error } = await supabase.from("documentos_generados").delete().eq("id", g.id);
    if (error) { alert("No se pudo eliminar: " + error.message); return; }
    await record("Eliminado", g.nombre_archivo); load();
  };
  return <div className="space-y-3 text-xs">
    {docs.length === 0 ? <p className="text-muted-foreground">Aún no hay documentos generados para este NNA.</p>
      : <ul className="space-y-2">{docs.map(g => <li key={g.id} className="flex flex-wrap items-center gap-2 rounded-md border p-3">
        <FileText className="size-5 shrink-0 text-secondary" /><span className="min-w-0 flex-1"><b className="block break-words">{g.nombre_archivo}</b><small className="text-muted-foreground">{g.tipo_actuacion} · {new Date(g.created_at).toLocaleString("es-PE")} · {g.autor}</small></span>
        <button onClick={() => download(g)} className={`${btn} border`}><Download className="size-4" />Descargar</button>
        {!readOnly && <><label className={`${btn} cursor-pointer border`}><Upload className="size-4" />Subir corregido<input type="file" accept=".docx" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) replace(g, f); e.target.value = ""; }} /></label>
        <button onClick={() => remove(g)} className={`${btn} border text-danger`}><Trash2 className="size-4" />Eliminar</button></>}
      </li>)}</ul>}
    {log.length > 0 && <details><summary className="cursor-pointer font-bold text-secondary">Registro de documentos ({log.length})</summary><ul className="mt-2 space-y-1">{log.map(r => <li key={r.id} className="border-b pb-1"><b className={r.accion === "Eliminado" ? "text-danger" : "text-success"}>{r.accion}</b> · {r.detalle} <span className="text-muted-foreground">— {r.autor}, {new Date(r.created_at).toLocaleString("es-PE")}</span></li>)}</ul></details>}
  </div>;
}
