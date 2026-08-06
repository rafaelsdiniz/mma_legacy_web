import { TelaDeDraft } from "@/components/jogo/tela-de-draft";

export default async function PaginaDeDraft({
  params,
}: PageProps<"/partida/[partidaId]/draft">) {
  const { partidaId } = await params;

  return <TelaDeDraft partidaId={partidaId} />;
}
