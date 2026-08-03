"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useMovimentoReduzido } from "@/lib/motion";

/**
 * A marca desenhada por uma grade de caracteres que se trocam, com física por
 * caractere. Inspirado no revelatio.studio.
 *
 * A forma vem de uma IMAGEM: o asset é desenhado num canvas do tamanho da grade
 * (1px = 1 célula) e cada célula "acesa" recebe um caractere. Daí em diante cada
 * caractere tem origem, posição atual e velocidade.
 *
 * Comportamentos: sorteio de glifos, repulsão ao redor do ponteiro, e clique que
 * alterna entre formado e bagunçado.
 *
 * Quatro decisões que fazem isso funcionar — cada uma custou uma volta:
 *
 *  1. **Célula não quadrada.** Um glifo monoespaçado é mais alto que largo; em
 *     grade quadrada os caracteres se tocam na vertical e sobra vão na horizontal,
 *     e os traços da forma viram pontos soltos. `cellW` acompanha o avanço medido
 *     do glifo, e o `drawImage` da máscara já recebe destino em células (largura em
 *     `cellW`, altura em `cellH`), então a proporção sai correta sem truque.
 *
 *  2. **O teste de célula acesa combina alpha E luminância.** Os assets da marca
 *     são construídos de formas opostas: o wordmark é glifo claro sobre fundo
 *     transparente, o ícone é branco sobre PRETO OPACO. Testar só alpha acenderia
 *     todas as células do ícone e a banda viraria um retângulo maciço.
 *
 *  3. **Recorte pela caixa de tinta.** `icon.png` tem margem preta enorme (o D
 *     ocupa ~35% do quadro). Sem recortar, o D sairia minúsculo. Com o recorte, a
 *     margem interna de cada asset deixa de importar.
 *
 *  4. **Atlas de glifos + `drawImage`.** `fillText` por caractere não sustentaria a
 *     grade fina que a legibilidade pede.
 */

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&1";
const COR_GLIFO = "#d3dddb"; // limestone (@theme em globals.css)
/** Resolução da varredura que acha a caixa de tinta. */
const LADO_VARREDURA = 240;

export interface FonteDaMarca {
  src: string;
  /** Fração da largura da banda que a forma ocupa. */
  preenchimento: number;
  /**
   * Só a reserva de altura ANTES da imagem carregar, para não haver salto de
   * layout. O valor real é derivado da caixa de tinta depois do load.
   */
  aspectoAprox: number;
  /**
   * Granularidade específica deste asset, se ele precisar. O peso do traço muda
   * o quanto a grade precisa ser fina: uma forma cheia (o símbolo) fecha bem com
   * poucas linhas, um wordmark de traço fino em caixa baixa pede mais, senão os
   * hastes viram pontos soltos. Sem valor, usa `linhasAlvo` do componente.
   */
  linhasAlvo?: number;
}

export interface MarcaCaracteresProps {
  /** Asset usado a partir de `larguraMinima` (o wordmark). */
  fonteLarga?: FonteDaMarca;
  /** Asset usado abaixo de `larguraMinima` (o símbolo). */
  fonteEstreita?: FonteDaMarca;
  /** Nome acessível e fallback em texto se a imagem falhar. */
  rotulo?: string;
  /** Largura onde troca do símbolo para o wordmark. */
  larguraMinima?: number;
  /** Quantas linhas de caractere a forma deve ter (granularidade). */
  linhasAlvo?: number;
  /** Raio de influência do ponteiro, em px. */
  raio?: number;
  /** Força da repulsão. */
  forca?: number;
  /** Opacidade dos caracteres em repouso. */
  brilhoBase?: number;
  /** Teto do devicePixelRatio. Abaixo de 768px o teto cai para 1. */
  maxDpr?: number;
}

type Caractere = {
  hx: number; // origem
  hy: number;
  x: number; // posição atual
  y: number;
  vx: number;
  vy: number;
  tx: number; // alvo da mola
  ty: number;
  ci: number; // índice no CHARSET (= tile no atlas)
};

