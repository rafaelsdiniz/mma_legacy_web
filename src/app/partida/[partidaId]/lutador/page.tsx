import { TelaDeRevelacao } from "@/components/jogo/tela-de-revelacao";

export default async function PaginaDoLutador({
  params,
}: PageProps<"/partida/[partidaId]/lutador">) {
  const { partidaId } = await params;

  return <TelaDeRevelacao partidaId={partidaId} />;
}
