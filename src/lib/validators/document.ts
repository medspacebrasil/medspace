/**
 * Validacao de CPF e CNPJ com digito verificador.
 *
 * Recebem a string com ou sem mascara; consideram apenas os digitos.
 * Rejeitam sequencias repetidas (ex.: 111.111.111-11), que passam na
 * conta dos digitos verificadores mas nunca sao documentos reais.
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "")
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcCheckDigit = (length: number): number => {
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calcCheckDigit(9) === Number(cpf[9]) && calcCheckDigit(10) === Number(cpf[10])
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value)
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const calcCheckDigit = (length: number): number => {
    // Pesos: comecam em 5 (CNPJ de 12 digitos) ou 6 (de 13), decrescem ate 2 e reiniciam em 9.
    let weight = length - 7
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += Number(cnpj[i]) * weight
      weight = weight === 2 ? 9 : weight - 1
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calcCheckDigit(12) === Number(cnpj[12]) && calcCheckDigit(13) === Number(cnpj[13])
}

/** Formata CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) a partir dos digitos. */
export function formatDocument(value: string, type: "CPF" | "CNPJ"): string {
  const digits = onlyDigits(value)
  if (type === "CPF") {
    return digits
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }
  return digits
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2")
}
