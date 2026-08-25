/**
 * Cliente HTTP do Asaas.
 *
 * Isola o gateway atrás de uma interface própria, para o resto do sistema ser
 * testável com mock e para trocar sandbox por produção mudando uma variável de
 * ambiente, sem tocar em código.
 *
 * Detalhes do gateway que já custaram tempo de gente e ficam registrados aqui:
 * o header é `access_token`, não `Authorization: Bearer`; o `User-Agent` é
 * obrigatório para contas criadas a partir de 13/06/2024; e requisição GET com
 * corpo pode voltar 403, então GET nunca leva body.
 */

const BASE_URLS = {
  sandbox: "https://api-sandbox.asaas.com/v3",
  production: "https://api.asaas.com/v3",
} as const

export type AsaasEnv = keyof typeof BASE_URLS

/** Lida preguiçosamente: o build não pode exigir a chave. */
function config(): { baseUrl: string; apiKey: string } {
  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey) {
    throw new AsaasError(
      "ASAAS_API_KEY não configurada",
      "MISSING_API_KEY",
      0
    )
  }
  const env = (process.env.ASAAS_ENV as AsaasEnv) ?? "sandbox"
  return { baseUrl: BASE_URLS[env] ?? BASE_URLS.sandbox, apiKey }
}

export class AsaasError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number
  ) {
    super(message)
    this.name = "AsaasError"
  }
}

interface AsaasErrorBody {
  errors?: Array<{ code?: string; description?: string }>
}

async function request<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown } = { method: "GET" }
): Promise<T> {
  const { baseUrl, apiKey } = config()

  const res = await fetch(`${baseUrl}${path}`, {
    method: init.method,
    headers: {
      access_token: apiKey,
      "Content-Type": "application/json",
      // Obrigatório para contas raiz criadas a partir de 13/06/2024.
      "User-Agent": "MedSpace/1.0 (medspacebrasil.com.br)",
    },
    // GET nunca leva corpo: o Asaas pode responder 403.
    body: init.method === "POST" && init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const body = data as AsaasErrorBody | null
    const first = body?.errors?.[0]
    throw new AsaasError(
      first?.description ?? `Falha na chamada ao Asaas (${res.status})`,
      first?.code ?? "UNKNOWN",
      res.status
    )
  }

  return data as T
}

// ---------------------------------------------------------------- clientes

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string
}

export interface CreateCustomerInput {
  name: string
  /** Só dígitos. Obrigatório pelo Asaas, tanto para CPF quanto CNPJ. */
  cpfCnpj: string
  email?: string
  mobilePhone?: string
}

export function createCustomer(input: CreateCustomerInput): Promise<AsaasCustomer> {
  return request<AsaasCustomer>("/customers", { method: "POST", body: input })
}

export function getCustomer(id: string): Promise<AsaasCustomer> {
  return request<AsaasCustomer>(`/customers/${id}`)
}

// ---------------------------------------------------------------- cobranças

export type AsaasBilling = "PIX" | "CREDIT_CARD"

export interface AsaasPayment {
  id: string
  customer: string
  billingType: AsaasBilling
  value: number
  status: string
  dueDate: string
  invoiceUrl?: string
  externalReference?: string
}

export interface CreatePaymentInput {
  customer: string
  billingType: AsaasBilling
  value: number
  dueDate: string
  description: string
  /** Id do nosso pedido. É o que permite reconciliar pelo painel do Asaas. */
  externalReference: string
}

export function createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
  return request<AsaasPayment>("/payments", { method: "POST", body: input })
}

/**
 * Reconsulta a cobrança na fonte.
 *
 * Usada antes de liberar qualquer publicação: o webhook do Asaas não é
 * assinado, então confiar apenas no payload recebido abriria espaço para
 * evento forjado. O estado que vale é o que a API responde.
 */
export function getPayment(id: string): Promise<AsaasPayment> {
  return request<AsaasPayment>(`/payments/${id}`)
}

export interface AsaasPixQrCode {
  /** PNG em base64, sem o prefixo data:. */
  encodedImage: string
  /** Copia e cola. */
  payload: string
  expirationDate?: string
}

export function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return request<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`)
}

/**
 * Estorno.
 *
 * Só aceita cobrança em RECEIVED ou CONFIRMED. As tarifas do gateway não
 * voltam em estorno nenhum, nem parcial nem integral, e por isso o estorno
 * integral de um Pix recém-recebido pode falhar por saldo insuficiente.
 */
export function refundPayment(paymentId: string, valueCents?: number) {
  return request<{ id: string; status: string }>(`/payments/${paymentId}/refund`, {
    method: "POST",
    body: valueCents ? { value: valueCents / 100 } : {},
  })
}

/** Datas do Asaas são YYYY-MM-DD. */
export function toAsaasDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}
