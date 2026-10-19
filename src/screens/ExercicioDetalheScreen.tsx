import React from "react";
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { CATALOGO } from "@/data/catalogoExercicios";
import type { ExerciciosStackParamList } from "@/navigation";

type Props = NativeStackScreenProps<ExerciciosStackParamList, "DetalheExercicio">;

export default function ExercicioDetalheScreen({ route }: Props) {
  const ex = CATALOGO.find((e) => e.id === route.params.id);

  if (!ex) {
    return (
      <View style={s.container}>
        <Text style={s.texto}>Exercício não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={s.titulo}>{ex.nome}</Text>
      <Text style={s.meta}>
        {ex.grupo} · {ex.nivel} · {ex.equipamento}
      </Text>
      <Text style={s.meta}>Ambientes: {ex.ambientes.join(", ")}</Text>

      <Text style={s.secao}>Sobre</Text>
      <Text style={s.texto}>{ex.descricao}</Text>

      <Text style={s.secao}>Como fazer</Text>
      {ex.passos.map((p, i) => (
        <Text key={i} style={s.texto}>
          {i + 1}. {p}
        </Text>
      ))}

      <Text style={s.secao}>Dicas</Text>
      {ex.dicas.map((d, i) => (
        <Text key={i} style={s.texto}>
          • {d}
        </Text>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  titulo: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 6 },
  meta: { color: "#22D3EE", fontSize: 13, marginBottom: 2 },
  secao: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 8 },
  texto: { color: "#CBD5E1", fontSize: 14, lineHeight: 21, marginBottom: 6 },
});
