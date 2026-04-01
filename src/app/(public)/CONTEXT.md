# (public)/ - Context

## Descricao
Grupo de rotas publicas (acessiveis sem autenticacao). Compartilham um layout com header completo (logo, navegacao, botao "Anuncie sua clinica") e footer.

## Rotas
| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/` | `page.tsx` | Home page |
| `/anuncios` | `anuncios/page.tsx` | Marketplace (listagem + filtros) |
| `/anuncios/[slug]` | `anuncios/[slug]/page.tsx` | Detalhe de um anuncio |

## Home (`/`)
Pagina principal com:
1. **Hero section:** Tagline "Conectando Medicos e Clinicas", subtexto explicativo, campo de busca rapida (cidade ou especialidade), CTA "Ver anuncios"
2. **Destaques:** Grid com 4-6 anuncios recentes/destacados
3. **Como funciona:** 3 passos (Busque → Escolha → Entre em contato)
4. **CTA para clinicas:** "Tem uma clinica? Anuncie gratuitamente" → `/cadastro`
5. **Footer:** Logo, links uteis, copyright

**Dados:** Server Component buscando anuncios recentes via Prisma (ISR com revalidacao).

## Marketplace (`/anuncios`)
Pagina principal do marketplace estilo OLX:

### Filtros (sidebar no desktop, drawer no mobile)
- Cidade (select ou autocomplete)
- Bairro (select, depende da cidade)
- Especialidade (multi-select ou checkboxes)
- Tipo de sala (select)
- Equipamentos (multi-select ou checkboxes)

### Listagem
- Grid de cards (3 colunas desktop, 1 coluna mobile)
- Cada card: foto principal, titulo, cidade/bairro, especialidades (tags), descricao curta
- Paginacao (server-side via searchParams)
- Ordenacao: mais recentes (padrao)
- Mensagem "Nenhum anuncio encontrado" com sugestao de limpar filtros

**Dados:** Server Component com searchParams para filtros. URL reflete estado dos filtros (shareable).

## Detalhe do Anuncio (`/anuncios/[slug]`)
Pagina individual do anuncio:

1. **Galeria de fotos** (carousel/lightbox)
2. **Titulo do anuncio**
3. **Localizacao:** Cidade - Bairro
4. **Clinica:** Nome da clinica
5. **Especialidades:** Tags/badges
6. **Tipo de sala:** Badge
7. **Equipamentos:** Lista com icones
8. **Descricao completa:** Texto livre
9. **CTA "Tenho interesse":** Botao verde que abre WhatsApp com mensagem pre-preenchida:
   `"Ola! Vi o anuncio '[titulo]' no MedSpace e tenho interesse. Podemos conversar?"`
10. **Anuncios relacionados** (mesma cidade ou especialidade)

**SEO:** generateMetadata() com title, description, og:image (primeira foto).
**Dados:** Server Component buscando por slug via Prisma.

## Layout
```
┌─────────────────────────────────────────┐
│  [Logo]    Anuncios    [Anuncie] [Login]│  ← Header
├─────────────────────────────────────────┤
│                                         │
│           {children}                    │  ← Page content
│                                         │
├─────────────────────────────────────────┤
│  Logo  |  Links  |  © 2026 MedSpace    │  ← Footer
└─────────────────────────────────────────┘
```

---
## Changelog
- [2026-03-30] - Context criado
