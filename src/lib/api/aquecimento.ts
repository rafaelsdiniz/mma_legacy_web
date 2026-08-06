import { api } from "./cliente";

/**
 * Acorda a API antes de o jogador precisar dela.
 *
 * No tier gratuito do Cloud Run a aplicação escala a zero: quando ninguém joga
 * há alguns minutos, o contêiner é desligado e a próxima requisição espera o
 * cold start. Chamado quando o jogador abre a ficha de inscrição, este ping dá
 * à API os segundos que ele gasta digitando nome e apelido — e quando ele
 * clica em "Iniciar draft", ela já está de pé.
 *
 * A alternativa comum, um cron batendo na API de minuto em minuto para
 * mantê-la quente, é pior por dois motivos: queima a cota gratuita e a maioria
 * dos termos de uso proíbe.
 *
 * Falha em silêncio de propósito. Se a API estiver fora, quem tem que mostrar
 * o erro é a ação real do jogador, não um aquecimento que ele nem sabe que
 * existe.
 */
export function aquecerApi() {
  void api.saude().catch(() => {});
}
