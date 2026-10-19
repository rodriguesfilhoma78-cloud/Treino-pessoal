/**
 * Modelo de domínio do app.
 *
 * Treino      = o plano (ex: "Treino A - Peito/Tríceps")
 * SessaoTreino = uma execução real desse plano em uma data
 * SerieRegistrada = cada série feita dentro de uma sessão
 *
 * Separar plano de execução é o que permite comparar
 * "o que era pra fazer" com "o que de fato foi feito".
 */

export interface Exercicio {
  id: number;
  nome: string;
  grupoMuscular: string;
}

export interface Treino {
  id: number;
  nome: string;
}

export interface TreinoExercicio {
  id: number;
  treinoId: number;
  exercicioId: number;
  ordem: number;
}

export interface TreinoComExercicios extends Treino {
  exercicios: Exercicio[];
}

export interface SessaoTreino {
  id: number;
  treinoId: number;
  data: string; // ISO 8601
}

export interface SerieRegistrada {
  id: number;
  sessaoId: number;
  exercicioId: number;
  carga: number;
  repeticoes: number;
  rpe?: number | null;
}

export interface PontoProgressao {
  data: string;
  cargaMaxima: number;
}

export const GRUPOS_MUSCULARES = [
  "Peito",
  "Costas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Perna",
  "Abdômen",
  "Outro",
] as const;

export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];
