import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import frasco from "@/assets/homem-forte-frasco.jpg";
import heroVideo from "@/assets/hero-video.mp4.asset.json";
import prodHero from "@/assets/prod-frasco-hero.jpg";
import medico from "@/assets/homem-forte-medico.jpg";
import ingrGinseng from "@/assets/ingr-ginseng.jpg";
import ingrBeterraba from "@/assets/ingr-beterraba.jpg";
import ingrMaca from "@/assets/ingr-maca.jpg";
import { Reveal } from "@/components/Reveal";
import { usePastHero } from "@/hooks/use-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRECO_UNITARIO = 10000;
const WHATSAPP = "244937876711";

const kz = (valor: number) => `${valor.toLocaleString("pt-AO").replace(/,/g, ".")} Kz`;

const hojeISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

export const Route = createFileRoute("/")({
  component: HomemForte,
  head: () => ({
    meta: [
      { title: "HOMEM FORTE 500 ml | Entrega hoje em Angola" },
      {
        name: "description",
        content:
          "HOMEM FORTE — 500 ml, 10.000 Kz. Em Luanda paga na entrega. Peça agora pelo WhatsApp e receba hoje.",
      },
      { property: "og:title", content: "HOMEM FORTE 500 ml | Entrega hoje" },
      {
        property: "og:description",
        content:
          "Fórmula de 500 ml com ginseng, beterraba, gengibre e maca peruana. 10.000 Kz, entrega hoje em Luanda.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

/* ------------------------------------------------------------------ */
/* Navegação                                                           */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#inicio", label: "Início" },
  { href: "#produto", label: "Produto" },
  { href: "#ingredientes", label: "Ingredientes" },
  { href: "#utilizar", label: "Como utilizar" },
  { href: "#faq", label: "FAQ" },
];

function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:px-8">
        <a href="#inicio" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center border border-gold/50 font-display text-sm tracking-widest text-gold">
            HF
          </span>
          <span className="truncate font-display text-lg tracking-[0.22em] text-foreground">
            HOMEM FORTE
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#pedido"
            className="btn-green px-5 py-2 text-xs font-bold tracking-[0.18em]"
          >
            FAZER PEDIDO
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label="Abrir menu"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 border border-border md:hidden"
        >
          <span
            className={`h-px w-5 bg-foreground transition-transform ${aberto ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 bg-foreground transition-transform ${aberto ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {aberto && (
        <nav
          id="menu-mobile"
          aria-label="Menu mobile"
          className="border-t border-border bg-surface px-5 py-4 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setAberto(false)}
                  className="block border-b border-border/60 py-3 text-sm tracking-wide text-muted-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#pedido"
                onClick={() => setAberto(false)}
                className="btn-green mt-4 block px-5 py-3 text-center text-xs font-bold tracking-[0.18em]"
              >
                FAZER PEDIDO
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Formulário de pedido → WhatsApp                                      */
/* ------------------------------------------------------------------ */

type Erros = Partial<Record<"nome" | "telefone" | "endereco" | "dia", string>>;

function mascaraTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, "").slice(0, 9);
  return digitos.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_m, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
}

function FormularioPedido() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [zona, setZona] = useState<"luanda" | "provincia">("luanda");
  const [dia, setDia] = useState(hojeISO());
  const [periodo, setPeriodo] = useState("Hoje — o mais cedo possível");
  const [quantidade, setQuantidade] = useState(1);
  const [erros, setErros] = useState<Erros>({});

  const total = useMemo(() => PRECO_UNITARIO * quantidade, [quantidade]);

  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().length < 3) e.nome = "Indique o seu nome.";
    if (telefone.replace(/\D/g, "").length !== 9)
      e.telefone = "Telefone com 9 dígitos.";
    if (endereco.trim().length < 4) e.endereco = "Indique onde entregar.";
    if (!dia) e.dia = "Escolha o dia.";
    return e;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    const msg = [
      "*NOVO PEDIDO — HOMEM FORTE 500 ml*",
      `Nome: ${nome}`,
      `Telefone: ${telefone}`,
      `Local: ${zona === "luanda" ? "Luanda" : "Fora de Luanda (província)"}`,
      `Endereço: ${endereco}`,
      `Entrega: ${dia} · ${periodo}`,
      `Quantidade: ${quantidade}`,
      `Total: ${kz(total)}`,
      zona === "luanda"
        ? "Pagamento: na entrega"
        : "Pagamento: antecipado (envio imediato após confirmação)",
    ].join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const campo =
    "w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-green focus:outline-none";
  const rotulo = "mb-2 block text-xs font-semibold tracking-[0.16em] text-muted-foreground";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-border bg-surface p-6 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="nome" className={rotulo}>
            NOME
          </label>
          <input
            id="nome"
            name="nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-invalid={!!erros.nome}
            className={campo}
            placeholder="O seu nome"
          />
          {erros.nome && <p className="mt-2 text-xs text-destructive">{erros.nome}</p>}
        </div>

        <div>
          <label htmlFor="telefone" className={rotulo}>
            TELEFONE (WHATSAPP)
          </label>
          <input
            id="telefone"
            name="telefone"
            inputMode="tel"
            autoComplete="tel"
            value={telefone}
            onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
            aria-invalid={!!erros.telefone}
            className={campo}
            placeholder="923 000 000"
          />
          {erros.telefone && <p className="mt-2 text-xs text-destructive">{erros.telefone}</p>}
        </div>

        <div>
          <label htmlFor="quantidade" className={rotulo}>
            QUANTIDADE
          </label>
          <div className="flex items-center border border-input bg-background">
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="px-4 py-3 text-lg text-muted-foreground transition-colors hover:text-green"
            >
              −
            </button>
            <input
              id="quantidade"
              name="quantidade"
              type="number"
              min={1}
              max={99}
              value={quantidade}
              onChange={(e) =>
                setQuantidade(Math.min(99, Math.max(1, Number(e.target.value) || 1)))
              }
              className="w-full bg-transparent py-3 text-center text-sm text-foreground focus:outline-none"
            />
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
              className="px-4 py-3 text-lg text-muted-foreground transition-colors hover:text-green"
            >
              +
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <span className={rotulo}>ONDE ESTÁ?</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["luanda", "Luanda — pago na entrega"],
                ["provincia", "Fora de Luanda — pago antes"],
              ] as const
            ).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setZona(valor)}
                aria-pressed={zona === valor}
                className={`border px-4 py-3 text-left text-sm transition-colors ${
                  zona === valor
                    ? "border-green bg-green/10 text-foreground"
                    : "border-input text-muted-foreground hover:border-green/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="endereco" className={rotulo}>
            ENDEREÇO DE ENTREGA
          </label>
          <textarea
            id="endereco"
            name="endereco"
            rows={2}
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            aria-invalid={!!erros.endereco}
            className={campo}
            placeholder="Bairro, rua, referência"
          />
          {erros.endereco && <p className="mt-2 text-xs text-destructive">{erros.endereco}</p>}
        </div>

        <div>
          <label htmlFor="dia" className={rotulo}>
            DIA DA ENTREGA (HOJE)
          </label>
          <input
            id="dia"
            name="dia"
            type="date"
            value={dia}
            min={hojeISO()}
            onChange={(e) => setDia(e.target.value)}
            aria-invalid={!!erros.dia}
            className={campo}
          />
          {erros.dia && <p className="mt-2 text-xs text-destructive">{erros.dia}</p>}
        </div>

        <div>
          <label htmlFor="periodo" className={rotulo}>
            PERÍODO
          </label>
          <select
            id="periodo"
            name="periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className={campo}
          >
            <option>Hoje — o mais cedo possível</option>
            <option>Hoje — manhã</option>
            <option>Hoje — tarde</option>
            <option>Hoje — noite</option>
          </select>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Produto</dt>
            <dd className="font-display tracking-widest">HOMEM FORTE 500 ML</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Preço unitário</dt>
            <dd>{kz(PRECO_UNITARIO)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">TOTAL</dt>
            <dd className="font-display text-3xl text-gold">{kz(total)}</dd>
          </div>
        </dl>
      </div>

      <button type="submit" className="btn-green mt-8 w-full py-4 font-display text-sm tracking-[0.2em]">
        SOLICITAR PEDIDO NO WHATSAPP
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {zona === "luanda"
          ? "Em Luanda paga apenas quando receber."
          : "Fora de Luanda o pagamento é feito antes e enviamos imediatamente."}
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

const ingredientes = [
  {
    nome: "GINSENG",
    img: ingrGinseng,
    texto: "Raiz tradicionalmente associada à energia e à disposição no dia a dia.",
  },
  {
    nome: "BETERRABA + GENGIBRE",
    img: ingrBeterraba,
    texto: "Combinação presente na fórmula, ligada à circulação e ao vigor.",
  },
  {
    nome: "MACA PERUANA + BATATA AFRICANA",
    img: ingrMaca,
    texto: "Raízes reconhecidas na tradição masculina pela vitalidade.",
  },
];

function HomemForte() {
  const mostrarCtaFixo = usePastHero();

  const ficha = [
    ["Produto", "HOMEM FORTE"],
    ["Volume", "500 ml"],
    ["Origem", "Angola"],
    ["Público informado", "Homens com 18 anos ou mais"],
    ["Preço", "10.000 Kz"],
    ["Pagamento", "Luanda: na entrega · Província: antes do envio"],
    ["Utilização", "2 tampas pela manhã + 2 tampas à noite"],
    ["Conservação", "Refrigerado / geleira na maior parte do tempo"],
  ];

  const faq = [
    ["Quanto custa o HOMEM FORTE?", "10.000 Kz o frasco de 500 ml."],
    [
      "Como faço o pedido?",
      "Preenche o formulário e o pedido entra directamente no nosso WhatsApp. Confirmamos e organizamos a entrega de hoje.",
    ],
    [
      "Como funciona o pagamento?",
      "Em Luanda paga somente na entrega. Fora de Luanda o pagamento é feito antes e enviamos imediatamente.",
    ],
    [
      "Consigo receber hoje?",
      "Sim. Em Luanda a entrega é feita hoje mesmo, dentro do stock disponível do dia.",
    ],
    ["Como é utilizado?", "2 tampas pela manhã e 2 tampas à noite."],
    ["Como conservar?", "Manter refrigerado, na geleira, na maior parte do tempo."],
    [
      "Para quem é indicado?",
      "A informação fornecida pela empresa indica homens com 18 anos ou mais.",
    ],
  ];

  const whatsappDireto = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    "Olá! Quero encomendar o HOMEM FORTE 500 ml para hoje.",
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* SEÇÃO 1 — HERO EM VÍDEO */}
        <section id="inicio" className="relative min-h-[92vh] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={heroVideo.url}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

          <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-16 pt-32 md:px-8 md:pb-24">
            <span className="inline-flex w-fit items-center gap-2 border border-green/60 bg-green/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-[0.25em] text-green">
              ÚLTIMOS FRASCOS DISPONÍVEIS HOJE
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              O SILÊNCIO NO QUARTO <span className="text-gold-gradient">TEM SOLUÇÃO.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/85 sm:text-lg">
              HOMEM FORTE — 500 ml de fórmula natural angolana com ginseng, beterraba, gengibre e
              maca peruana. Peça agora e receba <strong className="text-foreground">hoje</strong>.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#pedido"
                className="btn-green px-8 py-4 text-center font-display text-sm tracking-[0.2em]"
              >
                QUERO O MEU HOJE — 10.000 Kz
              </a>
              <a
                href={whatsappDireto}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border/80 bg-background/60 px-8 py-4 text-center font-display text-sm tracking-[0.2em] text-foreground backdrop-blur transition-colors hover:border-green hover:text-green"
              >
                FALAR NO WHATSAPP
              </a>
            </div>

            <p className="mt-5 text-xs tracking-[0.18em] text-muted-foreground">
              LUANDA: PAGA NA ENTREGA · FORA DE LUANDA: ENVIO IMEDIATO
            </p>
          </div>
        </section>

        {/* SEÇÃO 2 — HISTÓRIA / GATILHO */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <img
                src={medico}
                alt="Profissional responsável pela orientação do HOMEM FORTE"
                loading="lazy"
                width={1149}
                height={1369}
                className="w-full border border-border object-cover shadow-[var(--shadow-premium)]"
              />
            </Reveal>
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                O PROBLEMA NÃO É VOCÊ. É <span className="text-gold">FALTA DE COMBUSTÍVEL.</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Cansaço, stress, noites mal dormidas e alimentação corrida tiram a energia do homem.
                O corpo continua ali — só precisa do que perdeu.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                O HOMEM FORTE nasceu em Angola para isso: uma fórmula de 500 ml, tomada de manhã e à
                noite, que devolve disposição, firmeza e confiança. Milhares de homens já não saem
                de casa sem o frasco na geleira.
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {[
                  "Energia e disposição do primeiro ao último dia do frasco",
                  "Fórmula natural, sem complicação",
                  "Discrição total na entrega",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green">✓</span>
                    <span className="text-foreground/90">{i}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#pedido"
                className="btn-green mt-9 inline-block px-8 py-4 font-display text-sm tracking-[0.2em]"
              >
                FAZER PEDIDO AGORA
              </a>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 3 — PRODUTO */}
        <section id="produto" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="max-w-3xl font-display text-3xl tracking-tight sm:text-4xl">
                500 ML DE <span className="text-gold">FORÇA, POTÊNCIA E VITALIDADE.</span>
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
              <Reveal>
                <img
                  src={frasco}
                  alt="Frasco original do suplemento HOMEM FORTE de 500 ml"
                  loading="lazy"
                  width={828}
                  height={1153}
                  className="w-full border border-border object-cover shadow-[var(--shadow-premium)]"
                />
              </Reveal>
              <Reveal>
                <dl className="divide-y divide-border border-y border-border">
                  {ficha.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                      <dt className="text-sm text-muted-foreground">{k}</dt>
                      <dd className="text-right text-sm font-medium text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SEÇÃO 4 — INGREDIENTES */}
        <section id="ingredientes" className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                O QUE ESTÁ DENTRO DO FRASCO
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {ingredientes.map((ing) => (
                <Reveal key={ing.nome}>
                  <article className="h-full overflow-hidden border border-border bg-background transition-transform duration-300 hover:-translate-y-1 hover:border-green/50">
                    <img
                      src={ing.img}
                      alt={`Ingrediente da fórmula: ${ing.nome.toLowerCase()}`}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="h-56 w-full object-cover"
                    />
                    <div className="p-7">
                      <h3 className="font-display text-xl leading-snug tracking-wide text-foreground">
                        {ing.nome}
                      </h3>
                      <div className="hairline mt-4 w-16" />
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {ing.texto}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SEÇÃO 5 — COMO UTILIZAR */}
        <section id="utilizar" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">COMO UTILIZAR</h2>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {[
                { titulo: "MANHÃ", valor: "2 tampas" },
                { titulo: "NOITE", valor: "2 tampas" },
              ].map((m) => (
                <Reveal key={m.titulo}>
                  <div className="border border-border bg-surface p-10 text-center">
                    <p className="font-display text-xs tracking-[0.3em] text-gold">{m.titulo}</p>
                    <p className="mt-4 font-display text-4xl tracking-tight">{m.valor}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Conservar refrigerado, mantendo na geleira na maior parte do tempo.
              </p>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 6 — OFERTA / ESCASSEZ */}
        <section className="relative overflow-hidden border-t border-border bg-surface/40">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
            <Reveal>
              <span className="inline-block border border-green/60 bg-green/10 px-4 py-1.5 text-[0.7rem] font-bold tracking-[0.25em] text-green">
                STOCK LIMITADO PARA AS ENTREGAS DE HOJE
              </span>
              <h2 className="mt-8 font-display text-4xl tracking-tight sm:text-5xl">HOMEM FORTE</h2>
              <p className="mt-3 text-sm tracking-[0.3em] text-muted-foreground">500 ML</p>
              <p className="mt-8 font-display text-6xl tracking-tight text-gold sm:text-7xl">
                10.000 Kz
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Em Luanda paga somente no momento da entrega.
              </p>
              <a
                href="#pedido"
                className="btn-green mt-10 inline-block px-12 py-4 font-display text-sm tracking-[0.2em]"
              >
                QUERO RECEBER HOJE
              </a>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 7 — PEDIDO */}
        <section id="pedido" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                FAZER O PEDIDO EM 30 SEGUNDOS
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Entrega já marcada para hoje — pode ajustar se preferir. Ao enviar, o pedido abre
                directamente no nosso WhatsApp.
              </p>
            </Reveal>
            <div className="mt-10">
              <FormularioPedido />
            </div>
          </div>
        </section>

        {/* SEÇÃO 8 — PAGAMENTO */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto grid max-w-4xl gap-6 px-5 py-16 sm:grid-cols-2 md:py-20">
            <div className="border border-green/40 bg-green/5 p-8 text-center">
              <h2 className="font-display text-xl tracking-[0.12em] text-green">EM LUANDA</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Pagamento na entrega. Recebe o frasco, confere e paga.
              </p>
            </div>
            <div className="border border-border bg-background p-8 text-center">
              <h2 className="font-display text-xl tracking-[0.12em] text-gold">FORA DE LUANDA</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                O pagamento é feito antes e enviamos imediatamente para a sua província.
              </p>
            </div>
          </div>
        </section>

        {/* SEÇÃO 9 — FAQ */}
        <section id="faq" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                PERGUNTAS FREQUENTES
              </h2>
            </Reveal>
            <Accordion type="single" collapsible className="mt-10 w-full">
              {faq.map(([q, a], i) => (
                <AccordionItem key={q} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-display text-base tracking-wide hover:text-gold hover:no-underline">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* SEÇÃO 10 — CTA FINAL */}
        <section className="relative overflow-hidden border-t border-border">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--green)_12%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
            <Reveal>
              <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">
                HOJE PODE SER O DIA EM QUE TUDO MUDA.
              </h2>
              <p className="mt-5 text-base text-muted-foreground">
                Últimos frascos reservados para as entregas de hoje.
              </p>
              <p className="mt-8 font-display text-5xl tracking-tight text-gold">10.000 Kz</p>
              <a
                href="#pedido"
                className="btn-green mt-10 inline-block px-12 py-4 font-display text-sm tracking-[0.2em]"
              >
                QUERO O HOMEM FORTE
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-surface/60 pb-24 md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:px-8">
          <div>
            <p className="font-display text-lg tracking-[0.22em]">HOMEM FORTE</p>
            <p className="mt-2 text-sm text-muted-foreground">Produto de origem angolana.</p>
            <a
              href={whatsappDireto}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-green hover:underline"
            >
              WhatsApp: 937 876 711
            </a>
          </div>
          <nav aria-label="Rodapé" className="md:justify-self-end">
            <ul className="flex flex-wrap gap-6">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HOMEM FORTE · H.F.
        </div>
      </footer>

      {/* WhatsApp flutuante */}
      <a
        href={whatsappDireto}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="btn-green fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full md:bottom-6"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.14c-.25.69-1.45 1.32-2 1.36-.51.04-1.16.06-1.87-.12-.43-.11-.99-.29-1.7-.6-2.99-1.29-4.94-4.3-5.09-4.5-.15-.2-1.22-1.62-1.22-3.09s.77-2.19 1.04-2.49c.27-.3.59-.37.79-.37h.57c.18 0 .43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.39-.45.53-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.15.5.22.57.35.07.13.07.74-.18 1.43Z" />
        </svg>
      </a>

      {/* CTA fixo mobile */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
          mostrarCtaFixo ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a
          href="#pedido"
          className="btn-green block py-4 text-center font-display text-sm tracking-[0.15em]"
        >
          PEDIR AGORA — 10.000 Kz
        </a>
      </div>
    </div>
  );
}
