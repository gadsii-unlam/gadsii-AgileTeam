# Brief de Producto — Unlam Parking

| | |
|---|---|
| **Versión** | 2.1 |
| **Fecha** | 31/08/2026 |
| **Equipo** | Agile Team |
| **Materia** | Gestión Aplicada al Desarrollo de Software II (3665) |
| **Cátedra** | Departamento de Ingeniería e Investigaciones Tecnológicas — Ingeniería Informática, UNLaM |
| **Origen** | TP 1 - Reentrega|

---

## Cambios respecto de la versión anterior

Se confirma la disponibilidad de U1, U2 y U3 para dos reuniones: Una la ultima semana de agosto y la siguiente en la ultima semana de septiembre.

---

## 1. Segmento

Apuntamos a las personas de la comunidad UNLaM que **llegan al predio en vehículo propio y usan el estacionamiento de la institución**: alumnos, docentes, no docentes e invitados.

> *Invitado*: persona que no estudia ni trabaja en la universidad, pero que asiste al Teatro por alguna función o evento.

**Por qué elegimos este segmento:**

- **El dolor es diario y medible.** Aproximadamente 1.500 personas dejan su vehículo en el estacionamiento cada día y cada una de ellas tiene que buscar lugar durante varios minutos, lo que provoca que lleguen tarde a clases, entrenamientos o funciones.
- **Lo conocemos de primera mano.** Todos los integrantes del equipo formamos parte del segmento en algún momento, así que entendemos lo que vale llegar al estacionamiento y no tener que pelear por un lugar.
- **Es un segmento accesible.** Los usuarios están físicamente en el mismo predio donde cursamos, lo que nos permite observarlos, entrevistarlos y testear el producto sin fricción logística.

**Contacto con usuarios reales:** se contactaron tres potenciales usuarios mediante una publicación en LinkedIn — los llamamos **U1, U2 y U3**. Ninguno tenía relación previa con los integrantes del equipo. Los tres son estudiantes de la UNLaM que cursan de noche y dejan su auto en el estacionamiento, y los tres reportaron haber pasado mucho tiempo buscando lugar, e incluso haber llegado tarde a clase por esa razón.

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

---

## 4. Integraciones previstas

| Sistema | Qué implica |
|---|---|
| **Estacionamiento** | Vincular la app con un lector de código QR y con la barrera del estacionamiento de la UNLaM, para validar la reserva en el ingreso. |
| **Teatro** | Como los invitados también pueden usar el estacionamiento, deben poder seleccionar desde la app el evento al que asisten; eso requiere integrarse con el sistema del Teatro. |

---

## 5. Grupos de usuarios y usuario primario

| Grupo | Descripción | ¿En el MVP? |
|---|---|---|
| **Usuarios que reservan** | Estudiantes, docentes e invitados que acuden a la universidad en vehículo propio. | Sí |
| **Administrador del sistema** | Empleados de la universidad que asignan las plazas disponibles y configuran parámetros como el tiempo de reserva. | Sí |
| **Empleado de seguridad** | Mecanismo alternativo de control de reservas cuando el usuario no logra levantar la barrera. | No (fuera del MVP) |

### Usuario primario elegido

El usuario primario es el **usuario que reserva**. Es el perfil que sufre el problema con mayor frecuencia (todos los días de cursada), en el horario de mayor congestión, y con la consecuencia más concreta: llegar tarde a clase.

Se contactó a los potenciales usuarios mediante una publicación en LinkedIn. Varias personas participaron de la encuesta, pero no todas estaban dispuestas a sumarse a las dos instancias de reunión propuestas; con tres de ellas se logró avanzar y agendar encuentros. Estos tres usuarios son:

 * Marcos — estudiante, cursa de noche de lunes a viernes. Disponibilidad confirmada por parte de Marcos para una reunion en la ultima semana de agosto y una en la ultima semana de septiembre.
 * Facundo — estudiante, cursa de noche varias veces por semana. Disponibilidad confirmada por parte de Facundo para una reunion en la ultima semana de agosto y una en la ultima semana de septiembre.
 * Sofía — estudiante, cursa de noche varias veces por semana. Disponibilidad confirmada por parte de Sofía para una reunion en la ultima semana de agosto y una en la ultima semana de septiembre.

