"use client";

import Image from "next/image";
import { useState } from "react";

import { fotoDoAtleta } from "@/lib/fotos";
import { cn } from "@/lib/utils";

/**
 * O rosto do atleta, recortado no octógono da marca.
 *
 * As fotos vêm do Wikimedia Commons e são imagens livres, não de divulgação —
 * enquadramento, fundo e iluminação variam muito. A máscara octogonal com
 * enquadramento no topo é o que normaliza isso: corta o ambiente, centraliza a
 * cabeça e faz quarenta fotos díspares parecerem um elenco só.
 *
 * Quem não tem imagem livre cai na silhueta, que é o comportamento previsto
 * desde o começo do projeto.
 */
export function RostoDoAtleta({
  slug,
  nome,
  className,
  tamanho = 56,
}: {
  slug: string;
  nome: string;
  className?: string;
  tamanho?: number;
}) {
  const [falhou, setFalhou] = useState(false);
  const foto = fotoDoAtleta(slug);

  return (
    <span
      className={cn(
        "recorte-octogonal bg-grafite-borda relative block shrink-0 overflow-hidden",
        className,
      )}
      style={{ width: tamanho, height: tamanho }}
    >
      {foto && !falhou ? (
        <Image
          src={foto}
          alt={nome}
          width={tamanho}
          height={tamanho}
          onError={() => setFalhou(true)}
          // `object-top` porque o rosto quase sempre está no terço superior da
          // foto; centralizar cortaria a cabeça na maioria delas.
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <Silhueta />
      )}
    </span>
  );
}

/** Placeholder para atletas sem imagem de licença compatível. */
function Silhueta() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="text-aco h-full w-full"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="8.5" r="4" />
      <path d="M12 14c-4.2 0-7.5 2.4-7.5 5.4V24h15v-4.6c0-3-3.3-5.4-7.5-5.4Z" />
    </svg>
  );
}
