import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { treinoRepository } from "@/repositories/treinoRepository";
import { Treino } from "@/types";
import { TreinosStackParamList } from "@/navigation";

type Nav = NativeStackNavigationProp<TreinosStackParamList, "ListaTreinos">;

export default function TreinosScreen() {
  const navigation = useNavigation<Nav>();
  const [treinos, setTreinos] = useState<Treino[]>([]);

  // Recarrega sempre que a tela ganha foco (ex: após criar um treino novo)
  useFocusEffect(
    useCallback(() => {
      treinoRepository.listar().then(setTreinos);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={treinos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum treino cadastrado ainda. Toque em "+ Novo treino" pra começar.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("Sessao", { treinoId: item.id, treinoNome: item.nome })
            }
          >
            <Text style={styles.cardTitulo}>{item.nome}</Text>
            <Text style={styles.cardSeta}>›</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.botaoGerar} onPress={() => navigation.navigate("GerarPlano")}>
        <Text style={styles.botaoGerarTexto}>Gerar plano de treino</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate("CriarTreino")}>
        <Text style={styles.botaoNovoTexto}>+ Novo treino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  lista: { padding: 16, flexGrow: 1 },
  vazio: { color: "#64748B", textAlign: "center", marginTop: 40, fontSize: 15 },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitulo: { color: "#F1F5F9", fontSize: 16, fontWeight: "600" },
  cardSeta: { color: "#64748B", fontSize: 20 },
  botaoGerar: {
    borderWidth: 1,
    borderColor: "#22D3EE",
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoGerarTexto: { color: "#22D3EE", fontWeight: "700", fontSize: 15 },
  botaoNovo: {
    backgroundColor: "#22D3EE",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoNovoTexto: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
});
