import type { StatusDaPartida } from "./api/tipos";

/**
 * As partidas deste navegador.
 *
 * A carreira só existe pela URL: quem fecha a aba sem guardar
 * `/partida/<id>/carreira` perde o lutador que montou, e não há login para
 * reencontrá-lo. Enquanto autenticação não existe, uma lista no próprio
 * navegador resolve o caso que importa — voltar para a carreira que você estava
 * jogando.
 *
 * É deliberadamente burro: não sincroniza, não expira e não é fonte da verdade
 * de nada. O servidor continua dono do estado; isto aqui é um marcador de
 * página.
 */

const CHAVE = "mma-legacy:partidas";

/** Quantas partidas ficam guardadas. Além disso vira histórico, não atalho. */
const LIMITE = 5;

/**
 * O `storage` do navegador só avisa as <b>outras</b> abas. Este evento é o que
 * faz a aba que gravou também se redesenhar.
 */
const EVENTO_DE_MUDANCA = "mma-legacy:partidas-mudaram";

export interface PartidaSalva {
  id: string;
  /** Como o lutador aparece no cartaz, para a tela não precisar buscar nada. */
  nomeDeCartaz: string;
  status: StatusDaPartida;
  /** ISO da última vez que esta partida foi tocada. */
  atualizadaEm: string;
}

export function listarPartidasSalvas(): PartidaSalva[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const salvas: unknown = bruto ? JSON.parse(bruto) : [];

    return Array.isArray(salvas) ? salvas.filter(ehPartidaSalva) : [];
  } catch {
    // localStorage bloqueado, cheio ou com lixo de uma versão anterior. Ficar
    // sem atalho é um problema pequeno; quebrar a home por causa dele, não.
    return [];
  }
}

/** Guarda ou atualiza uma partida, sempre no topo da lista. */
export function salvarPartida(partida: Omit<PartidaSalva, "atualizadaEm">) {
  if (typeof window === "undefined") {
    return;
  }

  const atualizada: PartidaSalva = { ...partida, atualizadaEm: new Date().toISOString() };
  const restantes = listarPartidasSalvas().filter((salva) => salva.id !== partida.id);

  gravar([atualizada, ...restantes].slice(0, LIMITE));
}

export function esquecerPartida(id: string) {
  gravar(listarPartidasSalvas().filter((salva) => salva.id !== id));
}

/**
 * Assina mudanças na lista, para o React redesenhar sozinho.
 *
 * Existe junto de {@link lerPartidaMaisRecente} para alimentar
 * `useSyncExternalStore` — que é como se lê um armazenamento de fora do React
 * sem cair no vaivém de guardar o valor em estado dentro de um efeito.
 */
export function assinarPartidasSalvas(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  window.addEventListener(EVENTO_DE_MUDANCA, aoMudar);

  return () => {
    window.removeEventListener("storage", aoMudar);
    window.removeEventListener(EVENTO_DE_MUDANCA, aoMudar);
  };
}

let ultimoBruto: string | null = null;
let ultimaPartida: PartidaSalva | null = null;

/**
 * A partida mais recente, que é a que o botão "continuar" abre.
 *
 * Devolve sempre o <b>mesmo objeto</b> enquanto o conteúdo gravado não mudar.
 * `useSyncExternalStore` compara por identidade, e um objeto novo a cada
 * leitura o faria redesenhar para sempre.
 */
export function lerPartidaMaisRecente(): PartidaSalva | null {
  const bruto = window.localStorage.getItem(CHAVE);

  if (bruto !== ultimoBruto) {
    ultimoBruto = bruto;
    ultimaPartida = listarPartidasSalvas()[0] ?? null;
  }

  return ultimaPartida;
}

/** No servidor não existe navegador, e portanto não existe partida salva. */
export function semPartidaSalva(): PartidaSalva | null {
  return null;
}

function gravar(partidas: PartidaSalva[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(partidas));
    window.dispatchEvent(new Event(EVENTO_DE_MUDANCA));
  } catch {
    // Sem espaço ou sem permissão: seguir sem o atalho.
  }
}

function ehPartidaSalva(valor: unknown): valor is PartidaSalva {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }

  const candidata = valor as Partial<PartidaSalva>;

  return typeof candidata.id === "string" && typeof candidata.nomeDeCartaz === "string";
}
