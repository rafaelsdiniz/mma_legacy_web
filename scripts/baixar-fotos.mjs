// @ts-check
/**
 * Baixa as fotos dos atletas do acervo a partir da Wikimedia.
 *
 * Uso:
 *   node scripts/baixar-fotos.mjs
 *   node scripts/baixar-fotos.mjs https://mma-legacy-api-....run.app/api
 *
 * O acervo vem da própria API, então a lista nunca sai de sincronia com o jogo.
 *
 * ATRIBUIÇÃO NÃO É OPCIONAL. As imagens do Commons são em geral CC BY ou
 * CC BY-SA, o que exige creditar autor e licença. Por isso o script grava
 * `creditos.json` junto das imagens, e a página /creditos exibe o conteúdo.
 * Baixar sem publicar o crédito é violação de licença.
 */

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const URL_DA_API = process.argv[2] ?? "http://localhost:5080/api";
const PASTA = join(process.cwd(), "public", "fighters");

/** A Wikipédia em inglês tem cobertura muito melhor de MMA que a portuguesa. */
const WIKIPEDIA = "https://en.wikipedia.org/w/api.php";
const COMMONS = "https://commons.wikimedia.org/w/api.php";

/** Limite da API por requisição. */
const LOTE = 50;

/**
 * Largura da miniatura baixada.
 *
 * Pedir a miniatura em vez do arquivo original resolve três problemas de uma
 * vez: os originais passam de 1900px e vários MB, o que estourava o limite de
 * taxa da Wikimedia (429), inchava o repositório e deixava a página lenta.
 * O card do jogo nunca passa de 400px.
 */
const LARGURA_DA_FOTO = 500;

/** A Wikimedia bloqueia user-agent genérico. Identificar-se é exigência deles. */
const CABECALHOS = {
  "User-Agent":
    "MmaLegacyBot/1.0 (https://github.com/rafaelsdiniz/mma_legacy_web; projeto educacional)",
};

async function consultar(base, parametros) {
  const url = new URL(base);
  url.search = new URLSearchParams({
    format: "json",
    formatversion: "2",
    origin: "*",
    ...parametros,
  }).toString();

  const resposta = await fetch(url, { headers: CABECALHOS });
  if (!resposta.ok) {
    throw new Error(`${base} respondeu ${resposta.status}`);
  }

  return resposta.json();
}

function emLotes(itens, tamanho) {
  const lotes = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    lotes.push(itens.slice(i, i + tamanho));
  }
  return lotes;
}

/** Descobre a imagem principal do artigo de cada atleta. */
async function buscarImagens(nomes) {
  const encontradas = new Map();

  for (const lote of emLotes(nomes, LOTE)) {
    const dados = await consultar(WIKIPEDIA, {
      action: "query",
      prop: "pageimages",
      // `thumbnail` devolve a miniatura já redimensionada pelo servidor deles;
      // `name` devolve o nome do arquivo no Commons, que é a chave para buscar
      // autor e licença depois.
      piprop: "thumbnail|name",
      pithumbsize: String(LARGURA_DA_FOTO),
      titles: lote.join("|"),
      redirects: "1",
    });

    // `normalized` e `redirects` mapeiam o nome que pedimos para o título real
    // do artigo. Sem isso, "Jiri Prochazka" não casa com "Jiří Procházka".
    const equivalencias = new Map();
    for (const troca of [
      ...(dados.query?.normalized ?? []),
      ...(dados.query?.redirects ?? []),
    ]) {
      equivalencias.set(troca.to, troca.from);
    }

    for (const pagina of dados.query?.pages ?? []) {
      const miniatura = pagina.thumbnail?.source;
      if (!miniatura || !pagina.pageimage) continue;

      const pedido = equivalencias.get(pagina.title) ?? pagina.title;
      encontradas.set(pedido, {
        url: miniatura,
        arquivoNoCommons: `File:${pagina.pageimage}`,
      });
    }
  }

  return encontradas;
}

/** Busca autor e licença de cada arquivo. É o que torna o uso legítimo. */
async function buscarCreditos(arquivos) {
  const creditos = new Map();

  for (const lote of emLotes(arquivos, LOTE)) {
    const dados = await consultar(COMMONS, {
      action: "query",
      prop: "imageinfo",
      iiprop: "extmetadata",
      iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl|Credit",
      titles: lote.join("|"),
    });

    for (const pagina of dados.query?.pages ?? []) {
      const meta = pagina.imageinfo?.[0]?.extmetadata;
      if (!meta) continue;

      creditos.set(pagina.title, {
        autor: limparHtml(meta.Artist?.value) ?? "Autor não informado",
        licenca: meta.LicenseShortName?.value ?? "Licença não informada",
        licencaUrl: meta.LicenseUrl?.value ?? null,
        origem: `https://commons.wikimedia.org/wiki/${encodeURIComponent(pagina.title)}`,
      });
    }
  }

  return creditos;
}

