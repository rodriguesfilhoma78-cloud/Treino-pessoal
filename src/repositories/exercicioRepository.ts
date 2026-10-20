import { getDb } from "@/db/database";
import { Exercicio } from "@/types";

export const exercicioRepository = {
  async listar(): Promise<Exercicio[]> {
    const db = await getDb();
    return db.getAllAsync<Exercicio>(
      `SELECT id, nome, grupo_muscular as grupoMuscular
       FROM exercicios ORDER BY grupo_muscular, nome`
    );
  },

  async criar(nome: string, grupoMuscular: string): Promise<number> {
    const db = await getDb();
    const result = await db.runAsync(
      "INSERT INTO exercicios (nome, grupo_muscular) VALUES (?, ?)",
      nome,
      grupoMuscular
    );
    return result.lastInsertRowId;
  },
};
