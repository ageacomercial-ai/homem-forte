import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { buildInitiateCheckoutEvent, sendToMeta, type DadosCliente } from "@/lib/meta-servidor.server";

const payloadSchema = z.object({
  eventId: z.string().min(1).max(100),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(200).optional(),
  nome: z.string().min(1).max(100),
  telefone: z.string().min(9).max(20),
  cidade: z.string().max(100).optional(),
  provincia: z.string().max(100).optional(),
  quantidade: z.number().int().min(1).max(50),
  total: z.number().min(0),
  url: z.string().max(500).optional(),
});

async function respostaJSON(status: number, corpo: unknown): Promise<Response> {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/capi")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secFetchSite = request.headers.get("sec-fetch-site");
        const origin = request.headers.get("origin");
        if (secFetchSite && !["same-origin", "same-site"].includes(secFetchSite)) {
          return respostaJSON(403, { success: false, error: "forbidden" });
        }
        if (origin && !origin.startsWith("https://") ) {
          return respostaJSON(403, { success: false, error: "forbidden" });
        }

        let corpo: unknown;
        try {
          corpo = await request.json();
        } catch {
          return respostaJSON(400, { success: false, error: "invalid_json" });
        }

        const parsed = payloadSchema.safeParse(corpo);
        if (!parsed.success) {
          return respostaJSON(400, { success: false, error: "invalid_data" });
        }
        const data = parsed.data;

        const pixelId = process.env["META_PIXEL_ID"];
        const accessToken = process.env["META_ACCESS_TOKEN"];
        if (!pixelId || !accessToken) {
          console.error("[CAPI] META_PIXEL_ID/META_ACCESS_TOKEN não configurados");
          return respostaJSON(503, { success: false, error: "not_configured" });
        }

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
        const userAgent = request.headers.get("user-agent") || undefined;

        let evento;
        try {
          const dados: DadosCliente = {
            nome: data.nome,
            telefone: data.telefone,
            quantidade: data.quantidade,
            total: data.total,
          };
          if (data.cidade) dados.cidade = data.cidade;
          if (data.provincia) dados.provincia = data.provincia;
          if (data.url) dados.url = data.url;
          if (data.fbp) dados.fbp = data.fbp;
          if (data.fbc) dados.fbc = data.fbc;
          evento = buildInitiateCheckoutEvent(data.eventId, dados, { ip, userAgent });
        } catch (error) {
          console.error("[CAPI] Falha ao construir evento:", error);
          return respostaJSON(400, { success: false, error: "invalid_data" });
        }

        try {
          const testEventCode = process.env["META_PIXEL_TEST_EVENT_CODE"];
          const resultado = await sendToMeta(pixelId, accessToken, evento, testEventCode);
          if (!resultado.ok) {
            return respostaJSON(502, { success: false, error: "meta_error", status: resultado.status });
          }
          return respostaJSON(200, { success: true });
        } catch (error) {
          console.error("[CAPI] Falha ao enviar para a Meta:", error);
          return respostaJSON(502, { success: false, error: "network" });
        }
      },
    },
  },
});
