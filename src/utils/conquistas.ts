/**
 * Cálculo de conquistas a partir de números já agregados.
 * Funções puras: não tocam no banco nem em estado de tela.
 */

export interface ResumoParaConquistas {
  treinos: number; // sessões com pelo menos uma série
  volumeKg: number;
  semanasSeguidas: number; // maior sequência de semanas com 3+ treinos
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  atual: number;
  meta: number;
  conquistada: boolean;
}

function faixa(
  id: string,
  titulo: string,
  descricao: string,
  atual: number,
  meta: number
): Conquista {
  return { id, titulo, descricao, atual: Math.min(atual, meta), meta, conquistada: atual >= meta };
}

export function calcularConquistas(r: ResumoParaConquistas): Conquista[] {
  return [
    faixa("primeiro", "Primeiro passo", "Complete seu primeiro treino", r.treinos, 1),
    faixa("t10", "Pegando o ritmo", "Complete 10 treinos", r.treinos, 10),
    faixa("t50", "Rotina de ferro", "Complete 50 treinos", r.treinos, 50),
    faixa("t100", "Centurião", "Complete 100 treinos", r.treinos, 100),
    faixa("v1k", "Mil quilos", "Levante 1.000 kg de volume total", r.volumeKg, 1000),
    faixa("v10k", "Dez toneladas", "Levante 10.000 kg de volume total", r.volumeKg, 10000),
    faixa("v100k", "Cem toneladas", "Levante 100.000 kg de volume total", r.volumeKg, 100000),
    faixa("s2", "Constância", "2 semanas seguidas com 3+ treinos", r.semanasSeguidas, 2),
    faixa("s4", "Hábito formado", "4 semanas seguidas com 3+ treinos", r.semanasSeguidas, 4),
  ];
}

/** Segunda-feira da semana de `d` como chave YYYY-MM-DD local. */
function chaveSemana(d: Date): string {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const dia = String(base.getDate()).padStart(2, "0");
  return `${base.getFullYear()}-${m}-${dia}`;
}

/** Maior sequência de semanas consecutivas com pelo menos `minimo` dias de treino. */
export function maiorSequenciaDeSemanas(datasIso: string[], minimo = 3): number {
  const diasPorSemana = new Map<string, Set<string>>();
  for (const iso of datasIso) {
    const d = new Date(iso);
    const semana = chaveSemana(d);
    const dia = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!diasPorSemana.has(semana)) diasPorSemana.set(semana, new Set());
    diasPorSemana.get(semana)!.add(dia);
  }

  const boas = [...diasPorSemana.entries()]
    .filter(([, dias]) => dias.size >= minimo)
    .map(([semana]) => new Date(`${semana}T00:00:00`).getTime())
    .sort((a, b) => a - b);

  let melhor = 0;
  let atual = 0;
  let anterior: number | null = null;
  for (const t of boas) {
    // 7 dias, com folga de 2h para mudança de horário de verão
    atual =
      anterior !== null && Math.abs(t - anterior - 7 * 86400000) < 3600000 * 2 ? atual + 1 : 1;
    melhor = Math.max(melhor, atual);
    anterior = t;
  }
  return melhor;
}
