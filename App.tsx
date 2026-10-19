import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

import { inicializarBanco } from "@/db/database";
import RootNavigation from "@/navigation";

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    inicializarBanco()
      .then(() => setPronto(true))
      .catch((e) => setErro(String(e)));
  }, []);

  if (erro) {
    return (
      <View style={styles.centro}>
        <Text style={styles.erro}>Erro ao iniciar o banco: {erro}</Text>
      </View>
    );
  }

  if (!pronto) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#22D3EE" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigation />
    </>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center" },
  erro: { color: "#F87171", padding: 24, textAlign: "center" },
});
