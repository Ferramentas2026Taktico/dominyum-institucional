import type { NextConfig } from "next";

/**
 * `allowedDevOrigins` é **só de desenvolvimento**: libera o dev server para atender
 * o celular pelo IP da LAN. Em produção não tem efeito nenhum.
 *
 * Duas coisas que custaram uma investigação:
 *
 * 1. **A lista tem de morar no default export.** A versão anterior declarava um
 *    `module.exports = { allowedDevOrigins: [...] }` ao lado do
 *    `export default nextConfig`. Num arquivo TS/ESM o Next lê o default — que era o
 *    objeto vazio — então a lista ficava MORTA sem avisar ninguém. Dois mecanismos de
 *    export no mesmo arquivo é justamente a classe de erro que não dá erro.
 * 2. **Curinga em vez do IP exato.** O casamento é por segmento separado por ponto
 *    (`isCsrfOriginAllowed`, no Next), então `192.168.67.*` cobre a sub-rede inteira
 *    e sobrevive ao DHCP trocar o último octeto do celular — o IP fixo quebrava na
 *    primeira reatribuição do roteador.
 *
 * O bloqueio só se aplica a recursos internos (`/_next`, `/__nextjs`), e o Next já
 * libera de graça `localhost` e o próprio hostname em que o servidor está atendendo.
 */
const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.67.*"],
};

export default nextConfig;
