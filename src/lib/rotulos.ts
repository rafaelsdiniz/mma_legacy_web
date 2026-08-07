import type {
  BaseDeLuta,
  CategoriaDePeso,
  EstiloDeLuta,
  GrauDeDificuldade,
  GravidadeDaLesao,
  IntensidadeDoTreino,
  MetodoDeEncerramento,
  NivelDaOrganizacao,
  NivelDeLegado,
  TipoDeLesao,
} from "./api/tipos";

/**
 * Tradução dos enums da API para texto de tela.
 *
 * As habilidades e as categorias já chegam com nome acentuado do servidor —
 * estas são as que faltam, e ficam aqui porque são puramente de apresentação:
 * mudar "Nocauteador" para "Especialista em nocaute" não deveria exigir deploy
 * do back-end.
 */

export const ESTILOS: Record<EstiloDeLuta, string> = {
  Nocauteador: "Nocauteador",
  WrestlerDePressao: "Wrestler de pressão",
  GrapplerCompleto: "Grappler completo",
  ContraGolpeadorTecnico: "Contra-golpeador técnico",
  LutadorDeMovimentacao: "Lutador de movimentação",
  LutadorCompleto: "Lutador completo",
};

export const DESCRICAO_DO_ESTILO: Record<EstiloDeLuta, string> = {
  Nocauteador: "Busca a interrupção cedo e castiga quem trocar de frente.",
  WrestlerDePressao: "Vence pelo volume de quedas e pela pressão constante.",
  GrapplerCompleto: "Leva a luta para o chão e finaliza de qualquer posição.",
  ContraGolpeadorTecnico: "Espera o erro do adversário e cobra no contragolpe.",
  LutadorDeMovimentacao: "Vence pela movimentação e pelo volume de golpes.",
  LutadorCompleto: "Sem vantagens claras, mas também sem buracos.",
};

export const LEGADOS: Record<NivelDeLegado, string> = {
  PromessaQueNaoCorrespondeu: "Promessa que não correspondeu",
  LutadorRegional: "Lutador regional",
  VeteranoRespeitado: "Veterano respeitado",
  CompetidorDeElite: "Competidor de elite",
  DesafianteAoCinturao: "Desafiante ao cinturão",
  CampeaoMundial: "Campeão mundial",
  CampeaoDominante: "Campeão dominante",
  DuploCampeao: "Duplo campeão",
  LendaDoMma: "Lenda do MMA",
  MaiorDeTodosOsTempos: "Maior de todos os tempos",
};

/** Posição na escada de legado, de 1 a 10. Usada para dosar o brilho da tela. */
export const ALTURA_DO_LEGADO: Record<NivelDeLegado, number> = {
  PromessaQueNaoCorrespondeu: 1,
  LutadorRegional: 2,
  VeteranoRespeitado: 3,
  CompetidorDeElite: 4,
  DesafianteAoCinturao: 5,
  CampeaoMundial: 6,
  CampeaoDominante: 7,
  DuploCampeao: 8,
  LendaDoMma: 9,
  MaiorDeTodosOsTempos: 10,
};

export const METODOS: Record<MetodoDeEncerramento, string> = {
  Nocaute: "Nocaute",
  Finalizacao: "Finalização",
  Decisao: "Decisão",
};

/** Versão curta para a linha do cartel, no estilo do badge de resultado. */
export const METODOS_CURTOS: Record<MetodoDeEncerramento, string> = {
  Nocaute: "KO/TKO",
  Finalizacao: "SUB",
  Decisao: "DEC",
};

/**
 * O nome da organização em cada degrau.
 *
 * O enum da API continua genérico — `GrandeOrganizacao`, não `Ufc` —, e a marca
 * mora só aqui. É de propósito: trocar de organização, corrigir um nome ou
 * regionalizar o jogo vira edição de uma linha nesta tabela, sem migration nem
 * deploy do back-end. E é a mesma trajetória de verdade: Anderson Silva e José
 * Aldo saíram do Jungle Fight antes de chegar lá em cima.
 */
export const ORGANIZACOES: Record<NivelDaOrganizacao, string> = {
  CircuitoRegional: "Jungle Fight",
  OrganizacaoNacional: "LFA",
  GrandeOrganizacao: "UFC",
};

