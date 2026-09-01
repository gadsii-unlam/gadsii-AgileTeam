# Brief de Producto — Unlam Parking

| | |
|---|---|
| **Versión** | 3.0 |
| **Fecha** | 01/09/2026 |
| **Equipo** | Agile Team |
| **Materia** | Gestión Aplicada al Desarrollo de Software II (3665) |
| **Cátedra** | Departamento de Ingeniería e Investigaciones Tecnológicas — Ingeniería Informática, UNLaM |
| **Origen** | TP 2 - Análisis de Usuarios e Hipótesis de Valor |

---

## Cambios respecto de la versión anterior

Esta versión incorpora los resultados del relevamiento realizado con usuarios reales para el TP2. Los cambios principales son:

- **El perfil de usuario hipotético fue reemplazado por el perfil real**, construido a partir de entrevistas no estructuradas realizadas por Microsoft Teams a tres usuarios del grupo primario (identificados como U1, U2 y U3, siguiendo el criterio de anonimización exigido: el repositorio es público y las personas entrevistadas no pertenecen a la materia).
- Se agregan explícitamente las **necesidades, problemas y contexto de uso** relevados, que antes no estaban documentados con este nivel de detalle.
- Se actualiza el **estado de los siete supuestos** definidos en el TP1: tres fueron confirmados y dos refutados con evidencia de las entrevistas, y dos quedan sin evidencia por ahora.
- Se agrega la **hipótesis de valor**, que sintetiza el trabajo de relevamiento y va a guiar lo que se construya en el TP3.
- Se revalida el **usuario primario**: los tres entrevistados fueron estudiantes, pero surgieron respuestas de docentes en la publicación de LinkedIn, por lo que el segmento (alumnos, docentes, no docentes e invitados) se mantiene sin cambios.
- El supuesto crítico (S2) queda **confirmado**, lo cual sostiene la razón de ser del producto.

---

## 1. Segmento

Apuntamos a las personas de la comunidad UNLaM que **llegan al predio en vehículo propio y usan el estacionamiento de la institución**: alumnos, docentes, no docentes e invitados.

> *Invitado*: persona que no estudia ni trabaja en la universidad, pero que asiste al Teatro por alguna función o evento.

**Por qué elegimos este segmento:**

- **El dolor es diario y medible.** Aproximadamente 1.500 personas dejan su vehículo en el estacionamiento cada día y cada una de ellas tiene que buscar lugar durante varios minutos, lo que provoca que lleguen tarde a clases, entrenamientos o funciones.
- **Lo conocemos de primera mano.** Todos los integrantes del equipo formamos parte del segmento en algún momento, así que entendemos lo que vale llegar al estacionamiento y no tener que pelear por un lugar.
- **Es un segmento accesible.** Los usuarios están físicamente en el mismo predio donde cursamos, lo que nos permite observarlos, entrevistarlos y testear el producto sin fricción logística.

**Contacto con usuarios reales:** se contactaron potenciales usuarios mediante una publicación en LinkedIn. Varias personas respondieron, pero no todas estaban disponibles para las instancias de entrevista propuestas; con tres de ellas se avanzó y se realizaron entrevistas individuales por Microsoft Teams, de aproximadamente 15 minutos cada una. Las transcripciones se dejaron como evidencia en `docs/evidencia/tp2/`. Los usuarios se identifican como **U1, U2 y U3** para mantener la confidencialidad.

---

## 2. Producto

### Nombre

**Unlam Parking**

### Problema que resuelve

Hoy, quien llega al predio en vehículo propio no tiene forma de saber si hay lugar disponible antes de entrar. El resultado es una búsqueda a ciegas dando vueltas por el estacionamiento que cuesta minutos valiosos y termina en llegadas tarde a clases, funciones o al trabajo. A eso se suma que personas ajenas a la universidad ocupan plazas que deberían ser para la comunidad, agravando la escasez.

### A quién le resuelve

A cualquier persona que realiza una actividad en la UNLaM y necesita dejar su vehículo en el estacionamiento: alumnos, docentes, no docentes e invitados al Teatro.

### Propuesta de valor

Con Unlam Parking se evita la demora para estacionar reservando un lugar desde el celular antes de llegar. Además, el sistema garantiza que nadie externo a la comunidad UNLaM pueda ocupar una plaza y retirarse del predio.

---

## 3. Funcionalidades core

1. **Reservar un lugar** en el estacionamiento.
2. **Cancelar una reserva** ya realizada.
3. **Ver la disponibilidad** de lugares en el estacionamiento.
4. **Distinguir tipos de vehículo** (auto, moto, bicicleta, etc.).
5. **Penalizar a quien incumple** la reserva.

