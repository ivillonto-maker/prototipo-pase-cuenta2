import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/administracion")({ head:()=>metaFor("Administración","Configuración y gestión administrativa de SAGE-UPE."), component:AdminPage });