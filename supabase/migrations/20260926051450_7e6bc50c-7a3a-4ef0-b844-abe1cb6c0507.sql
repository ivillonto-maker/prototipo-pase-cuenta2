CREATE TABLE public.nna_registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente_codigo text NOT NULL,
  caso_base text,
  nombre text NOT NULL DEFAULT '',
  dni text NOT NULL DEFAULT '',
  fecha_nacimiento date,
  eliminado boolean NOT NULL DEFAULT false,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nna_registros TO authenticated;
GRANT ALL ON public.nna_registros TO service_role;
ALTER TABLE public.nna_registros ENABLE ROW LEVEL SECURITY;
CREATE POLICY nr_select ON public.nna_registros FOR SELECT TO authenticated USING (true);
CREATE POLICY nr_insert ON public.nna_registros FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY nr_update ON public.nna_registros FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY nr_delete ON public.nna_registros FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pti_actuaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  base_indice integer,
  eliminado boolean NOT NULL DEFAULT false,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pti_actuaciones TO authenticated;
GRANT ALL ON public.pti_actuaciones TO service_role;
ALTER TABLE public.pti_actuaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY pa_select ON public.pti_actuaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY pa_insert ON public.pti_actuaciones FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY pa_update ON public.pti_actuaciones FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY pa_delete ON public.pti_actuaciones FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TABLE public.contactos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambito text NOT NULL,
  persona text NOT NULL,
  tipo text NOT NULL,
  valor text NOT NULL DEFAULT '',
  observacion text NOT NULL DEFAULT '',
  actual boolean NOT NULL DEFAULT true,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contactos TO authenticated;
GRANT ALL ON public.contactos TO service_role;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
CREATE POLICY ct_select ON public.contactos FOR SELECT TO authenticated USING (true);
CREATE POLICY ct_insert ON public.contactos FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY ct_update ON public.contactos FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY ct_delete ON public.contactos FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));