/**
 * Nome do arquivo dentro da URL do Commons, sem query string.
 *
 * A Wikimedia passou a anexar `?utm_source=...` nas URLs devolvidas pela API.
 * Sem remover isso, o nome do arquivo sai com `?` e `&` — inválidos no Windows
 * — e todo download falha.
 */
function nomeDoArquivo(url) {
  return decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
}

/** Os campos de metadados vêm com HTML dentro. */
function limparHtml(valor) {
  return valor
    ?.replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const esperar = (ms) => new Promise((resolva) => setTimeout(resolva, ms));

/** Pausa entre downloads. A Wikimedia devolve 429 em rajada de requisições. */
const INTERVALO_MS = 1200;
const TENTATIVAS = 4;

/**
 * Baixa um arquivo, respeitando o limite de taxa da Wikimedia.
 *
 * Em 429 espera e tenta de novo com intervalo crescente — o servidor está
 * pedindo calma, não recusando o arquivo. Insistir na mesma cadência só
 * prolonga o bloqueio.
 */
async function baixar(url, destino) {
  for (let tentativa = 1; tentativa <= TENTATIVAS; tentativa++) {
    const resposta = await fetch(url, { headers: CABECALHOS });

    if (resposta.ok) {
      await writeFile(destino, Buffer.from(await resposta.arrayBuffer()));
      return;
    }

    if (resposta.status !== 429 || tentativa === TENTATIVAS) {
      throw new Error(`download falhou (${resposta.status})`);
    }

    await esperar(INTERVALO_MS * 4 * tentativa);
  }
}

async function principal() {
  await mkdir(PASTA, { recursive: true });

  console.log(`Lendo o acervo em ${URL_DA_API}/lutadores`);
  const acervo = await (await fetch(`${URL_DA_API}/lutadores`)).json();
  console.log(`${acervo.length} atletas no acervo.\n`);

  const imagens = await buscarImagens(acervo.map((atleta) => atleta.nome));
  const creditos = await buscarCreditos(
    [...imagens.values()].map((imagem) => imagem.arquivoNoCommons),
  );

  const catalogo = [];
  const semFoto = [];

  for (const atleta of acervo) {
    const imagem = imagens.get(atleta.nome);

    if (!imagem) {
      semFoto.push(atleta.nome);
      continue;
    }

    const extensao = nomeDoArquivo(imagem.url).split(".").pop()?.toLowerCase() ?? "jpg";
    const arquivo = `${atleta.slug}.${extensao}`;
    const chave = imagem.arquivoNoCommons;
    const destino = join(PASTA, arquivo);

    // Já baixado em execução anterior: registra no catálogo e segue.
    //
    // É o que torna o script incremental. A Wikimedia limita a taxa e derruba
    // parte dos downloads com 429; rodar de novo preenche só o que faltou, em
    // vez de recomeçar do zero e tomar o mesmo bloqueio.
    if (existsSync(destino)) {
      catalogo.push({
        slug: atleta.slug,
        nome: atleta.nome,
        arquivo: `/fighters/${arquivo}`,
        ...(creditos.get(chave) ?? {}),
      });
      continue;
    }

    try {
      await esperar(INTERVALO_MS);
      await baixar(imagem.url, destino);
      catalogo.push({
        slug: atleta.slug,
        nome: atleta.nome,
        arquivo: `/fighters/${arquivo}`,
        ...(creditos.get(chave) ?? {}),
      });
      console.log(`  ok   ${atleta.nome}`);
    } catch (erro) {
      semFoto.push(atleta.nome);
      console.log(`  erro ${atleta.nome}: ${erro.message}`);
    }
  }

  await writeFile(
    join(PASTA, "creditos.json"),
    `${JSON.stringify(catalogo, null, 2)}\n`,
  );

  console.log(`\n${catalogo.length} fotos baixadas, ${semFoto.length} sem imagem livre.`);
  if (semFoto.length > 0) {
    console.log("Estes usam a silhueta:");
    for (const nome of semFoto) console.log(`  - ${nome}`);
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
