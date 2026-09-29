import { createFileRoute } from "@tanstack/react-router";
import { LoginPage, metaFor } from "@/components/sage";

export const Route = createFileRoute("/")({
  head: () => metaFor("Ingreso al Sistema", "Acceso autorizado al área de seguimiento documental de SAGE-UPE."),
  component: LoginPage,
});