import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import frasco from "@/assets/homem-forte-frasco.jpg";
import prodHero from "@/assets/prod-frasco-hero.jpg";
import medico from "@/assets/homem-forte-medico.jpg";
import ingrGinseng from "@/assets/ingr-ginseng.jpg";
import ingrBeterraba from "@/assets/ingr-beterraba.jpg";
import ingrMaca from "@/assets/ingr-maca.jpg";
import { Reveal } from "@/components/Reveal";
import { usePastHero } from "@/hooks/use-reveal";
import { metaCapi } from "@/lib/capi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRECO_UNITARIO = 10000;
const PRECO_ENTREGA = 1000;
const WHATSAPP = "244937876711";
const WA_PEDIDO = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Olá! Quero fazer o meu pedido do HOMEM FORTE 500 ML."
)}`;

const PIXEL_ID = "1032782669666254";

const PIXEL_SCRIPT = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`;

function fbq(...args: unknown[]) {
  (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.(...args);
}

const kz = (valor: number) =>
  `${valor.toLocaleString("pt-AO").replace(/[,\s\u00A0\u202F]/g, ".")} Kz`;

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
          "HOMEM FORTE — 500 ml, 10.000 Kz. Em Luanda paga na entrega. Ligue agora (Unitel ou Africell) e receba hoje.",
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
    scripts: [{ children: PIXEL_SCRIPT }],
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
/* Formulário de pedido progressivo → ligação direta                    */
/* ------------------------------------------------------------------ */

type Erros = Partial<
  Record<"dia" | "periodo" | "zona" | "nome" | "telefone" | "endereco" | "provincia", string>
>;

const PERIODOS = ["O mais cedo possível", "Manhã", "Tarde", "Noite"] as const;

const PROVINCIAS = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire",
] as const;

const ETAPAS_LABEL = ["QUANDO", "PERÍODO", "LOCAL", "DADOS", "RESUMO"] as const;

function mascaraTelefone(valor: string) {
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length > 9 && digitos.startsWith("244")) digitos = digitos.slice(3);
  digitos = digitos.slice(0, 9);
  return digitos.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_m, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
}

const amanhaISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

