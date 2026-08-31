# Brief de Producto — Unlam Parking

| | |
|---|---|
| **Versión** | 1 |
| **Fecha** | 25/08/2026 |
| **Equipo** | Agile Team |
| **Materia** | Gestión Aplicada al Desarrollo de Software II (3665) |
| **Cátedra** | Departamento de Ingeniería e Investigaciones Tecnológicas — Ingeniería Informática, UNLaM |
| **Origen** | TP 1 |

---

## Cambios respecto de la versión anterior

Esta es la primera versión del brief, así que no hay una versión previa contra la cual contrastar: acá arranca el documento. Nace en el TP 1 y consolida todas las definiciones tomadas hasta ahora — segmento elegido, producto y problema, funcionalidades core, integraciones previstas, grupos de usuarios con el usuario primario y la lista de supuestos con el crítico marcado. Todo lo que sigue es **hipotético y todavía no está validado con usuarios**; se escribe acá justamente para poder confirmarlo o descartarlo en los TPs siguientes. El brief es un documento vivo: cada TP genera una versión nueva que se commitea, y a partir de la versión 2 este mismo párrafo va a declarar qué cambió respecto de la anterior y por qué.

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
| **Usuarios que reservan** | Alumnos, docentes e invitados que acuden a la universidad en vehículo propio. | Sí |
| **Administrador del sistema** | Empleados de la universidad que asignan las plazas disponibles y configuran parámetros como el tiempo de reserva. | Sí |
| **Empleado de seguridad** | Mecanismo alternativo de control de reservas cuando el usuario no logra levantar la barrera. | No (fuera del MVP) |

### Usuario primario elegido

El usuario primario es el **usuario que reserva** y, dentro de ese grupo, el perfil que representan U1, U2 y U3: **estudiante de la UNLaM que cursa de noche y llega al predio en auto propio**. Es el perfil que sufre el problema con mayor frecuencia (todos los días de cursada), en el horario de mayor congestión, y con la consecuencia más concreta: llegar tarde a clase.

> ⚠️ **Esta elección todavía es hipotética.** Está basada en los tres usuarios contactados y en nuestra propia experiencia dentro del segmento, no en investigación validada. Es posible que la validación de los próximos TPs muestre que el dolor más agudo lo tiene otro perfil (por ejemplo, docentes con horarios ajustados entre materias, o invitados al Teatro que no conocen el predio). Si eso ocurre, el usuario primario se redefine y se declara el cambio en la versión siguiente de este brief.

---

## 6. Supuestos

| # | Supuesto | Evidencia para comprobarlo | Estado | 
|---|---|---|---|
| S1 | Asumimos que todos los usuarios que acuden a la universidad en vehículo propio también cuentan con un celular para hacer las reservas. | Consultar a U1, U2 y U3 si poseen celular y si lo llevan cuando concurren a la universidad | Sin validar |
| **S2** | **Asumimos que a los usuarios del estacionamiento hoy les cuesta entre 5 y 10 minutos encontrar un lugar para estacionar.** | Medir mediante observacion directa el tiempo entre la llegada al estacionamiento y el momento en el que el vehículo queda estacionado en distintas franjas horarias y momentos representativos, contrastandolo con lo que reporten U1, U2 y U3. | 🔴 **CRÍTICO** — Sin validar |
| S3 | Asumimos que personas externas a la universidad utilizan el estacionamiento cuando no deberían (ej.: personas que acuden al Hospital Italiano). | Consultar a personal de seguridad sobre casos conocidos y realizar observaciones en el estacionamiento que permitan detectar esta situacion. | Sin validar |
| S4 | Asumimos que no siempre hay buena conexion a Internet en la entrada al estacionamiento de la Universidad | Realizar pruebas de conectividad con dispositivos moviles en la entrada al estacionamiento, en distintos momentos y utilizando diferentes operadores. |Sin validar |
| S5 | Asumimos que la universidad va a autorizar y habilitar técnicamente la integración con la barrera del estacionamiento y con el sistema del Teatro. | Consultar a las autoridades sobre la viabilidad y autorizacion para ambas integraciones. | Sin validar |
| S6 | Asumimos que la penalización por incumplimiento alcanza como incentivo para que los usuarios respeten sus reservas o las cancelen a tiempo. | Consultar a U1, U2, y U3 como influiria en su comportamineto la existencia de una penalizacion a la hora de respetar o cancelar una reserva y que penalizacion considerarian suficiente para modificar su comportamiento. | Sin validar |
| S7 | Asumimos que aproximadamente 1.500 vehículos diarios utilizan diariamente el estacionamiento de la universidad. | Obtener datos oficiales de la universidad o realizar conteos/estimaciones de capacidad y movimiento de ingresos y egresos de vehiculos durante jornadas y horarios representativos. | Sin validar |

### 🔴 Supuesto crítico: S2

**S2 es el supuesto crítico porque es el único del que depende la existencia misma del producto.** Todo Unlam Parking se apoya en que hoy existe una demora real y molesta al buscar lugar. Si esa demora no existe, o es de treinta segundos, o solamente aparece unos pocos días al año, entonces reservar desde el celular agrega fricción sin devolver ningún beneficio y el producto no tiene razón de ser. Ninguna funcionalidad, integración ni decisión de diseño lo salva.

Los otros supuestos son distintos en naturaleza: si S1 resultara falso, el producto sigue teniendo sentido y solamente necesita un canal alternativo de reserva (tótem, web, mostrador). Si S3 resultara falso, se cae una de las razones para el control de acceso, pero la reserva sigue resolviendo el problema principal. **S2, en cambio, no tiene plan B: si se cae, se cae el producto.**

**Cómo lo vamos a validar:** medir el tiempo real entre el ingreso al predio y el momento en que el vehículo queda estacionado, en distintas franjas horarias, combinando observación directa en el estacionamiento con lo que reporten U1, U2 y U3.
