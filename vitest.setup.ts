import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

/**
 * Cada teste começa com a árvore desmontada e o armazenamento limpo.
 *
 * Sem isto, o atalho gravado por um teste apareceria no seguinte — e um teste
 * que depende do que outro deixou para trás é um teste que passa por acaso.
 */
afterEach(() => {
  cleanup();
});

beforeEach(() => {
  window.localStorage.clear();
});
