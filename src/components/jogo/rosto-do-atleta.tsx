"use client";

import Image from "next/image";
import { useState } from "react";

import { FOTOS_DOS_LUTADORES } from "@/lib/fotos-dos-lutadores";
import { cn } from "@/lib/utils";

/**
 * O rosto do atleta, recortado no octógono da marca.
 *
 * As fotos são colocadas à mão em `public/fighters/`, com o nome igual ao slug
 * do atleta — o mesmo que a API devolve. Não há catálogo nem script: se o
 * arquivo existe, aparece; se não, entra a silhueta.
 *
 * Aceita `.png` e `.jpg` nessa ordem, então não é preciso converter nada nem
 * padronizar formato antes de soltar o arquivo na pasta.
 */

/** Formatos tentados, em ordem, antes de desistir e mostrar a silhueta. */
const FORMATOS_ALTERNATIVOS = ["avif", "png", "jpg"] as const;

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
  const candidatos = [
    ...(FOTOS_DOS_LUTADORES[slug] ? [FOTOS_DOS_LUTADORES[slug]] : []),
    ...FORMATOS_ALTERNATIVOS.map((formato) => `/fighters/${slug}.${formato}`),
  ];
  const [falha, setFalha] = useState({ slug, tentativa: 0 });
  const tentativa = falha.slug === slug ? falha.tentativa : 0;
  const semFoto = tentativa >= candidatos.length;

  return (
    <span
      className={cn(
        "recorte-octogonal bg-grafite-borda relative block shrink-0 overflow-hidden",
        className,
      )}
      style={{ width: tamanho, height: tamanho }}
    >
      {semFoto ? (
        <Silhueta />
      ) : (
        <Image
          // A key força o Next a refazer a requisição ao trocar de formato;
          // sem ela ele reaproveita o elemento e o onError não dispara de novo.
          key={candidatos[tentativa]}
          src={candidatos[tentativa]}
          alt={nome}
          width={tamanho}
          height={tamanho}
          onError={() =>
            setFalha((atual) => ({
              slug,
              tentativa: atual.slug === slug ? atual.tentativa + 1 : 1,
            }))
          }
          // `object-top` porque o rosto quase sempre está no terço superior da
          // foto; centralizar cortaria a cabeça na maioria delas.
          className="h-full w-full object-cover object-top"
        />
      )}
    </span>
  );
}

/** Placeholder para atletas que ainda não têm foto na pasta. */
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
