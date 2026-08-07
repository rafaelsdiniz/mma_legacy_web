import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LutaRoundARound } from "@/components/jogo/luta-round-a-round";
import { renderizar } from "@/teste/cenario";
import type { DesfechoDaUltimaLuta, RoundDaLuta } from "@/lib/api/tipos";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function round(numero: number, ajustes: Partial<RoundDaLuta> = {}): RoundDaLuta {
  return {
    numero,
    vencedor: "Lutador",
    lutadorBuscouQueda: false,
    lutadorControlou: false,
    adversarioBuscouQueda: false,
    adversarioControlou: false,
    fadigaDoLutador: 20,
    fadigaDoAdversario: 25,
    danoDoLutador: 5,
    danoDoAdversario: 12,
    encerramento: null,
    ...ajustes,
  };
}

/** O intervalo do componente: uma chamada de `avancar` revela um round. */
const INTERVALO_ENTRE_ROUNDS = 900;

const DESFECHO: DesfechoDaUltimaLuta = {
  luta: {
    ordem: 1,
    idade: 25,
    adversario: "Bruno Falcao",
    overallDoAdversario: 84,
    estiloDoAdversario: "Nocauteador",
    organizacao: "CircuitoRegional",
    categoria: "MeioPesado",
    valendoCinturao: false,
    disputaDeCinturao: false,
    defesaDeCinturao: false,
    roundsProgramados: 3,
    resultado: "Vitoria",
    metodo: "Decisao",
    roundDoEncerramento: 3,
  },
  rounds: [round(1), round(2), round(3)],
};

describe("luta round a round", () => {
  it("comeca sem nenhum round e sem entregar o resultado", () => {
    renderizar(<LutaRoundARound desfecho={DESFECHO} />);

    expect(screen.queryByText("Round 1")).not.toBeInTheDocument();
    expect(screen.queryByText(/vitória/i)).not.toBeInTheDocument();
    expect(screen.getByText("Round 1 de 3")).toBeInTheDocument();
  });

  it("revela um round de cada vez", async () => {
    renderizar(<LutaRoundARound desfecho={DESFECHO} />);

    await avancar();
    expect(screen.getByText("Round 1")).toBeInTheDocument();
    expect(screen.queryByText("Round 2")).not.toBeInTheDocument();

    await avancar();
    expect(screen.getByText("Round 2")).toBeInTheDocument();
  });

  it("so entrega o placar quando o ultimo round cai", async () => {
    renderizar(<LutaRoundARound desfecho={DESFECHO} />);

    await avancar();
    await avancar();
    expect(screen.queryByText(/vitória/i)).not.toBeInTheDocument();

    await avancar();
    expect(screen.getByText(/vitória/i)).toBeInTheDocument();
  });

  it("quem nao quiser esperar pula direto para o resultado", () => {
    renderizar(<LutaRoundARound desfecho={DESFECHO} />);

    fireEvent.click(screen.getByRole("button", { name: /ver o resultado/i }));

    expect(screen.getByText("Round 3")).toBeInTheDocument();
    expect(screen.getByText(/vitória/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /ver o resultado/i }),
    ).not.toBeInTheDocument();
  });
});

/**
 * Adianta o relógio de um round e deixa o React reagir.
 *
 * O `act` é o que faz a diferença: sem ele o `setTimeout` do componente até
 * dispara, mas o redesenho fica na fila e o teste mede a tela de antes.
 */
async function avancar() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(INTERVALO_ENTRE_ROUNDS);
  });
}
