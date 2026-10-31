# Unlam Parking — MVP (TP5)

App web mobile-first para reservar un lugar en el estacionamiento de la UNLaM.
Alcance del MVP (brief v3.1, TP3 + correcciones TP4B):

- Reservar un lugar, cancelar la reserva y ver la disponibilidad por franja horaria.
- Login con "cuenta universitaria" **simulada**: cuentas precargadas con el seed.
- Botón **«Llegué»** para registrar la hora de llegada (reemplaza al QR, que quedó fuera del MVP).
- Fecha y hora en desplegables que sólo muestran horarios con lugares libres (H4).
- Mensaje claro si el login falla (H9) y pantalla de Ayuda en todas las pantallas salvo el login (H10).

Fuera del MVP: tipos de vehículo, penalizaciones, más de un estacionamiento, QR/barrera,
liberación automática por vencimiento, elegir una plaza puntual e historial de reservas.

---

## Guía rápida

Si ya tenés todo instalado (ver [paso 1](#1-instalar-lo-necesario-una-sola-vez)):

```bash
git clone https://github.com/gadsii-unlam/gadsii-AgileTeam.git
cd gadsii-AgileTeam/src
npm install
npm run seed        # crea las cuentas (sólo la primera vez)
npm start           # link de desarrollo: http://localhost:3000
npm run publicar    # link público (en vez de npm start)
```

Los comandos son **los mismos en Windows y en Linux**.

---

## 1. Instalar lo necesario (una sola vez)

| Programa | Para qué | ¿Quién lo necesita? |
|---|---|---|
| **Git** | Bajar el repositorio | Todos |
| **Node.js 24 o superior** (incluye `npm`) | Correr la app | Todos |
| **cloudflared** | Generar el link público | Sólo quien publica |

No hace falta instalar ninguna base de datos: SQLite viene incluido en Node.

### Windows (PowerShell)

Abrí **PowerShell** y corré:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Cloudflare.cloudflared -e
```

> Si `winget` no existe en tu PC, instalá a mano desde
> [git-scm.com](https://git-scm.com/download/win), [nodejs.org](https://nodejs.org/) (versión LTS) y
> [cloudflared para Windows](https://github.com/cloudflare/cloudflared/releases/latest) (archivo
> `cloudflared-windows-amd64.msi`).

**Cerrá y volvé a abrir PowerShell** para que reconozca los programas nuevos.

Si al correr `npm` aparece *"la ejecución de scripts está deshabilitada en este sistema"*, corré
una vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Linux (Ubuntu / Debian / WSL)

```bash
# Git
sudo apt update && sudo apt install -y git curl

# Node.js (con nvm, sin necesidad de sudo)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts

# cloudflared (sólo quien publica)
curl -L -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb && rm cloudflared.deb
```

### Verificar

En cualquier sistema, estos comandos tienen que mostrar una versión:

```bash
git --version
node --version        # tiene que ser v24 o mayor
npm --version
cloudflared --version # sólo si vas a publicar
```

---

## 2. Bajar el repositorio e instalar dependencias

```bash
git clone https://github.com/gadsii-unlam/gadsii-AgileTeam.git
cd gadsii-AgileTeam
git switch mvp-tp5    # sólo mientras el MVP no esté mergeado en main
cd src
npm install
```

Si ya tenías el repositorio: `git pull` y después `npm install` dentro de `src/`.

**Todos los comandos que siguen se corren dentro de la carpeta `src/`.**

---

## 3. Cargar las cuentas de prueba

```bash
npm run seed
```

Crea estas cuentas (los nombres son ficticios, no hay datos personales en el repo):

| Etiqueta | Correo | Uso |
|---|---|---|
| U1, U2, U3 | `lgomez@alumno.unlam.edu.ar`, `mfernandez@alumno.unlam.edu.ar`, `jrodriguez@alumno.unlam.edu.ar` | Usuarios de prueba |
| EQ1–EQ5 | `equipo1@alumno.unlam.edu.ar` … `equipo5@alumno.unlam.edu.ar` | Integrantes del equipo |
| DEMO | `demo@unlam.edu.ar` | Demostraciones (formato docente) |

Las **contraseñas** se generan al azar y quedan en **`src/data/credenciales.txt`**. Ese archivo
**no se sube al repo**: hay que entregárselas a cada usuario en persona o por mensaje privado.

- Correr el seed de nuevo no borra nada: sólo crea las cuentas que falten.
- Para regenerar las contraseñas: `npm run seed -- --nuevas-claves`.
- Para usar otras cuentas o contraseñas: copiar `usuarios.ejemplo.json` a `data/usuarios.json`,
  editarlo y correr `npm run seed`.

> ⚠️ **Cada PC tiene su propia base de datos y sus propias contraseñas.** Las reservas y las
> cuentas que existen en una PC no están en las demás. Las sesiones de prueba con U1–U3 tienen que
> hacerse **siempre desde la misma PC** (la de quien publica), para que los datos de la primera
> sesión sigan estando una semana después.

---

## 4. Link de desarrollo (sólo en tu PC)

```bash
npm start
```

Abrí **http://localhost:3000** en el navegador (si no carga, probá **http://127.0.0.1:3000**).
Para cortar: `Ctrl+C`.

- Si usás **WSL**, el link también abre desde el navegador de Windows.
- Para ver la app como en un celular: en Chrome o Edge apretá `F12` y después el ícono de
  dispositivo móvil (o `Ctrl+Shift+M`).
- Durante el desarrollo, `npm run dev` reinicia el servidor solo cada vez que guardás un cambio.

---

## 5. Link público (para usar desde cualquier celular)

La app corre en la PC de un integrante y se publica con un **Cloudflare quick tunnel**: sin cuenta,
sin abrir puertos del router y con HTTPS.

```bash
npm run publicar
```

(No hace falta correr `npm start` antes: `publicar` levanta el servidor solo. Si había un
`npm start` abierto, cerralo primero.)

El comando hace un backup de la base, levanta el servidor y el túnel, y muestra:

- La **URL pública** (`https://algo-al-azar.trycloudflare.com`), también guardada en
  `data/url-publica.txt`.
- Un **QR con la URL**, para escanearlo desde la pantalla. También queda guardado en
  `data/url-publica.png` para mandarlo por mensaje.

**Dejá la terminal abierta** mientras se use la app. `Ctrl+C` corta el servidor y el túnel.

Importante:

- **La URL cambia cada vez que se corre `npm run publicar`** (por ejemplo, después de apagar la PC).
  Hay que mandarles la URL nueva a los usuarios antes de cada sesión.
- Si la PC se apaga o se suspende, la URL deja de funcionar. Los datos **no** se pierden: quedan en
  `data/parking.sqlite`.
- La primera vez, la URL puede tardar unos segundos en cargar.

URL del MVP: _se completa en cada sesión de prueba (cambia en cada publicación)._

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `"node"` / `"npm"` / `"cloudflared"` no se reconoce como comando | Cerrá y volvé a abrir la terminal. Si sigue, reinstalá el programa (paso 1). |
| Al correr `npm` en PowerShell: *"la ejecución de scripts está deshabilitada"* | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Error con `node:sqlite` o `No such built-in module` | Tu Node es viejo: instalá la versión 24 o mayor (`node --version`). |
| *"Ya hay un servidor corriendo en el puerto 3000"* o `EADDRINUSE` | Hay otro `npm start` / `npm run publicar` abierto: cerralo. O usá otro puerto (ver abajo). |
| La URL pública muestra **Error 1033** de Cloudflare | El túnel no está corriendo: volvé a correr `npm run publicar` y usá la URL **nueva**. |
| *"Falta instalar cloudflared"* | Instalalo (paso 1) y reabrí la terminal. |
| El login dice que el correo o la contraseña no son correctos | Revisá `data/credenciales.txt` **de la PC donde corre la app**. |
| La app se ve vacía o sin cuentas | Corré `npm run seed`. |

**Usar otro puerto** (por ejemplo 3001):

```bash
# Linux / WSL
PORT=3001 npm start
```
```powershell
# Windows PowerShell
$env:PORT=3001; npm start
```
```bat
:: Windows cmd
set PORT=3001 && npm start
```

---

## Configuración

Se cambia con variables de entorno, igual que `PORT` arriba (no hay pantalla de administración en el MVP):

| Variable | Por defecto | Qué es |
|---|---|---|
| `CAPACIDAD` | 15 | Lugares por franja de llegada |
| `TOLERANCIA_MIN` | 15 | Minutos de tolerancia después de la hora reservada |
| `FRANJA_MIN` | 30 | Cada cuántos minutos hay una franja |
| `HORA_APERTURA` / `ULTIMA_LLEGADA` | 07:00 / 22:30 | Primera y última franja del día (domingos cerrado) |
| `ANTICIPACION_MIN` | 15 | Mínimo de anticipación para reservar |
| `LLEGUE_DESDE_MIN` | 60 | Desde cuántos minutos antes se habilita «Llegué» |
| `OCUPACION_SIMULADA` | 1 | Suma ocupación ficticia de "otros usuarios" (`0` para desactivarla) |
| `SESION_DIAS` | 5 | Días que dura la sesión sin usar la app |
| `PORT` / `HOST` | 3000 / 127.0.0.1 | Dónde escucha el servidor |
| `DB_PATH` | `data/parking.sqlite` | Archivo de la base |

Cómo se calcula la disponibilidad: cada franja tiene `CAPACIDAD` lugares; los ocupan las reservas
activas de esa franja (llegue o no la persona: no hay liberación por vencimiento) más la ocupación
simulada. La lógica está en `dominio/disponibilidad.js`.

---

## Datos para las métricas

- `npm run backup` guarda una copia de la base en `data/backups/` (también se hace al publicar).
- `npm run -s eventos > eventos.csv` exporta el log interno (login, login fallido, reserva creada,
  reserva cancelada, «Llegué», cierre de sesión) con fecha y hora de Argentina y la etiqueta del
  usuario (U1, U2…). Es un apoyo: la observación de las sesiones sigue siendo humana.
  En Windows PowerShell usar `npm run -s eventos | Out-File -Encoding utf8 eventos.csv` para que
  Excel lea bien los acentos.

### Consultar la base de datos

La base es el archivo `src/data/parking.sqlite`. Tres formas de verla:

1. **VS Code**: instalar la extensión *SQLite Viewer* y abrir el archivo (sólo lectura).
2. **Línea de comandos**: instalar `sqlite3` (Linux: `sudo apt install sqlite3`; Windows:
   `winget install SQLite.SQLite`) y correr `sqlite3 data/parking.sqlite`. Adentro conviene usar
   `.headers on` y `.mode box`.
3. **Sin instalar nada**, con Node:
   ```bash
   node -e "const {DatabaseSync}=require('node:sqlite'); console.table(new DatabaseSync('data/parking.sqlite').prepare(process.argv[1]).all())" "SELECT * FROM reservas"
   ```

Las columnas `fecha` y `hora` de las reservas están en hora de Argentina; las que terminan en `_en`
están en UTC (3 horas más). Antes de modificar datos a mano, hacer `npm run backup` y apagar el servidor.

---

## Tests

```bash
npm test
```

Prueban la lógica de disponibilidad y reservas, y recorren el flujo completo por HTTP
(login → reservar → «Llegué» → cancelar → cerrar sesión).

---

## Estructura

```
src/
  server.js            arranque del servidor
  app.js               rutas y pantallas (Express)
  config.js            parámetros del MVP
  db/                  esquema y conexión SQLite
  dominio/             lógica propia: disponibilidad, reservas, sesiones, eventos
  vistas/              pantallas (plantillas EJS, renderizadas en el servidor)
  public/              estilos, JS mínimo, íconos, manifest y service worker (PWA)
  scripts/             seed, backup, exportar eventos, publicar (+ QR de la URL), generar íconos
  test/                tests (node:test)
  data/                base, credenciales, backups y URL pública (no se sube al repo)
```

## Seguridad (resumen)

- Las contraseñas se guardan con hash bcrypt; el celular sólo guarda una cookie de sesión
  `HttpOnly` (y `Secure` cuando se accede por HTTPS), y en la base se guarda el hash del token.
- El servidor sólo escucha en `127.0.0.1`: desde internet sólo se llega a través del túnel.
- Consultas SQL parametrizadas, límite de intentos de login, cabeceras de seguridad (CSP, etc.).
- Recomendación: levantar el túnel sólo durante las sesiones de prueba.
