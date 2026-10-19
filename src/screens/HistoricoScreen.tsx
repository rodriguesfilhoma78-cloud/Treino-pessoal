import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { sessaoRepository, SessaoComTreino } from "@/repositories/sessaoRepository";

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HistoricoScreen() {
  const [sessoes, setSessoes] = useState<SessaoComTreino[]>([]);

  useFocusEffect(
    useCallback(() => {
      sessaoRepository.listarHistorico().then(setSessoes);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>
      <FlatList
        data={sessoes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma sessão registrada ainda.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.cardTitulo}>{item.treinoNome}</Text>
              <Text style={styles.cardData}>{formatarData(item.data)}</Text>
            </View>
            <Text style={styles.cardSeries}>{item.totalSeries} séries</Text>
          </View>
        )}
      />
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
  lista: { padding: 16, paddingTop: 0, flexGrow: 1 },
  vazio: { color: "#64748B", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitulo: { color: "#F1F5F9", fontSize: 15, fontWeight: "600" },
  cardData: { color: "#64748B", fontSize: 12, marginTop: 2 },
  cardSeries: { color: "#22D3EE", fontSize: 13, fontWeight: "600" },
});
