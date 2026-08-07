import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TelaDeDraft } from "@/components/jogo/tela-de-draft";
import { renderizar, rodada } from "@/teste/cenario";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api/cliente", () => ({
  api: {
    obterRodadaAtual: vi.fn(),
    escolherHabilidade: vi.fn(),
    pularAtleta: vi.fn(),
  },
  ErroDaApi: class ErroDaApi extends Error {},
}));

const { api } = await import("@/lib/api/cliente");

const PARTIDA = "11111111-1111-1111-1111-111111111111";
const ATLETA = "22222222-2222-2222-2222-222222222222";

beforeEach(() => {
  vi.mocked(api.obterRodadaAtual).mockReset();
  vi.mocked(api.escolherHabilidade).mockReset();
  vi.mocked(api.pularAtleta).mockReset();
});

async function abrirDraft(rodadaInicial = rodada()) {
  vi.mocked(api.obterRodadaAtual).mockResolvedValue(rodadaInicial);
  renderizar(<TelaDeDraft partidaId={PARTIDA} />);

  return screen.findByText(rodadaInicial.atleta.nome);
}

describe("tela do draft", () => {
  it("apresenta o atleta da rodada", async () => {
    await abrirDraft();

    expect(screen.getByText("Atleta de Teste")).toBeInTheDocument();
  });

  it("escolher uma habilidade manda o atleta e a habilidade para a api", async () => {
    const usuario = userEvent.setup();
    await abrirDraft();
    vi.mocked(api.escolherHabilidade).mockResolvedValue(
      // A escolha devolve a partida; o teste só precisa que ela não avance de
      // tela, então o draft segue em andamento.
      { status: "DraftEmAndamento" } as never,
    );

    await usuario.click(screen.getByRole("button", { name: /wrestling/i }));

    await waitFor(() =>
      expect(api.escolherHabilidade).toHaveBeenCalledWith(PARTIDA, ATLETA, "Wrestling"),
    );
  });

  it("a habilidade ja gasta fica trancada na mesa", async () => {
    await abrirDraft(
      rodada({
        habilidadesDisponiveis: ["Striking", "Potencia"],
        // Wrestling já foi levada de outro atleta em uma rodada anterior.
        escolhasFeitas: [
          {
            ordem: 1,
            habilidade: "Wrestling",
            habilidadeNome: "Wrestling",
            nota: 82,
            atletaNome: "Outro Atleta",
          },
        ],
      }),
    );

    // Cada escolha fecha uma porta para sempre: a habilidade já gasta deixa de
    // ser botão e vira registro de quem a levou.
    expect(screen.getByRole("button", { name: /striking/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /wrestling/i })).not.toBeInTheDocument();
    expect(screen.getByText(/de Outro Atleta/)).toBeInTheDocument();
  });

  it("dispensar o atleta pede outro sem gastar escolha", async () => {
    const usuario = userEvent.setup();
    await abrirDraft();
    vi.mocked(api.pularAtleta).mockResolvedValue(
      rodada({ atleta: { ...rodada().atleta, nome: "Substituto" }, pulosRestantes: 1 }),
    );

    await usuario.click(screen.getByRole("button", { name: /dispensar atleta/i }));

    await waitFor(() => expect(api.pularAtleta).toHaveBeenCalledWith(PARTIDA));
    expect(api.escolherHabilidade).not.toHaveBeenCalled();
    expect(await screen.findByText("Substituto")).toBeInTheDocument();
  });

  it("sem pulos restantes o botao de dispensar some", async () => {
    await abrirDraft(rodada({ pulosRestantes: 0 }));

    expect(screen.queryByRole("button", { name: /dispensar atleta/i })).not.toBeInTheDocument();
  });
});
