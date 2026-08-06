"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MarcaTexto } from "@/components/jogo/marca";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", rotulo: "Início" },
  { href: "/lutadores", rotulo: "Lutadores" },
  { href: "/criar", rotulo: "Jogar" },
] as const;

/**
 * Barra de navegação.
 *
 * Fica oculta durante o draft: aquela tela é uma sequência de oito decisões, e
 * um link para outra página no topo só serve para o jogador abandonar a partida
 * pela metade sem querer.
 */
export function Navbar() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  if (caminho.includes("/draft")) {
    return null;
  }

  return (
    <header className="border-grafite-borda bg-grafite/90 sticky top-0 z-40 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" onClick={() => setAberto(false)}>
          <MarcaTexto className="text-xl" />
        </Link>

        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <ItemDeMenu link={link} caminho={caminho} />
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          aria-label="Abrir menu"
          className="border-grafite-borda hover:border-fight flex size-9 items-center justify-center border sm:hidden"
        >
          <span aria-hidden className="font-display text-lg leading-none">
            {aberto ? "✕" : "≡"}
          </span>
        </button>
      </nav>

      {aberto && (
        <ul className="border-grafite-borda flex flex-col border-t px-4 pb-3 sm:hidden">
          {LINKS.map((link) => (
            <li key={link.href} onClick={() => setAberto(false)}>
              <ItemDeMenu link={link} caminho={caminho} className="block py-2" />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function ItemDeMenu({
  link,
  caminho,
  className,
}: {
  link: { href: string; rotulo: string };
  caminho: string;
  className?: string;
}) {
  const ativo = link.href === "/" ? caminho === "/" : caminho.startsWith(link.href);

  return (
    <Link
      href={link.href}
      className={cn(
        "font-display px-3 py-2 text-sm tracking-widest uppercase transition-colors",
        ativo ? "text-fight-claro" : "text-aco-claro hover:text-gelo",
        className,
      )}
    >
      {link.rotulo}
    </Link>
  );
}

/** Rodapé com o aviso legal, que o projeto precisa manter visível. */
export function Rodape() {
  const caminho = usePathname();

  if (caminho.includes("/draft")) {
    return null;
  }

  return (
    <footer className="border-grafite-borda mt-auto border-t">
      <div className="text-aco mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs leading-relaxed sm:px-6">
        <MarcaTexto className="text-base" />

        <p className="max-w-2xl">
          Projeto independente, criado para fins educacionais e de entretenimento.
          Sem associação, parceria ou aprovação do UFC, da TKO Group Holdings ou de
          qualquer organização esportiva. Nomes e marcas pertencem aos seus
          respectivos proprietários.
        </p>

        <p className="max-w-2xl">
          As notas dos atletas são estimativas editoriais usadas exclusivamente
          dentro da mecânica do jogo e não representam avaliações oficiais. Os
          adversários da simulação de carreira são fictícios.
        </p>

        <p className="text-aco/70 mt-2">
          Desenvolvido por Rafael Silva Diniz · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
