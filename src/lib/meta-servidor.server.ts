import { createHash } from "node:crypto";

export function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Normaliza o telefone para E.164 sem o "+" (244 + 9 dígitos).
 * Aceita +244937876711, 244937876711, 937876711, 937 876 711, etc.
 */
export function normalizarTelefone(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  const semPrefixo = digitos.startsWith("244") ? digitos.slice(3) : digitos;
  if (semPrefixo.length !== 9) {
    throw new Error(`Número de telefone inválido: ${telefone}`);
  }
  return `244${semPrefixo}`;
}

export interface InitiateCheckoutData {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  user_data?: UserData;
  custom_data?: CustomData;
}

export interface UserData {
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  fn?: string;
  ph?: string;
  ct?: string;
  st?: string;
  country?: string;
}

export interface CustomData {
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}

export interface DadosCliente {
  nome: string;
  telefone: string;
  cidade?: string | undefined;
  provincia?: string | undefined;
  quantidade: number;
  total: number;
  url?: string | undefined;
  fbp?: string | undefined;
  fbc?: string | undefined;
}

export interface DadosRequest {
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export function buildInitiateCheckoutEvent(
  eventId: string,
  cliente: DadosCliente,
  request: DadosRequest
): InitiateCheckoutData {
  const now = Math.floor(Date.now() / 1000);
  const userData: UserData = {};
  const customData: CustomData = {};

  if (request.ip) {
    userData.client_ip_address = request.ip;
  }
  if (request.userAgent) {
    userData.client_user_agent = request.userAgent;
  }
  if (cliente.fbp) {
    userData.fbp = cliente.fbp;
  }
  if (cliente.fbc) {
    userData.fbc = cliente.fbc;
  }
  if (cliente.nome) {
    userData.fn = sha256Hex(cliente.nome);
  }
  if (cliente.telefone) {
    userData.ph = sha256Hex(normalizarTelefone(cliente.telefone));
  }
  if (cliente.cidade) {
    userData.ct = sha256Hex(cliente.cidade);
  }
  if (cliente.provincia) {
    userData.st = sha256Hex(cliente.provincia);
  }
  userData.country = "AO";

  customData.content_name = "HOMEM FORTE 500 ML";
  customData.content_ids = ["HF-500"];
  customData.content_type = "product";
  customData.value = cliente.total;
  customData.currency = "AOA";
  customData.num_items = cliente.quantidade;

  const evento: InitiateCheckoutData = {
    event_name: "InitiateCheckout",
    event_time: now,
    event_id: eventId,
    event_source_url: cliente.url ?? "https://homem-forte.com",
  };
  if (Object.keys(userData).length > 0) {
    evento.user_data = userData;
  }
  if (Object.keys(customData).length > 0) {
    evento.custom_data = customData;
  }
  return evento;
}

/**
 * Envia o evento para a Meta Conversions API (Graph API v26.0).
 * Lança erro em caso de falha de rede; erros HTTP são registados e devolvidos.
 */
export async function sendToMeta(
  pixelId: string,
  accessToken: string,
  evento: InitiateCheckoutData,
  testEventCode?: string
): Promise<{ ok: boolean; status?: number; body?: unknown }> {
  const url = `https://graph.facebook.com/v26.0/${pixelId}/events`;
  const payload: { data: InitiateCheckoutData[]; test_event_code?: string } = {
    data: [evento],
  };
  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    console.error(`[CAPI] Meta API ${response.status}: ${JSON.stringify(body)}`);
    return { ok: false, status: response.status, body };
  }

  console.log(`[CAPI] Evento ${evento.event_id} enviado com sucesso`);
  return { ok: true, status: response.status, body };
}
