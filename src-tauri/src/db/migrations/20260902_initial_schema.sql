-- src-tauri/src/db/migrations/20260902_initial_schema.sql

CREATE TABLE IF NOT EXISTS os (
    id TEXT PRIMARY KEY,
    glpi_ticket_id TEXT NOT NULL,
    tecnico TEXT NOT NULL,
    cliente TEXT NOT NULL,
    endereco TEXT NOT NULL,
    data_visita TEXT NOT NULL,
    tipo_servico TEXT NOT NULL,
    observacoes TEXT NOT NULL,
    status TEXT NOT NULL,
    current_step INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS os_checklist (
    id TEXT PRIMARY KEY,
    os_id TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    checked BOOLEAN NOT NULL CHECK (checked IN (0, 1)),
    FOREIGN KEY(os_id) REFERENCES os(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS os_materials (
    id TEXT PRIMARY KEY,
    os_id TEXT NOT NULL,
    material_id TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    observation TEXT,
    is_custom BOOLEAN NOT NULL CHECK (is_custom IN (0, 1)),
    FOREIGN KEY(os_id) REFERENCES os(id) ON DELETE CASCADE
);