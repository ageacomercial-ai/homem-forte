import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";

import frasco from "@/assets/homem-forte-frasco.jpg";
import medico from "@/assets/homem-forte-medico.jpg.asset.json";
import { Reveal } from "@/components/Reveal";
import { usePastHero } from "@/hooks/use-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRECO_UNITARIO = 10000;

const kz = (valor: number) => `${valor.toLocaleString("pt-AO").replace(/,/g, ".")} Kz`;

export const Route = createFileRoute("/")({
  component: HomemForte,
  head: () => ({
    meta: [
      { title: "HOMEM FORTE | 500 ml" },
      {
        name: "description",
        content:
          "HOMEM FORTE — suplemento de 500 ml de origem angolana, 10.000 Kz, pagamento somente na entrega.",
      },
      { property: "og:title", content: "HOMEM FORTE | 500 ml" },
      {
        property: "og:description",
        content:
          "Fórmula de 500 ml com ingredientes como ginseng, batata africana e maca peruana. 10.000 Kz, pagamento na entrega.",
      },
      { property: "og:type", content: "product" },
      { property: "og:url", content: "/" },
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
            className="border border-gold px-5 py-2 text-xs font-semibold tracking-[0.18em] text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
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
                className="mt-4 block bg-gold px-5 py-3 text-center text-xs font-bold tracking-[0.18em] text-primary-foreground"
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
/* Formulário de pedido                                                */
/* ------------------------------------------------------------------ */

type Erros = Partial<Record<"nome" | "telefone" | "endereco" | "dia" | "hora", string>>;

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
  const [dia, setDia] = useState("");
  const [hora, setHora] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [erros, setErros] = useState<Erros>({});
  const [enviado, setEnviado] = useState(false);

  const total = useMemo(() => PRECO_UNITARIO * quantidade, [quantidade]);

  function validar(): Erros {
    const e: Erros = {};
    if (nome.trim().length < 3) e.nome = "Indique o seu nome completo.";
    if (telefone.replace(/\D/g, "").length !== 9)
      e.telefone = "Indique um telefone válido com 9 dígitos.";
    if (endereco.trim().length < 5) e.endereco = "Indique o endereço de entrega.";
    if (!dia) e.dia = "Escolha o dia da entrega.";
    if (!hora) e.hora = "Escolha a hora da entrega.";
    return e;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // Configure aqui o destino do pedido (ex.: envio para o seu endpoint ou WhatsApp).
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="border border-gold/40 bg-surface p-8 text-center md:p-12">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold text-gold">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-6 font-display text-2xl tracking-wide">Pedido recebido.</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Os dados foram enviados para organização da entrega.
        </p>
        <p className="mt-6 text-xs tracking-[0.18em] text-gold">
          TOTAL: {kz(total)} · PAGAMENTO NA ENTREGA
        </p>
      </div>
    );
  }

  const campo =
    "w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-gold focus:outline-none";
  const rotulo = "mb-2 block text-xs font-semibold tracking-[0.16em] text-muted-foreground";

  return (
    <form onSubmit={onSubmit} noValidate className="border border-border bg-surface p-6 md:p-10">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="nome" className={rotulo}>
            NOME COMPLETO
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
            TELEFONE
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
              className="px-4 py-3 text-lg text-muted-foreground transition-colors hover:text-gold"
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
              className="px-4 py-3 text-lg text-muted-foreground transition-colors hover:text-gold"
            >
              +
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="endereco" className={rotulo}>
            ENDEREÇO
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
            DIA DA ENTREGA
          </label>
          <input
            id="dia"
            name="dia"
            type="date"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            aria-invalid={!!erros.dia}
            className={campo}
          />
          {erros.dia && <p className="mt-2 text-xs text-destructive">{erros.dia}</p>}
        </div>

        <div>
          <label htmlFor="hora" className={rotulo}>
            HORA DA ENTREGA
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            aria-invalid={!!erros.hora}
            className={campo}
          />
          {erros.hora && <p className="mt-2 text-xs text-destructive">{erros.hora}</p>}
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Produto</dt>
            <dd className="font-display tracking-widest">HOMEM FORTE</dd>
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

      <button
        type="submit"
        className="mt-8 w-full bg-gold py-4 font-display text-sm tracking-[0.2em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)]"
      >
        SOLICITAR PEDIDO
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Sem pagamento antecipado.</p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

function HomemForte() {
  const mostrarCtaFixo = usePastHero();

  const valores = [
    { n: "01", titulo: "500 ML", icone: "M7 3h10v4l-2 2v10a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V9L7 7z" },
    {
      n: "02",
      titulo: "FÓRMULA COM INGREDIENTES SELECIONADOS",
      icone: "M12 3v18M5 8c4 0 7 3 7 7M19 8c-4 0-7 3-7 7",
    },
    { n: "03", titulo: "ORIGEM ANGOLA", icone: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" },
  ];

  const ficha = [
    ["Produto", "HOMEM FORTE"],
    ["Volume", "500 ml"],
    ["Origem", "Angola"],
    ["Público informado", "Homens com 18 anos ou mais"],
    ["Preço", "10.000 Kz"],
    ["Pagamento", "Somente na entrega"],
    ["Utilização", "2 tampas pela manhã + 2 tampas à noite"],
    ["Conservação", "Refrigerado / geleira na maior parte do tempo"],
  ];

  const faq = [
    ["Quanto custa o HOMEM FORTE?", "10.000 Kz."],
    ["Qual é a apresentação?", "500 ml."],
    [
      "Como é utilizado?",
      "O modo de utilização informado é de 2 tampas pela manhã e 2 tampas à noite.",
    ],
    ["Como conservar?", "Manter refrigerado, na geleira, na maior parte do tempo."],
    ["Como funciona o pagamento?", "O pagamento é feito somente no momento da entrega."],
    [
      "Para quem é indicado?",
      "A informação fornecida pela empresa indica homens com 18 anos ou mais.",
    ],
    [
      "Quando os efeitos podem ser percebidos?",
      "Segundo a informação fornecida pela empresa, os efeitos podem ser percebidos progressivamente já nos primeiros dias, conforme a experiência relatada com o produto.",
    ],
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* SEÇÃO 1 — HERO */}
        <section id="inicio" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_70%_20%,color-mix(in_oklab,var(--gold)_10%,transparent),transparent_70%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block border border-gold/50 px-4 py-1.5 text-[0.7rem] font-semibold tracking-[0.3em] text-gold">
                HOMEM FORTE
              </span>
              <h1 className="mt-7 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                UMA ESCOLHA PARA O HOMEM QUE VALORIZA SUA{" "}
                <span className="text-gold-gradient">VITALIDADE.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Fórmula de 500 ml com ingredientes como ginseng, batata africana e maca peruana.
              </p>

              <ul className="mt-8 space-y-2.5 text-sm">
                {["500 ml", "Produto de origem angolana", "Para homens com 18 anos ou mais"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="text-gold">✓</span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-10">
                <p className="font-display text-5xl tracking-tight text-foreground sm:text-6xl">
                  10.000 Kz
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Pagamento somente na entrega.</p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#pedido"
                  className="bg-gold px-8 py-4 text-center font-display text-sm tracking-[0.2em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)]"
                >
                  QUERO O HOMEM FORTE
                </a>
                <a
                  href="#produto"
                  className="border border-border px-8 py-4 text-center font-display text-sm tracking-[0.2em] text-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  VER DETALHES
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-6 bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--gold)_14%,transparent),transparent_65%)] blur-2xl" />
              {/* [IMAGEM REAL DO PRODUTO] — src/assets/homem-forte-frasco.jpg */}
              <img
                src={frasco}
                alt="Frasco de 500 ml do suplemento HOMEM FORTE sobre mesa de madeira"
                width={828}
                height={1148}
                className="relative mx-auto w-full max-w-md border border-border object-cover shadow-[var(--shadow-premium)]"
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2 — PROPOSTA DE VALOR */}
        <section id="produto" className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="max-w-3xl font-display text-3xl tracking-tight sm:text-4xl">
                SIMPLICIDADE. PRATICIDADE. <span className="text-gold">HOMEM FORTE.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                O HOMEM FORTE é apresentado em uma embalagem de 500 ml e reúne ingredientes
                informados na fórmula, como ginseng, batata africana e maca peruana.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-px bg-border sm:grid-cols-3">
              {valores.map((v) => (
                <Reveal key={v.n} className="bg-background">
                  <div className="group h-full bg-background p-8 transition-colors duration-300 hover:bg-surface">
                    <span className="font-display text-xs tracking-[0.3em] text-gold">{v.n}</span>
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="mt-6 h-8 w-8 text-muted-foreground transition-colors duration-300 group-hover:text-gold"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={v.icone} />
                    </svg>
                    <h3 className="mt-6 font-display text-lg leading-snug tracking-wide">
                      {v.titulo}
                    </h3>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SEÇÃO 3 — INGREDIENTES */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                INGREDIENTES INFORMADOS NA FÓRMULA
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {["GINSENG", "BATATA AFRICANA", "MACA PERUANA"].map((ing, i) => (
                <Reveal key={ing}>
                  <article className="h-full border border-border bg-surface p-8 transition-transform duration-300 hover:-translate-y-1 hover:border-gold/50">
                    <span className="font-display text-xs tracking-[0.3em] text-muted-foreground">
                      0{i + 1}
                    </span>
                    <h3 className="mt-4 font-display text-2xl tracking-wide text-foreground">
                      {ing}
                    </h3>
                    <div className="hairline mt-6 w-16" />
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-8 border border-dashed border-border p-6 text-center font-display text-sm tracking-[0.2em] text-muted-foreground">
                E OUTROS COMPONENTES DA FÓRMULA
              </p>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 4 — COMO UTILIZAR */}
        <section id="utilizar" className="border-t border-border bg-surface/40">
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
                  <div className="border border-border bg-background p-10 text-center">
                    <p className="font-display text-xs tracking-[0.3em] text-gold">{m.titulo}</p>
                    <p className="mt-4 font-display text-4xl tracking-tight">{m.valor}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                O modo de utilização informado é de 2 tampas pela manhã e 2 tampas à noite.
              </p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Conservar refrigerado, mantendo na geleira na maior parte do tempo.
              </p>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 5 — INFORMAÇÃO SOBRE O PRODUTO */}
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:px-8 md:py-28 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <img
                src={medico.url}
                alt="Profissional de bata branca a segurar o frasco de 500 ml do HOMEM FORTE"
                loading="lazy"
                width={1152}
                height={1367}
                className="w-full border border-border object-cover shadow-[var(--shadow-premium)]"
              />
            </Reveal>

            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
                INFORMAÇÃO SOBRE O PRODUTO
              </h2>
              <dl className="mt-10 divide-y divide-border border-y border-border">
                {ficha.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4">
                    <dt className="text-sm text-muted-foreground">{k}</dt>
                    <dd className="text-right text-sm font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 6 — OFERTA */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
            <Reveal>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl">HOMEM FORTE</h2>
              <p className="mt-3 text-sm tracking-[0.3em] text-muted-foreground">500 ML</p>
              <p className="mt-10 font-display text-6xl tracking-tight text-gold sm:text-7xl">
                10.000 Kz
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Pagamento somente no momento da entrega.
              </p>
              <a
                href="#pedido"
                className="mt-10 inline-block bg-gold px-12 py-4 font-display text-sm tracking-[0.2em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)]"
              >
                QUERO RECEBER
              </a>
              <p className="mt-4 text-xs text-muted-foreground">Sem pagamento antecipado.</p>
            </Reveal>
          </div>
        </section>

        {/* SEÇÃO 7 — PEDIDO */}
        <section id="pedido" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">FAZER O PEDIDO</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Preencha os dados para organização da entrega.
              </p>
            </Reveal>
            <div className="mt-10">
              <FormularioPedido />
            </div>
          </div>
        </section>

        {/* SEÇÃO 8 — PAGAMENTO */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 py-16 text-center md:py-20">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-10 w-10 text-gold"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 6h13v9H1zM14 9h4l3 3v3h-7z" />
              <circle cx="5.5" cy="18" r="1.8" />
              <circle cx="17.5" cy="18" r="1.8" />
            </svg>
            <h2 className="font-display text-2xl tracking-[0.15em]">PAGAMENTO NA ENTREGA</h2>
            <p className="text-sm text-muted-foreground">
              Você paga somente no momento da entrega.
            </p>
          </div>
        </section>

        {/* SEÇÃO 9 — FAQ */}
        <section id="faq" className="border-t border-border">
          <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
            <Reveal>
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">PERGUNTAS FREQUENTES</h2>
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklab,var(--gold)_12%,transparent),transparent_70%)]" />
          <div className="relative mx-auto max-w-3xl px-5 py-24 text-center md:py-32">
            <Reveal>
              <h2 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl">
                PRONTO PARA CONHECER O HOMEM FORTE?
              </h2>
              <p className="mt-5 text-base text-muted-foreground">
                Faça seu pedido e pague somente na entrega.
              </p>
              <p className="mt-8 font-display text-5xl tracking-tight text-gold">10.000 Kz</p>
              <a
                href="#pedido"
                className="mt-10 inline-block bg-gold px-12 py-4 font-display text-sm tracking-[0.2em] text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-gold)]"
              >
                QUERO O HOMEM FORTE
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-2 md:px-8">
          <div>
            <p className="font-display text-lg tracking-[0.22em]">HOMEM FORTE</p>
            <p className="mt-2 text-sm text-muted-foreground">Produto de origem angolana.</p>
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

      {/* CTA fixo mobile — surge após a primeira dobra */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
          mostrarCtaFixo ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a
          href="#pedido"
          className="block bg-gold py-4 text-center font-display text-sm tracking-[0.15em] text-primary-foreground"
        >
          QUERO O HOMEM FORTE — 10.000 Kz
        </a>
      </div>
    </div>
  );
}
