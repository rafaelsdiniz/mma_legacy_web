"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A logo do jogo.
 *
 * Espera o arquivo em `public/marca/mma-legacy.png`. Se ele não existir — ou
 * falhar por qualquer motivo —, cai na versão em texto em vez de deixar um
 * ícone quebrado na tela. Um placeholder legível é sempre melhor que um erro
 * visível, e isso vale tanto para o dia em que o arquivo ainda não chegou
 * quanto para uma falha de CDN em produção.
 */
export function Marca({
  className,
  tamanho = 220,
}: {
  className?: string;
  tamanho?: number;
}) {
  const [falhou, setFalhou] = useState(false);

  if (falhou) {
    return (
      <MarcaTexto
        className={cn("text-5xl sm:text-6xl", className)}
        style={{ fontSize: tamanho / 4.5 }}
      />
    );
  }

  return (
    <Image
      src="/marca/mma-legacy.png"
      alt="MMA Legacy"
      width={tamanho}
      height={Math.round(tamanho * 0.58)}
      priority
      onError={() => setFalhou(true)}
      className={cn("h-auto", className)}
    />
  );
}

/** Versão em texto, para cabeçalhos internos onde a logo cheia pesaria demais. */
export function MarcaTexto({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn("font-display leading-none font-bold tracking-tight", className)}
      style={style}
    >
      <span className="text-gelo">MMA</span>
      <span className="text-fight-claro"> LEGACY</span>
    </span>
  );
}
