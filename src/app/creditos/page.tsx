import { Etiqueta, Painel, TituloAngular } from "@/components/jogo/painel";
import { fotosComCredito } from "@/lib/fotos";

export const metadata = {
  title: "Créditos das imagens · MMA Legacy",
  description: "Autoria e licença das fotos usadas no jogo.",
};

/**
 * Créditos das imagens.
 *
 * Não é uma página de cortesia: as fotos vêm do Wikimedia Commons sob CC BY e
 * CC BY-SA, licenças que exigem creditar autor e licença de forma acessível.
 * Usar as imagens sem esta página seria violação — ela é parte da condição de
 * uso, não um extra.
 */
export default function PaginaDeCreditos() {
  const fotos = fotosComCredito();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <TituloAngular className="text-3xl sm:text-4xl">Créditos</TituloAngular>

      <div className="text-aco-claro mt-6 flex flex-col gap-3 text-sm leading-relaxed">
        <p>
          As fotos dos atletas vêm do{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noreferrer"
            className="text-fight-claro underline"
          >
            Wikimedia Commons
          </a>{" "}
          e são usadas sob as licenças indicadas abaixo. Os direitos pertencem
          aos respectivos autores.
        </p>
        <p>
          As imagens foram redimensionadas e recortadas para caber na interface.
          Nenhuma outra alteração foi feita.
        </p>
        <p className="text-aco">
          Atletas sem imagem de licença compatível aparecem no jogo com uma
          silhueta.
        </p>
      </div>

      <Etiqueta className="mt-10">{fotos.length} imagens</Etiqueta>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {fotos.map((foto) => (
          <li key={foto.slug}>
            <Painel>
              <div className="p-4">
                <p className="font-display text-base leading-tight">{foto.nome}</p>

                <dl className="text-aco-claro mt-2 flex flex-col gap-1 text-xs">
                  <div className="flex gap-2">
                    <dt className="text-aco shrink-0">Autor:</dt>
                    <dd className="break-words">{foto.autor ?? "Não informado"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-aco shrink-0">Licença:</dt>
                    <dd>
                      {foto.licencaUrl ? (
                        <a
                          href={foto.licencaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-fight-claro underline"
                        >
                          {foto.licenca}
                        </a>
                      ) : (
                        (foto.licenca ?? "Não informada")
                      )}
                    </dd>
                  </div>
                </dl>

                {foto.origem && (
                  <a
                    href={foto.origem}
                    target="_blank"
                    rel="noreferrer"
                    className="text-aco hover:text-gelo mt-2 inline-block text-[11px] underline"
                  >
                    Ver arquivo original
                  </a>
                )}
              </div>
            </Painel>
          </li>
        ))}
      </ul>
    </main>
  );
}
