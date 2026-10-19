import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TreinosScreen from "@/screens/TreinosScreen";
import CriarTreinoScreen from "@/screens/CriarTreinoScreen";
import SessaoScreen from "@/screens/SessaoScreen";
import HistoricoScreen from "@/screens/HistoricoScreen";
import ProgressoScreen from "@/screens/ProgressoScreen";
import InicioScreen from "@/screens/InicioScreen";
import GerarPlanoScreen from "@/screens/GerarPlanoScreen";
import EstatisticasScreen from "@/screens/EstatisticasScreen";
import ExerciciosScreen from "@/screens/ExerciciosScreen";
import ExercicioDetalheScreen from "@/screens/ExercicioDetalheScreen";

export type TreinosStackParamList = {
  ListaTreinos: undefined;
  CriarTreino: undefined;
  GerarPlano: undefined;
  Sessao: { treinoId: number; treinoNome: string };
};

export type ExerciciosStackParamList = {
  ListaExercicios: undefined;
  DetalheExercicio: { id: string };
};

const TreinosStack = createNativeStackNavigator<TreinosStackParamList>();
const ExerciciosStack = createNativeStackNavigator<ExerciciosStackParamList>();
const Tab = createBottomTabNavigator();

function ExerciciosStackNavigator() {
  return (
    <ExerciciosStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: "#0F172A" }, headerTintColor: "#fff" }}
    >
      <ExerciciosStack.Screen
        name="ListaExercicios"
        component={ExerciciosScreen}
        options={{ title: "Exercícios" }}
      />
      <ExerciciosStack.Screen
        name="DetalheExercicio"
        component={ExercicioDetalheScreen}
        options={{ title: "Exercício" }}
      />
    </ExerciciosStack.Navigator>
  );
}

function TreinosStackNavigator() {
  return (
    <TreinosStack.Navigator
      screenOptions={{ headerStyle: { backgroundColor: "#0F172A" }, headerTintColor: "#fff" }}
    >
      <TreinosStack.Screen
        name="ListaTreinos"
        component={TreinosScreen}
        options={{ title: "Meus Treinos" }}
      />
      <TreinosStack.Screen
        name="CriarTreino"
        component={CriarTreinoScreen}
        options={{ title: "Novo Treino" }}
      />
      <TreinosStack.Screen
        name="GerarPlano"
        component={GerarPlanoScreen}
        options={{ title: "Gerar plano" }}
      />
      <TreinosStack.Screen
        name="Sessao"
        component={SessaoScreen}
        options={({ route }) => ({ title: route.params.treinoNome })}
      />
    </TreinosStack.Navigator>
  );
}

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#22D3EE",
          tabBarStyle: { backgroundColor: "#0F172A", borderTopColor: "#1E293B" },
          tabBarInactiveTintColor: "#64748B",
        }}
      >
        <Tab.Screen name="Início" component={InicioScreen} />
        <Tab.Screen name="Treinos" component={TreinosStackNavigator} />
        <Tab.Screen name="Exercícios" component={ExerciciosStackNavigator} />
        <Tab.Screen name="Histórico" component={HistoricoScreen} />
        <Tab.Screen name="Progresso" component={ProgressoScreen} />
        <Tab.Screen name="Estatísticas" component={EstatisticasScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
