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
  | "CarreiraEmAndamento"
  | "CarreiraSimulada";

export type EtapaDaCarreira =
  | "CircuitoRegional"
  | "OrganizacaoNacional"
  | "GrandeOrganizacao"
  | "Top15"
  | "Top5"
  | "DisputaDeCinturao"
  | "Campeao";

export type MotivoDoEncerramento =
  | "IdadeLimite"
  | "CorpoCastigado"
  | "SequenciaDeDerrotas"
  | "SemResultados"
  | "SemContrato"
  | "LimiteDeLutas"
  | "EscolhaDoLutador"
  | "LesaoIncapacitante";

export type EventoDaCarreira =
  | "Promovido"
  | "Rebaixado"
  | "Dispensado"
  | "DisputaDeCinturaoMarcada"
  | "CinturaoConquistado"
  | "CinturaoDefendido"
  | "CinturaoPerdido"
  | "MudouDeCategoria"
  | "AnoVirado"
  | "FicouInativo"
  | "CarreiraEncerrada"
  | "Lesionou"
  | "RecuperouDeLesao";

export type VencedorDoRound = "Lutador" | "Adversario" | "Empate";

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

/**
 * Quão dura uma oferta é para o lutador que a recebe.
 *
 * Não é atributo do adversário: é a relação entre ele e o jogador de hoje. O
 * mesmo nome que era `Brutal` para o estreante é `Tranquila` quatro anos
 * depois, e por isso o grau vem calculado a cada leitura da mesa.
 */
export type GrauDeDificuldade = "Tranquila" | "Equilibrada" | "Dura" | "Brutal";

export type TipoDeLesao =
  | "Corte"
  | "MaoFraturada"
  | "JoelhoLesionado"
  | "CostelaTrincada"
  | "Concussao";

export type GravidadeDaLesao = "Leve" | "Moderada" | "Grave";

/** Com que peso o lutador treinou para a luta que aceitou. */
export type IntensidadeDoTreino = "Leve" | "Padrao" | "Pesado";

/** Na ordem em que a tela apresenta as opções de camp. */
export const INTENSIDADES: readonly IntensidadeDoTreino[] = [
  "Leve",
  "Padrao",
  "Pesado",
] as const;

export interface Lesao {
  tipo: TipoDeLesao;
  gravidade: GravidadeDaLesao;
  /** Nula quando a lesão não deixa sequela, como um corte. */
  habilidadeAfetada: Habilidade | null;
  pontosPerdidos: number;
  afastamento: number;
  compromissosRestantes: number;
  idadeQuandoOcorreu: number;
}

/** Uma intensidade de camp e o risco de lesão que ela traz para esta luta. */
export interface OpcaoDeCamp {
  intensidade: IntensidadeDoTreino;
  riscoDeLesao: number;
}

/** O que o treino que antecedeu a luta produziu. */
export interface Camp {
  /** Nulo quando o jogador não escolheu foco nenhum. */
  foco: Habilidade | null;
  intensidade: IntensidadeDoTreino;
  evoluiu: boolean;
  /** Treinou, mas a habilidade já estava no teto do potencial do draft. */
  noTetoDoPotencial: boolean;
  notaAntes: number;
  notaDepois: number;
}

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
  ehLenda: boolean;
  categoria: CategoriaDePeso | null;
  categoriaTexto: string | null;
  /** 0 é o campeão; 1 a 15, os ranqueados; nulo para quem está fora. */
  posicaoNoRanking: number | null;
  overall: number;
  estilo: EstiloDeLuta;
  maiorQualidade: string;
  principalFraqueza: string;
  notas: NotaDeHabilidade[];
}

