import { createFileRoute } from "@tanstack/react-router";
import { SearchPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/buscar")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : undefined }),
  head: () => metaFor("Buscar expediente", "Consulta de expedientes por número, agrupados por familia y año."),
  component: SearchPage,
});
