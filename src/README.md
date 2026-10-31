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

**Dónde corre:**

| | Link público (producción) | Link de desarrollo |
|---|---|---|
| Dónde | **Netlify** (URL fija, siempre disponible) | Tu PC: http://localhost:3000 |
| Base de datos | **Turso** (SQLite en la nube, compartida) | Archivo `src/data/parking.sqlite` (sólo tuyo) |
| Para qué | Sesiones de prueba con U1–U3 | Programar y probar cambios |

---

## Guía rápida (desarrollo local)

Si ya tenés todo instalado (ver [paso 1](#1-instalar-lo-necesario-una-sola-vez)):

```bash
git clone https://github.com/gadsii-unlam/gadsii-AgileTeam.git
cd gadsii-AgileTeam/src
npm install
npm run seed        # crea las cuentas locales (sólo la primera vez)
npm start           # http://localhost:3000
```

Los comandos son **los mismos en Windows y en Linux**. Para desarrollar no hace falta ninguna
cuenta de Netlify ni de Turso.

---

## 1. Instalar lo necesario (una sola vez)

| Programa | Para qué |
|---|---|
| **Git** | Bajar el repositorio |
| **Node.js 22 o superior** (incluye `npm`) | Correr la app |

No hace falta instalar ninguna base de datos: en local se usa un archivo SQLite.

### Windows (PowerShell)

Abrí **PowerShell** y corré:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
```

> Si `winget` no existe en tu PC, instalá a mano desde
> [git-scm.com](https://git-scm.com/download/win) y [nodejs.org](https://nodejs.org/) (versión LTS).

**Cerrá y volvé a abrir PowerShell** para que reconozca los programas nuevos.

Si al correr `npm` aparece *"la ejecución de scripts está deshabilitada en este sistema"*, corré
una vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### Linux (Ubuntu / Debian / WSL)

```bash
sudo apt update && sudo apt install -y git curl

# Node.js (con nvm, sin necesidad de sudo)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### Verificar

```bash
git --version
node --version        # tiene que ser v22 o mayor
npm --version
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

## 3. Cargar las cuentas de prueba (local)

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
**no se sube al repo**.

- Correr el seed de nuevo no borra nada: sólo crea las cuentas que falten.
- Para regenerar las contraseñas: `npm run seed -- --nuevas-claves`.
- Para usar otras cuentas o contraseñas: copiar `usuarios.ejemplo.json` a `data/usuarios.json`,
  editarlo y correr `npm run seed`.

> Las cuentas y reservas **locales** son sólo de tu PC. Las de producción (Netlify) están en Turso
> y se cargan como se explica en el [paso 5](#5-publicar-en-netlify-una-sola-vez-la-hace-una-persona).

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
- `npm run dev` reinicia el servidor solo cada vez que guardás un cambio.
- Si aparece el mensaje *".env not found. Continuing without it."*, es normal: significa que se
  está usando la base local.

---

## 5. Publicar en Netlify (una sola vez, la hace una persona)

La app se publica en **Netlify** y guarda los datos en **Turso** (una base SQLite en la nube).
Las dos tienen plan gratuito y se puede entrar con la cuenta de GitHub. Todo se hace desde el
navegador: no hace falta instalar nada más.

### 5.1. Crear la base en Turso

1. Entrar a [app.turso.tech](https://app.turso.tech) con GitHub.
2. **Create Database**. Nombre: `unlam-parking`. Región: la más cercana a Argentina disponible
   (por ejemplo São Paulo).
3. En la base creada, botón **Connect** (o *Create Token*):
   - Copiar la **URL** (empieza con `libsql://`).
   - Generar un **token** con permiso de lectura y escritura y copiarlo.

> El token da acceso total a la base: **no lo subas al repo ni lo pegues en chats públicos**.

### 5.2. Cargar las cuentas en la base de Turso

En tu PC, dentro de `src/`:

1. Copiar `.env.ejemplo` como `.env` y completar `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
2. Correr:
   ```bash
   npm run seed
   ```
   Las tablas se crean solas. Las contraseñas de producción quedan en `data/credenciales.txt`
   **de tu PC**: son las que hay que entregarles a U1, U2 y U3 (en persona o por mensaje privado).
3. Opcional: borrar el `.env` o renombrarlo, para que `npm start` vuelva a usar la base local.
   **No pruebes cosas contra la base de producción**: los datos de las sesiones están ahí.

### 5.3. Crear el sitio en Netlify

1. Entrar a [app.netlify.com](https://app.netlify.com) con GitHub.
2. **Add new project → Import an existing project → GitHub** y elegir
   `gadsii-unlam/gadsii-AgileTeam`. (Si no aparece, dar acceso a la organización `gadsii-unlam`
   en la ventana de permisos de GitHub.)
3. **Branch to deploy:** `mvp-tp5` (o `main` cuando esté mergeado). El resto de la configuración
   (carpeta `src`, comando, función) ya está en el archivo `netlify.toml` de la raíz: no hay que
   tocar nada.
4. Antes de desplegar, en **Environment variables** agregar:
   - `TURSO_DATABASE_URL` = la URL de Turso
   - `TURSO_AUTH_TOKEN` = el token de Turso
5. **Deploy**. Al terminar, Netlify muestra la URL (`algo-al-azar.netlify.app`).
6. Para una URL más clara: **Project configuration → Change project name** → por ejemplo
   `unlam-parking` → queda **https://unlam-parking.netlify.app** (si el nombre está libre).

Para un QR de la URL (para mostrar en pantalla o mandar por mensaje):

```bash
npm run qr -- https://unlam-parking.netlify.app
```

Queda guardado en `data/url-publica.png`.

### 5.4. Después

- **Cada vez que se sube un cambio a la rama configurada, Netlify vuelve a publicar solo.**
  Antes de publicar corre los tests: si alguno falla, no publica y la versión anterior sigue andando.
- La URL **no cambia** y la app funciona aunque todas las PCs estén apagadas.
- Si las variables de entorno se cambian en Netlify, hay que volver a desplegar
  (**Deploys → Trigger deploy**).

URL del MVP: _completar después del primer deploy (ej. https://unlam-parking.netlify.app)._

---

## Problemas frecuentes

| Problema | Solución |
|---|---|
| `"node"` / `"npm"` no se reconoce como comando | Cerrá y volvé a abrir la terminal. Si sigue, reinstalá Node (paso 1). |
| Al correr `npm` en PowerShell: *"la ejecución de scripts está deshabilitada"* | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Error `bad option: --env-file-if-exists` | Tu Node es viejo: instalá la versión 22 o mayor (`node --version`). |
| `EADDRINUSE` al hacer `npm start` | Ya hay otro `npm start` abierto: cerralo, o usá otro puerto (ver abajo). |
| El login dice que el correo o la contraseña no son correctos | Las contraseñas locales y las de producción son distintas: usá las de `data/credenciales.txt` de la PC que corrió el seed contra esa base. |
| La app local se ve sin cuentas | Corré `npm run seed`. |
| El sitio de Netlify muestra *"Algo salió mal"* | Revisá que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén bien cargadas en Netlify y redesplegá. El detalle del error está en Netlify → **Logs → Functions → app**. |
| El deploy de Netlify falla | En el log del deploy: si fallaron los tests, corré `npm test` en tu PC y arreglalo antes de volver a subir. |

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

Se cambia con variables de entorno: en local, igual que `PORT` arriba (o en el `.env`); en
producción, en Netlify → **Environment variables** (y redesplegar). No hay pantalla de
administración en el MVP.

| Variable | Por defecto | Qué es |
|---|---|---|
| `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` | — (base local) | Base de Turso. Obligatorias en Netlify. |
| `CAPACIDAD` | 15 | Lugares por franja de llegada |
| `TOLERANCIA_MIN` | 15 | Minutos de tolerancia después de la hora reservada |
| `FRANJA_MIN` | 30 | Cada cuántos minutos hay una franja |
| `HORA_APERTURA` / `ULTIMA_LLEGADA` | 07:00 / 22:30 | Primera y última franja del día (domingos cerrado) |
| `ANTICIPACION_MIN` | 15 | Mínimo de anticipación para reservar |
| `LLEGUE_DESDE_MIN` | 60 | Desde cuántos minutos antes se habilita «Llegué» |
| `OCUPACION_SIMULADA` | 1 | Suma ocupación ficticia de "otros usuarios" (`0` para desactivarla) |
| `SESION_DIAS` | 5 | Días que dura la sesión sin usar la app |
| `PORT` / `HOST` | 3000 / 127.0.0.1 | Dónde escucha el servidor local |

Cómo se calcula la disponibilidad: cada franja tiene `CAPACIDAD` lugares; los ocupan las reservas
activas de esa franja (llegue o no la persona: no hay liberación por vencimiento) más la ocupación
simulada. La lógica está en `dominio/disponibilidad.js`.

### Concurrencia

En Netlify varias instancias de la app pueden atender pedidos al mismo tiempo contra la misma base.
Para que dos personas nunca se queden con el mismo último lugar, cada escritura (reservar, cancelar,
«Llegué») es **una sola sentencia SQL que incluye sus condiciones** (cupo libre, que el usuario no
tenga otra reserva, estado de la reserva). SQLite/Turso ejecuta cada sentencia de forma atómica y las
escrituras de a una, así que no hay ventana entre "verificar" y "guardar". Los tests de
`test/reservas.test.js` lo comprueban disparando reservas simultáneas desde varias conexiones (por
ejemplo, 60 personas por 15 lugares → exactamente 15 reservas).

---

## Datos para las métricas

Estos comandos usan la base configurada: la local, o la de Turso si hay un `.env` (ver 5.2).

- `npm run backup` guarda una copia de todas las tablas en `data/backups/` (archivo JSON).
  Conviene hacerlo antes y después de cada sesión de prueba.
- `npm run -s eventos > eventos.csv` exporta el log interno (login, login fallido, reserva creada,
  reserva cancelada, «Llegué», cierre de sesión) con fecha y hora de Argentina y la etiqueta del
  usuario (U1, U2…). Es un apoyo: la observación de las sesiones sigue siendo humana.
  En Windows PowerShell usar `npm run -s eventos | Out-File -Encoding utf8 eventos.csv` para que
  Excel lea bien los acentos.

### Consultar la base de datos

- **Producción (Turso):** en [app.turso.tech](https://app.turso.tech), abrir la base y usar la
  pestaña **Shell / SQL** (o *Edit Data*) para correr consultas.
- **Local:** la base es el archivo `src/data/parking.sqlite`. Se puede abrir con la extensión
  *SQLite Viewer* de VS Code, con `sqlite3 data/parking.sqlite` (Linux: `sudo apt install sqlite3`;
  Windows: `winget install SQLite.SQLite`), o sin instalar nada:
  ```bash
  node -e "require('@libsql/client').createClient({url:'file:data/parking.sqlite'}).execute(process.argv[1]).then(r=>console.table(r.rows))" "SELECT * FROM reservas"
  ```

Las columnas `fecha` y `hora` de las reservas están en hora de Argentina; las que terminan en `_en`
están en UTC (3 horas más). Antes de modificar datos a mano, hacer `npm run backup`.

---

## Tests

```bash
npm test
```

Prueban la lógica de disponibilidad y reservas, la concurrencia (reservas simultáneas) y recorren
el flujo completo por HTTP (login → reservar → «Llegué» → cancelar → cerrar sesión).

---

## Estructura

```
netlify.toml           (en la raíz del repo) configuración de Netlify
src/
  server.js            servidor para desarrollo local
  netlify/functions/   la app como función de Netlify
  app.js               rutas y pantallas (Express)
  config.js            parámetros del MVP
  db/                  esquema y conexión (Turso o archivo SQLite local)
  dominio/             lógica propia: disponibilidad, reservas, sesiones, eventos
  vistas/              pantallas (plantillas EJS, renderizadas en el servidor)
  public/              estilos, JS mínimo, íconos, manifest y service worker (PWA)
  scripts/             seed, backup, exportar eventos, QR de la URL, generar íconos
  test/                tests (node:test)
  data/                base local, credenciales y backups (no se sube al repo)
```

## Seguridad (resumen)

- Las contraseñas se guardan con hash bcrypt; el celular sólo guarda una cookie de sesión
  `HttpOnly` y `Secure`, y en la base se guarda el hash del token.
- El token de Turso sólo está en las variables de entorno de Netlify y en el `.env` local de quien
  carga las cuentas (ninguno de los dos se sube al repo).
- Consultas SQL parametrizadas, límite de intentos de login (guardado en la base), cabeceras de
  seguridad (CSP, etc.).
