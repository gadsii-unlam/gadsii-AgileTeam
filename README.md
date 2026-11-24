# Agile Team

Integrantes: Barcia Matías, De Vito Daniel, Ledesma Miguel, Militello Nicolás y Serra Leandro

Producto: Una app para que miembros de la comunidad Unlam, como estudiantes, docentes e invitados puedan reservar un lugar en el estacionamiento de la universidad.

Segmento de la comunidad UNLaM: Personas que vayan a la Unlam en su propio vehículo y usen el estacionamiento de la universidad.

MVP (TP5): el código está en [`src/`](src/). Cómo instalarlo, correrlo y publicarlo (Windows y Linux): [`src/README.md`](src/README.md).

## Unlam Parking

App web mobile-first para que quien llega a la UNLaM en vehículo propio reserve un lugar antes de salir y tenga la certeza de que va a poder estacionar. El usuario primario es el estudiante del turno noche que va en auto.

**App publicada:** https://unlam-parking.netlify.app/

## Estado del producto

| Parte | Estado |
|---|---|
| Reservar, cancelar y ver los lugares libres por turno (8, 14 y 19 hs; sábados 8 y 14; 15 lugares por turno) | Construido |
| Registrar la llegada con el botón «Llegué» (reemplaza al QR) | Construido |
| Registro de eventos para las métricas, exportable a CSV | Construido |
| Inicio de sesión con cuenta universitaria | Simulado: cuentas precargadas a mano |
| QR, lector y barrera del estacionamiento | Diferido: sin autorización de la universidad (supuesto S5) |
| Penalizaciones y liberación de reservas por vencimiento | Diferido |
| Panel de administración, tipos de vehículo, segundo estacionamiento y sistema del Teatro | Diferido |

## Documentación

| Qué | Dónde |
|---|---|
| Brief del producto (última versión: 6.0) | [`docs/brief.md`](docs/brief.md) |
| Arquitectura real del MVP y de la gran visión | [`docs/arquitectura/`](docs/arquitectura/) |
| Registro del trabajo con IA y decisiones del MVP | [`docs/prompts.md`](docs/prompts.md) y [`docs/prompt-mvp-tp5.md`](docs/prompt-mvp-tp5.md) |
| Evidencia del relevamiento (TP2) y de la prueba con usuarios (TP5) | [`docs/evidencia/`](docs/evidencia/) |
| Diseño y wireframe | [`docs/diseno/`](docs/diseno/) |

## Cómo continuar

Lo que habría que resolver para llevar el producto a producción en la UNLaM, en este orden:

1. **Motor de reservas y cupo.** Pasar de turnos independientes a un modelo de ocupación (entrada y salida, o franja de permanencia), calcular el cupo con la capacidad real del predio y llevar las reglas de cupo al esquema de la base, con sus tests.
2. **Autorización de la universidad** (supuesto S5) para integrar la barrera, el sistema de cuentas y el del Teatro. Sin ella no hay producción posible.
3. **Autenticación institucional** con las cuentas de la UNLaM, o como mínimo verificación por enlace al correo `@unlam.edu.ar`.
4. **Validación del ingreso** con QR, lector y un servicio local junto a la barrera que funcione aunque se corte internet.
5. **Panel de administración** para capacidad, horarios y tolerancia (hoy son variables de entorno) y liberación automática de reservas vencidas.

## Accesos

| Servicio | Para qué | Quién tiene el acceso |
|---|---|---|
| GitHub (`gadsii-unlam/gadsii-AgileTeam`) | Código y documentación | Los integrantes del equipo |
| Netlify | Publicación de la app | Militello Nicolás (cuenta gratuita personal) |
| Turso | Base de datos de producción | Militello Nicolás (cuenta gratuita personal) |

Las contraseñas de las cuentas de prueba y el token de la base no están en el repositorio. Para pasar el proyecto a otro equipo hay que transferir las cuentas de Netlify y Turso, o migrar a infraestructura de la universidad, y generar un token nuevo para la base.