type CaixaDeTinta = { sx: number; sy: number; sw: number; sh: number; aspecto: number };

const sorteiaIndice = () => Math.floor(Math.random() * CHARSET.length);

/**
 * Célula acesa = opaca E clara. Ver decisão 2 no topo: é o que faz o mesmo código
 * servir ao wordmark (fundo transparente) e ao ícone (fundo preto opaco).
 */
const acesa = (d: Uint8ClampedArray, i: number) =>
  d[i + 3] > 128 &&
  0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2] > 128;

export default function MarcaCaracteres({
  fonteLarga = {
    src: "/brand/Logo_Dominyum.png",
    preenchimento: 0.92,
    aspectoAprox: 6.1,
  },
  // `/brand/simbolo.png` e nao `/icon.png`: o favicon saiu de `src/app/` para o
  // `icon.svg`, e favicon e máscara de canvas querem coisas diferentes (16px
  // nítido vs. resolução para varrer). Manter um servindo aos dois amarrava as
  // duas decisões. A caixa de tinta continua a mesma — só o branco conta como
  // acesa, então o quadrado carbon não entra na medida.
  fonteEstreita = {
    src: "/brand/simbolo.png",
    preenchimento: 0.55,
    aspectoAprox: 1.5,
  },
  rotulo = "Dominyum",
  larguraMinima = 768,
  linhasAlvo = 22,
  raio = 130,
  forca = 30,
  brilhoBase = 0.5,
  maxDpr = 1.5,
}: MarcaCaracteresProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheImagens = useRef(new Map<string, HTMLImageElement>());

  const [estreita, setEstreita] = useState(false);
  const [aspectoBanda, setAspectoBanda] = useState<number | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [jaClicou, setJaClicou] = useState(false);

  const reduzido = useMovimentoReduzido();

  const fonte = estreita ? fonteEstreita : fonteLarga;

  // Qual asset usar, pela largura medida. A largura não depende do aspecto da
  // banda (o wrapper é w-full), então não há circularidade com o aspectoBanda.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const avaliar = () => setEstreita((wrap.clientWidth || 0) < larguraMinima);
    avaliar();
    const ro = new ResizeObserver(avaliar);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [larguraMinima]);

  useEffect(() => {
    if (falhou) return;

    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // sem contexto 2D sobra o sr-only; nada quebra

    let chars: Caractere[] = [];
    let cellH = 12;
    let cellW = 9;
    let altura = 1; // vem do CSS (aspect-ratio), lido no redimensionar
    let dpr = 1;
    let tileW = 1;
    let tileH = 1;
    let atlas: HTMLCanvasElement | null = null;
    let imagem: HTMLImageElement | null = null;
    let tinta: CaixaDeTinta | null = null;
    let visivel = true;
    let bagunçado = false;
    let descartado = false;
    const ponteiro = { x: -9999, y: -9999, ativo: false };

    // O campo só liga onde existe ponteiro de verdade — critério do Contato
    const mqPonteiro = window.matchMedia("(hover: hover) and (pointer: fine)");

    const fonteGlifos = (tam: number) =>
      `${tam}px ui-monospace, SFMono-Regular, Menlo, monospace`;

    const carregar = async (src: string) => {
      const cache = cacheImagens.current;
      const pronta = cache.get(src);
      if (pronta) return pronta;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      await img.decode();
      cache.set(src, img);
      return img;
    };

    /** Varre a imagem e devolve o retângulo que contém tinta de verdade. */
    const caixaDeTinta = (img: HTMLImageElement): CaixaDeTinta | null => {
      const escala = Math.min(
        LADO_VARREDURA / img.naturalWidth,
        LADO_VARREDURA / img.naturalHeight,
        1
      );
      const w = Math.max(1, Math.round(img.naturalWidth * escala));
      const h = Math.max(1, Math.round(img.naturalHeight * escala));

      const t = document.createElement("canvas");
      t.width = w;
      t.height = h;
      const tctx = t.getContext("2d");
      if (!tctx) return null;
      tctx.drawImage(img, 0, 0, w, h);
      const d = tctx.getImageData(0, 0, w, h).data;

      let x0 = w;
      let y0 = h;
      let x1 = -1;
      let y1 = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (acesa(d, (y * w + x) * 4)) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      }
      if (x1 < 0) return null; // imagem sem tinta clara: nada a desenhar

      // volta para coordenadas da imagem original, com 1px de folga
      const sx = Math.max(0, (x0 - 1) / escala);
      const sy = Math.max(0, (y0 - 1) / escala);
      const sw = Math.min(img.naturalWidth - sx, (x1 - x0 + 3) / escala);
      const sh = Math.min(img.naturalHeight - sy, (y1 - y0 + 3) / escala);
      return { sx, sy, sw, sh, aspecto: sw / sh };
    };

    /** Um tile por glifo do CHARSET, para o render usar drawImage. */
    const montarAtlas = (tamFonte: number) => {
      tileW = Math.max(1, Math.ceil(cellW * dpr));
      tileH = Math.max(1, Math.ceil(cellH * dpr));

      const a = document.createElement("canvas");
      a.width = tileW * CHARSET.length;
      a.height = tileH;
      const actx = a.getContext("2d");
      if (!actx) return;

      actx.font = fonteGlifos(tamFonte * dpr);
      actx.textAlign = "center";
      actx.textBaseline = "middle";
      actx.fillStyle = COR_GLIFO;
      for (let i = 0; i < CHARSET.length; i++) {
        actx.fillText(CHARSET[i], i * tileW + tileW / 2, tileH / 2);
      }
      atlas = a;
    };

    /** Amostra a imagem num canvas do tamanho da grade e monta os caracteres. */
    const montarGrade = () => {
      if (!imagem || !tinta) return;
      const largura = wrap.clientWidth || 1;

      // A granularidade é expressa em LINHAS DA FORMA, não num divisor de largura:
      // assim wordmark e símbolo — que têm alturas de forma bem diferentes para a
      // mesma largura — saem com a mesma fidelidade.
      const larguraForma = largura * fonte.preenchimento;
      const alturaForma = larguraForma / tinta.aspecto;
      cellH = Math.min(
        18,
        Math.max(6, alturaForma / (fonte.linhasAlvo ?? linhasAlvo))
      );

      // O corpo do glifo é maior que a célula para a TINTA preencher a altura
      // (uma maiúscula ocupa ~72% do corpo). cellW acompanha o avanço real medido
      // nesse corpo, para não sobrar vão na horizontal.
      ctx.font = fonteGlifos(100);
      const m = ctx.measureText("M");
      const razaoTinta =
        m.actualBoundingBoxAscent && m.actualBoundingBoxDescent
          ? (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100
          : 0.72;
      const tamFonte = cellH / Math.max(0.5, razaoTinta);

      ctx.font = fonteGlifos(tamFonte);
      const avanco = ctx.measureText("M").width || tamFonte * 0.6;
      const proporcao = Math.min(1, Math.max(0.4, avanco / cellH));
      cellW = cellH * proporcao;

      const cols = Math.max(8, Math.floor(largura / cellW));
      const rows = Math.max(4, Math.floor(altura / cellH));

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = "high";

      // O destino já está em CÉLULAS (largura medida em cellW, altura em cellH),
      // então a célula não quadrada é absorvida aqui e a forma sai na proporção
      // correta sem precisar esticar nada.
      const colsForma = Math.max(1, Math.round(larguraForma / cellW));
      const rowsForma = Math.max(1, Math.round(alturaForma / cellH));
      const dx = Math.round((cols - colsForma) / 2);
      const dy = Math.round((rows - rowsForma) / 2);
      octx.drawImage(
        imagem,
        tinta.sx,
        tinta.sy,
        tinta.sw,
        tinta.sh,
        dx,
        dy,
        colsForma,
        rowsForma
      );

      const dados = octx.getImageData(0, 0, cols, rows).data;
      const novos: Caractere[] = [];
      const offsetX = (largura - cols * cellW) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (acesa(dados, (r * cols + c) * 4)) {
            const hx = offsetX + c * cellW + cellW / 2;
            const hy = r * cellH + cellH / 2;
            novos.push({
              hx,
              hy,
              x: hx,
              y: hy,
              vx: 0,
              vy: 0,
              tx: hx,
              ty: hy,
              ci: sorteiaIndice(),
            });
          }
        }
      }
      chars = novos;
      montarAtlas(tamFonte);

      wrap.dataset.fonte = fonte.src;
      wrap.dataset.cols = String(cols);
      wrap.dataset.rows = String(rows);
      wrap.dataset.linhasForma = String(rowsForma);
      wrap.dataset.chars = String(novos.length);
      wrap.dataset.aspectoTinta = tinta.aspecto.toFixed(3);
    };

    const redimensionar = () => {
      const largura = wrap.clientWidth || 1;
      altura = wrap.clientHeight || Math.round(largura / fonte.aspectoAprox);
      const teto = window.innerWidth < 768 ? 1 : maxDpr;
      dpr = Math.min(teto, window.devicePixelRatio || 1);

      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      montarGrade();
    };

    const desenhar = () => {
      if (!atlas) return;
      // Trabalha em pixels de dispositivo: evita escalar duas vezes
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const meioW = tileW / 2;
      const meioH = tileH / 2;

      for (const p of chars) {
        // Perto do ponteiro o caractere clareia — dá contorno visível ao campo
        let brilho = brilhoBase;
        if (ponteiro.ativo) {
          const d = Math.hypot(p.x - ponteiro.x, p.y - ponteiro.y);
          if (d < raio) brilho = brilhoBase + (1 - d / raio) * (1 - brilhoBase);
        }
        ctx.globalAlpha = brilho;
        ctx.drawImage(
          atlas,
          p.ci * tileW,
          0,
          tileW,
          tileH,
          p.x * dpr - meioW,
          p.y * dpr - meioH,
          tileW,
          tileH
        );
      }
      ctx.globalAlpha = 1;
    };

    let acumuladoSorteio = 0;

    const passo = (_t: number, dt: number) => {
      if (!visivel || descartado) return;

      const passoSeg = Math.min(dt, 50) / 1000;

      // (1) Sorteio de uma FRAÇÃO das células. Trocar todas a cada frame viraria
      // chuvisco e destruiria a leitura da forma: o ruído tem de ser uma camada
      // sobre algo estável.
      acumuladoSorteio += dt;
      if (acumuladoSorteio > 80) {
        acumuladoSorteio = 0;
        const quantas = Math.ceil(chars.length * 0.06);
        for (let i = 0; i < quantas; i++) {
          const p = chars[Math.floor(Math.random() * chars.length)];
          if (p) p.ci = sorteiaIndice();
        }
      }

      // (2) Mola para o alvo + amortecimento + repulsão do ponteiro
      const rigidez = bagunçado ? 26 : 52;
      const amortecimento = bagunçado ? 7 : 9;

      for (const p of chars) {
        let ax = (p.tx - p.x) * rigidez;
        let ay = (p.ty - p.y) * rigidez;

        if (ponteiro.ativo && !bagunçado) {
          const dx = p.x - ponteiro.x;
          const dy = p.y - ponteiro.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          if (d < raio) {
            const queda = 1 - d / raio;
            const f = queda * queda * forca * rigidez;
            ax += (dx / d) * f;
            ay += (dy / d) * f;
          }
        }

        p.vx = (p.vx + ax * passoSeg) * (1 - amortecimento * passoSeg);
        p.vy = (p.vy + ay * passoSeg) * (1 - amortecimento * passoSeg);
        p.x += p.vx * passoSeg;
        p.y += p.vy * passoSeg;
      }

      desenhar();
    };

    // ---- montagem ----------------------------------------------------------

    const iniciar = async () => {
      try {
        imagem = await carregar(fonte.src);
      } catch {
        setFalhou(true); // 404, rede, formato: cai no wordmark em texto
        return;
      }
      if (descartado) return;

      tinta = caixaDeTinta(imagem);
      if (!tinta) {
        setFalhou(true);
        return;
      }

      // A proporção da banda vem da caixa de tinta, não das dimensões do arquivo:
      // a margem interna do asset deixa de influenciar o enquadramento.
      setAspectoBanda(tinta.aspecto / fonte.preenchimento);

      redimensionar();

      if (reduzido) {
        desenhar(); // um frame estático: sem sorteio, sem física, sem ponteiro
        return;
      }
      gsap.ticker.add(passo);
    };

    void iniciar();

    const ro = new ResizeObserver(() => {
      if (!imagem || !tinta) return;
      redimensionar();
      if (reduzido) desenhar();
    });
    ro.observe(wrap);

    // Suspende fora da viewport por FLAG — remover o listener de dentro do
    // dispatch do ticker faria o GSAP pular o listener seguinte (o do Lenis).
    const io = new IntersectionObserver((entradas) => {
      visivel = entradas.some((e) => e.isIntersecting);
    });
    io.observe(wrap);

    const onMove = (e: PointerEvent) => {
      if (!mqPonteiro.matches) return;
      const r = canvas.getBoundingClientRect();
      ponteiro.x = e.clientX - r.left;
      ponteiro.y = e.clientY - r.top;
      ponteiro.ativo = true;
    };
    const onLeave = () => {
      ponteiro.ativo = false;
      ponteiro.x = -9999;
      ponteiro.y = -9999;
    };
    const onClick = () => {
      bagunçado = !bagunçado;
      const largura = canvas.width / dpr;
      for (const p of chars) {
        if (bagunçado) {
          p.tx = Math.random() * largura;
          p.ty = Math.random() * altura;
          p.vx += (Math.random() - 0.5) * 400; // saída não uniforme
          p.vy += (Math.random() - 0.5) * 400;
        } else {
          p.tx = p.hx;
          p.ty = p.hy;
        }
      }
      setJaClicou(true); // esconde a dica
    };

    if (!reduzido) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("click", onClick);
    }

    return () => {
      descartado = true;
      gsap.ticker.remove(passo);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, [
    fonte.src,
    fonte.preenchimento,
    fonte.aspectoAprox,
    fonte.linhasAlvo,
    linhasAlvo,
    raio,
    forca,
    brilhoBase,
    maxDpr,
    reduzido,
    falhou,
  ]);

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative w-full"
        style={
          falhou
            ? undefined
            : { aspectRatio: `${aspectoBanda ?? fonte.aspectoAprox} / 1` }
        }
      >
        {falhou ? (
          // A imagem da marca não carregou: melhor o wordmark em texto que uma
          // banda vazia.
          <span className="block py-6 text-center font-display text-4xl font-semibold text-limestone/80">
            {rotulo}
          </span>
        ) : (
          <>
            {/* O canvas é decoração: o nome de verdade vive no sr-only.
                Sem role="button" — o clique é easter egg, não função essencial. */}
            <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
            <span className="sr-only">{rotulo}</span>
          </>
        )}
      </div>

      {/* A dica mora junto da interação que ela descreve: sem imagem ou sob
          reduced motion não há o que clicar, então ela não aparece. */}
      {!falhou && !reduzido && (
        <p
          className={`mt-2 text-center font-sans text-xs uppercase tracking-[0.2em] text-limestone/30 transition-opacity duration-500 ${
            jaClicou ? "opacity-0" : "opacity-100"
          }`}
        >
          Clique para bagunçar
        </p>
      )}
    </div>
  );
}
