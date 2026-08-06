import { TelaDeSimulacao } from "@/components/jogo/tela-de-simulacao";

export default async function PaginaDaCarreira({
  params,
}: PageProps<"/partida/[partidaId]/carreira">) {
  const { partidaId } = await params;

  return <TelaDeSimulacao partidaId={partidaId} />;
}
