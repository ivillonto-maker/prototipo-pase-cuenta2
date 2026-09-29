# SAGE-UPE — demo navegable fiel al prototipo

## Objetivo
Construir una primera versión web completa y navegable del prototipo SAGE-UPE, conservando su identidad visual institucional y usando los datos de ejemplo mostrados en el PDF.

## Pantallas
- Ingreso al sistema con usuario, contraseña, visibilidad de contraseña y validación de campos.
- Panel de Control Operativo con buscador, indicadores, seguimiento prioritario y alertas.
- Resultados de búsqueda de expedientes.
- Detalle del expediente con datos del NNA, responsables, alertas, antecedentes, PTI, documentos, historial y línea de tiempo.
- Nueva actuación con selección de tipo, formulario dinámico, archivo adjunto y planificación del próximo seguimiento.
- Recepcionados y entregados con indicadores, filtros, tabla y paginación.
- Pendientes y alertas con filtros, grupos por urgencia y acciones.
- Administración con secciones de usuarios, plantillas, campos, actuaciones, alertas, configuración y auditoría.

## Interacciones
- Navegación real entre módulos desde el menú lateral.
- Acceso de demostración que abre el panel tras validar campos.
- Búsqueda que conduce al resultado y luego al detalle del expediente.
- Formularios, filtros, selectores, botones y estados interactivos.
- Adaptación para escritorio, tableta y móvil; en móvil el menú se compactará.
- Mensajes claros al guardar o completar acciones.

## Diseño
- Replicar la combinación azul marino, verde turquesa, blanco y colores de alerta del prototipo.
- Mantener la estructura compacta y profesional orientada al trabajo documental.
- Mejorar únicamente legibilidad, consistencia y adaptación a pantallas pequeñas sin cambiar la identidad.

## Alcance técnico
- Primera versión con información simulada en el navegador; no incluirá aún usuarios reales, almacenamiento permanente ni carga definitiva de archivos.
- Cada módulo tendrá su propia dirección para permitir navegación directa.
- Se crearán elementos reutilizables para menú, encabezados, tablas, indicadores y etiquetas de estado.
- Se añadirá información descriptiva propia para cada pantalla al compartirla o abrirla en buscadores.

## Validación
- Comprobar el recorrido completo: ingreso → panel → búsqueda → expediente → nueva actuación.
- Comprobar navegación hacia documentos, pendientes y administración.
- Revisar visualmente escritorio y móvil para evitar cortes, desbordamientos y superposiciones.
