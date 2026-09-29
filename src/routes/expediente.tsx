import { createFileRoute } from "@tanstack/react-router";
import { CasePage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/expediente")({
  validateSearch: (s: Record<string, unknown>) => ({ caso: typeof s["caso"] === "string" ? s["caso"] : undefined }),
  head: () => metaFor("Detalle de expediente", "Detalle protegido del expediente y su historial de seguimiento."),
  component: CasePage,
});
