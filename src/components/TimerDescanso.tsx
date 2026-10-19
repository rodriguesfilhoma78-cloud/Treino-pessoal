import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";

export const DURACOES_DESCANSO = [30, 60, 90, 120, 180];

interface Props {
  /** Muda a cada série registrada; reinicia a contagem. 0 = ainda não iniciado. */
  disparo: number;
  duracao: number;
  onMudarDuracao: (segundos: number) => void;
}

function formatar(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Contagem regressiva de descanso entre séries. Calcula o restante a partir
 * do horário de término (não de ticks), então não atrasa se o app pausar.
 */
export default function TimerDescanso({ disparo, duracao, onMudarDuracao }: Props) {
  const [fim, setFim] = useState<number | null>(null);
  const [restante, setRestante] = useState(0);
  const avisou = useRef(false);

  useEffect(() => {
    if (disparo === 0) return;
    avisou.current = false;
    setFim(Date.now() + duracao * 1000);
    setRestante(duracao);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disparo]);

  useEffect(() => {
    if (fim === null) return;
    const id = setInterval(() => {
      const seg = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
      setRestante(seg);
      if (seg === 0) {
        clearInterval(id);
        if (!avisou.current) {
          avisou.current = true;
          Vibration.vibrate([0, 400, 150, 400]);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [fim]);

  function ajustar(delta: number) {
    if (fim === null) return;
    setFim(fim + delta * 1000);
    avisou.current = false;
  }

  function parar() {
    setFim(null);
    setRestante(0);
  }

  const ativo = fim !== null;
  const acabou = ativo && restante === 0;

  return (
    <View style={s.barra}>
      <View style={s.topo}>
        <Text style={s.rotulo}>Descanso</Text>
        <Text style={[s.tempo, acabou && s.tempoFim]}>
          {ativo ? (acabou ? "Pronto!" : formatar(restante)) : formatar(duracao)}
        </Text>
        {ativo && (
          <View style={s.acoes}>
            <TouchableOpacity onPress={() => ajustar(-15)} style={s.mini}>
              <Text style={s.miniTexto}>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => ajustar(15)} style={s.mini}>
              <Text style={s.miniTexto}>+15s</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={parar} style={s.mini}>
              <Text style={s.miniTexto}>Parar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={s.presets}>
        {DURACOES_DESCANSO.map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => onMudarDuracao(d)}
            style={[s.chip, d === duracao && s.chipAtivo]}
          >
            <Text style={[s.chipTexto, d === duracao && s.chipTextoAtivo]}>{formatar(d)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  barra: {
    backgroundColor: "#111C30",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topo: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  rotulo: { color: "#94A3B8", fontSize: 13, marginRight: 10 },
  tempo: { color: "#F1F5F9", fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] },
  tempoFim: { color: "#22D3EE" },
  acoes: { flexDirection: "row", marginLeft: "auto" },
  mini: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 6,
  },
  miniTexto: { color: "#CBD5E1", fontSize: 12 },
  presets: { flexDirection: "row" },
  chip: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  chipAtivo: { backgroundColor: "#22D3EE", borderColor: "#22D3EE" },
  chipTexto: { color: "#CBD5E1", fontSize: 12 },
  chipTextoAtivo: { color: "#0F172A", fontWeight: "600" },
});
