import { createFileRoute } from "@tanstack/react-router";
import { ActionPage, metaFor } from "@/components/sage";
export const Route = createFileRoute("/nueva-actuacion")({ head:()=>metaFor("Nueva actuación","Registro de actuaciones del seguimiento documental."), component:ActionPage });