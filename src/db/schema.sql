PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id            INTEGER PRIMARY KEY,
  correo        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  etiqueta      TEXT NOT NULL,           -- U1, U2, U3, EQ1, DEMO...
  creado_en     TEXT NOT NULL
);

-- fecha y hora están en hora de Argentina; una reserva ocupa un lugar en su franja de llegada.
CREATE TABLE IF NOT EXISTS reservas (
  id                    INTEGER PRIMARY KEY,
  usuario_id            INTEGER NOT NULL REFERENCES usuarios(id),
  fecha                 TEXT NOT NULL,   -- YYYY-MM-DD
  hora                  TEXT NOT NULL,   -- HH:MM
  estado                TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada')),
  creada_en             TEXT NOT NULL,
  cancelada_en          TEXT,
  llegada_registrada_en TEXT
);
CREATE INDEX IF NOT EXISTS idx_reservas_franja ON reservas (fecha, hora, estado);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas (usuario_id, estado);

-- Se guarda el hash del token, nunca el token en sí.
CREATE TABLE IF NOT EXISTS sesiones (
  token_hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  expira_en  TEXT NOT NULL
);

-- Log interno para apoyar las métricas del TP5 (la observación sigue siendo humana).
CREATE TABLE IF NOT EXISTS eventos (
  id          INTEGER PRIMARY KEY,
  usuario_id  INTEGER REFERENCES usuarios(id),
  tipo        TEXT NOT NULL,
  detalle     TEXT,
  ocurrido_en TEXT NOT NULL
);
