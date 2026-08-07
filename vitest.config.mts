import { defineConfig } from "vitest/config";

/**
 * Testes das telas do jogo.
 *
 * Sem o plugin oficial do React de propósito: ele existe para o Fast Refresh,
 * que não tem uso em teste, e arrastaria o Babel 8 para dentro de uma árvore de
 * dependências que ainda vive no 7. O transformador do próprio Vite dá conta do
 * JSX das telas.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.teste.{ts,tsx}"],
  },
});
