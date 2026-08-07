import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TelaDeSimulacao } from "@/components/jogo/tela-de-simulacao";
import { lesao, oferta, renderizar, situacao } from "@/teste/cenario";

vi.mock("@/lib/api/cliente", () => ({
  api: {
    estrearCarreira: vi.fn(),
    aceitarOferta: vi.fn(),
    recuperar: vi.fn(),
    recusarOfertas: vi.fn(),
    aposentar: vi.fn(),
    simularOResto: vi.fn(),
  },
  ErroDaApi: class ErroDaApi extends Error {},
}));

const { api } = await import("@/lib/api/cliente");

const PARTIDA = "11111111-1111-1111-1111-111111111111";

beforeEach(() => {
  vi.mocked(api.estrearCarreira).mockReset();
  vi.mocked(api.aceitarOferta).mockReset();
  vi.mocked(api.recuperar).mockReset();
});

async function abrirTela(situacaoInicial = situacao()) {
  vi.mocked(api.estrearCarreira).mockResolvedValue(situacaoInicial);
  renderizar(<TelaDeSimulacao partidaId={PARTIDA} />);

  return screen.findByText("Ofertas na mesa").catch(() => null);
}

describe("tela da carreira", () => {
  it("anuncia o grau da luta e o risco de lesao antes da decisao", async () => {
    await abrirTela();

    expect(await screen.findByText(/luta dura/i)).toBeInTheDocument();
    expect(screen.getByText("11%")).toBeInTheDocument();
  });

  it("trocar para camp pesado sobe o risco mostrado na oferta", async () => {
    const usuario = userEvent.setup();
    await abrirTela();

    expect(await screen.findByText("11%")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Pesado" }));

    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.queryByText("11%")).not.toBeInTheDocument();
  });

  it("manda o foco e a intensidade escolhidos junto com a oferta", async () => {
    const usuario = userEvent.setup();
    await abrirTela();
    vi.mocked(api.aceitarOferta).mockResolvedValue(situacao());

    await usuario.click(await screen.findByRole("button", { name: /Wrestling/ }));
    await usuario.click(screen.getByRole("button", { name: "Pesado" }));
    await usuario.click(screen.getByRole("button", { name: /aceitar luta/i }));

    await waitFor(() =>
      expect(api.aceitarOferta).toHaveBeenCalledWith(PARTIDA, 1, "Wrestling", "Pesado"),
    );
  });

  it("machucado nao escolhe luta: a mesa some e sobra o departamento medico", async () => {
    await abrirTela(
      situacao({ estado: { ...situacao().estado, lesao: lesao() }, ofertas: [] }),
    );

    expect(await screen.findByText("Departamento médico")).toBeInTheDocument();
    expect(screen.getByText("Joelho lesionado")).toBeInTheDocument();
    expect(screen.queryByText("Ofertas na mesa")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /recusar/i })).not.toBeInTheDocument();
  });

  it("tratar a lesao gasta um compromisso pela api de recuperacao", async () => {
    const usuario = userEvent.setup();
    await abrirTela(
      situacao({ estado: { ...situacao().estado, lesao: lesao() }, ofertas: [] }),
    );
    vi.mocked(api.recuperar).mockResolvedValue(situacao());

    await usuario.click(await screen.findByRole("button", { name: /tratar a lesão/i }));

    await waitFor(() => expect(api.recuperar).toHaveBeenCalledWith(PARTIDA));
  });

  it("a revancha vem com o confronto direto a vista", async () => {
    await abrirTela(
      situacao({
        ofertas: [
          oferta({
            ehRevanche: true,
            vitoriasDoAdversarioSobreVoce: 1,
            derrotasDoAdversarioParaVoce: 0,
            chamada: "Revanche: ele te nocauteou",
          }),
        ],
      }),
    );

    expect(
      await screen.findByText("Revanche · 0–1 no confronto direto"),
    ).toBeInTheDocument();
    expect(screen.getByText(/0–\s*1 no confronto direto/)).toBeInTheDocument();
  });
});
