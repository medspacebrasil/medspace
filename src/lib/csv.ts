/**
 * Célula de CSV segura para abrir no Excel e no Google Sheets.
 *
 * Uma célula que começa com =, +, - ou @ é interpretada como fórmula. Como
 * título de anúncio e nome de anunciante são texto livre digitado pelo
 * usuário, sem escapar ele conseguiria fazer a planilha executar fórmula ao
 * ser aberta. O apóstrofo força a leitura como texto.
 *
 * Separador ";" é o do Excel em português, e por isso ele também entra na
 * lista de caracteres que exigem aspas.
 */
export function csvCell(value: string | number): string {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Monta o arquivo com BOM, para o Excel em português abrir sem quebrar acentuação. */
export function csvFile(header: string[], rows: (string | number)[][]): string {
  const lines = [header.join(";"), ...rows.map((r) => r.map(csvCell).join(";"))]
  return "﻿" + lines.join("\r\n")
}
