"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";

import { aquecerApi } from "@/lib/api/aquecimento";

import { Botao } from "@/components/jogo/botao";
import { Etiqueta, Painel } from "@/components/jogo/painel";
import { api, ErroDaApi } from "@/lib/api/cliente";
import type { BaseDeLuta, CategoriaDePeso } from "@/lib/api/tipos";
import { BASES, CATEGORIAS } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/**
 * As mesmas regras que o back-end aplica, repetidas aqui só para o erro
 * aparecer enquanto o jogador digita. Quem manda continua sendo a API — este
 * schema não substitui a validação do servidor, apenas evita uma ida e volta.
 */
const esquema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(40, "O nome deve ter no máximo 40 caracteres."),
  apelido: z
    .string()
    .trim()
    .min(1, "Informe o apelido.")
    .max(30, "O apelido deve ter no máximo 30 caracteres."),
  nacionalidade: z.string().trim().min(2, "Informe a nacionalidade."),
  categoriaDePeso: z.string().min(1, "Escolha a categoria de peso."),
  idadeInicial: z.coerce
    .number()
    .int()
    .min(18, "A idade de estreia deve estar entre 18 e 35 anos.")
    .max(35, "A idade de estreia deve estar entre 18 e 35 anos."),
  baseDeLuta: z.string().min(1, "Escolha a base de luta."),
  nivelDeDificuldade: z.enum(["Facil", "Dificil"]),
});

type Formulario = z.input<typeof esquema>;