const rotuloDia = (iso: string) => {
  if (!iso) return "";
  if (iso === hojeISO()) return "Hoje";
  if (iso === amanhaISO()) return "Amanhã";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

function FormularioPedido() {
  const [etapa, setEtapa] = useState(1);
  const [dia, setDia] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [zona, setZona] = useState<"" | "luanda" | "provincia">("");
  const [provincia, setProvincia] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [erros, setErros] = useState<Erros>({});
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);
  const ultimoClique = useRef(0);

  const totalProduto = useMemo(() => PRECO_UNITARIO * quantidade, [quantidade]);
  const total = useMemo(() => totalProduto + PRECO_ENTREGA, [totalProduto]);

  function ir(proxima: number) {
    setEtapa(proxima);
    painelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function limparErros(chave: keyof Erros) {
    setErros((e) => ({ ...e, [chave]: undefined }));
  }

  function validar(atual: number): Erros {
    const e: Erros = {};
    if (atual <= 1 && !dia) e.dia = "Escolha uma data.";
    if (atual >= 2 && !periodo) e.periodo = "Escolha um período.";
    if (atual >= 3 && !zona) e.zona = "Escolha a localização.";
    if (atual >= 4) {
      if (nome.trim().length < 3) e.nome = "Informe o seu nome.";
      const digitos = telefone.replace(/\D/g, "");
      if (!digitos) e.telefone = "Informe o seu número de telefone.";
      else if (digitos.length !== 9) e.telefone = "Telefone com 9 dígitos.";
      if (endereco.trim().length < 4) e.endereco = "Informe onde devemos entregar.";
      if (zona === "provincia" && !provincia) e.provincia = "Selecione a província.";
    }
    return e;
  }

  function continuar() {
    const e = validar(etapa);
    setErros(e);
    if (Object.keys(e).length > 0) return;
    setErros({});
    ir(etapa + 1);
  }

  function voltar() {
    setErros({});
    ir(etapa - 1);
  }

  function escolherDia(valor: string) {
    setDia(valor);
    limparErros("dia");
    ir(2);
  }

  function escolherPeriodo(valor: string) {
    setPeriodo(valor);
    limparErros("periodo");
    ir(3);
  }

  function escolherZona(valor: "luanda" | "provincia") {
    setZona(valor);
    if (zona !== valor) setProvincia("");
    limparErros("zona");
    ir(4);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const e = validar(5);
    setErros(e);
    if (Object.keys(e).length > 0) {
      if (e.nome || e.telefone || e.endereco || e.provincia) ir(4);
      else if (e.zona) ir(3);
      else if (e.periodo) ir(2);
      else ir(1);
      return;
    }

    const msg = [
      "Olá! Quero fazer um pedido do HOMEM FORTE 500 ML.",
      "",
      "*Pedido*",
      "Produto: HOMEM FORTE 500 ML",
      `Quantidade: ${quantidade}`,
      `Produto: ${kz(totalProduto)}`,
      `Entrega: ${kz(PRECO_ENTREGA)}`,
      `Total: ${kz(total)}`,
      "",
      "*Entrega*",
      `Data: ${rotuloDia(dia)}`,
      `Período: ${periodo}`,
      `Local: ${zona === "luanda" ? "Luanda" : `Outra província — ${provincia}`}`,
      "",
      "*Cliente*",
      `Nome: ${nome}`,
      `Telefone: ${telefone}`,
      `Endereço: ${endereco}`,
      zona === "luanda"
        ? "Pagamento: na entrega"
        : "Pagamento: antecipado (envio imediato após confirmação)",
    ].join("\n");

    if (Date.now() - ultimoClique.current > 2500) {
      ultimoClique.current = Date.now();
      const eventId = crypto.randomUUID();
      fbq("track", "InitiateCheckout", {
        content_name: "HOMEM FORTE 500 ml",
        content_ids: ["HF-500"],
        content_type: "product",
        value: total,
        currency: "AOA",
        num_items: quantidade,
      }, { eventID: eventId });

      const lerCookie = (n: string) =>
        document.cookie
          .split("; ")
          .find((c) => c.startsWith(`${n}=`))
          ?.slice(n.length + 1);

      const fbp = lerCookie("_fbp");
      const fbc = lerCookie("_fbc");

      metaCapi({
        data: {
          eventId,
          fbp,
          fbc,
          nome,
          telefone,
          cidade: zona === "luanda" ? "Luanda" : undefined,
          provincia: zona === "provincia" ? provincia : undefined,
          quantidade,
          total,
          url: window.location.href,
        },
      }).catch((error) => console.error("[CAPI] Falha:", error));

      window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    }
  }

  const campo =
    "w-full border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-green focus:outline-none";
  const rotulo = "mb-2 block text-xs font-semibold tracking-[0.16em] text-muted-foreground";
  const opcao = (ativa: boolean) =>
    `w-full border px-5 py-4 text-left font-display text-sm tracking-[0.14em] transition-colors ${
      ativa
        ? "border-green bg-green/10 text-foreground"
        : "border-input text-muted-foreground hover:border-green/50 hover:text-foreground"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="border border-border bg-surface p-6 md:p-10">
      <div className="mb-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            {etapa} de 5
          </p>
          <p className="font-display text-xs tracking-[0.18em] text-gold">
            {ETAPAS_LABEL[etapa - 1]}
          </p>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden bg-border">
          <div
            className="h-full bg-green transition-all duration-300"
            style={{ width: `${(etapa / 5) * 100}%` }}
          />
        </div>
        <p className="mt-3 hidden flex-wrap gap-x-4 gap-y-1 text-[10px] tracking-[0.12em] text-muted-foreground/60 sm:flex">
          {ETAPAS_LABEL.map((et, i) => (
            <span
              key={et}
              className={
                i + 1 < etapa
                  ? "text-green"
                  : i + 1 === etapa
                    ? "font-semibold text-gold"
                    : undefined
              }
            >
              {i + 1}. {et}
            </span>
          ))}
        </p>
      </div>

      <div ref={painelRef} className="scroll-mt-24">
        {/* ETAPA 1 — QUANDO QUER RECEBER? */}
        {etapa === 1 && (
          <div>
            <h3 className="font-display text-2xl tracking-tight text-foreground">
              QUANDO QUER RECEBER?
            </h3>
            <div className="mt-6 grid gap-3">
              <button type="button" onClick={() => escolherDia(hojeISO())} className={opcao(dia === hojeISO())}>
                HOJE
              </button>
              <button type="button" onClick={() => escolherDia(amanhaISO())} className={opcao(dia === amanhaISO())}>
                AMANHÃ
              </button>
              <button
                type="button"
                onClick={() => setMostrarCalendario(true)}
                className={opcao(mostrarCalendario)}
              >
                OUTRA DATA
              </button>
            </div>
            {mostrarCalendario && (
              <div className="mt-5">
                <label htmlFor="dia" className={rotulo}>
                  ESCOLHA A DATA
                </label>
                <input
                  id="dia"
                  name="dia"
                  type="date"
                  value={dia}
                  min={hojeISO()}
                  onChange={(e) => {
                    if (e.target.value) escolherDia(e.target.value);
                  }}
                  aria-invalid={!!erros.dia}
                  className={campo}
                />
                {erros.dia && <p className="mt-2 text-xs text-destructive">{erros.dia}</p>}
              </div>
            )}
          </div>
        )}

        {/* ETAPA 2 — QUAL PERÍODO PREFERE? */}
        {etapa === 2 && (
          <div>
            <h3 className="font-display text-2xl tracking-tight text-foreground">
              QUAL PERÍODO PREFERE?
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PERIODOS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => escolherPeriodo(p)}
                  className={opcao(periodo === p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            {erros.periodo && <p className="mt-3 text-xs text-destructive">{erros.periodo}</p>}
          </div>
        )}

        {/* ETAPA 3 — ONDE SERÁ A ENTREGA? */}
        {etapa === 3 && (
          <div>
            <h3 className="font-display text-2xl tracking-tight text-foreground">
              ONDE SERÁ A ENTREGA?
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => escolherZona("luanda")}
                className={opcao(zona === "luanda")}
              >
                LUANDA
              </button>
              <button
                type="button"
                onClick={() => escolherZona("provincia")}
                className={opcao(zona === "provincia")}
              >
                OUTRA PROVÍNCIA
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Em Luanda paga apenas quando receber. Fora de Luanda o pagamento é feito antes e
              enviamos imediatamente.
            </p>
            {erros.zona && <p className="mt-3 text-xs text-destructive">{erros.zona}</p>}
          </div>
        )}

        {/* ETAPA 4 — DADOS DO CLIENTE */}
        {etapa === 4 && (
          <div>
            <h3 className="font-display text-2xl tracking-tight text-foreground">SEUS DADOS</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
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
                  placeholder="Digite seu nome"
                />
                {erros.nome && <p className="mt-2 text-xs text-destructive">{erros.nome}</p>}
              </div>

              <div>
                <label htmlFor="telefone" className={rotulo}>
                  NÚMERO DE TELEFONE
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
                  placeholder="Ex.: 923 000 000"
                />
                {erros.telefone && (
                  <p className="mt-2 text-xs text-destructive">{erros.telefone}</p>
                )}
              </div>

              {zona === "provincia" && (
                <div>
                  <label htmlFor="provincia" className={rotulo}>
                    PROVÍNCIA
                  </label>
                  <select
                    id="provincia"
                    name="provincia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    aria-invalid={!!erros.provincia}
                    className={campo}
                  >
                    <option value="">Selecione a província</option>
                    {PROVINCIAS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {erros.provincia && (
                    <p className="mt-2 text-xs text-destructive">{erros.provincia}</p>
                  )}
                </div>
              )}

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
                  placeholder="Onde devemos entregar?"
                />
                {erros.endereco && (
                  <p className="mt-2 text-xs text-destructive">{erros.endereco}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={continuar}
              className="btn-green mt-8 w-full py-4 font-display text-sm tracking-[0.2em]"
            >
              CONTINUAR
            </button>
            <button
              type="button"
              onClick={voltar}
              className="mt-4 w-full text-xs tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
            >
              ← VOLTAR
            </button>
          </div>
        )}

        {/* ETAPA 5 — RESUMO */}
        {etapa === 5 && (
          <div>
            <h3 className="font-display text-2xl tracking-tight text-foreground">SEU PEDIDO</h3>

            <div className="mt-6 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-4">
                <p className="min-w-0 font-display tracking-widest text-foreground">
                  <span className="whitespace-nowrap">HOMEM FORTE</span>{" "}
                  <span className="whitespace-nowrap">500 ML</span>
                </p>
                <div className="flex shrink-0 items-center border border-input bg-background">
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
                    className="w-14 bg-transparent py-3 text-center text-sm text-foreground focus:outline-none"
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

              <dl className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Quantidade</dt>
                  <dd className="whitespace-nowrap font-semibold text-foreground">
                    {quantidade} {quantidade === 1 ? "frasco" : "frascos"}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Produto</dt>
                  <dd className="whitespace-nowrap font-semibold text-foreground">
                    {kz(totalProduto)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className="text-muted-foreground">Entrega</dt>
                  <dd className="whitespace-nowrap font-semibold text-foreground">
                    {kz(PRECO_ENTREGA)}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-3">
                  <dt className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                    TOTAL
                  </dt>
                  <dd className="whitespace-nowrap font-display text-2xl text-gold">
                    {kz(total)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="border border-border bg-background p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  ENTREGA
                </p>
                <dl className="mt-3 space-y-2 text-sm text-foreground">
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Data</dt>
                    <dd className="min-w-0 break-words text-right">{rotuloDia(dia)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Período</dt>
                    <dd className="min-w-0 break-words text-right">{periodo}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Local</dt>
                    <dd className="min-w-0 break-words text-right">
                      {zona === "luanda" ? "Luanda" : `Outra província — ${provincia}`}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-border bg-background p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground">
                  CLIENTE
                </p>
                <dl className="mt-3 space-y-2 text-sm text-foreground">
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Nome</dt>
                    <dd className="min-w-0 break-words text-right">{nome}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Telefone</dt>
                    <dd className="min-w-0 break-words text-right">{telefone}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-muted-foreground">Endereço</dt>
                    <dd className="min-w-0 break-words text-right">{endereco}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <button
              type="submit"
              className="btn-green mt-8 w-full py-4 font-display text-sm tracking-[0.2em]"
            >
              🔥 FAZER MEU PEDIDO NO WHATSAPP
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              O pedido abre no WhatsApp já preenchido — revê tudo e toca em Enviar.
            </p>
            <button
              type="button"
              onClick={voltar}
              className="mt-4 w-full text-xs tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
            >
              ← VOLTAR
            </button>
          </div>
        )}
      </div>
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

  useEffect(() => {
    fbq("track", "ViewContent", {
      content_name: "HOMEM FORTE 500 ml",
      content_ids: ["HF-500"],
      content_type: "product",
      value: PRECO_UNITARIO,
      currency: "AOA",
    });
  }, []);

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
      "Preenche o formulário em 5 perguntas rápidas e toca em \"FAZER MEU PEDIDO NO WHATSAPP\" — o pedido abre no WhatsApp já preenchido, é só enviar. Confirmamos e organizamos a entrega de hoje.",
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* SEÇÃO 1 — HERO EM VÍDEO */}
        <section id="inicio" className="relative min-h-[92vh] overflow-hidden">
          <video
            className="absolute inset-0 h-full w-full object-cover object-[50%_25%]"
            src="/hero-video.mp4"
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
                href={WA_PEDIDO}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-green px-8 py-4 text-center font-display text-sm tracking-[0.2em]"
              >
                FAZER MEU PEDIDO NO WHATSAPP
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
                5 perguntas rápidas e o pedido é enviado direto para o nosso WhatsApp.
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
              <p className="mt-8 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                PEDIDO POR ESCRITO, SEM LIGAÇÕES
              </p>
              <a
                href={WA_PEDIDO}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-green mt-4 inline-block px-12 py-4 font-display text-sm tracking-[0.2em]"
              >
                FAZER MEU PEDIDO NO WHATSAPP
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
            <div className="mt-4 flex flex-col gap-1 text-sm">
              <a href={WA_PEDIDO} target="_blank" rel="noopener noreferrer" className="text-green hover:underline">
                Pedido por WhatsApp: 937 876 711
              </a>
            </div>
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

      {/* Ligação flutuante WhatsApp */}
      <a
        href={WA_PEDIDO}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fazer pedido pelo WhatsApp"
        className="btn-green fixed bottom-24 right-4 z-50 grid h-14 w-14 place-items-center rounded-full md:bottom-6"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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
