import type {
  Carreira,
  CriarPartidaRequisicao,
  Habilidade,
  Partida,
  Resultado,
  RodadaAtual,
} from "./tipos";

const URL_DA_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080/api";

/**
 * Formato de erro que a API devolve em toda falha (RFC 7807).
 */
interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  /** Erros por campo, presente só nas falhas de validação (400). */
  errors?: Record<string, string[]>;
}

/**
 * Erro vindo da API, já traduzido para algo exibível ao jogador.
 *
 * A API escreve `detail` em linguagem do jogo ("Striking já foi preenchida em
 * uma rodada anterior"), então a mensagem pode ir direto para a tela sem o
 * front-end precisar interpretar código de status.
 */
export class ErroDaApi extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
    readonly errosPorCampo?: Record<string, string[]>,
  ) {
    super(mensagem);
    this.name = "ErroDaApi";
  }

  /** A jogada conflita com o estado atual da partida. */
  get ehJogadaInvalida() {
    return this.status === 409;
  }

  get ehNaoEncontrado() {
    return this.status === 404;
  }
}

async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${URL_DA_API}${caminho}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes?.headers,
    },
  });

  if (!resposta.ok) {
    throw await montarErro(resposta);
  }

  // 204 e afins não têm corpo para desserializar.
  if (resposta.status === 204) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}

async function montarErro(resposta: Response): Promise<ErroDaApi> {
  let problema: ProblemDetails = {};

  try {
    problema = (await resposta.json()) as ProblemDetails;
  } catch {
    // Resposta sem corpo JSON (proxy, timeout): a mensagem genérica serve.
  }

  const mensagem =
    problema.detail ??
    primeiroErroDeCampo(problema.errors) ??
    problema.title ??
    "Não foi possível falar com o servidor. Tente novamente.";

  return new ErroDaApi(resposta.status, mensagem, problema.errors);
}

function primeiroErroDeCampo(erros?: Record<string, string[]>) {
  return erros ? Object.values(erros).flat()[0] : undefined;
}

export const api = {
  criarPartida: (dados: CriarPartidaRequisicao) =>
    requisitar<Partida>("/partidas", {
      method: "POST",
      body: JSON.stringify(dados),
    }),

  obterPartida: (partidaId: string) => requisitar<Partida>(`/partidas/${partidaId}`),

  obterRodadaAtual: (partidaId: string) =>
    requisitar<RodadaAtual>(`/partidas/${partidaId}/draft/atual`),

  escolherHabilidade: (partidaId: string, atletaId: string, habilidade: Habilidade) =>
    requisitar<Partida>(`/partidas/${partidaId}/draft/escolher`, {
      method: "POST",
      body: JSON.stringify({ atletaId, habilidade }),
    }),

  simularCarreira: (partidaId: string) =>
    requisitar<Carreira>(`/partidas/${partidaId}/carreira/simular`, { method: "POST" }),

  obterCarreira: (partidaId: string) =>
    requisitar<Carreira>(`/partidas/${partidaId}/carreira`),

  obterResultado: (partidaId: string) =>
    requisitar<Resultado>(`/partidas/${partidaId}/resultado`),
};