export function FormularioDeLutador() {
  const router = useRouter();

  // Acorda a API enquanto o jogador preenche a ficha, para o cold start do
  // tier gratuito acontecer nesses segundos e não depois do clique.
  useEffect(aquecerApi, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nome: "",
      apelido: "",
      nacionalidade: "Brasil",
      categoriaDePeso: "MeioPesado",
      idadeInicial: 22,
      baseDeLuta: "MuayThai",
      nivelDeDificuldade: "Facil",
    },
  });

  const criar = useMutation({
    mutationFn: (dados: Formulario) =>
      api.criarPartida({
        nome: dados.nome.trim(),
        apelido: dados.apelido.trim(),
        nacionalidade: dados.nacionalidade.trim(),
        categoriaDePeso: dados.categoriaDePeso as CategoriaDePeso,
        idadeInicial: Number(dados.idadeInicial),
        baseDeLuta: dados.baseDeLuta as BaseDeLuta,
        nivelDeDificuldade: dados.nivelDeDificuldade,
      }),
    onSuccess: (partida) => router.push(`/partida/${partida.id}/draft`),
  });

  const nome = watch("nome");
  const apelido = watch("apelido");
  const idade = Number(watch("idadeInicial"));
  const dificuldade = watch("nivelDeDificuldade");

  return (
    <form
      onSubmit={handleSubmit((dados) => criar.mutate(dados))}
      className="mt-8 flex flex-col gap-6"
    >
      {/* Preview do cartaz: transforma o formulário em algo que já é o jogo. */}
      <Painel destaque>
        <div className="px-5 py-6 text-center">
          <Etiqueta>Como vai aparecer no cartaz</Etiqueta>
          <p className="font-display mt-2 text-2xl leading-tight font-bold break-words uppercase sm:text-3xl">
            <MontarCartaz nome={nome} apelido={apelido} />
          </p>
        </div>
      </Painel>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Nome" erro={errors.nome?.message} className="sm:col-span-2">
          <input
            {...register("nome")}
            placeholder="Rafael Diniz"
            autoComplete="off"
            className={entrada}
          />
        </Campo>

        <Campo rotulo="Apelido" erro={errors.apelido?.message}>
          <input
            {...register("apelido")}
            placeholder="The Machine"
            autoComplete="off"
            className={entrada}
          />
        </Campo>

        <Campo rotulo="Nacionalidade" erro={errors.nacionalidade?.message}>
          <input {...register("nacionalidade")} autoComplete="off" className={entrada} />
        </Campo>

        <Campo rotulo="Categoria de peso" erro={errors.categoriaDePeso?.message}>
          <select {...register("categoriaDePeso")} className={entrada}>
            {Object.entries(CATEGORIAS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </Campo>

        <Campo rotulo="Base de luta" erro={errors.baseDeLuta?.message}>
          <select {...register("baseDeLuta")} className={entrada}>
            {Object.entries(BASES).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </Campo>

        <Campo
          rotulo={`Idade de estreia — ${idade || 22} anos`}
          erro={errors.idadeInicial?.message}
          className="sm:col-span-2"
        >
          <input
            type="range"
            min={18}
            max={35}
            step={1}
            {...register("idadeInicial")}
            className="accent-fight w-full"
          />
          <p className="text-aco-claro mt-2 text-xs">
            Estrear cedo dá mais anos de carreira para evoluir — e mais tempo para
            o corpo cobrar a conta.
          </p>
        </Campo>
      </div>

      <fieldset className="flex flex-col gap-3">
        <Etiqueta>Nível de dificuldade</Etiqueta>

        <div className="grid gap-3 sm:grid-cols-2">
          <OpcaoDeDificuldade
            valor="Facil"
            titulo="Fácil"
            resumo="Notas visíveis"
            detalhe="Você compara os números e decide com a informação toda na mesa."
            selecionado={dificuldade === "Facil"}
            registro={register("nivelDeDificuldade")}
          />
          <OpcaoDeDificuldade
            valor="Dificil"
            titulo="Difícil"
            resumo="Notas ocultas"
            detalhe="Nenhum número até o fim. Você escolhe pelo que sabe de MMA — e só descobre o que montou no final."
            selecionado={dificuldade === "Dificil"}
            registro={register("nivelDeDificuldade")}
          />
        </div>
      </fieldset>

      {criar.isError && (
        <p className="border-fight bg-fight/10 text-fight-claro border-l-2 px-4 py-3 text-sm">
          {criar.error instanceof ErroDaApi
            ? criar.error.message
            : "Não foi possível falar com o servidor. Verifique se a API está no ar."}
        </p>
      )}

      <Botao
        type="submit"
        disabled={criar.isPending}
        apoio={criar.isPending ? undefined : "8 atletas serão sorteados"}
        className="self-center"
      >
        {criar.isPending ? "Sorteando..." : "Iniciar draft"}
      </Botao>
    </form>
  );
}

const entrada =
  "recorte-angular-suave w-full border border-grafite-borda bg-grafite-claro px-4 py-2.5 text-gelo outline-none transition-colors focus:border-fight";

/**
 * Cartão de escolha do modo.
 *
 * É um radio de verdade por baixo — o input fica visualmente escondido, não
 * removido. Assim teclado e leitor de tela continuam navegando o grupo como
 * esperam, sem precisar reimplementar o comportamento na mão.
 */
function OpcaoDeDificuldade({
  valor,
  titulo,
  resumo,
  detalhe,
  selecionado,
  registro,
}: {
  valor: string;
  titulo: string;
  resumo: string;
  detalhe: string;
  selecionado: boolean;
  registro: UseFormRegisterReturn<"nivelDeDificuldade">;
}) {
  return (
    <label
      className={cn(
        "recorte-angular-suave cursor-pointer border p-4 transition-colors",
        selecionado
          ? "border-fight bg-fight/10"
          : "border-grafite-borda bg-grafite-claro hover:border-aco",
      )}
    >
      <input type="radio" value={valor} className="sr-only" {...registro} />

      <span className="flex items-baseline justify-between gap-2">
        <span className="font-display text-lg font-bold uppercase">{titulo}</span>
        <span
          className={cn(
            "font-display text-[10px] tracking-widest uppercase",
            selecionado ? "text-fight-claro" : "text-aco",
          )}
        >
          {resumo}
        </span>
      </span>

      <span className="text-aco-claro mt-1.5 block text-xs leading-relaxed">
        {detalhe}
      </span>
    </label>
  );
}

function Campo({
  rotulo,
  erro,
  children,
  className,
}: {
  rotulo: string;
  erro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <Etiqueta>{rotulo}</Etiqueta>
      {children}
      {erro && <span className="text-fight-claro text-xs">{erro}</span>}
    </label>
  );
}

/** Reproduz no cliente o formato NOME "APELIDO" SOBRENOME que a API devolve. */
function MontarCartaz({ nome, apelido }: { nome: string; apelido: string }) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const aspas = apelido.trim() ? `"${apelido.trim()}"` : "";

  if (partes.length === 0) {
    return <span className="text-aco">Seu nome aqui</span>;
  }

  if (partes.length < 2) {
    return (
      <>
        {partes[0]} <span className="text-fight-claro">{aspas}</span>
      </>
    );
  }

  return (
    <>
      {partes.slice(0, -1).join(" ")} <span className="text-fight-claro">{aspas}</span>{" "}
      {partes.at(-1)}
    </>
  );
}
