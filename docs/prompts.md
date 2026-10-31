# Registro de trabajo con IA

| Fecha | Herramienta y versión | Prompt (resumen) | TP |
|---|---|---|---|
|25/08/2026| Claude Opus 5 | Consolidar el contenido del TP1 en un brief de producto V1 siguiendo la estructura y los contenidos exigidos por la consigna del punto 6. Adjuntamos pdf de consigna y el pdf de resolución del TP | TP 1 |
|01/09/2026| Claude Sonnet 5 | Consolidar el contenido del TP2 en un brief de producto siguiendo la estructura y los contenidos exigidos por la consigna del punto 6. Adjuntamos pdf de consigna y el pdf de resolución del TP | TP 2 |
|08/09/2026| Claude Sonnet 5 | Consolidar el contenido de la parte 1 del TP3 en un brief de producto siguiendo la estructura y los contenidos exigidos por la consigna del punto 5. Adjuntamos pdf de consigna y el pdf de resolución del TP | TP 3 |
|08/09/2026| Claude Sonnet 5 | En base al brief que te adjunto, quiero que crees tres estructuras diferentes para el mismo flujo principal, destacando en cada una un atributo de usabilidad diferente. En la primera destaca la facilidad de aprendizaje, en la segunda recuerdo en el tiempo y en la tercera eficiencia | TP 3 |
|08/09/2026| Claude Sonnet 5 | Crea un wireframe de baja fidelidad como HTML navegable para la alternativa B que contenga estructura de pantallas, jerarquía de información, navegación y flujo. Sin diseño visual, colores ni estilos definitivos. Debe incluir las 4 pantallas del flujo principal del MVP y las conexiones y navegación entre ellas. También deja anotaciones que expliquen las decisiones de diseño | TP 3 |
|16/09/2026| Claude Sonnet 5 | Recorre el wireframe recibido aplicando las heurísticas de Nielsen y documentar cada problema encontrado en la siguiente tabla: Número, Heurística incumplida, Descripción del problema, Severidad (1-4), Mejora sugerida. Ten en cuenta la siguiente escala de severidad: Cosmético — no es necesario corregirlo salvo que sobre tiempo. Menor — baja prioridad de corrección. Mayor — alta prioridad, impacta la experiencia del usuario. Catastrófico — debe corregirse antes de avanzar | TP 4A |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Construir desde cero en `src/` el MVP de Unlam Parking para el TP5 (prompt completo en `prompt-mvp-tp5.md`): leer todo `docs/`, señalar contradicciones y entregar primero un plan (stack, estructura, modelo de datos, pantallas, endpoints, despliegue) con la lista de preguntas abiertas, sin codear hasta su aprobación | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Respuesta al plan: se resuelven las contradicciones con la propuesta de la IA, se reemplaza el QR por el botón "Llegué", la sesión se recuerda 5 días, el usuario es el correo UNLaM y la ocupación de cada franja se comparte y se muestra. Consultas sobre hash de contraseñas y Cloudflare Tunnel | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Sin penalidad (sólo estado informativo, porque está fuera del scope). Consulta sobre mostrar un aviso cuando la PC que aloja la app está apagada | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Se elige publicar desde la PC de un integrante con Cloudflare quick tunnel y se aprueba empezar a codear | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Generar un código QR con la URL pública al publicar, para compartir el link | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Resolver el error 1033 de Cloudflare al entrar a la URL pública | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Cómo entrar a la base de datos y ejecutar consultas | TP 5 |
|31/10/2026| Claude Opus 5.5 (Claude Code) | Documentar en el README todos los comandos e instalaciones necesarios (Windows y Linux) para que cualquier integrante pueda correr la app y abrir el link público o de desarrollo; proponer un mensaje de commit | TP 5 |

## Decisiones del MVP (TP5)

| Decisión | Decidido por |
|---|---|
| Web mobile-first instalable como PWA, con URL pública | Equipo |
| Node.js en el backend con SQLite como persistencia | Equipo |
| Seguir la alternativa B del wireframe (Inicio con estado, una sola pantalla de reserva) | Equipo |
| Botón "Llegué" para registrar la llegada, en reemplazo del QR (lector y barrera fuera del MVP) | Equipo |
| Sin penalidad: si no se registra la llegada a tiempo sólo se muestra un aviso informativo y el lugar no se libera | Equipo |
| Sesión recordada 5 días sin uso (aprox. un login por semana) | Equipo |
| Usuario = correo UNLaM (`inicialApellido@alumno.unlam.edu.ar` / `@unlam.edu.ar` para docentes) | Equipo |
| Ocupación compartida entre todos los usuarios, visible por franja | Equipo |
| Hosting: PC de un integrante + Cloudflare quick tunnel (la URL cambia en cada publicación) | Equipo |
| Contradicciones entre `docs/` y el prompt: gana la alternativa B sobre el flujo del brief §11, sin pantalla de administración, login validado con mensaje de error (H9), botón "Continuar", sólo correcciones H4/H9/H10 | Propuesto por la IA, aprobado por el equipo |
| Capacidad de 15 lugares por franja de llegada, franjas independientes; ocupación simulada de "otros usuarios" | Propuesto por la IA, aprobado por el equipo |
| Tolerancia de 15 minutos; franjas cada 30 min; reservas desde 15 min hasta 24 h hacia adelante; horario 07:00–22:30; domingos cerrado | Propuesto por la IA, aprobado por el equipo |
| Una sola reserva activa por usuario; "Llegué" habilitado desde 60 min antes; no se puede cancelar después de llegar o de vencida la tolerancia | Propuesto por la IA, aprobado por el equipo |
| Log interno de eventos (login, login fallido, reserva creada/cancelada, "Llegué", cierre de sesión) exportable a CSV | Propuesto por la IA, aprobado por el equipo |
| Contraseñas con hash bcrypt en la base; cookie de sesión HttpOnly con el hash del token guardado en la base | Propuesto por la IA, aprobado por el equipo |
| Express 5 como framework web y pantallas renderizadas en el servidor con plantillas EJS (sin framework de front ni build) | IA |
| Módulo `node:sqlite` incluido en Node (en lugar de `better-sqlite3`), para no compilar módulos nativos | IA |
| Organización de `src/`: `dominio/` (lógica propia), `vistas/`, `public/`, `db/`, `scripts/`, `test/`; datos en `src/data/` fuera del repo | IA |
| Contraseñas del seed generadas al azar y guardadas en `src/data/credenciales.txt` (fuera del repo); nombres de cuentas ficticios | IA |
| Script `npm run publicar` que hace backup, levanta servidor y túnel y guarda la URL; servidor escuchando sólo en 127.0.0.1 | IA |
| Límite de intentos de login, cabeceras de seguridad (CSP) y service worker que no guarda datos de reservas | IA |
| Tests con `node:test` (lógica de disponibilidad/reservas y recorrido completo por HTTP) | IA |
| QR con la URL pública en la terminal y en `data/url-publica.png` al publicar, con la librería `qrcode` (herramienta del equipo para compartir el link; la app no muestra QR) | Propuesto por la IA, aprobado por el equipo |
| Script de publicación escrito en Node (no en bash) para que funcione igual en Windows y Linux; verifica que el puerto esté libre, carga las cuentas si faltan y avisa si se cae el servidor o el túnel | IA |
