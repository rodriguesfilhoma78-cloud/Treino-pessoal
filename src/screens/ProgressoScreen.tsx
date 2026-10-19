import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

import { exercicioRepository } from "@/repositories/exercicioRepository";
import { sessaoRepository } from "@/repositories/sessaoRepository";
import { Exercicio, PontoProgressao } from "@/types";

const larguraTela = Dimensions.get("window").width;

export default function ProgressoScreen() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selecionado, setSelecionado] = useState<Exercicio | null>(null);
  const [pontos, setPontos] = useState<PontoProgressao[]>([]);

  useEffect(() => {
    exercicioRepository.listar().then((lista) => {
      setExercicios(lista);
      if (lista.length > 0) setSelecionado(lista[0]);
    });
  }, []);

  useEffect(() => {
    if (!selecionado) return;
    sessaoRepository.progressaoPorExercicio(selecionado.id).then(setPontos);
  }, [selecionado]);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Progresso</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seletorLinha}>
        {exercicios.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            style={[styles.chip, selecionado?.id === ex.id && styles.chipAtivo]}
            onPress={() => setSelecionado(ex)}
          >
            <Text style={[styles.chipTexto, selecionado?.id === ex.id && styles.chipTextoAtivo]}>
              {ex.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {pontos.length >= 2 ? (
        <LineChart
          data={{
            labels: pontos.map((p) =>
              new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
            ),
            datasets: [{ data: pontos.map((p) => p.cargaMaxima) }],
          }}
          width={larguraTela - 32}
          height={220}
          yAxisSuffix="kg"
          chartConfig={{
            backgroundColor: "#1E293B",
            backgroundGradientFrom: "#1E293B",
            backgroundGradientTo: "#1E293B",
            decimalPlaces: 1,
            color: () => "#22D3EE",
            labelColor: () => "#94A3B8",
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#0F172A" },
          }}
          style={styles.grafico}
          bezier
        />
      ) : (
        <Text style={styles.vazio}>
          Registre pelo menos 2 sessões com esse exercício pra ver a evolução de carga.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", paddingTop: 60 },
  titulo: {
    color: "#F1F5F9",
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seletorLinha: { paddingHorizontal: 16, marginBottom: 16, flexGrow: 0 },
  chip: {
    backgroundColor: "#1E293B",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  chipAtivo: { backgroundColor: "#22D3EE" },
  chipTexto: { color: "#94A3B8", fontSize: 13 },
  chipTextoAtivo: { color: "#0F172A", fontWeight: "700" },
  grafico: { marginHorizontal: 16, borderRadius: 12 },
  vazio: { color: "#64748B", textAlign: "center", marginTop: 40, paddingHorizontal: 32 },
});
