import React, { useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, ScrollView, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  CATALOGO,
  GRUPOS_CATALOGO,
  AMBIENTES,
  GrupoCatalogo,
  Ambiente,
} from "@/data/catalogoExercicios";
import type { ExerciciosStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<ExerciciosStackParamList, "ListaExercicios">;
type Ordem = "popularidade" | "az";

export default function ExerciciosScreen({ navigation }: Props) {
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<GrupoCatalogo | null>(null);
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [ordem, setOrdem] = useState<Ordem>("popularidade");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return CATALOGO.filter(
      (e) =>
        (!grupo || e.grupo === grupo) &&
        (!ambiente || e.ambientes.includes(ambiente)) &&
        (!termo || e.nome.toLowerCase().includes(termo))
    ).sort((a, b) =>
      ordem === "az" ? a.nome.localeCompare(b.nome, "pt-BR") : a.popularidade - b.popularidade
    );
  }, [busca, grupo, ambiente, ordem]);

  return (
    <View style={s.container}>
      <TextInput
        style={s.busca}
        placeholder="Buscar exercício"
        placeholderTextColor="#64748B"
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={s.rotulo}>Grupo muscular</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips}>
        {GRUPOS_CATALOGO.map((g) => (
          <Chip
            key={g}
            texto={g}
            ativo={grupo === g}
            onPress={() => setGrupo(grupo === g ? null : g)}
          />
        ))}
      </ScrollView>

      <Text style={s.rotulo}>Onde você treina</Text>
      <View style={s.linha}>
        {AMBIENTES.map((a) => (
          <Chip
            key={a}
            texto={a}
            ativo={ambiente === a}
            onPress={() => setAmbiente(ambiente === a ? null : a)}
          />
        ))}
      </View>

      <View style={s.cabecalhoLista}>
        <Text style={s.rotulo}>{lista.length} exercícios</Text>
        <View style={s.linha}>
          <Chip
            texto="Popularidade"
            ativo={ordem === "popularidade"}
            onPress={() => setOrdem("popularidade")}
          />
          <Chip texto="A-Z" ativo={ordem === "az"} onPress={() => setOrdem("az")} />
        </View>
      </View>

      <FlatList
        data={lista}
        keyExtractor={(e) => e.id}
        ListEmptyComponent={<Text style={s.vazio}>Nenhum exercício encontrado.</Text>}
        renderItem={({ item, index }) => (
          <Pressable
            style={s.card}
            onPress={() => navigation.navigate("DetalheExercicio", { id: item.id })}
          >
            <Text style={s.nome}>
              {ordem === "popularidade" ? `${index + 1}. ` : ""}
              {item.nome}
            </Text>
            <Text style={s.descricao} numberOfLines={2}>
              {item.descricao}
            </Text>
            <Text style={s.meta}>
              {item.grupo} · {item.nivel} · {item.equipamento}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

function Chip({ texto, ativo, onPress }: { texto: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, ativo && s.chipAtivo]}>
      <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>{texto}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220", padding: 16 },
  busca: {
    backgroundColor: "#1E293B",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  rotulo: { color: "#94A3B8", fontSize: 12, marginTop: 8, marginBottom: 6 },
  chips: { flexGrow: 0, flexShrink: 0 },
  linha: { flexDirection: "row", flexWrap: "wrap" },
  cabecalhoLista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  chipAtivo: { backgroundColor: "#22D3EE", borderColor: "#22D3EE" },
  chipTexto: { color: "#CBD5E1", fontSize: 13 },
  chipTextoAtivo: { color: "#0F172A", fontWeight: "600" },
  card: { backgroundColor: "#111C30", borderRadius: 12, padding: 14, marginBottom: 10 },
  nome: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  descricao: { color: "#94A3B8", fontSize: 13, marginBottom: 6 },
  meta: { color: "#22D3EE", fontSize: 12 },
  vazio: { color: "#64748B", textAlign: "center", marginTop: 32 },
});
