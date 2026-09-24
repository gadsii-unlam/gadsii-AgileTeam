# Evaluación heurística — QuickMap, Alternativa C (Satisfacción)

Evaluación del wireframe `wireframe_quickmap.html` (3 pantallas) según las 10 heurísticas de Nielsen. P1, P2 y P3 refieren a las pantallas 1, 2 y 3.

**Escala de severidad**

1. Cosmético: no es necesario corregirlo salvo que sobre tiempo.
2. Menor: baja prioridad de corrección.
3. Mayor: alta prioridad, impacta la experiencia del usuario.
4. Catastrófico: debe corregirse antes de avanzar.

| Nº | Heurística incumplida | Descripción del problema | Sev. | Mejora sugerida |
|---|---|---|:-:|---|
| 1 | H7 · Flexibilidad y eficiencia de uso | **P1.** Elegir carrera y luego pulsar "Ver plan" son dos pasos para una sola decisión (el flujo del brief carga el mapa al elegir). El desplegable no tiene búsqueda, aunque la UNLaM tiene muchas carreras, y no recuerda la última carrera elegida. | 2 | Cargar el mapa al seleccionar la carrera, eliminando el botón. Agregar buscador dentro del selector y recordar la última carrera para quien vuelve. |
| 2 | H1 · Visibilidad del estado del sistema | **P1.** El botón "Ver plan" aparece deshabilitado (opacidad 45%) sin indicar por qué. La pantalla tampoco presenta QuickMap ni qué va a pasar después. | 1 | Texto de apoyo ("Elegí una carrera para ver tu plan") y una línea breve de contexto sobre qué es QuickMap. |
| 3 | H2 · Coincidencia entre el sistema y el mundo real | **P2.** Los planes de estudio se conocen por año y cuatrimestre, pero los nodos están dispuestos sin esa estructura (Física I aparece al final de la cadena). Los nombres están abreviados ("Sist. y org."). | 2 | Organizar el mapa en columnas por año/cuatrimestre y usar los nombres oficiales del plan (abreviados solo con tooltip o detalle). |
| 4 | H6 · Reconocimiento antes que recuerdo | **P2 y P3.** Las conexiones no tienen flecha, así que el usuario debe deducir cuál materia es requisito de cuál. Es información clave de las correlatividades. | 3 | Agregar puntas de flecha (o convención explícita de dirección) y resaltar las aristas de una materia al seleccionarla. |
| 5 | H6 · Reconocimiento antes que recuerdo | **P2.** Nada indica que los nodos sean tocables. La única guía es un texto al pie que desaparece en P3, y la leyenda de colores tampoco aparece hasta P3. Quien vuelve tras semanas no tiene ayuda visible. | 2 | Dar a los nodos aspecto interactivo (checkbox o ícono de tilde). Mantener una instrucción breve y una leyenda compacta, colapsable, visibles en P2 y P3. |
| 6 | H1 · Visibilidad del estado del sistema | **P2 y P3.** No se muestra qué carrera ni qué versión del plan se está viendo. Ante planes con cambios (supuesto 5 del brief) el usuario no puede saber si mira el plan correcto. | 3 | Encabezado persistente con carrera y plan/año, más la opción "Cambiar carrera". |
| 7 | H3 · Control y libertad del usuario | **P2 y P3.** No hay botón para volver, cambiar de carrera, reiniciar las marcas ni deshacer. Con guardado automático, un toque accidental (fácil en celular) queda registrado sin salida. | 3 | Agregar "Volver/Cambiar carrera", "Reiniciar" y un aviso con "Deshacer" durante unos segundos tras cada cambio. |
| 8 | H7 · Flexibilidad y eficiencia de uso | **P2 y P3.** El mapa de 5 nodos no muestra cómo escala a un plan real de 30 a 40 materias, y no se prevé zoom, desplazamiento ni filtros. En celular (contexto de uso frecuente según el brief) sería ilegible. | 3 | Diseñar y validar con un plan real completo. Agregar zoom/pan, foco por año y, en móvil, una vista alternativa por columnas. |
| 9 | H4 · Consistencia y estándares (accesibilidad) | **P2 y P3.** Las fuentes de nodos y leyenda son de 8 a 11 px. Los nodos miden unos 40 px de alto, por debajo de los 44 px recomendados para tocar. El texto gris de "Guardado automático" tiene bajo contraste. | 3 | Mínimo de 12 a 14 px en textos, áreas táctiles de 44 px o más, y contraste mínimo 4.5:1 (WCAG AA). |
| 10 | H2 · Coincidencia entre el sistema y el mundo real | **P3.** "Camino crítico" (rojo) y "estado" (verde, azul, gris) comparten el canal de color y se excluyen entre sí. "Sist. y org." aparece en rojo, pero como depende de Análisis II (solo habilitada), en realidad está bloqueada. El usuario no puede saber si una materia crítica se puede cursar ya. Además, el rojo suele leerse como error o peligro, no como "prioridad". Esta es la funcionalidad central de la hipótesis (80% de uso del camino crítico en el TP5). | 4 | Separar dimensiones: el relleno indica el estado (aprobada, habilitada, bloqueada con candado) y el camino crítico se marca con otro canal (borde grueso, ícono o etiqueta "Prioridad", aristas destacadas). Usar un color de prioridad que no se confunda con error. |
| 11 | H4 · Consistencia y estándares | **P3.** "Bloqueada" (#e2e0d9) es casi idéntica al estado neutro (#e4e2db), y en el mapa no hay ningún nodo gris. Física I está bloqueada pero se ve neutra. "Habilitada", el estado más accionable, se distingue solo por un borde azul oscuro poco saliente. | 3 | Un estilo inequívoco por estado: bloqueada con ícono de candado y texto atenuado, habilitada con relleno o acento claramente visible. Verificar que todos los nodos usen un estado de la leyenda. |
| 12 | H4 · Consistencia y estándares (accesibilidad) | **P3.** El significado depende solo del color (rojo/verde). Las personas con daltonismo rojo-verde no distinguen aprobada de camino crítico. | 3 | Redundar con ícono o patrón (tilde, candado, flecha) y texto en cada estado. |
| 13 | H6 · Reconocimiento antes que recuerdo | **P3.** El toque sobre un nodo está reservado para "marcar aprobada". No hay forma de consultar las correlativas de una materia (funcionalidad core 1 del brief) sin marcarla, y no existe un detalle de materia. | 3 | Separar acciones: tocar el nodo abre un detalle (correlativas, a qué habilita) y un control específico (tilde) marca la materia. |
| 14 | H5 · Prevención de errores | **P3.** Se puede marcar como aprobada una materia cuyos requisitos no están aprobados, generando estados incoherentes. Desmarcar una correlativa deja dependientes marcadas sin aviso. Todo se guarda al instante, sin confirmación. | 3 | Marcar en cascada los prerrequisitos (con aviso) o impedir marcar nodos bloqueados. Advertir al desmarcar una materia con dependientes aprobadas. |
| 15 | H1 · Visibilidad del estado del sistema | **P3.** El contador dice "4" materias para cursar, pero el mapa muestra una sola habilitada (Análisis II). La incongruencia resta credibilidad. Además el número no es interactivo ni lista cuáles son, y la redacción "materias podés cursar" es incorrecta. | 3 | Derivar el contador del estado real, hacerlo tocable para resaltar/listar esas materias e indicar cuáles pertenecen al camino crítico. Corregir el texto ("Podés cursar 4 materias el próximo cuatrimestre"). |
| 16 | H1 · Visibilidad del estado del sistema | **P3.** El recálculo "en vivo" no muestra qué cambió tras cada tilde. Sin animación ni resaltado, el usuario no percibe qué materias se habilitaron ni por qué. | 2 | Resaltar brevemente los nodos que cambian de estado y mostrar la variación del contador ("+2 habilitadas"). |
| 17 | H1 · Visibilidad del estado del sistema | **P3.** "Guardado automático" promete persistencia, pero el MVP excluye el login. Sin cuenta, el progreso queda solo en el dispositivo y puede perderse (o no verse en el otro dispositivo, aunque se usan celular y PC). El flujo del brief además habla de "guardar", que el wireframe elimina. | 3 | Indicar dónde se guarda ("Guardado en este dispositivo") y advertir la limitación. Ofrecer exportar o compartir un enlace de estado, y alinear el brief y el wireframe en este punto. |
| 18 | H10 · Ayuda y documentación | **P3.** "Camino crítico" es un término técnico sin explicación, y el brief indica que los ingresantes no entienden bien las correlativas. Nada aclara qué significa ni por qué conviene priorizar esas materias. | 3 | Tooltip o "¿Qué es?" junto a la leyenda con una frase en lenguaje llano ("materias que desbloquean más materias"). Sumar un onboarding mínimo de un solo uso. |
| 19 | H7 · Flexibilidad y eficiencia de uso | **P2 y P3.** Marcar materias una por una es lento para un alumno de 2° año con 15 o más aprobadas. No hay atajo por año o cuatrimestre. | 2 | "Marcar todo el año/cuatrimestre" y selección múltiple. |
| 20 | H9 · Ayudar a reconocer, diagnosticar y recuperarse de errores | **P1 a P3.** No están diseñados los estados de carga, error o vacío (plan no disponible, datos desactualizados). El plan viene de un scraping estático que puede quedar desfasado. | 2 | Definir pantallas de carga y error con mensaje claro y salida. Mostrar la fecha de actualización del plan, con un enlace para reportar diferencias. |

## Resumen por severidad

1 catastrófico (Nº 10), 12 mayores, 6 menores y 1 cosmético.

## Prioridades antes de seguir

- **Nº 10:** rediseñar la codificación de estado y camino crítico. Si no se entiende el camino crítico, el TP5 no puede validar la hipótesis de valor.
- **Nº 15, 17 y 6:** los tres afectan la confianza del usuario (contador incoherente, persistencia dudosa y carrera/plan sin visibilidad).
- **Nº 8 y 9:** resolverlos antes de prototipar, porque condicionan la estructura del mapa.

## Limitaciones y desalineaciones con el brief

- Es una evaluación de un solo evaluador sobre un wireframe estático. Nielsen recomienda 3 a 5 evaluadores para cubrir más problemas.
- El brief dice que al cargar el mapa ya se muestra el camino crítico en rojo (flujo, paso 4), pero P2 lo muestra neutro. Conviene decidir cuál de las dos versiones es la correcta.
- Los estados "Cursando" y "Regular" de la funcionalidad core 2 no aparecen en la leyenda. Puede ser una simplificación válida para el MVP, pero conviene dejarla documentada.
