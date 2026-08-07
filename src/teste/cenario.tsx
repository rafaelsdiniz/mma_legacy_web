import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

import type {
  Habilidade,
  Lesao,
  NotaDeHabilidade,
  OfertaDeLuta,
  RodadaAtual,
  SituacaoDaCarreira,
} from "@/lib/api/tipos";
import { HABILIDADES } from "@/lib/api/tipos";

/**
 * Fábricas de dados e o `render` já embrulhado nos provedores.
 *
 * Concentrar a montagem aqui evita que cada teste repita uma situação de
 * carreira inteira só para chegar ao pedaço que quer medir.
 */

const NOMES: Record<Habilidade, string> = {
  Striking: "Striking",
  Potencia: "Potência",
  Velocidade: "Velocidade",
  Wrestling: "Wrestling",
  JiuJitsu: "Jiu-jítsu",
  Cardio: "Cardio",
  Resistencia: "Resistência",
  InteligenciaDeLuta: "Inteligência de luta",
};

export function atributos(nota = 80): NotaDeHabilidade[] {
  return HABILIDADES.map((habilidade) => ({
    habilidade,
    nome: NOMES[habilidade],
    nota,
  }));
}

export function oferta(ajustes: Partial<OfertaDeLuta> = {}): OfertaDeLuta {
  return {
    indice: 1,
    adversario: "Bruno Falcao",
    cartelDoAdversario: "12-3-0",
    overallDoAdversario: 84,
    estiloDoAdversario: "Nocauteador",
    atributosDoAdversario: atributos(84),
    organizacao: "CircuitoRegional",
    categoria: "MeioPesado",
    categoriaTexto: "Meio-pesado",
    valendoCinturao: false,
    disputaDeCinturao: false,
    defesaDeCinturao: false,
    roundsProgramados: 3,
    chamada: "Nome forte da divisao",
    dificuldade: "Dura",
    ehRevanche: false,
    vitoriasDoAdversarioSobreVoce: 0,
    derrotasDoAdversarioParaVoce: 0,
    riscoDeLesao: 0.11,
    opcoesDeCamp: [
      { intensidade: "Leve", riscoDeLesao: 0.08 },
      { intensidade: "Padrao", riscoDeLesao: 0.11 },
      { intensidade: "Pesado", riscoDeLesao: 0.15 },
    ],
    slugDoAdversario: null,
    posicaoDoAdversario: null,
    ...ajustes,
  };
}

export function lesao(ajustes: Partial<Lesao> = {}): Lesao {
  return {
    tipo: "JoelhoLesionado",
    gravidade: "Grave",
    habilidadeAfetada: "Velocidade",
    pontosPerdidos: 2,
    afastamento: 3,
    compromissosRestantes: 2,
    idadeQuandoOcorreu: 27,
    ...ajustes,
  };
}

export function situacao(ajustes: Partial<SituacaoDaCarreira> = {}): SituacaoDaCarreira {
  return {
    partidaId: "11111111-1111-1111-1111-111111111111",
    nomeDeCartaz: 'RAFAEL "THE MACHINE" DINIZ',
    encerrada: false,
    motivoDoEncerramento: null,
    estado: {
      idade: 25,
      categoria: "MeioPesado",
      categoriaTexto: "Meio-pesado",
      etapa: "CircuitoRegional",
      organizacao: "CircuitoRegional",
      estilo: "LutadorCompleto",
      overallAtual: 80,
      overallMaximo: 80,
      atributos: atributos(),
      ehCampeao: false,
      sequenciaDeVitorias: 0,
      derrotasSeguidas: 0,
      derrotasParaSerDispensado: 3,
      recusasSeguidas: 0,
      recusasParaSerDispensado: 3,
      vitoriasNaEtapa: 0,
      vitoriasParaSubir: 4,
      compromissosNaTemporada: 0,
      compromissosPorTemporada: 4,
      vezesDispensado: 0,
      lesoesSofridas: 0,
      lesao: null,
      posicaoNoRanking: null,
      ...ajustes.estado,
    },
    ofertas: [oferta()],
    carreira: {
      cartel: "0-0-0",
      vitorias: 0,
      derrotas: 0,
      empates: 0,
      totalDeLutas: 0,
      vitoriasPorNocaute: 0,
      vitoriasPorFinalizacao: 0,
      vitoriasPorDecisao: 0,
      idadeDeEstreia: 25,
      idadeDeAposentadoria: 0,
      maiorSequenciaDeVitorias: 0,
      overallMaximo: 80,
      categoriaFinal: "MeioPesado",
      categoriaFinalTexto: "Meio-pesado",
      legado: "LutadorRegional",
      pontuacaoDeLegado: 0,
      conquistas: [],
      lutas: [],
      ...ajustes.carreira,
    },
    ultimaLuta: null,
    eventos: [],
    camp: null,
    rankingDaDivisao: [],
    posicaoAnterior: null,
    ...ajustes,
  };
}

/** Renderiza dentro de um QueryClient próprio, isolado por teste. */
export function renderizar(elemento: React.ReactNode) {
  const cliente = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(<QueryClientProvider client={cliente}>{elemento}</QueryClientProvider>);
}

/** Uma rodada de draft com o atleta da vez e as habilidades ainda livres. */
export function rodada(ajustes: Partial<RodadaAtual> = {}): RodadaAtual {
  return {
    ordem: 1,
    totalDeRodadas: 8,
    nivelDeDificuldade: "Facil",
    atleta: {
      id: "22222222-2222-2222-2222-222222222222",
      nome: "Atleta de Teste",
      slug: "atleta-de-teste",
      pais: "Brasil",
      notas: atributos(),
    },
    habilidadesDisponiveis: [...HABILIDADES],
    escolhasFeitas: [],
    pulosRestantes: 2,
    pulosPermitidos: 2,
    ...ajustes,
  };
}
