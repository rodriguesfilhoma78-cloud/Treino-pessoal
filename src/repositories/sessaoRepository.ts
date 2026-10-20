import { getDb } from "@/db/database";
import { PontoProgressao, SerieRegistrada, SessaoTreino } from "@/types";

export interface SessaoComTreino extends SessaoTreino {
  treinoNome: string;
  totalSeries: number;
}

export interface EstatisticasGerais {
  totalSeries: number;
  totalReps: number;
  volumeKg: number;
  recordeExercicio: string | null;
  recordeCarga: number | null;
}

export const sessaoRepository = {
  async iniciar(treinoId: number): Promise<number> {
    const db = await getDb();
    const data = new Date().toISOString();
    const result = await db.runAsync(
      "INSERT INTO sessoes_treino (treino_id, data) VALUES (?, ?)",
      treinoId,
      data
    );
    return result.lastInsertRowId;
  },

  async registrarSerie(
    sessaoId: number,
    exercicioId: number,
    carga: number,
    repeticoes: number,
    rpe?: number
  ): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO series_registradas (sessao_id, exercicio_id, carga, repeticoes, rpe)
       VALUES (?, ?, ?, ?, ?)`,
      sessaoId,
      exercicioId,
      carga,
      repeticoes,
      rpe ?? null
    );
  },

  async listarSeriesDaSessao(sessaoId: number): Promise<SerieRegistrada[]> {
    const db = await getDb();
    return db.getAllAsync<SerieRegistrada>(
      `SELECT id, sessao_id as sessaoId, exercicio_id as exercicioId,
              carga, repeticoes, rpe
       FROM series_registradas WHERE sessao_id = ? ORDER BY id`,
      sessaoId
    );
  },

  async listarHistorico(limite = 50): Promise<SessaoComTreino[]> {
    const db = await getDb();
    return db.getAllAsync<SessaoComTreino>(
      `SELECT s.id, s.treino_id as treinoId, s.data, t.nome as treinoNome,
              (SELECT COUNT(*) FROM series_registradas WHERE sessao_id = s.id) as totalSeries
       FROM sessoes_treino s
       JOIN treinos t ON t.id = s.treino_id
       ORDER BY s.data DESC
       LIMIT ?`,
      limite
    );
  },

  /** Totais gerais de séries, repetições e volume, mais a maior carga já registrada. */
  async estatisticasGerais(): Promise<EstatisticasGerais> {
    const db = await getDb();
    const [totais] = await db.getAllAsync<{
      totalSeries: number;
      totalReps: number;
      volumeKg: number;
    }>(
      `SELECT COUNT(*) as totalSeries,
              COALESCE(SUM(repeticoes), 0) as totalReps,
              COALESCE(SUM(carga * repeticoes), 0) as volumeKg
       FROM series_registradas`
    );
    const [recorde] = await db.getAllAsync<{ nome: string | null; carga: number | null }>(
      `SELECT e.nome as nome, sr.carga as carga
       FROM series_registradas sr
       JOIN exercicios e ON e.id = sr.exercicio_id
       ORDER BY sr.carga DESC
       LIMIT 1`
    );
    return {
      totalSeries: totais?.totalSeries ?? 0,
      totalReps: totais?.totalReps ?? 0,
      volumeKg: totais?.volumeKg ?? 0,
      recordeExercicio: recorde?.nome ?? null,
      recordeCarga: recorde?.carga ?? null,
    };
  },

  /** Progressão de carga máxima por sessão, pra um exercício específico. */
  async progressaoPorExercicio(exercicioId: number): Promise<PontoProgressao[]> {
    const db = await getDb();
    return db.getAllAsync<PontoProgressao>(
      `SELECT s.data as data, MAX(sr.carga) as cargaMaxima
       FROM series_registradas sr
       JOIN sessoes_treino s ON s.id = sr.sessao_id
       WHERE sr.exercicio_id = ?
       GROUP BY s.id
       ORDER BY s.data ASC`,
      exercicioId
    );
  },
};
