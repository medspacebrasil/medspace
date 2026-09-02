import { generateSlug } from "@/lib/utils"

/**
 * Páginas por cidade.
 *
 * A auditoria de mídia mostrou o visitante de fora de Brasília chegando a uma
 * página sem oferta para a cidade dele e saindo em segundos. Cada cidade ganha
 * uma página própria: mostra o que houver na região e, quando não houver nada,
 * convida a clínica local a se cadastrar em vez de dar um beco sem saída.
 */

export interface Cidade {
  nome: string
  uf: string
}

/**
 * Cidades que têm página mesmo sem nenhum anúncio publicado, para a campanha
 * nacional de clínicas ter destino que fala a língua do visitante. Capitais e
 * praças grandes; crescer a lista é adicionar uma linha.
 */
export const CIDADES_CONHECIDAS: Record<string, Cidade> = {
  "brasilia": { nome: "Brasília", uf: "DF" },
  "sao-paulo": { nome: "São Paulo", uf: "SP" },
  "rio-de-janeiro": { nome: "Rio de Janeiro", uf: "RJ" },
  "belo-horizonte": { nome: "Belo Horizonte", uf: "MG" },
  "goiania": { nome: "Goiânia", uf: "GO" },
  "curitiba": { nome: "Curitiba", uf: "PR" },
  "porto-alegre": { nome: "Porto Alegre", uf: "RS" },
  "salvador": { nome: "Salvador", uf: "BA" },
  "fortaleza": { nome: "Fortaleza", uf: "CE" },
  "recife": { nome: "Recife", uf: "PE" },
  "manaus": { nome: "Manaus", uf: "AM" },
  "belem": { nome: "Belém", uf: "PA" },
  "vitoria": { nome: "Vitória", uf: "ES" },
  "florianopolis": { nome: "Florianópolis", uf: "SC" },
  "campo-grande": { nome: "Campo Grande", uf: "MS" },
  "cuiaba": { nome: "Cuiabá", uf: "MT" },
  "joao-pessoa": { nome: "João Pessoa", uf: "PB" },
  "natal": { nome: "Natal", uf: "RN" },
  "maceio": { nome: "Maceió", uf: "AL" },
  "aracaju": { nome: "Aracaju", uf: "SE" },
  "teresina": { nome: "Teresina", uf: "PI" },
  "sao-luis": { nome: "São Luís", uf: "MA" },
  "palmas": { nome: "Palmas", uf: "TO" },
  "porto-velho": { nome: "Porto Velho", uf: "RO" },
  "boa-vista": { nome: "Boa Vista", uf: "RR" },
  "rio-branco": { nome: "Rio Branco", uf: "AC" },
  "macapa": { nome: "Macapá", uf: "AP" },
  "campinas": { nome: "Campinas", uf: "SP" },
  "anapolis": { nome: "Anápolis", uf: "GO" },
  "uberlandia": { nome: "Uberlândia", uf: "MG" },
}

export function cidadeSlug(nome: string): string {
  return generateSlug(nome)
}

/**
 * Slug de uma cidade do banco, com a UF anexada só quando o nome colide.
 *
 * A identidade de uma cidade é (nome, UF): existe Palmas no Tocantins e no
 * Paraná. Enquanto o nome é único na base, o slug fica curto ("palmas");
 * quando duas UFs disputam o mesmo nome, cada uma ganha o sufixo
 * ("palmas-to", "palmas-pr") e nenhuma página mistura os anúncios da outra.
 */
export function slugDaCidade(
  cidade: { city: string; state: string },
  todas: { city: string; state: string }[]
): string {
  const base = generateSlug(cidade.city)
  const ufs = new Set(
    todas.filter((c) => generateSlug(c.city) === base).map((c) => c.state || "")
  )
  return ufs.size > 1 && cidade.state
    ? `${base}-${cidade.state.toLowerCase()}`
    : base
}

/**
 * Resolve o slug da URL para a cidade canônica.
 *
 * O banco vem primeiro: se existe anúncio numa cidade, o nome e a UF gravados
 * nele são o que vale (inclusive grafias fora da lista fixa). A lista fixa
 * cobre cidade sem oferta ainda; homônimas do banco usam o slug com UF, e o
 * slug curto de um nome em disputa cai na lista fixa (a capital conhecida).
 * Slug desconhecido devolve undefined e a página responde 404.
 */
export function resolverCidade(
  slug: string,
  cidadesDoBanco: { city: string; state: string }[]
): Cidade | undefined {
  const doBanco = cidadesDoBanco.find((c) => slugDaCidade(c, cidadesDoBanco) === slug)
  if (doBanco) return { nome: doBanco.city, uf: doBanco.state }
  return CIDADES_CONHECIDAS[slug]
}
