import type {
  CriarPartidaRequisicao,
  DivisaoDoRanking,
  Habilidade,
  IntensidadeDoTreino,
  LutadorDoAcervo,
  Partida,
  Resultado,
  RodadaAtual,
  SituacaoDaCarreira,
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
  /** Ping leve, usado para acordar a API antes de o jogador precisar dela. */
  saude: () => requisitar<{ situacao: string }>("/saude"),

  listarLutadores: () => requisitar<LutadorDoAcervo[]>("/lutadores"),

  obterRanking: () => requisitar<DivisaoDoRanking[]>("/lutadores/ranking"),

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

  /** Dispensa o atleta da vez e devolve a rodada já com o substituto. */
  pularAtleta: (partidaId: string) =>
    requisitar<RodadaAtual>(`/partidas/${partidaId}/draft/pular`, { method: "POST" }),

  estrearCarreira: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira/estrear`, {
      method: "POST",
    }),

  obterCarreira: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira`),

  /**
   * Aceita uma oferta e, junto com ela, decide o camp que antecede a luta.
   *
   * As duas escolhas viajam no mesmo pedido porque são tomadas juntas: contra
   * quem se vai lutar e com que corpo se vai chegar lá.
   */
  aceitarOferta: (
    partidaId: string,
    indice: number,
    focoDoCamp: Habilidade | null,
    intensidade: IntensidadeDoTreino,
  ) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira/aceitar`, {
      method: "POST",
      body: JSON.stringify({ indice, focoDoCamp, intensidade }),
    }),

  /** Passa um compromisso do calendário tratando a lesão. */
  recuperar: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira/recuperar`, {
      method: "POST",
    }),


  recusarOfertas: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira/recusar`, {
      method: "POST",
    }),

  aposentar: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(`/partidas/${partidaId}/carreira/aposentar`, {
      method: "POST",
    }),

  simularOResto: (partidaId: string) =>
    requisitar<SituacaoDaCarreira>(
      `/partidas/${partidaId}/carreira/simular-o-resto`,
      { method: "POST" },
    ),

  obterResultado: (partidaId: string) =>
    requisitar<Resultado>(`/partidas/${partidaId}/resultado`),
};