> ⚠️ Sobre el punto 5: el relevamiento del TP2 (supuesto S6) sugiere que la penalización, por sí sola, podría no alcanzar como incentivo para que los usuarios respeten o cancelen a tiempo sus reservas — ver sección de Supuestos. Esto no se elimina del alcance, pero se marca como un punto a revisar en el diseño, ya que quizás requiera complementarse con otro mecanismo (recordatorios, ventanas de gracia, etc.).

---

## 4. Integraciones previstas

| Sistema | Qué implica |
|---|---|
| **Estacionamiento** | Vincular la app con un lector de código QR y con la barrera del estacionamiento de la UNLaM, para validar la reserva en el ingreso. |
| **Teatro** | Como los invitados también pueden usar el estacionamiento, deben poder seleccionar desde la app el evento al que asisten; eso requiere integrarse con el sistema del Teatro. |

> ⚠️ La autorización y viabilidad técnica de ambas integraciones (supuesto S5) sigue sin evidencia — no hubo aún respuesta de las autoridades de la universidad al respecto. Es un riesgo abierto para el producto.

---

## 5. Usuario primario: perfil real

El usuario primario es el **usuario que reserva**. El relevamiento con U1, U2 y U3 confirma que este es el grupo correcto: es el perfil que sufre el problema con mayor frecuencia (todos los días de cursada), en el horario de mayor congestión, y con la consecuencia más concreta: llegar tarde a clase.

### Quiénes son

Los tres usuarios entrevistados son estudiantes de la UNLaM que cursan en el turno nocturno y viajan a la universidad en su propio vehículo (auto/moto). Llevan siempre su celular (iOS o Android) con conexión a internet mediante datos móviles. Dejan el vehículo en el estacionamiento del predio, asisten a sus actividades (clases) y luego regresan a buscarlo para volver a su hogar.

Si bien los tres entrevistados son estudiantes, hubo respuestas de docentes en la publicación de LinkedIn, por lo que se considera que el segmento (alumnos, docentes, no docentes e invitados) sigue siendo válido; el usuario primario para el diseño puntual sigue siendo el estudiante que cursa de noche.

### Necesidades reales

- Saber, con certeza, que va a encontrar lugar para estacionar — independientemente del día, horario o evento.
- Demorar menos de 5 minutos en estacionar su vehículo, para no depender de salir con mucha anticipación de su casa o trabajo.

### Problemas y frustraciones concretas

- Demoras reales de entre 5 y 20 minutos en encontrar un lugar, que en varios casos provocaron llegadas tarde a clase.
- La mayor demora está en la **fila previa a la barrera de ingreso** (entre 5 y 10 minutos solo para entrar), antes incluso de empezar a buscar un lugar disponible.
- Para compensar la incertidumbre, salen antes de lo necesario de sus casas o trabajos, lo que les genera un costo de tiempo y estrés adicional aunque el estacionamiento no esté lleno.
- En casos extremos, tuvieron que dejar el vehículo **fuera** del predio, con el riesgo que eso implica — se registró un caso concreto de robo de vehículo por esta razón.
- Percepción de que personas ajenas a la universidad utilizan el estacionamiento y luego se retiran del predio sin haber realizado ninguna actividad en él, agravando la escasez de lugares.

### Contexto de uso

- Viajan solos, en su propio vehículo, mayormente en el turno noche.
- Llevan siempre el celular encima (iOS o Android) con datos móviles activos; no reportaron problemas de conectividad en la zona de ingreso.
- El momento de mayor tensión es al llegar al predio: con el tiempo ya ajustado para llegar a horario a clase, sin saber de antemano si van a encontrar lugar.
- El uso de la app se daría antes de salir de casa/trabajo (para hacer la reserva) y nuevamente al llegar al predio (para validar el ingreso).

---

## 6. Hipótesis de valor

> **Creemos que** un estudiante (o docente) de la UNLaM que viaja a la universidad en su propio vehículo, principalmente en el turno nocturno,
>
> **tiene el problema de** no saber si va a encontrar lugar para estacionar y, cuando lo encuentra, demorar entre 5 y 20 minutos en lograrlo —principalmente por la fila previa a la barrera de ingreso—, lo que lo obliga a salir con anticipación de su casa o trabajo, le genera estrés durante el viaje, y en casos extremos lo lleva a dejar el vehículo fuera del predio, con el riesgo de robo que eso implica,
>
> **Nuestra solución es** una aplicación móvil que permite reservar de antemano un lugar de estacionamiento dentro del predio universitario, garantizando al usuario que va a encontrar dónde estacionar sin depender del día ni del horario, y agilizando el ingreso al estacionamiento,
>
> **Sabremos que estamos en lo correcto cuando** los usuarios que reserven su lugar logren estacionar en menos de 5 minutos desde su llegada al predio (frente a los 5-20 minutos actuales), y reporten una reducción en la necesidad de salir con anticipación o en el estrés asociado a no saber si van a encontrar lugar.

