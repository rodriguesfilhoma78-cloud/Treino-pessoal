import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { sessaoRepository, EstatisticasGerais } from "@/repositories/sessaoRepository";
import { calcularConquistas, maiorSequenciaDeSemanas, Conquista } from "@/utils/conquistas";

interface Dados {
  treinos: number;
  stats: EstatisticasGerais;
  conquistas: Conquista[];
}

function formatarKg(kg: number): string {
  return kg >= 1000
    ? `${(kg / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t`
    : `${Math.round(kg).toLocaleString("pt-BR")} kg`;
}

function formatarProgresso(n: number): string {
  return Math.round(n).toLocaleString("pt-BR");
}

export default function EstatisticasScreen() {
  const [dados, setDados] = useState<Dados | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function carregar() {
        const [historico, stats] = await Promise.all([
          sessaoRepository.listarHistorico(1000),
          sessaoRepository.estatisticasGerais(),
        ]);
        const feitas = historico.filter((s) => s.totalSeries > 0);
        const conquistas = calcularConquistas({
          treinos: feitas.length,
          volumeKg: stats.volumeKg,
          semanasSeguidas: maiorSequenciaDeSemanas(feitas.map((s) => s.data)),
        });
        setDados({ treinos: feitas.length, stats, conquistas });
      }
      carregar();
    }, [])
  );

  if (!dados) return <View style={s.container} />;

  const { treinos, stats, conquistas } = dados;
  const feitas = conquistas.filter((c) => c.conquistada).length;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      <Text style={s.titulo}>Estatísticas</Text>

      <View style={s.grade}>
        <Numero valor={String(treinos)} rotulo="treinos" />
        <Numero valor={String(stats.totalSeries)} rotulo="séries" />
        <Numero valor={stats.totalReps.toLocaleString("pt-BR")} rotulo="repetições" />
        <Numero valor={formatarKg(stats.volumeKg)} rotulo="volume total" />
      </View>

      <View style={s.card}>
        <Text style={s.rotulo}>Maior carga registrada</Text>
        {stats.recordeCarga !== null ? (
          <Text style={s.recorde}>
            {stats.recordeCarga} kg <Text style={s.recordeNome}>· {stats.recordeExercicio}</Text>
          </Text>
        ) : (
          <Text style={s.vazio}>Ainda sem séries registradas.</Text>
        )}
      </View>

      <Text style={s.secao}>
        Conquistas ({feitas}/{conquistas.length})
      </Text>
      {conquistas.map((c) => (
        <View key={c.id} style={[s.conquista, !c.conquistada && s.conquistaPendente]}>
          <View style={{ flex: 1 }}>
            <Text style={s.conquistaTitulo}>
              {c.conquistada ? "✓ " : ""}
              {c.titulo}
            </Text>
            <Text style={s.conquistaDesc}>{c.descricao}</Text>
            <View style={s.trilho}>
              <View style={[s.preenchido, { width: `${(c.atual / c.meta) * 100}%` }]} />
            </View>
          </View>
          <Text style={s.progresso}>
            {formatarProgresso(c.atual)}/{formatarProgresso(c.meta)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={s.numero}>
      <View style={s.numeroCaixa}>
        <Text style={s.numeroValor}>{valor}</Text>
        <Text style={s.numeroRotulo}>{rotulo}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  titulo: { color: "#F1F5F9", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  grade: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  numero: { width: "50%", paddingHorizontal: 4, marginBottom: 8 },
  numeroCaixa: { backgroundColor: "#1E293B", borderRadius: 12, padding: 14 },
  numeroValor: { color: "#22D3EE", fontSize: 24, fontWeight: "700" },
  numeroRotulo: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  rotulo: { color: "#94A3B8", fontSize: 13 },
  recorde: { color: "#F1F5F9", fontSize: 20, fontWeight: "700", marginTop: 4 },
  recordeNome: { color: "#94A3B8", fontSize: 14, fontWeight: "400" },
  vazio: { color: "#64748B", marginTop: 4 },
  secao: { color: "#F1F5F9", fontSize: 17, fontWeight: "700", marginTop: 16, marginBottom: 10 },
  conquista: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  conquistaPendente: { opacity: 0.65 },
  conquistaTitulo: { color: "#F1F5F9", fontSize: 15, fontWeight: "600" },
  conquistaDesc: { color: "#94A3B8", fontSize: 12, marginTop: 2, marginBottom: 8 },
  trilho: { height: 6, backgroundColor: "#0F172A", borderRadius: 3, overflow: "hidden" },
  preenchido: { height: 6, backgroundColor: "#16A34A", borderRadius: 3 },
  progresso: { color: "#22D3EE", fontSize: 12, marginLeft: 12 },
});
