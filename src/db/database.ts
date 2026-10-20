import * as SQLite from "expo-sqlite";

/**
 * Ponto único de acesso ao banco. Nenhum outro arquivo deve abrir o SQLite
 * diretamente — sempre passe por getDb().
 *
 * Abre de forma assíncrona: na web a API síncrona bloqueia a página esperando
 * o worker do SQLite e estoura "Sync operation timeout".
 */
let db: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = SQLite.openDatabaseAsync("befit.db");
  }
  return db;
}

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    grupo_muscular TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS treinos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS treino_exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES exercicios(id),
    ordem INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessoes_treino (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    treino_id INTEGER NOT NULL REFERENCES treinos(id),
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS series_registradas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessao_id INTEGER NOT NULL REFERENCES sessoes_treino(id) ON DELETE CASCADE,
    exercicio_id INTEGER NOT NULL REFERENCES exercicios(id),
    carga REAL NOT NULL,
    repeticoes INTEGER NOT NULL,
    rpe INTEGER
  );
`;

const EXERCICIOS_SEED: Array<[string, string]> = [
  ["Supino reto", "Peito"],
  ["Supino inclinado", "Peito"],
  ["Puxada frontal", "Costas"],
  ["Remada curvada", "Costas"],
  ["Desenvolvimento militar", "Ombro"],
  ["Elevação lateral", "Ombro"],
  ["Rosca direta", "Bíceps"],
  ["Tríceps corda", "Tríceps"],
  ["Agachamento livre", "Perna"],
  ["Leg press", "Perna"],
  ["Cadeira extensora", "Perna"],
  ["Abdominal supra", "Abdômen"],
];

/**
 * Cria o schema se não existir e popula exercícios básicos
 * na primeira execução. Chamar uma vez, no boot do app.
 */
export async function inicializarBanco(): Promise<void> {
  const database = await getDb();
  await database.execAsync(SCHEMA);

  const [{ total }] = await database.getAllAsync<{ total: number }>(
    "SELECT COUNT(*) as total FROM exercicios"
  );

  if (total === 0) {
    await database.withTransactionAsync(async () => {
      for (const [nome, grupo] of EXERCICIOS_SEED) {
        await database.runAsync(
          "INSERT INTO exercicios (nome, grupo_muscular) VALUES (?, ?)",
          nome,
          grupo
        );
      }
    });
  }
}
