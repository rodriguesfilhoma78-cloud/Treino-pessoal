import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { sessaoRepository, SessaoComTreino } from "@/repositories/sessaoRepository";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Chave local YYYY-MM-DD (as sessões são gravadas em UTC; o dia que conta é o do aparelho). */
function chaveDia(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Segunda-feira da semana de `ref`, à meia-noite local. */
function inicioDaSemana(ref: Date): Date {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const delta = (d.getDay() + 6) % 7; // domingo=0 -> 6
  d.setDate(d.getDate() - delta);
  return d;
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

export default function InicioScreen() {
  const navigation = useNavigation<any>();
  const [sessoes, setSessoes] = useState<SessaoComTreino[]>([]);

  useFocusEffect(
    useCallback(() => {
      sessaoRepository.listarHistorico(200).then(setSessoes);
    }, [])
  );

  // sessão aberta sem nenhuma série registrada não conta como treino feito
  const feitas = sessoes.filter((s) => s.totalSeries > 0);
  const diasTreinados = new Set(feitas.map((s) => chaveDia(new Date(s.data))));

  const hoje = new Date();
  const segunda = inicioDaSemana(hoje);
  const semana = DIAS.map((rotulo, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    const chave = chaveDia(d);
    return {
      rotulo,
      numero: d.getDate(),
      treinou: diasTreinados.has(chave),
      ehHoje: chave === chaveDia(hoje),
    };
  });

  const treinosNaSemana = semana.filter((d) => d.treinou).length;
  const ultima = feitas[0];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingTop: 60 }}>
      <Text style={s.titulo}>Esta semana</Text>

      <View style={s.semana}>
        {semana.map((d) => (
          <View key={d.rotulo} style={[s.dia, d.ehHoje && s.diaHoje]}>
            <Text style={[s.diaRotulo, d.ehHoje && s.diaTextoHoje]}>{d.rotulo}</Text>
            <Text style={[s.diaNumero, d.ehHoje && s.diaTextoHoje]}>{d.numero}</Text>
            <View style={[s.marca, d.treinou && s.marcaFeita]} />
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardValor}>{treinosNaSemana}/7</Text>
        <Text style={s.cardRotulo}>dias treinados nesta semana</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardRotulo}>Último treino</Text>
        {ultima ? (
          <>
            <Text style={s.cardTitulo}>{ultima.treinoNome}</Text>
            <Text style={s.cardData}>
              {formatarData(ultima.data)} · {ultima.totalSeries} séries
            </Text>
          </>
        ) : (
          <Text style={s.cardData}>Nenhum treino registrado ainda.</Text>
        )}
      </View>

      <TouchableOpacity style={s.botao} onPress={() => navigation.navigate("Treinos")}>
        <Text style={s.botaoTexto}>Começar um treino</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  titulo: { color: "#F1F5F9", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  semana: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  dia: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: "#1E293B",
  },
  diaHoje: { backgroundColor: "#22D3EE" },
  diaRotulo: { color: "#94A3B8", fontSize: 11 },
  diaNumero: { color: "#F1F5F9", fontSize: 16, fontWeight: "700", marginVertical: 4 },
  diaTextoHoje: { color: "#0F172A" },
  marca: { width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: "#475569" },
  marcaFeita: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  card: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 12 },
  cardValor: { color: "#22D3EE", fontSize: 28, fontWeight: "700" },
  cardRotulo: { color: "#94A3B8", fontSize: 13 },
  cardTitulo: { color: "#F1F5F9", fontSize: 16, fontWeight: "600", marginTop: 4 },
  cardData: { color: "#64748B", fontSize: 13, marginTop: 2 },
  botao: {
    backgroundColor: "#22D3EE",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  botaoTexto: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
});
