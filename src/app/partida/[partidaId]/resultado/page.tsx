import { TelaDeResultado } from "@/components/jogo/tela-de-resultado";

export default async function PaginaDeResultado({
  params,
}: PageProps<"/partida/[partidaId]/resultado">) {
  const { partidaId } = await params;

  return <TelaDeResultado partidaId={partidaId} />;
}