export const CATEGORIAS: Record<CategoriaDePeso, string> = {
  Mosca: "Peso-mosca",
  Galo: "Peso-galo",
  Pena: "Peso-pena",
  Leve: "Peso-leve",
  MeioMedio: "Meio-médio",
  Medio: "Peso-médio",
  MeioPesado: "Meio-pesado",
  Pesado: "Peso-pesado",
};

export const BASES: Record<BaseDeLuta, string> = {
  Boxe: "Boxe",
  MuayThai: "Muay thai",
  Karate: "Karatê",
  Kickboxing: "Kickboxing",
  Wrestling: "Wrestling",
  JiuJitsu: "Jiu-jítsu",
  Judo: "Judô",
  Sambo: "Sambo",
  Taekwondo: "Taekwondo",
  Capoeira: "Capoeira",
};

/**
 * Cor de uma nota na escala de 1 a 100.
 *
 * Serve para o jogador bater o olho e saber se 84 é bom sem comparar com nada.
 * Os cortes seguem a leitura do jogo: 90+ é elite, 80+ é topo do ranking,
 * 70+ é grande organização, abaixo disso é regional.
 */
export function corDaNota(nota: number) {
  if (nota >= 90) return "text-legado-claro";
  if (nota >= 80) return "text-gelo";
  if (nota >= 70) return "text-aco-claro";
  return "text-aco";
}

/**
 * O grau de dificuldade da oferta, do jeito que o cartaz falaria.
 *
 * O nome importa mais do que parece: é o que o jogador lê antes de decidir, e
 * "brutal" precisa soar como aviso, não como estatística.
 */
export const DIFICULDADES: Record<GrauDeDificuldade, string> = {
  Tranquila: "Tranquila",
  Equilibrada: "Equilibrada",
  Dura: "Dura",
  Brutal: "Brutal",
};

export const DESCRICAO_DA_DIFICULDADE: Record<GrauDeDificuldade, string> = {
  Tranquila: "Nome abaixo do seu. Vitória provável, pouco a ganhar.",
  Equilibrada: "Gente do seu nível. A luta que mais mede alguma coisa.",
  Dura: "Ele vem acima de você. Vencer acelera a fila.",
  Brutal: "Muito acima. Dá para vencer, mas o corpo cobra.",
};

/** Cor de cada grau, do verde de vitória ao vermelho do fight. */
export const COR_DA_DIFICULDADE: Record<GrauDeDificuldade, string> = {
  Tranquila: "text-vitoria",
  Equilibrada: "text-gelo",
  Dura: "text-legado-claro",
  Brutal: "text-fight-claro",
};

export const TIPOS_DE_LESAO: Record<TipoDeLesao, string> = {
  Corte: "Corte profundo",
  MaoFraturada: "Mão fraturada",
  JoelhoLesionado: "Joelho lesionado",
  CostelaTrincada: "Costela trincada",
  Concussao: "Concussão",
};

export const GRAVIDADES_DE_LESAO: Record<GravidadeDaLesao, string> = {
  Leve: "Leve",
  Moderada: "Moderada",
  Grave: "Grave",
};

export const INTENSIDADES_DE_TREINO: Record<IntensidadeDoTreino, string> = {
  Leve: "Leve",
  Padrao: "Padrão",
  Pesado: "Pesado",
};

/**
 * O que cada intensidade de camp entrega e o que ela cobra.
 *
 * A frase diz o trade-off inteiro porque é ele que transforma o treino em
 * decisão: sem o custo à vista, treinar pesado seria sempre a resposta certa.
 */
export const DESCRICAO_DA_INTENSIDADE: Record<IntensidadeDoTreino, string> = {
  Leve: "Só manutenção. Não evolui nada e poupa o corpo.",
  Padrao: "O camp normal. Alguma evolução, risco normal.",
  Pesado: "Puxado. Quase dobra a evolução e o corpo chega castigado.",
};

/** Percentual arredondado de um risco que vem de 0 a 1. */
export function emPorcentagem(fracao: number) {
  return `${Math.round(fracao * 100)}%`;
}
