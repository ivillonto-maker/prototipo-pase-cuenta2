import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/documentos")({ head:()=>metaFor("Recepcionados y entregados","Consulta de movimientos documentales de SAGE-UPE."), component:DocumentsPage });