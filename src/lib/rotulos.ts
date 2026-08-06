import type {
  BaseDeLuta,
  CategoriaDePeso,
  EstiloDeLuta,
  MetodoDeEncerramento,
  NivelDaOrganizacao,
  NivelDeLegado,
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
