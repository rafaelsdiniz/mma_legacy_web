"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provedores globais da aplicação.
 *
 * O QueryClient é criado dentro de estado, e não em módulo, para que cada
 * requisição no servidor tenha o seu. Um cliente compartilhado entre
 * requisições vazaria dados de uma partida para outra.
 */
export function Provedores({ children }: { children: React.ReactNode }) {
  const [cliente] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // O estado de uma partida só muda por ação do próprio jogador,
            // então revalidar ao focar a janela só geraria requisição à toa.
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
