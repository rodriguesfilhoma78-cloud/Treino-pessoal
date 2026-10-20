import { getDb } from "@/db/database";
import { Exercicio, Treino, TreinoComExercicios } from "@/types";

export const treinoRepository = {
  async listar(): Promise<Treino[]> {
    const db = await getDb();
    return db.getAllAsync<Treino>("SELECT id, nome FROM treinos ORDER BY nome");
  },

  async buscarComExercicios(treinoId: number): Promise<TreinoComExercicios | null> {
    const db = await getDb();
    const treino = await db.getFirstAsync<Treino>(
      "SELECT id, nome FROM treinos WHERE id = ?",
      treinoId
    );
    if (!treino) return null;

    const exercicios = await db.getAllAsync<Exercicio>(
      `SELECT e.id, e.nome, e.grupo_muscular as grupoMuscular
       FROM treino_exercicios te
       JOIN exercicios e ON e.id = te.exercicio_id
       WHERE te.treino_id = ?
       ORDER BY te.ordem`,
      treinoId
    );

    return { ...treino, exercicios };
  },

  /** Cria o treino e associa a lista de exercícios na ordem informada. */
  async criar(nome: string, exercicioIds: number[]): Promise<number> {
    const db = await getDb();
    let treinoId = 0;

    await db.withTransactionAsync(async () => {
      const result = await db.runAsync("INSERT INTO treinos (nome) VALUES (?)", nome);
      treinoId = result.lastInsertRowId;

      for (let ordem = 0; ordem < exercicioIds.length; ordem++) {
        await db.runAsync(
          "INSERT INTO treino_exercicios (treino_id, exercicio_id, ordem) VALUES (?, ?, ?)",
          treinoId,
          exercicioIds[ordem],
          ordem
        );
      }
    });

    return treinoId;
  },

  async excluir(treinoId: number): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM treinos WHERE id = ?", treinoId);
  },
};
