"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MarcaTexto } from "@/components/jogo/marca";
import { cn } from "@/lib/utils";

/**
 * Navegação inspirada na estrutura institucional do whitehouse.gov: barra
 * utilitária fina no topo, barra principal com a marca à esquerda, menu com
 * painel expansível e rodapé em colunas com faixa final.
 *
 * O que foi adaptado é a **estrutura**, não a identidade — cores, tipografia e
 * bordas angulares continuam sendo as do MMA Legacy.
 *
 * Uma decisão deliberada: o painel expansível lista só rotas que existem. Um
 * mega menu com seções vazias parece grande, mas leva o visitante para 404 e
 * denuncia que o site é menor do que aparenta.
 */

interface ItemDeMenu {
  href: string;
  rotulo: string;
  descricao?: string;
}

interface SecaoDeMenu {
  rotulo: string;
  href: string;
  /** Quando presente, o item abre um painel em vez de navegar direto. */
  itens?: ItemDeMenu[];
}

// Menu plano, sem submenu. "Acervo" era um rótulo de banco de dados, não de
// jogo: ninguém chega ao site querendo ver um acervo, chega querendo saber quem
// pode escolher no draft.
const SECOES: SecaoDeMenu[] = [
  { rotulo: "Início", href: "/" },
  { rotulo: "Lutadores", href: "/lutadores" },
  { rotulo: "Ranking", href: "/ranking" },
  { rotulo: "Jogar", href: "/criar" },
];

export function Navbar() {
  const caminho = usePathname();
  const [secaoAberta, setSecaoAberta] = useState<string | null>(null);
  const [menuMobile, setMenuMobile] = useState(false);

  // Fecha tudo ao trocar de rota: sem isso o painel fica aberto por cima da
  // página nova depois de um clique.
  useEffect(() => {
    const quadro = requestAnimationFrame(() => {
      setSecaoAberta(null);
      setMenuMobile(false);
    });

    return () => cancelAnimationFrame(quadro);
  }, [caminho]);

  // Durante o draft a navegação some. Aquela tela é uma sequência de oito
  // decisões irreversíveis, e um link no topo só serve para o jogador
  // abandonar a partida pela metade sem querer.
  if (caminho.includes("/draft")) {
    return null;
  }

  return (
    <header className="border-grafite-borda bg-grafite/95 sticky top-0 z-40 border-b backdrop-blur">
      <BarraUtilitaria />

      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <MarcaTexto className="text-xl" />
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {SECOES.map((secao) => (
            <ItemDaBarra
              key={secao.rotulo}
              secao={secao}
              caminho={caminho}
              aberta={secaoAberta === secao.rotulo}
              aoAlternar={() =>
                setSecaoAberta((atual) => (atual === secao.rotulo ? null : secao.rotulo))
              }
            />
          ))}
        </nav>

        <Link
          href="/criar"
          className="recorte-angular-suave bg-fight hover:bg-fight-claro font-display ml-auto hidden shrink-0 px-5 py-2 text-sm font-bold tracking-widest uppercase transition-colors md:block"
        >
          Montar lutador
        </Link>

        <button
          type="button"
          onClick={() => setMenuMobile((atual) => !atual)}
          aria-expanded={menuMobile}
          aria-label="Abrir menu"
          className="border-grafite-borda hover:border-fight ml-auto flex size-9 items-center justify-center border md:hidden"
        >
          <span aria-hidden className="font-display text-lg leading-none">
            {menuMobile ? "✕" : "≡"}
          </span>
        </button>
      </div>

      {/* Painel do menu, no lugar do mega menu da referência. */}
      {secaoAberta && (
        <PainelDaSecao
          secao={SECOES.find((secao) => secao.rotulo === secaoAberta)!}
          caminho={caminho}
        />
      )}

      {menuMobile && <MenuMobile caminho={caminho} />}
    </header>
  );
}

/** Faixa fina acima da barra principal, como a utility bar da referência. */
function BarraUtilitaria() {
  return (
    <div className="border-grafite-borda bg-grafite-claro border-b">
      <div className="text-aco font-display mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[10px] tracking-[0.22em] uppercase sm:px-6">
        <span>Projeto independente · sem vínculo com organizações esportivas</span>
        <span className="hidden sm:inline">Escolha · Construa · Sobreviva</span>
      </div>
    </div>
  );
}

function ItemDaBarra({
  secao,
  caminho,
  aberta,
  aoAlternar,
}: {
  secao: SecaoDeMenu;
  caminho: string;
  aberta: boolean;
  aoAlternar: () => void;
}) {
  const ativo = estaAtivo(secao.href, caminho);
  const classe = cn(
    "font-display px-3 py-2 text-sm tracking-widest uppercase transition-colors",
    ativo || aberta ? "text-fight-claro" : "text-aco-claro hover:text-gelo",
  );

  if (!secao.itens) {
    return (
      <Link href={secao.href} className={classe}>
        {secao.rotulo}
      </Link>
    );
  }

  return (
    <button type="button" onClick={aoAlternar} aria-expanded={aberta} className={classe}>
      {secao.rotulo}
      <span aria-hidden className="ml-1.5 text-[9px]">
        {aberta ? "▲" : "▼"}
      </span>
    </button>
  );
}

