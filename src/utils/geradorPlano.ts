/**
 * Gerador de plano de treino por regras (sem IA): objetivo, nível, dias por
 * semana e ambiente definem a divisão, os exercícios e a prescrição.
 * Funções puras sobre o catálogo estático.
 */

import {
  CATALOGO,
  Ambiente,
  ExercicioCatalogo,
  GrupoCatalogo,
  Nivel,
} from "@/data/catalogoExercicios";

export type Objetivo = "Hipertrofia" | "Força" | "Emagrecimento";
export const OBJETIVOS: Objetivo[] = ["Hipertrofia", "Força", "Emagrecimento"];
export const NIVEIS: Nivel[] = ["Iniciante", "Intermediário", "Avançado"];
export const DIAS_POSSIVEIS = [2, 3, 4, 5, 6];

export interface ParametrosPlano {
  objetivo: Objetivo;
  nivel: Nivel;
  dias: number;
  ambiente: Ambiente;
}

export interface Prescricao {
  series: number;
  repeticoes: string;
  descansoSeg: number;
}

export interface ItemPlano {
  exercicio: ExercicioCatalogo;
  prescricao: Prescricao;
}

export interface DiaPlano {
  nome: string;
  itens: ItemPlano[];
}

export interface Plano {
  dias: DiaPlano[];
  avisos: string[];
}

const RANK: Record<Nivel, number> = { Iniciante: 0, Intermediário: 1, Avançado: 2 };

interface ModeloDia {
  nome: string;
  grupos: GrupoCatalogo[]; // na ordem de execução: grupos grandes primeiro
}

const PEITO_OMBRO_TRICEPS: ModeloDia = {
  nome: "Peito, ombros e tríceps",
  grupos: ["Peito", "Ombros", "Tríceps"],
};
const COSTAS_BICEPS: ModeloDia = {
  nome: "Costas e bíceps",
  grupos: ["Costas", "Bíceps", "Antebraço"],
};
const PERNAS: ModeloDia = {
  nome: "Pernas",
  grupos: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"],
};
const SUPERIOR: ModeloDia = {
  nome: "Superior",
  grupos: ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"],
};
const INFERIOR: ModeloDia = {
  nome: "Inferior",
  grupos: ["Quadríceps", "Posterior", "Glúteos", "Panturrilha", "Abdômen"],
};
const CORPO_TODO: ModeloDia = {
  nome: "Corpo inteiro",
  grupos: ["Quadríceps", "Peito", "Costas", "Ombros", "Posterior", "Abdômen"],
};

/** Divisão semanal por número de dias. */
function modelosDaSemana(dias: number): ModeloDia[] {
  switch (dias) {
    case 2:
      return [CORPO_TODO, CORPO_TODO];
    case 3:
      return [
        PEITO_OMBRO_TRICEPS,
        COSTAS_BICEPS,
        { ...PERNAS, grupos: [...PERNAS.grupos, "Abdômen"] },
      ];
    case 4:
      return [SUPERIOR, INFERIOR, SUPERIOR, INFERIOR];
    case 5:
      return [
        { nome: "Peito e tríceps", grupos: ["Peito", "Tríceps"] },
        { nome: "Costas e bíceps", grupos: ["Costas", "Bíceps"] },
        { nome: "Pernas", grupos: ["Quadríceps", "Posterior", "Panturrilha"] },
        { nome: "Ombros e abdômen", grupos: ["Ombros", "Abdômen"] },
        { nome: "Posterior e glúteos", grupos: ["Posterior", "Glúteos", "Lombar"] },
      ];
    default:
      return [
        PEITO_OMBRO_TRICEPS,
        COSTAS_BICEPS,
        PERNAS,
        PEITO_OMBRO_TRICEPS,
        COSTAS_BICEPS,
        PERNAS,
      ];
  }
}

export function prescricaoPara(objetivo: Objetivo, nivel: Nivel): Prescricao {
  const base: Prescricao =
    objetivo === "Força"
      ? { series: 4, repeticoes: "4-6", descansoSeg: 150 }
      : objetivo === "Emagrecimento"
        ? { series: 3, repeticoes: "12-15", descansoSeg: 45 }
        : { series: 3, repeticoes: "8-12", descansoSeg: 75 };

  // iniciantes ficam em 3 séries; avançados ganham uma a mais nos objetivos de carga
  if (nivel === "Iniciante") return { ...base, series: Math.min(base.series, 3) };
  if (nivel === "Avançado" && objetivo !== "Emagrecimento")
    return { ...base, series: base.series + 1 };
  return base;
}

