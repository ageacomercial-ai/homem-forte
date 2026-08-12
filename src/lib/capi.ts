import {
  createCsrfMiddleware,
  createMiddleware,
  createServerFn,
} from "@tanstack/react-start";
import { z } from "zod";

import { buildInitiateCheckoutEvent, sendToMeta, type DadosCliente } from "./meta-servidor.server";

const requestInfo = createMiddleware({ type: "request" }).server(
  async ({ request, next }) =>
    next({
      context: {
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    })
);

const initiateCheckoutSchema = z.object({
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

export const metaCapi = createServerFn({ method: "POST" })
  .middleware([createCsrfMiddleware(), requestInfo])
  .validator(initiateCheckoutSchema)
  .handler(async ({ data, context }) => {
    const pixelId = process.env["META_PIXEL_ID"];
    const accessToken = process.env["META_ACCESS_TOKEN"];

    if (!pixelId || !accessToken) {
      console.error("[CAPI] META_PIXEL_ID/META_ACCESS_TOKEN não configurados");
      return { success: false, error: "not_configured" };
    }

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
      evento = buildInitiateCheckoutEvent(
        data.eventId,
        dados,
        { ip: context?.ip, userAgent: context?.userAgent }
      );
    } catch (error) {
      console.error("[CAPI] Falha ao construir evento:", error);
      return { success: false, error: "invalid_data" };
    }

    try {
      const testEventCode = process.env["META_PIXEL_TEST_EVENT_CODE"];
      const resultado = await sendToMeta(pixelId, accessToken, evento, testEventCode);
      return resultado.ok
        ? { success: true }
        : { success: false, error: "meta_error", status: resultado.status };
    } catch (error) {
      console.error("[CAPI] Falha ao enviar para a Meta:", error);
      return { success: false, error: "network" };
    }
  });

export default metaCapi;
