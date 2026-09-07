# Alternativas de diseño — Flujo principal del MVP

Tres estructuras distintas para el mismo flujo (login → reservar → confirmar → validar ingreso con QR), cada una privilegiando un atributo de usabilidad diferente. Es la primera propuesta recibida de Claude a partir del brief.

---

## Alternativa A — Privilegia la facilidad de aprendizaje

**Pantallas principales:**

1. **Login** — usuario y contraseña.
2. **Menú principal** — con ayuda contextual visible (qué hace cada botón).
3. **Elegir fecha** — pantalla dedicada, paso 1 de 2, con instrucción explícita.
4. **Elegir hora** — pantalla dedicada, paso 2 de 2.
5. **Confirmación** — resumen de lo elegido + explicación de qué hacer después (ir a "Reservas solicitadas" cuando llegue al predio).

**Navegación:** lineal, un paso por pantalla, sin retrocesos ni pantallas combinadas. Cada pantalla tiene un único objetivo.

**Anotaciones:**
- Separar fecha y hora en dos pantallas reduce la cantidad de decisiones simultáneas que el usuario debe entender la primera vez.
- El resumen final antes de dar por hecha la reserva funciona como confirmación explícita y como oportunidad de corregir sin ambigüedad.
- Costo: son más taps y más pantallas que las otras dos alternativas — más lento en usos repetidos.

---

## Alternativa B — Privilegia el recuerdo en el tiempo

**Pantallas principales:**

1. **Login** — sesión recordada (no requiere reingresar credenciales seguido).
2. **Inicio** — muestra el estado actual de un vistazo: "sin reserva activa" o "reserva activa: [fecha/hora]", con un único botón cuya acción cambia según el estado.
3. **Reservar** — fecha y hora en una misma pantalla.
4. **Confirmación y QR** — mismo patrón visual siempre, se accede al QR desde el mismo lugar que la reserva.

**Navegación:** pocas pantallas, todas con el mismo patrón de layout. La pantalla de inicio es también la pantalla de estado, así el usuario no tiene que recordar "a qué menú ir" para ver su reserva o para reservar.

**Anotaciones:**
- Reducir la cantidad de pantallas y patrones distintos minimiza lo que el usuario tiene que volver a aprender si no usa la app todos los días.
- Que el estado se vea directamente en el inicio (en vez de detrás de un botón "Reservas solicitadas") apoya el reconocimiento por sobre el recuerdo.
- Costo: al combinar fecha y hora en una sola pantalla, un usuario totalmente nuevo puede necesitar un poco más de orientación la primera vez que la alternativa A.

---

## Alternativa C — Privilegia la eficiencia

**Pantallas principales:**

1. **Login automático** — sin pasos adicionales de por medio.
2. **Inicio: reserva rápida** — fecha, hora y disponibilidad conviven en la misma pantalla, sin navegar a un formulario aparte.
3. **Confirmación inline** — la confirmación aparece dentro de la misma pantalla (por ejemplo, como un mensaje o banner), sin abrir una pantalla nueva.
4. **QR directo** — accesible de inmediato desde el inicio, sin pasar por un menú intermedio.

**Navegación:** todo el flujo ocurre prácticamente en una sola pantalla (inicio), con mínima cantidad de transiciones.

**Anotaciones:**
- Concentrar reserva, confirmación y acceso al QR en la misma pantalla reduce la cantidad de taps y de tiempo total, algo relevante para un usuario que llega justo de horario.
- Costo: al mostrar más información y opciones juntas, la pantalla es más densa y menos "a prueba de errores" para un usuario que la usa por primera vez — hay menos guía explícita paso a paso.

---

## Selección de la Propuesta Final

De las tres alternativas se seleccionó la **alternativa B** como propuesta final.
