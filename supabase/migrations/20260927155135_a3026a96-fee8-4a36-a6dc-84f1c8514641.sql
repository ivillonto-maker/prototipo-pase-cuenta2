CREATE TABLE public.registros_nna (
  id text PRIMARY KEY,
  fid text NOT NULL,
  code text NOT NULL,
  team text NOT NULL,
  label text NOT NULL DEFAULT '',
  data jsonb NOT NULL,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros_nna TO authenticated;
GRANT ALL ON public.registros_nna TO service_role;
ALTER TABLE public.registros_nna ENABLE ROW LEVEL SECURITY;
CREATE POLICY rn_select ON public.registros_nna FOR SELECT TO authenticated USING (true);
CREATE POLICY rn_insert ON public.registros_nna FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY rn_update ON public.registros_nna FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY rn_delete ON public.registros_nna FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.expedientes_archivo (
  fid text PRIMARY KEY,
  autor text NOT NULL DEFAULT '',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.expedientes_archivo TO authenticated;
GRANT ALL ON public.expedientes_archivo TO service_role;
ALTER TABLE public.expedientes_archivo ENABLE ROW LEVEL SECURITY;
CREATE POLICY ea_select ON public.expedientes_archivo FOR SELECT TO authenticated USING (true);
CREATE POLICY ea_insert ON public.expedientes_archivo FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY ea_delete ON public.expedientes_archivo FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS ct_delete ON public.contactos;
CREATE POLICY ct_delete ON public.contactos FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);