function PainelDaSecao({ secao, caminho }: { secao: SecaoDeMenu; caminho: string }) {
  return (
    <div className="border-grafite-borda bg-grafite-claro hidden border-t md:block">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {secao.itens?.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "hover:border-fight border-l-2 py-1 pl-4 transition-colors",
              estaAtivo(item.href, caminho) ? "border-fight" : "border-grafite-borda",
            )}
          >
            <span className="font-display block text-base tracking-wide uppercase">
              {item.rotulo}
            </span>
            {item.descricao && (
              <span className="text-aco mt-0.5 block text-xs leading-snug">
                {item.descricao}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MenuMobile({ caminho }: { caminho: string }) {
  return (
    <div className="border-grafite-borda bg-grafite-claro border-t md:hidden">
      <ul className="flex flex-col px-4 py-2">
        {SECOES.flatMap((secao) => secao.itens ?? [secao]).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "font-display block py-2.5 text-sm tracking-widest uppercase",
                estaAtivo(item.href, caminho)
                  ? "text-fight-claro"
                  : "text-aco-claro hover:text-gelo",
              )}
            >
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>

      <Link
        href="/criar"
        className="bg-fight font-display block px-4 py-3 text-center text-sm font-bold tracking-widest uppercase"
      >
        Montar lutador
      </Link>
    </div>
  );
}

/**
 * Rodapé em colunas com bloco de chamada e faixa final, seguindo a estrutura da
 * referência.
 *
 * No lugar do bloco de newsletter, que este projeto não tem, entra o convite
 * para jogar — é o que o rodapé de um jogo tem a oferecer a quem chegou até o
 * fim da página.
 */
export function Rodape() {
  const caminho = usePathname();

  if (caminho.includes("/draft")) {
    return null;
  }

  return (
    <footer className="border-grafite-borda bg-grafite-claro/70 mt-auto border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 pb-5 sm:px-6 md:grid-cols-4">
        <ColunaDoRodape
          titulo="O jogo"
          links={[
            { href: "/", rotulo: "Início" },
            { href: "/criar", rotulo: "Montar lutador" },
            { href: "/ranking", rotulo: "Ranking das divisões" },
            { href: "/lutadores", rotulo: "Todos os lutadores" },
          ]}
        />

        <ColunaDoRodape
          titulo="Como funciona"
          links={[
            { href: "/criar", rotulo: "Draft de oito rodadas" },
            { href: "/criar", rotulo: "Modos fácil e difícil" },
            { href: "/lutadores", rotulo: "Notas e estilos" },
          ]}
        />

        <ColunaDoRodape
          titulo="Sobre"
          links={[

            {
              href: "https://github.com/rafaelsdiniz/mma_legacy_api",
              rotulo: "Código da API",
              externo: true,
            },
            {
              href: "https://github.com/rafaelsdiniz/mma_legacy_web",
              rotulo: "Código do site",
              externo: true,
            },
          ]}
        />

        <div>
          <p className="font-display text-fight-claro text-xs tracking-[0.22em] uppercase">
            Comece agora
          </p>
          <p className="text-aco-claro mt-3 text-sm leading-relaxed">
            Oito atletas, oito escolhas e uma carreira inteira para descobrir se
            você montou um campeão.
          </p>
          <Link
            href="/criar"
            className="recorte-angular-suave bg-fight hover:bg-fight-claro font-display mt-4 inline-block px-5 py-2.5 text-sm font-bold tracking-widest uppercase transition-colors"
          >
            Montar lutador
          </Link>
        </div>
      </div>

      {/* Faixa final: marca, aviso legal e assinatura. */}
      <div>
        <div className="text-aco mx-auto grid max-w-6xl gap-3 px-4 pt-3 pb-8 text-xs leading-relaxed sm:px-6 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-x-8">
          <MarcaTexto className="text-base" />

          <p className="max-w-3xl lg:col-start-2 lg:row-start-1">
            Projeto independente, criado para fins educacionais e de
            entretenimento. Sem associação, parceria ou aprovação do UFC, da TKO
            Group Holdings ou de qualquer organização esportiva. Nomes e marcas
            pertencem aos seus respectivos proprietários.
          </p>

          <p className="max-w-3xl lg:col-start-2">
            As notas dos atletas são estimativas editoriais usadas exclusivamente
            dentro da mecânica do jogo e não representam avaliações oficiais. Os
            adversários da simulação de carreira são fictícios.
          </p>

          <p className="text-aco/70 lg:col-span-2">
            Desenvolvido por Rafael Silva Diniz · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

function ColunaDoRodape({
  titulo,
  links,
}: {
  titulo: string;
  links: { href: string; rotulo: string; externo?: boolean }[];
}) {
  return (
    <div>
      <p className="font-display text-fight-claro text-xs tracking-[0.22em] uppercase">
        {titulo}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={`${titulo}-${link.rotulo}`}>
            {link.externo ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-aco-claro hover:text-gelo text-sm transition-colors"
              >
                {link.rotulo}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-aco-claro hover:text-gelo text-sm transition-colors"
              >
                {link.rotulo}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function estaAtivo(href: string, caminho: string) {
  return href === "/" ? caminho === "/" : caminho.startsWith(href);
}
