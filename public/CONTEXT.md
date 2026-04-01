# Public - Context

## O que vai nesta pasta
Assets estaticos servidos diretamente pelo Next.js. Acessiveis via URL raiz (ex: `/images/logo-dark.png`).

## Estrutura planejada
```
public/
├── images/
│   ├── logo-dark.png          # Logo fundo escuro (azul marinho + dourado)
│   ├── logo-light.png         # Logo fundo claro (rosa + dourado)
│   ├── logo-icon.png          # Icone do logo (sem texto)
│   ├── placeholder-listing.png # Placeholder para anuncios sem foto
│   └── hero-bg.jpg            # Imagem de fundo do hero (home)
├── favicon.ico                # Favicon principal
├── apple-touch-icon.png       # Icone iOS
├── manifest.json              # PWA manifest (futuro)
└── robots.txt                 # SEO - regras de crawler
```

## Logos disponiveis
Os logos originais da cliente estao na raiz do projeto:
- `6106d1d5-...png` → renomear para `logo-dark.png`
- `ce96abd8-...png` → renomear para `logo-light.png`

## Paleta de cores (extraida dos logos)
- **Dourado:** principal da marca (gradiente)
- **Azul marinho escuro:** fundo da versao dark
- **Rosa claro / off-white:** fundo da versao light
- **Texto:** usar cores neutras (branco no dark, cinza escuro no light)

## Nota
Imagens de anuncios NAO ficam aqui. Elas vao para o Supabase Storage e sao referenciadas por URL.

---
## Changelog
- [2026-03-30] - Context criado
