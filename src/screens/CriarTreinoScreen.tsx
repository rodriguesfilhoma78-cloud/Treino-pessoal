import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { exercicioRepository } from "@/repositories/exercicioRepository";
import { treinoRepository } from "@/repositories/treinoRepository";
import { Exercicio } from "@/types";
import { TreinosStackParamList } from "@/navigation";

type Nav = NativeStackNavigationProp<TreinosStackParamList, "CriarTreino">;

export default function CriarTreinoScreen() {
  const navigation = useNavigation<Nav>();
  const [nome, setNome] = useState("");
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  useEffect(() => {
    exercicioRepository.listar().then(setExercicios);
  }, []);

  function alternarSelecao(id: number) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Dê um nome ao treino", "Ex: Treino A - Peito/Tríceps");
      return;
    }
    if (selecionados.length === 0) {
      Alert.alert("Selecione pelo menos um exercício");
      return;
    }
    await treinoRepository.criar(nome.trim(), selecionados);
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do treino (ex: Treino A)"
        placeholderTextColor="#64748B"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.secao}>Exercícios ({selecionados.length} selecionados)</Text>

      <FlatList
        data={exercicios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const ativo = selecionados.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, ativo && styles.itemAtivo]}
              onPress={() => alternarSelecao(item.id)}
            >
              <Text style={[styles.itemTexto, ativo && styles.itemTextoAtivo]}>{item.nome}</Text>
              <Text style={styles.itemGrupo}>{item.grupoMuscular}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.botaoSalvar} onPress={salvar}>
        <Text style={styles.botaoSalvarTexto}>Salvar treino</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", padding: 16 },
  input: {
    backgroundColor: "#1E293B",
    color: "#F1F5F9",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  secao: { color: "#94A3B8", fontSize: 13, marginBottom: 8, textTransform: "uppercase" },
  item: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemAtivo: { backgroundColor: "#164E63", borderWidth: 1, borderColor: "#22D3EE" },
  itemTexto: { color: "#F1F5F9", fontSize: 15 },
  itemTextoAtivo: { fontWeight: "700" },
  itemGrupo: { color: "#64748B", fontSize: 12 },
  botaoSalvar: {
    backgroundColor: "#22D3EE",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoSalvarTexto: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
});
