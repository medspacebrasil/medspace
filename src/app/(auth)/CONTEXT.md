# (auth)/ - Context

## Descricao
Grupo de rotas de autenticacao. O `(auth)` nao aparece na URL - serve apenas para agrupar e compartilhar um layout limpo (sem header/footer do marketplace).

## Rotas
| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/login` | `login/page.tsx` | Formulario de login (email + senha) |
| `/cadastro` | `cadastro/page.tsx` | Formulario de cadastro de clinica |

## Layout
Layout minimalista com:
- Logo MEDSPACE centralizado
- Card central com o formulario
- Fundo clean (sem distracao)

## Pagina de Login (`/login`)
- Campos: email, senha
- Link "Esqueci minha senha" (futuro - fora do MVP)
- Link "Nao tem conta? Cadastre-se" → `/cadastro`
- Apos login: redireciona para `/painel`
- Se ja autenticado: redireciona para `/painel`

## Pagina de Cadastro (`/cadastro`)
Formulario em etapas ou unica pagina com:
1. **Dados de acesso:** email, senha, confirmar senha
2. **Dados da clinica:** nome da clinica, cidade, bairro, whatsapp
3. Botao "Criar conta"

Apos cadastro:
- Cria User (role: CLINIC) + Clinic associada
- Faz login automatico
- Redireciona para `/painel`

## Server Actions
Arquivo: `actions.ts` neste grupo

| Action | Descricao |
|--------|-----------|
| `registerClinic(formData)` | Valida dados, cria user + clinic, faz login |
| `signIn(formData)` | Autentica via Auth.js credentials provider |

## Validacao (Zod)
```
email: string, email valido, obrigatorio
password: string, min 8 chars, obrigatorio
confirmPassword: deve ser igual a password (apenas cadastro)
clinicName: string, min 2 chars, obrigatorio
city: string, obrigatorio
neighborhood: string, obrigatorio
whatsapp: string, formato brasileiro (10-11 digitos)
```

---
## Changelog
- [2026-03-30] - Context criado