Esta hipótesis se va a trabajar y refinar en la clase del 01/09, y va a determinar qué se construye en el TP3.

---

## 7. Supuestos — estado actualizado tras el relevamiento

| # | Supuesto | Estado (TP1) | Estado (TP2) | Evidencia |
|---|---|---|---|---|
| S1 | Los usuarios que acuden en vehículo propio también cuentan con celular para hacer las reservas. | Sin validar | ✅ **Confirmado** | U3: coincide en que la mayoría de las personas van con esa posibilidad (dispositivo móvil disponible). |
| **S2** | **A los usuarios del estacionamiento hoy les cuesta entre 5 y 10 minutos encontrar un lugar para estacionar.** | 🔴 Crítico — Sin validar | ✅ **Confirmado** (🔴 crítico) | U1: hasta 20 minutos en el peor caso. U2: entre 5 y 10 minutos por la fila de ingreso. U3: entre 10 y 15 minutos si llegan justos de horario. |
| S3 | Personas externas a la universidad utilizan el estacionamiento cuando no deberían. | Sin validar | ✅ **Confirmado** | U1: escuchó casos de personas que estacionan y se retiran del predio. U2: reportó que le parecería bien limitar el uso solo a personas de la facultad, porque hoy lo usa gente ajena. |
| S4 | No siempre hay buena conexión a Internet en la entrada al estacionamiento. | Sin validar | ❌ **Refutado** | Pruebas propias del equipo: buena conexión utilizando datos móviles en la zona de ingreso. |
| S5 | La universidad va a autorizar y habilitar técnicamente la integración con la barrera del estacionamiento y con el sistema del Teatro. | Sin validar | ⚪ **Sin evidencia** | No hubo aún respuesta de las autoridades de la universidad al respecto. |
| S6 | La penalización por incumplimiento alcanza como incentivo para que los usuarios respeten sus reservas o las cancelen a tiempo. | Sin validar | ❌ **Refutado** | U3: considera que no va a funcionar, porque habitualmente hay imprevistos cotidianos que hacen llegar tarde (o directamente no llegar) a la facultad. |
| S7 | Aproximadamente 1.500 vehículos utilizan diariamente el estacionamiento de la universidad. | Sin validar | ⚪ **Sin evidencia** | No se obtuvieron datos oficiales ni mediciones propias todavía. |

### Qué apareció que no habíamos previsto

- La necesidad de los usuarios no es únicamente encontrar estacionamiento rápido, sino tener **certeza previa** de que van a encontrarlo — esa incertidumbre les genera un estrés adicional durante el viaje, incluso antes de llegar al predio.
- El caso concreto de un estudiante que sufrió el **robo de su vehículo** por haberlo dejado fuera del estacionamiento por falta de lugar. Este riesgo no estaba contemplado en ningún supuesto del TP1 y refuerza fuertemente la propuesta de valor.

### Qué pasó con el supuesto crítico (S2)

Quedó **confirmado**: es común tardar entre 5 y 10 minutos, y en ocasiones más, para encontrar lugar dentro del predio. Esto sostiene la razón de ser del producto — sin esta demora real, reservar desde el celular no aportaría ningún beneficio.

### ¿El usuario primario elegido en el TP1 sigue siendo el correcto?

Sí. Los tres usuarios entrevistados son estudiantes, lo cual valida el perfil elegido. Además, hubo respuestas de docentes en la publicación de LinkedIn, lo que indica que el problema también los afecta y que el segmento definido (alumnos, docentes, no docentes e invitados) sigue siendo válido sin necesidad de acotarlo.

---

## 8. Grupos de usuarios

| Grupo | Descripción | ¿En el MVP? |
|---|---|---|
| **Usuarios que reservan** | Estudiantes, docentes e invitados que acuden a la universidad en vehículo propio. | Sí |
| **Administrador del sistema** | Empleados de la universidad que asignan las plazas disponibles y configuran parámetros como el tiempo de reserva. | Sí |
| **Empleado de seguridad** | Mecanismo alternativo de control de reservas cuando el usuario no logra levantar la barrera. | No (fuera del MVP) |

La pregunta sobre tipo de dispositivo relevada en el contacto inicial por LinkedIn indicó una mezcla de iOS y Android entre los potenciales usuarios; es un primer insumo para definir plataformas de desarrollo, aunque todavía no alcanza como muestra representativa de todo el segmento.
