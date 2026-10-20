import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AMBIENTES, Ambiente, Nivel } from "@/data/catalogoExercicios";
import {
  DIAS_POSSIVEIS,
  NIVEIS,
  OBJETIVOS,
  Objetivo,
  Plano,
  gerarPlano,
  grupoParaBanco,
} from "@/utils/geradorPlano";
import { exercicioRepository } from "@/repositories/exercicioRepository";
import { treinoRepository } from "@/repositories/treinoRepository";
import type { TreinosStackParamList } from "@/navigation";

type Nav = NativeStackNavigationProp<TreinosStackParamList, "GerarPlano">;

export default function GerarPlanoScreen() {
  const navigation = useNavigation<Nav>();
  const [objetivo, setObjetivo] = useState<Objetivo>("Hipertrofia");
  const [nivel, setNivel] = useState<Nivel>("Iniciante");
  const [dias, setDias] = useState(3);
  const [ambiente, setAmbiente] = useState<Ambiente>("Academia");
  const [plano, setPlano] = useState<Plano | null>(null);
  const [salvando, setSalvando] = useState(false);

  function gerar() {
    setPlano(gerarPlano({ objetivo, nivel, dias, ambiente }));
  }

  async function salvar() {
    if (!plano || salvando) return;
    setSalvando(true);
    try {
      // reaproveita exercícios do banco pelo nome; cria os que faltam
      const existentes = await exercicioRepository.listar();
      const idPorNome = new Map(existentes.map((e) => [e.nome.toLowerCase(), e.id]));

      for (const dia of plano.dias) {
        const ids: number[] = [];
        for (const { exercicio } of dia.itens) {
          const chave = exercicio.nome.toLowerCase();
          let id = idPorNome.get(chave);
          if (id === undefined) {
            id = await exercicioRepository.criar(exercicio.nome, grupoParaBanco(exercicio.grupo));
            idPorNome.set(chave, id);
          }
          ids.push(id);
        }
        await treinoRepository.criar(dia.nome, ids);
      }

      Alert.alert("Plano salvo", `${plano.dias.length} treinos adicionados em Meus Treinos.`);
      navigation.popTo("ListaTreinos");
    } catch (e) {
      Alert.alert("Erro ao salvar o plano", String(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Opcoes titulo="Objetivo" opcoes={OBJETIVOS} valor={objetivo} onChange={setObjetivo} />
      <Opcoes titulo="Experiência" opcoes={NIVEIS} valor={nivel} onChange={setNivel} />
      <Opcoes titulo="Dias por semana" opcoes={DIAS_POSSIVEIS} valor={dias} onChange={setDias} />
      <Opcoes
        titulo="Onde você treina"
        opcoes={AMBIENTES}
        valor={ambiente}
        onChange={setAmbiente}
      />

      <TouchableOpacity style={s.botaoGerar} onPress={gerar}>
        <Text style={s.botaoGerarTexto}>{plano ? "Gerar de novo" : "Gerar plano"}</Text>
      </TouchableOpacity>

      {plano && (
        <>
          {plano.avisos.map((a, i) => (
            <Text key={i} style={s.aviso}>
              ⚠ {a}
            </Text>
          ))}

          {plano.dias.map((dia, i) => (
            <View key={i} style={s.card}>
              <Text style={s.diaNome}>{dia.nome}</Text>
              {dia.itens.map(({ exercicio, prescricao }) => (
                <View key={exercicio.id} style={s.item}>
                  <Text style={s.itemNome}>{exercicio.nome}</Text>
                  <Text style={s.itemPresc}>
                    {prescricao.series}×{prescricao.repeticoes} · {prescricao.descansoSeg}s
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <Text style={s.nota}>
            Os treinos salvos guardam só os exercícios; séries, repetições e descanso valem como
            guia.
          </Text>
          <TouchableOpacity
            style={[s.botaoSalvar, salvando && { opacity: 0.6 }]}
            onPress={salvar}
            disabled={salvando}
          >
            <Text style={s.botaoSalvarTexto}>
              {salvando ? "Salvando..." : `Salvar ${plano.dias.length} treinos`}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function Opcoes<T extends string | number>({
  titulo,
  opcoes,
  valor,
  onChange,
}: {
  titulo: string;
  opcoes: readonly T[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.rotulo}>{titulo}</Text>
      <View style={s.linha}>
        {opcoes.map((o) => (
          <TouchableOpacity
            key={String(o)}
            onPress={() => onChange(o)}
            style={[s.chip, o === valor && s.chipAtivo]}
          >
            <Text style={[s.chipTexto, o === valor && s.chipTextoAtivo]}>{String(o)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  rotulo: { color: "#94A3B8", fontSize: 13, marginBottom: 6 },
  linha: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 6,
  },
  chipAtivo: { backgroundColor: "#22D3EE", borderColor: "#22D3EE" },
  chipTexto: { color: "#CBD5E1", fontSize: 14 },
  chipTextoAtivo: { color: "#0F172A", fontWeight: "700" },
  botaoGerar: {
    backgroundColor: "#22D3EE",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginVertical: 8,
  },
  botaoGerarTexto: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
  aviso: { color: "#FBBF24", fontSize: 13, marginTop: 6 },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 14, marginTop: 12 },
  diaNome: { color: "#F1F5F9", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  item: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemNome: { color: "#CBD5E1", fontSize: 14, flex: 1, paddingRight: 8 },
  itemPresc: { color: "#22D3EE", fontSize: 13 },
  nota: { color: "#64748B", fontSize: 12, marginTop: 14 },
  botaoSalvar: {
    backgroundColor: "#16A34A",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  botaoSalvarTexto: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
