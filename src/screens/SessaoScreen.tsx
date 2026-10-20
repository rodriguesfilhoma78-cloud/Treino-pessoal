import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { treinoRepository } from "@/repositories/treinoRepository";
import { sessaoRepository } from "@/repositories/sessaoRepository";
import { exercicioRepository } from "@/repositories/exercicioRepository";
import { Exercicio, SerieRegistrada } from "@/types";
import { TreinosStackParamList } from "@/navigation";
import TimerDescanso from "@/components/TimerDescanso";

type Rota = RouteProp<TreinosStackParamList, "Sessao">;
type Nav = NativeStackNavigationProp<TreinosStackParamList, "Sessao">;

export default function SessaoScreen() {
  const { params } = useRoute<Rota>();
  const navigation = useNavigation<Nav>();

  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [sessaoId, setSessaoId] = useState<number | null>(null);
  const [seriesFeitas, setSeriesFeitas] = useState<SerieRegistrada[]>([]);

  // troca de exercício: vale só para esta sessão, o treino salvo não muda
  const [trocando, setTrocando] = useState<Exercicio | null>(null);
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);

  async function abrirTroca(exercicio: Exercicio) {
    setTodosExercicios(await exercicioRepository.listar());
    setTrocando(exercicio);
  }

  function confirmarTroca(novo: Exercicio) {
    if (!trocando) return;
    setExercicios((atual) => atual.map((e) => (e.id === trocando.id ? novo : e)));
    setTrocando(null);
  }

  // alternativas: mesmo grupo primeiro; esconde os que já estão no treino
  const alternativas = trocando
    ? todosExercicios
        .filter((e) => !exercicios.some((x) => x.id === e.id))
        .sort((a, b) => {
          const pa = a.grupoMuscular === trocando.grupoMuscular ? 0 : 1;
          const pb = b.grupoMuscular === trocando.grupoMuscular ? 0 : 1;
          return pa - pb || a.nome.localeCompare(b.nome, "pt-BR");
        })
    : [];

  // timer de descanso: `disparoDescanso` sobe a cada série e reinicia a contagem
  const [disparoDescanso, setDisparoDescanso] = useState(0);
  const [duracaoDescanso, setDuracaoDescanso] = useState(90);

  // carga/reps digitados por exercício, indexado por exercicioId
  const [inputs, setInputs] = useState<Record<number, { carga: string; reps: string }>>({});

  useEffect(() => {
    async function iniciar() {
      const treino = await treinoRepository.buscarComExercicios(params.treinoId);
      if (!treino) return;
      setExercicios(treino.exercicios);

      const id = await sessaoRepository.iniciar(params.treinoId);
      setSessaoId(id);
    }
    iniciar();
  }, [params.treinoId]);

  function atualizarInput(exercicioId: number, campo: "carga" | "reps", valor: string) {
    setInputs((atual) => ({
      ...atual,
      [exercicioId]: { ...atual[exercicioId], [campo]: valor },
    }));
  }

  async function registrarSerie(exercicioId: number) {
    if (!sessaoId) return;
    const valores = inputs[exercicioId];
    const carga = parseFloat(valores?.carga?.replace(",", "."));
    const reps = parseInt(valores?.reps, 10);

    if (isNaN(carga) || isNaN(reps)) {
      Alert.alert("Preencha carga e repetições");
      return;
    }

    await sessaoRepository.registrarSerie(sessaoId, exercicioId, carga, reps);
    const atualizadas = await sessaoRepository.listarSeriesDaSessao(sessaoId);
    setSeriesFeitas(atualizadas);
    setDisparoDescanso((n) => n + 1);

    // limpa os campos desse exercício pra próxima série
    setInputs((atual) => ({ ...atual, [exercicioId]: { carga: "", reps: "" } }));
  }

  function seriesDoExercicio(exercicioId: number): SerieRegistrada[] {
    return seriesFeitas.filter((s) => s.exercicioId === exercicioId);
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {exercicios.map((exercicio) => (
          <View key={exercicio.id} style={styles.card}>
            <View style={styles.cabecalhoExercicio}>
              <Text style={[styles.nomeExercicio, { flex: 1, marginBottom: 0 }]}>
                {exercicio.nome}
              </Text>
              <TouchableOpacity onPress={() => abrirTroca(exercicio)} style={styles.botaoTrocar}>
                <Text style={styles.botaoTrocarTexto}>Trocar</Text>
              </TouchableOpacity>
            </View>

            {seriesDoExercicio(exercicio.id).map((serie, idx) => (
              <Text key={serie.id} style={styles.serieFeita}>
                Série {idx + 1}: {serie.carga}kg × {serie.repeticoes}
              </Text>
            ))}

            <View style={styles.linhaInput}>
              <TextInput
                style={styles.inputPequeno}
                placeholder="kg"
                placeholderTextColor="#64748B"
                keyboardType="decimal-pad"
                value={inputs[exercicio.id]?.carga ?? ""}
                onChangeText={(v) => atualizarInput(exercicio.id, "carga", v)}
              />
              <TextInput
                style={styles.inputPequeno}
                placeholder="reps"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                value={inputs[exercicio.id]?.reps ?? ""}
                onChangeText={(v) => atualizarInput(exercicio.id, "reps", v)}
              />
              <TouchableOpacity
                style={styles.botaoAdd}
                onPress={() => registrarSerie(exercicio.id)}
              >
                <Text style={styles.botaoAddTexto}>+ Série</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={() => navigation.popTo("ListaTreinos")}
        >
          <Text style={styles.botaoFinalizarTexto}>Finalizar treino</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={trocando !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setTrocando(null)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCaixa}>
            <Text style={styles.modalTitulo}>Trocar {trocando?.nome}</Text>
            <FlatList
              data={alternativas}
              keyExtractor={(e) => String(e.id)}
              ListEmptyComponent={
                <Text style={styles.modalVazio}>Nenhum outro exercício disponível.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => confirmarTroca(item)}>
                  <Text style={styles.modalItemNome}>{item.nome}</Text>
                  <Text style={styles.modalItemGrupo}>{item.grupoMuscular}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancelar} onPress={() => setTrocando(null)}>
              <Text style={styles.modalCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TimerDescanso
        disparo={disparoDescanso}
        duracao={duracaoDescanso}
        onMudarDuracao={setDuracaoDescanso}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12 },
  nomeExercicio: { color: "#F1F5F9", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cabecalhoExercicio: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  botaoTrocar: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  botaoTrocarTexto: { color: "#22D3EE", fontSize: 12, fontWeight: "600" },
  modalFundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalCaixa: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "75%",
  },
  modalTitulo: { color: "#F1F5F9", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  modalItem: { backgroundColor: "#1E293B", borderRadius: 10, padding: 12, marginBottom: 8 },
  modalItemNome: { color: "#F1F5F9", fontSize: 15 },
  modalItemGrupo: { color: "#22D3EE", fontSize: 12, marginTop: 2 },
  modalVazio: { color: "#64748B", textAlign: "center", marginVertical: 24 },
  modalCancelar: { padding: 12, alignItems: "center" },
  modalCancelarTexto: { color: "#94A3B8" },
  serieFeita: { color: "#94A3B8", fontSize: 13, marginBottom: 2 },
  linhaInput: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" },
  inputPequeno: {
    backgroundColor: "#0F172A",
    color: "#F1F5F9",
    borderRadius: 8,
    padding: 10,
    width: 70,
    textAlign: "center",
  },
  botaoAdd: {
    backgroundColor: "#22D3EE",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
  },
  botaoAddTexto: { color: "#0F172A", fontWeight: "700", textAlign: "center" },
  botaoFinalizar: {
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  botaoFinalizarTexto: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
