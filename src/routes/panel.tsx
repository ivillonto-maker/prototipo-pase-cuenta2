import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/panel")({ head:()=>metaFor("Panel de Control Operativo","Resumen operativo de expedientes, actuaciones y alertas."), component:DashboardPage });