/** Uma divisão com o campeão e os quinze ranqueados, na ordem do ranking. */
export interface DivisaoDoRanking {
  categoria: CategoriaDePeso;
  categoriaTexto: string;
  campeao: LutadorDoAcervo | null;
  ranqueados: LutadorDoAcervo[];
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
  /** Quantas vezes ainda dá para dispensar o atleta da vez. */
  pulosRestantes: number;
  /** A cota do nível escolhido: 2 no fácil, 1 no difícil. */
  pulosPermitidos: number;
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

export interface EstadoDaCarreira {
  idade: number;
  categoria: CategoriaDePeso;
  categoriaTexto: string;
  etapa: EtapaDaCarreira;
  organizacao: NivelDaOrganizacao;
  estilo: EstiloDeLuta;
  overallAtual: number;
  overallMaximo: number;
  atributos: NotaDeHabilidade[];
  ehCampeao: boolean;
  sequenciaDeVitorias: number;
  derrotasSeguidas: number;
  derrotasParaSerDispensado: number;
  recusasSeguidas: number;
  recusasParaSerDispensado: number;
  vitoriasNaEtapa: number;
  vitoriasParaSubir: number;
  compromissosNaTemporada: number;
  compromissosPorTemporada: number;
  vezesDispensado: number;
  /** Quantas lesões o corpo já levou nesta carreira. */
  lesoesSofridas: number;
  /** A lesão em tratamento agora, ou nula se o lutador está inteiro. */
  lesao: Lesao | null;
  /** 0 é campeão, 1 a 15 ranqueado, nulo para quem ainda não entrou. */
  posicaoNoRanking: number | null;
}

/** Uma linha da tabela da divisão, já com o jogador encaixado nela. */
export interface LinhaDoRanking {
  posicao: number;
  nome: string;
  /** Nulo na linha do jogador, que não tem foto no acervo. */
  slug: string | null;
  overall: number;
  ehOJogador: boolean;
}

export interface OfertaDeLuta {
  indice: number;
  adversario: string;
  cartelDoAdversario: string;
  overallDoAdversario: number;
  estiloDoAdversario: EstiloDeLuta;
  atributosDoAdversario: NotaDeHabilidade[];
  organizacao: NivelDaOrganizacao;
  categoria: CategoriaDePeso;
  categoriaTexto: string;
  valendoCinturao: boolean;
  disputaDeCinturao: boolean;
  defesaDeCinturao: boolean;
  roundsProgramados: number;
  chamada: string;
  /** Quão dura esta luta é para o lutador de hoje. */
  dificuldade: GrauDeDificuldade;
  /** Já se enfrentaram antes. */
  ehRevanche: boolean;
  vitoriasDoAdversarioSobreVoce: number;
  derrotasDoAdversarioParaVoce: number;
  /** Chance de sair machucado, de 0 a 1, num camp de intensidade padrão. */
  riscoDeLesao: number;
  /** O risco em cada intensidade de camp, para a tela mostrar o preço da escolha. */
  opcoesDeCamp: OpcaoDeCamp[];
  /** Preenchido só quando o adversário é atleta real do acervo. */
  slugDoAdversario: string | null;
  /** Posição dele no ranking, que a vitória converte na sua. */
  posicaoDoAdversario: number | null;
}

export interface RoundDaLuta {
  numero: number;
  vencedor: VencedorDoRound;
  lutadorBuscouQueda: boolean;
  lutadorControlou: boolean;
  adversarioBuscouQueda: boolean;
  adversarioControlou: boolean;
  fadigaDoLutador: number;
  fadigaDoAdversario: number;
  danoDoLutador: number;
  danoDoAdversario: number;
  encerramento: MetodoDeEncerramento | null;
}

export interface DesfechoDaUltimaLuta {
  luta: Luta;
  rounds: RoundDaLuta[];
}

export interface SituacaoDaCarreira {
  partidaId: string;
  nomeDeCartaz: string;
  encerrada: boolean;
  motivoDoEncerramento: MotivoDoEncerramento | null;
  estado: EstadoDaCarreira;
  ofertas: OfertaDeLuta[];
  carreira: Carreira;
  ultimaLuta: DesfechoDaUltimaLuta | null;
  eventos: EventoDaCarreira[];
  /** O que o camp desta jogada produziu. Nulo quando não houve camp. */
  camp: Camp | null;
  /** Vazio antes de o lutador chegar ao UFC, onde não há ranking a mostrar. */
  rankingDaDivisao: LinhaDoRanking[];
  /** Onde você estava antes desta jogada, para animar o movimento. */
  posicaoAnterior: number | null;
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
