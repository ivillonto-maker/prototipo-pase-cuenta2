CREATE TABLE public.modelos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_actuacion text NOT NULL,
  nombre text NOT NULL,
  file_path text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos TO authenticated;
GRANT ALL ON public.modelos TO service_role;
ALTER TABLE public.modelos ENABLE ROW LEVEL SECURITY;
CREATE POLICY mod_select ON public.modelos FOR SELECT TO authenticated USING (true);
CREATE POLICY mod_insert ON public.modelos FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY mod_update ON public.modelos FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY mod_delete ON public.modelos FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TABLE public.documentos_generados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id text NOT NULL,
  expediente_codigo text NOT NULL,
  equipo text NOT NULL,
  nna_nombre text NOT NULL,
  tipo_actuacion text NOT NULL,
  modelo_nombre text NOT NULL,
  nombre_archivo text NOT NULL,
  file_path text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  autor text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.documentos_generados (caso_id);
GRANT SELECT, INSERT, DELETE ON public.documentos_generados TO authenticated;
GRANT ALL ON public.documentos_generados TO service_role;
ALTER TABLE public.documentos_generados ENABLE ROW LEVEL SECURITY;
CREATE POLICY dg_select ON public.documentos_generados FOR SELECT TO authenticated USING (true);
CREATE POLICY dg_insert ON public.documentos_generados FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY dg_delete ON public.documentos_generados FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TABLE public.registro_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id text NOT NULL,
  expediente_codigo text NOT NULL,
  accion text NOT NULL,
  detalle text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  autor text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.registro_documentos (caso_id);
GRANT SELECT, INSERT ON public.registro_documentos TO authenticated;
GRANT ALL ON public.registro_documentos TO service_role;
ALTER TABLE public.registro_documentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY rd_select ON public.registro_documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY rd_insert ON public.registro_documentos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER modelos_touch BEFORE UPDATE ON public.modelos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "sage files read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('modelos','generados'));
CREATE POLICY "sage files insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('modelos','generados'));
CREATE POLICY "sage files update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id IN ('modelos','generados'));
CREATE POLICY "sage files delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('modelos','generados'));