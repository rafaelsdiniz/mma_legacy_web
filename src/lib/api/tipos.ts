/**
 * Espelho dos contratos da API.
 *
 * Os enums viajam como texto (`"MeioPesado"`, não `7`), o que permite usar
 * uniões de string em vez de enums numéricos — o TypeScript passa a barrar
 * valor inválido em tempo de compilação, e o JSON continua legível.
 */

export type Habilidade =
  | "Striking"
  | "Potencia"
  | "Velocidade"
  | "Wrestling"
  | "JiuJitsu"
  | "Cardio"
  | "Resistencia"
  | "InteligenciaDeLuta";

/** Na mesma ordem em que a API devolve e em que o draft as apresenta. */
export const HABILIDADES: readonly Habilidade[] = [
  "Striking",
  "Potencia",
  "Velocidade",
  "Wrestling",
  "JiuJitsu",
  "Cardio",
  "Resistencia",
  "InteligenciaDeLuta",
] as const;

export type CategoriaDePeso =
  | "Mosca"
  | "Galo"
  | "Pena"
  | "Leve"
  | "MeioMedio"
  | "Medio"
  | "MeioPesado"
  | "Pesado";

export type BaseDeLuta =
  | "Boxe"
  | "MuayThai"
  | "Karate"
  | "Kickboxing"
  | "Wrestling"
  | "JiuJitsu"
  | "Judo"
  | "Sambo"
  | "Taekwondo"
  | "Capoeira";

export type EstiloDeLuta =
  | "Nocauteador"
  | "WrestlerDePressao"
  | "GrapplerCompleto"
  | "ContraGolpeadorTecnico"
  | "LutadorDeMovimentacao"
  | "LutadorCompleto";

/**
 * Quanta informação o jogador vê durante o draft.
 *
 * Não altera a simulação: dois lutadores idênticos montados em níveis
 * diferentes têm exatamente a mesma carreira. O que muda é o mérito.
 */
export type NivelDeDificuldade = "Facil" | "Dificil";

export type StatusDaPartida =
  | "DraftEmAndamento"
  | "DraftConcluido"
  | "CarreiraSimulada";

export type NivelDeLegado =
  | "PromessaQueNaoCorrespondeu"
  | "LutadorRegional"
  | "VeteranoRespeitado"
  | "CompetidorDeElite"
  | "DesafianteAoCinturao"
  | "CampeaoMundial"
  | "CampeaoDominante"
  | "DuploCampeao"
  | "LendaDoMma"
  | "MaiorDeTodosOsTempos";

export type ResultadoDaLuta = "Vitoria" | "Derrota" | "Empate";
export type MetodoDeEncerramento = "Nocaute" | "Finalizacao" | "Decisao";
export type NivelDaOrganizacao =
  | "CircuitoRegional"
  | "OrganizacaoNacional"
  | "GrandeOrganizacao";

export interface NotaDeHabilidade {
  habilidade: Habilidade;
  /** Nome acentuado pronto para exibição, vindo do servidor. */
  nome: string;
  nota: number;
}

/** Um atleta do acervo, como aparece na página que lista todos. */
export interface LutadorDoAcervo {
  id: string;
  nome: string;
  slug: string;
  pais: string;
  overall: number;
  estilo: EstiloDeLuta;
  maiorQualidade: string;
  principalFraqueza: string;
  notas: NotaDeHabilidade[];
}

export interface Ficha {
  nome: string;
  apelido: string;
  nacionalidade: string;
  categoriaDePeso: CategoriaDePeso;
  categoriaDePesoTexto: string;
  idadeInicial: number;
  baseDeLuta: BaseDeLuta;
  /** No formato NOME "APELIDO" SOBRENOME. */
  nomeDeCartaz: string;
}

export interface LutadorMontado {
  nomeDeCartaz: string;
  categoriaDePesoTexto: string;
  overall: number;
  estilo: EstiloDeLuta;
  atributos: NotaDeHabilidade[];
  maiorQualidade: string;
  principalFraqueza: string;
}

export interface Partida {
  id: string;
  seed: number;
  criadaEm: string;
  status: StatusDaPartida;
  nivelDeDificuldade: NivelDeDificuldade;
  escolhasFeitas: number;
  totalDeRodadas: number;
  ficha: Ficha;
  lutador: LutadorMontado | null;
}

export interface AtletaDoDraft {
  id: string;
  nome: string;
  /** Usado para montar o caminho da imagem em /fighters. */
  slug: string;
  pais: string;
  notas: NotaDeHabilidade[];
}

export interface EscolhaFeita {
  ordem: number;
  habilidade: Habilidade;
  habilidadeNome: string;
  /** Nulo no modo difícil: a nota só é revelada quando o draft fecha. */
  nota: number | null;
  atletaNome: string;
}

export interface RodadaAtual {
  ordem: number;
  totalDeRodadas: number;
  nivelDeDificuldade: NivelDeDificuldade;
  atleta: AtletaDoDraft;
  habilidadesDisponiveis: Habilidade[];
  escolhasFeitas: EscolhaFeita[];
}

export interface Conquista {
  descricao: string;
  alcancada: boolean;
}

export interface Luta {
  ordem: number;
  idade: number;
  adversario: string;
  overallDoAdversario: number;
  estiloDoAdversario: EstiloDeLuta;
  organizacao: NivelDaOrganizacao;
  categoria: CategoriaDePeso;
  valendoCinturao: boolean;
  disputaDeCinturao: boolean;
  defesaDeCinturao: boolean;
  roundsProgramados: number;
  resultado: ResultadoDaLuta;
  metodo: MetodoDeEncerramento;
  roundDoEncerramento: number;
}

export interface Carreira {
  cartel: string;
  vitorias: number;
  derrotas: number;
  empates: number;
  totalDeLutas: number;
  vitoriasPorNocaute: number;
  vitoriasPorFinalizacao: number;
  vitoriasPorDecisao: number;
  idadeDeEstreia: number;
  idadeDeAposentadoria: number;
  maiorSequenciaDeVitorias: number;
  overallMaximo: number;
  categoriaFinal: CategoriaDePeso;
  categoriaFinalTexto: string;
  legado: NivelDeLegado;
  pontuacaoDeLegado: number;
  conquistas: Conquista[];
  lutas: Luta[];
}

export interface Resultado {
  partidaId: string;
  seed: number;
  ficha: Ficha;
  lutador: LutadorMontado;
  carreira: Carreira;
}

export interface CriarPartidaRequisicao {
  nome: string;
  apelido: string;
  nacionalidade: string;
  categoriaDePeso: CategoriaDePeso;
  idadeInicial: number;
  baseDeLuta: BaseDeLuta;
  seed?: number | null;
  nivelDeDificuldade?: NivelDeDificuldade;
}
