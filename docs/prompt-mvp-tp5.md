# Prompt — Construcción del MVP "Unlam Parking" (TP5, GADS II — Agile Team)

## Rol y objetivo
Sos el agente de desarrollo del equipo Agile Team. Tenés que construir **desde cero** en `src/` el MVP de **Unlam Parking** para el TP5 ("Construcción del MVP, Prueba y Aprendizaje"). El objetivo del MVP no es ser prolijo: es **aguantar una sesión de prueba con un usuario real que no sabe nada del proyecto** y que tiene que recorrer el flujo principal de punta a punta **sin que nadie del equipo le opere la app**.

## Regla principal: ante la duda, PREGUNTÁ
- Antes de escribir código, leé todo `docs/` (brief.md, prompts.md, diseno/, evaluacion/, evidencia/, etc.).
- Si encontrás **cualquier ambigüedad, contradicción entre documentos, o algo de `docs/` que contradiga este prompt**, NO lo resuelvas por tu cuenta: listalo y preguntame. Yo decido.
- Si `docs/` tiene información más nueva que este prompt (ej. brief v4, cambios de scope), señalalo y preguntá cuál prevalece.
- Primero entregame un **plan** (stack, estructura de carpetas, modelo de datos, pantallas, endpoints, despliegue) + la **lista de preguntas abiertas**. No empieces a codear hasta que lo apruebe.

## Contexto del producto (resumen de TP1–TP4)
- **Segmento / usuario primario:** estudiantes (y docentes) de la UNLaM que van en su propio auto, principalmente turno noche. Usuarios de prueba: U1, U2, U3 (2 con iPhone, 1 con Android).
- **Hipótesis de valor (TP2):** el usuario no sabe si va a encontrar lugar y tarda 5–20 min en estacionar (sobre todo por la fila en la barrera). Reservar un lugar de antemano le garantiza dónde estacionar. Éxito = estaciona en < 5 min desde su llegada y reporta menos estrés / menos necesidad de salir antes.
- **Criterio de éxito ya commiteado (TP5 ej. 1):** la hipótesis se sostiene si los 3 usuarios logran hacer una reserva sin pedir ayuda. Métricas accionables: (1) tareas resueltas sin ayuda (crear y cancelar reserva), (2) recuerdo: tiempo para repetir las tareas tras una semana sin usar la app. → **La app y los datos deben seguir funcionando una semana después de la primera sesión.**

## Scope del MVP (TP3) — construir ÚNICAMENTE esto
**Incluido (se construye de verdad):**
1. Reservar un lugar en el estacionamiento.
2. Cancelar la reserva.
3. Ver la disponibilidad de lugares.

**Incluido pero SIMULADO (el usuario no tiene por qué enterarse):**
4. Login con "cuenta universitaria": usuario + contraseña contra cuentas precargadas a mano (seed). No hay integración real con la UNLaM. Mostrar mensaje de error claro si las credenciales son incorrectas (TP4B, H9).

**EXCLUIDO — no construir:** tipos de vehículo (se asume auto), penalizaciones, más de un estacionamiento (uno solo), lectura de QR / barrera, liberación automática de reservas por vencimiento, selección de plaza específica / mapa, historial de reservas (estos dos últimos fueron rechazos explícitos del TP3).

## Flujo principal (wireframe alternativa B — `docs/diseno/wireframe/`)
Usá el wireframe HTML del repo como referencia de estructura y jerarquía de pantallas (alternativa B: "recuerdo en el tiempo" — pocas pantallas, un único patrón visual).
1. **Login** (usuario + contraseña).
2. **Inicio** con dos estados: sin reserva → botón "Reservar estacionamiento"; con reserva → estado de la reserva y botón "Ver mi QR".
3. **Reservar**: fecha y hora en la misma pantalla, dentro de un rango de 24 h, y botón "Realizar reserva".
4. **Confirmación y QR**: leyenda "Reserva confirmada", bloque con fecha, hora y minutos de tolerancia, QR con los datos de la reserva, botón "Cancelar reserva" y "Continuar" (vuelve a Inicio).
5. **Cancelación**: confirma la cancelación y libera el lugar.

