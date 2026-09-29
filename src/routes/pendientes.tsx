import { createFileRoute } from "@tanstack/react-router";
import { PendingPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/pendientes")({ head:()=>metaFor("Pendientes y Alertas","Gestión de actividades pendientes y alertas automáticas."), component:PendingPage });