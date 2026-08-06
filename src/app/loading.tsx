import { TelaDeCarregamento } from "@/components/jogo/tela-de-carregamento";

/**
 * Loading UI da raiz do App Router.
 *
 * O Next mostra isto automaticamente enquanto a rota carrega, sem precisar de
 * estado nem de Suspense escrito à mão. Por estar na raiz, cobre a entrada no
 * site e a navegação para as rotas dinâmicas de partida.
 */
export default function Carregando() {
  return <TelaDeCarregamento />;
}