## Correcciones del TP4 que entran en el MVP (TP4B)
- **H4:** fecha y hora se eligen de **listas desplegables que sólo ofrecen opciones con disponibilidad** (el usuario no puede elegir algo que después falla al confirmar).
- **H10:** **botón de Ayuda en todas las pantallas excepto Login**, que lleva a una pantalla de Ayuda explicando cómo reservar, ver el QR, cancelar y registrar la llegada.

## Decisiones ya tomadas por el equipo (fuera del wireframe)
- **Plataforma:** web **mobile-first** (responsive, idealmente instalable como PWA), desplegada con una **URL pública** que funcione en iOS Safari y Android Chrome. Nada de tiendas de apps.
- **Stack:** **Node.js** en backend con **SQLite** como persistencia; el componente propio (lógica de reservas y disponibilidad) vive en el backend. Front a tu propuesta (justificala en el plan).
- **Registro de hora de llegada** (sugerencia del corrector del TP3, para medir el KPI de < 5 min): **botón "Llegué"** que el usuario presiona en la pantalla de su reserva al llegar a la universidad. Se guarda el timestamp. Se mantiene horario puntual + tolerancia (NO franja de permanencia).
- **QR:** se muestra en pantalla con los datos de la reserva; no hay lector ni barrera (excluido del MVP).

## Preguntas que ya sé que hay que resolver (incluilas en tu lista y proponé un valor por defecto)
- Capacidad total del estacionamiento simulado y cómo se calcula la disponibilidad por franja horaria.
- Minutos de tolerancia.
- Granularidad de los desplegables de hora (¿cada 15/30 min?) e interpretación de "rango de 24 h".
- ¿Una sola reserva activa por usuario?
- Cantidad de cuentas precargadas y cómo se las entregamos a U1–U3.
- ¿Guardamos un log interno de eventos con timestamps (login, reserva creada, cancelada, "Llegué") para apoyar las métricas? (La observación sigue siendo humana.)
- Hosting gratuito que **no pierda el archivo SQLite** entre reinicios/deploys durante al menos 2 semanas (muchos free tiers tienen disco efímero). Proponé opciones.

## Condiciones no negociables
- Un usuario real tiene que poder completar: login → reservar → ver QR → (registrar llegada) → cancelar, sin ayuda del equipo.
- Textos de la UI en español rioplatense, claros, sin jerga técnica.
- Sin datos personales reales en el repo (usuarios identificados como U1, U2, U3).
- Nada fuera del scope. Si creés que algo falta, proponelo y esperá aprobación.

## Versionado y trazabilidad (lo va a auditar el TP6/TP7)
- Commits pequeños y descriptivos; los que incorporen material generado con IA llevan **`(AI-assisted)`** en el mensaje.
- Cada **decisión estructural que tomes vos** y no el equipo (framework, librerías, forma de guardar datos, organización de archivos, hosting) se anota en el mensaje del commit **y** en `docs/prompts.md`, indicando "decidido por la IA" vs "decidido por el equipo".
- Agregá a `docs/prompts.md` una entrada con fecha para este prompt y para cada prompt siguiente.
- **No toques:** `docs/brief.md`, el punto 1 del TP5 (métricas y criterio de éxito) ni `docs/evidencia/`. Eso lo escribe el equipo.
- Incluí un `README` en `src/` (o en la raíz) con: cómo correr local, cómo cargar el seed de usuarios, cómo desplegar y la URL del MVP.

## Entregables de esta tarea
1. Plan + preguntas abiertas (esperar aprobación).
2. MVP funcionando en `src/`, con seed de usuarios y datos.
3. Despliegue con URL pública, probado desde un celular (viewport mobile).
4. Checklist final: recorrer el flujo completo en mobile y confirmar cada punto del scope, las correcciones H4/H10, el botón "Llegué" y que los datos persisten tras reiniciar el servidor.