const EXERCICIOS_POR_DIA: Record<Nivel, number> = { Iniciante: 5, Intermediário: 6, Avançado: 7 };

/** Candidatos de um grupo: respeitam ambiente e nível (com fallback se o nível esvaziar o grupo). */
function candidatos(grupo: GrupoCatalogo, p: ParametrosPlano): ExercicioCatalogo[] {
  const doGrupo = CATALOGO.filter((e) => e.grupo === grupo && e.ambientes.includes(p.ambiente));
  const noNivel = doGrupo.filter((e) => RANK[e.nivel] <= RANK[p.nivel]);
  return noNivel.length > 0 ? noNivel : doGrupo;
}

/** Reparte `total` exercícios entre os grupos, em rodízio, pelo menos 1 por grupo. */
function distribuir(grupos: GrupoCatalogo[], total: number): Map<GrupoCatalogo, number> {
  const mapa = new Map<GrupoCatalogo, number>(grupos.map((g) => [g, 1]));
  for (
    let i = 0, restante = total - grupos.length;
    restante > 0;
    i = (i + 1) % grupos.length, restante--
  ) {
    mapa.set(grupos[i], mapa.get(grupos[i])! + 1);
  }
  return mapa;
}

export function gerarPlano(p: ParametrosPlano): Plano {
  const prescricao = prescricaoPara(p.objetivo, p.nivel);
  const alvo = EXERCICIOS_POR_DIA[p.nivel];
  const usadosNaSemana = new Map<string, number>(); // id -> vezes usado
  const avisos: string[] = [];

  const dias: DiaPlano[] = modelosDaSemana(p.dias).map((modelo, indice) => {
    const porGrupo = distribuir(modelo.grupos, alvo);
    const escolhidos: ExercicioCatalogo[] = [];

    for (const grupo of modelo.grupos) {
      // prefere os menos usados na semana (dias repetidos variam), depois os mais populares
      const pegos = [...candidatos(grupo, p)]
        .sort(
          (a, b) =>
            (usadosNaSemana.get(a.id) ?? 0) - (usadosNaSemana.get(b.id) ?? 0) ||
            a.popularidade - b.popularidade
        )
        .slice(0, porGrupo.get(grupo) ?? 1)
        // compostos (nível mais alto no catálogo) antes dos isoladores dentro do grupo
        .sort((a, b) => RANK[b.nivel] - RANK[a.nivel]);
      escolhidos.push(...pegos);
    }

    // ambientes limitados (ex.: peso do corpo) podem deixar o dia curto: completa com o que houver
    if (escolhidos.length < 3) {
      const extras = CATALOGO.filter(
        (e) => e.ambientes.includes(p.ambiente) && !escolhidos.some((x) => x.id === e.id)
      )
        .sort(
          (a, b) =>
            (usadosNaSemana.get(a.id) ?? 0) - (usadosNaSemana.get(b.id) ?? 0) ||
            a.popularidade - b.popularidade
        )
        .slice(0, 3 - escolhidos.length);
      escolhidos.push(...extras);
      avisos.push(
        `Poucos exercícios de "${modelo.nome}" para "${p.ambiente}": completei o treino com exercícios de outros grupos.`
      );
    }

    escolhidos.forEach((e) => usadosNaSemana.set(e.id, (usadosNaSemana.get(e.id) ?? 0) + 1));

    return {
      nome: `Treino ${String.fromCharCode(65 + indice)} - ${modelo.nome}`,
      itens: escolhidos.map((exercicio) => ({ exercicio, prescricao })),
    };
  });

  if (p.objetivo === "Emagrecimento") {
    avisos.push(
      "Para emagrecimento, some cardio leve nos dias livres; o plano cobre só a musculação."
    );
  }
  return { dias, avisos };
}

/** Grupo do catálogo -> grupo usado na tabela `exercicios` do banco. */
export function grupoParaBanco(grupo: GrupoCatalogo): string {
  switch (grupo) {
    case "Ombros":
      return "Ombro";
    case "Quadríceps":
    case "Posterior":
    case "Glúteos":
    case "Panturrilha":
      return "Perna";
    case "Antebraço":
    case "Lombar":
      return "Outro";
    default:
      return grupo; // Peito, Costas, Bíceps, Tríceps, Abdômen
  }
}
