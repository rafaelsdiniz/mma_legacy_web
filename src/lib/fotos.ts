import creditos from "../../public/fighters/creditos.json";

/**
 * Uma foto de atleta e sua atribuição obrigatória.
 *
 * As imagens vêm do Wikimedia Commons, quase sempre sob CC BY ou CC BY-SA —
 * licenças que **exigem** creditar autor e licença. Por isso autor e licença
 * viajam junto do arquivo, e não como metadado solto: quem usa a foto tem os
 * dados do crédito na mão.
 */
export interface FotoDeAtleta {
  slug: string;
  nome: string;
  arquivo: string;
  autor?: string;
  licenca?: string;
  licencaUrl?: string | null;
  origem?: string;
}

const CATALOGO = creditos as FotoDeAtleta[];

/**
 * Mapa slug → foto.
 *
 * A extensão varia entre .jpg e .png conforme o arquivo de origem, então o
 * caminho não pode ser montado por convenção — precisa vir do catálogo que o
 * script gravou.
 */
const PORSLUG = new Map(CATALOGO.map((foto) => [foto.slug, foto]));

/** Caminho da foto do atleta, ou `null` se não houver imagem livre para ele. */
export function fotoDoAtleta(slug: string): string | null {
  return PORSLUG.get(slug)?.arquivo ?? null;
}

/** Todas as fotos com crédito, em ordem alfabética, para a página de créditos. */
export function fotosComCredito(): FotoDeAtleta[] {
  return [...CATALOGO].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
