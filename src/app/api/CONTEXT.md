# api/ - Context (Route Handlers)

## Descricao
Endpoints REST da aplicacao, implementados como Route Handlers do Next.js App Router.

Ver documentacao completa em [docs/API.md](../../../docs/API.md).

## Estrutura
```
api/
├── auth/
│   └── [...nextauth]/route.ts    # Auth.js catch-all (login, logout, session, csrf)
├── anuncios/
│   ├── route.ts                  # GET (listar com filtros) + POST (criar)
│   └── [id]/route.ts             # GET (detalhe) + PUT (editar) + DELETE (remover)
├── upload/
│   └── route.ts                  # POST (upload de imagem para Supabase Storage)
└── admin/
    ├── clinicas/route.ts         # GET (listar clinicas)
    └── anuncios/
        ├── route.ts              # GET (listar para moderacao)
        └── [id]/
            └── status/route.ts   # PATCH (aprovar/rejeitar/arquivar)
```

## Padrao de Implementacao

### Request → Validacao → Auth → Operacao → Response

```typescript
export async function POST(request: Request) {
  // 1. Parse body
  const body = await request.json()

  // 2. Validar com Zod
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ errors: result.error.flatten() }, { status: 400 })
  }

  // 3. Verificar autenticacao
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 4. Verificar autorizacao (se necessario)
  // ...

  // 5. Operacao no banco
  const data = await prisma.listing.create({ ... })

  // 6. Resposta
  return NextResponse.json(data, { status: 201 })
}
```

## Notas
- Route Handlers sao usados para endpoints consumidos por fetch no client
- Operacoes de formulario preferem Server Actions (evita criar endpoint)
- Endpoints de listagem (GET /api/anuncios) podem ser chamados tanto por SSR quanto por client-side fetch

---
## Changelog
- [2026-03-30] - Context criado