La pregunta #3 de la encuesta relevó además el tipo de dispositivo de cada uno: dos usan iPhone con iOS y el restante usa Android. Este dato es un primer insumo para definir para qué plataformas debe desarrollarse la app, aunque todavía no alcanza como muestra representativa de todo el segmento.

> ⚠️ **Esta elección todavía es hipotética.** Está basada en los tres usuarios contactados y en nuestra propia experiencia dentro del segmento, no en investigación validada. Es posible que la validación de los próximos TPs muestre que el dolor más agudo lo tiene otro perfil (por ejemplo, docentes con horarios ajustados entre materias, o invitados al Teatro que no conocen el predio). Si eso ocurre, el usuario primario se redefine y se declara el cambio en la versión siguiente de este brief.

---

## 6. Supuestos

| # | Supuesto | Evidencia para comprobarlo | Estado | 
|---|---|---|---|
| S1 | Asumimos que todos los usuarios que acuden a la universidad en vehículo propio también cuentan con un celular para hacer las reservas. | Resultado de la pregunta #2 de la encuesta realizada por LinkedIn, y del relevamiento de los usuarios del grupo de usuarios primario. | Sin validar |
| **S2** | **Asumimos que a los usuarios del estacionamiento hoy les cuesta entre 5 y 10 minutos encontrar un lugar para estacionar.** |  Resultado de la pregunta #4 de la encuesta realizada por LinkedIn, el relevamiento de los usuarios del grupo de usuarios primario, y el resultado de las mediciones de observaciones directas del tiempo entre la llegada al estacionamiento y el momento en el que el vehículo queda estacionado en distintas franjas horarias y momentos representativos. | 🔴 **CRÍTICO** — Sin validar |
| S3 | Asumimos que personas externas a la universidad utilizan el estacionamiento cuando no deberían (ej.: personas que acuden al Hospital Italiano). |  Respuesta del personal de seguridad a nuestras consultas sobre casos conocidos y resultados de las observaciones en  el estacionamiento que permitan detectar esta situación | Sin validar |
| S4 | Asumimos que no siempre hay buena conexion a Internet en la entrada al estacionamiento de la Universidad | Resultado de las pruebas de conectividad con dispositivos móviles en la entrada al estacionamiento, en distintos momentos y utilizando diferentes  operadores. |Sin validar |
| S5 | Asumimos que la universidad va a autorizar y habilitar técnicamente la integración con la barrera del estacionamiento y con el sistema del Teatro. | Respuesta de las autoridades de la universidad a nuestras consultas sobre la viabilidad y autorización para ambas integraciones. | Sin validar |
| S6 | Asumimos que la penalización por incumplimiento alcanza como incentivo para que los usuarios respeten sus reservas o las cancelen a tiempo. | Opinión de los usuarios del grupo primario durante el relevamiento sobre cómo creen que influiría en su comportamiento la existencia de una penalización por incumplir una reserva | Sin validar |
| S7 | Asumimos que aproximadamente 1.500 vehículos diarios utilizan diariamente el estacionamiento de la universidad. | Datos oficiales de la universidad y resultados de las mediciones de conteos/estimaciones de capacidad y movimiento de ingresos y egresos de vehículos durante jornadas y horarios representativos. | Sin validar |

### 🔴 Supuesto crítico: S2

**S2 es el supuesto crítico porque es el único del que depende la existencia misma del producto.** Todo Unlam Parking se apoya en que hoy existe una demora real y molesta al buscar lugar. Si esa demora no existe, o es de treinta segundos, o solamente aparece unos pocos días al año, entonces reservar desde el celular agrega fricción sin devolver ningún beneficio y el producto no tiene razón de ser. Ninguna funcionalidad, integración ni decisión de diseño lo salva.
