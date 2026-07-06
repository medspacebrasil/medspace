---
pdf_options:
  format: A4
  margin: 20mm 18mm
stylesheet_encoding: utf-8
css: |
  table { page-break-inside: avoid; width: 100%; }
  tr, h2, h3 { page-break-inside: avoid; }
  h2, h3 { page-break-after: avoid; }
  code { white-space: pre-wrap; }
---

# MedSpace — Guia de Execução das Campanhas (Google + Meta)

**Montagem: 05/07/2026 · Lançamento: 06/07/2026**
**Verba total: R$ 1.500/mês (R$ 50/dia) · 3 campanhas**

> Guia copia-e-cola para montar as campanhas nos painéis. Complementa
> [PLANO_GOOGLE_ADS.md](PLANO_GOOGLE_ADS.md) e [CAMPANHA_LANCAMENTO.md](CAMPANHA_LANCAMENTO.md).
> Rastreamento de conversão já instalado no site (Google Ads `AW-18151653017`:
> "Clique WhatsApp" e "Cadastro").

---

## Estratégia

Como a oferta hoje é só **Brasília** (12 salas publicadas; SP 2, BH 1, Goiânia 1),
não faz sentido mandar médico para cidade sem sala. Então:

- **Demanda (médicos)** roda **só em Brasília**, nos dois canais — isso vira um
  **head-to-head Google × Meta**: mesma cidade, mesmo lado, mesma verba
  (R$ 15/dia cada). Responde de forma limpa qual canal capta médico melhor.
- **Oferta (clínicas)** roda no **Meta**, nas 4 cidades-alvo — é o gargalo real
  (só Brasília tem sala), então leva a maior fatia (R$ 20/dia).
- **Google não roda captação de clínica.** "Anunciar consultório" tem volume
  quase zero no Search, e Demand Gen com verba baixa entrega mal. Meta cobre a
  oferta melhor.

| # | Campanha | Canal / formato | Lado | Cidade(s) | Verba/dia | /mês |
|---|---|---|---|---|---|---|
| 1 | Médicos — Search | Google Search | Demanda | Brasília | R$ 15 | R$ 450 |
| 2 | Clínicas — Lead Form | Meta (IG/FB) | Oferta | 4 cidades | R$ 20 | R$ 600 |
| 3 | Médicos — Interesse | Meta (IG/FB) | Demanda | Brasília | R$ 15 | R$ 450 |
| | **Total** | | | | **R$ 50** | **R$ 1.500** |

**Gatilho de expansão:** quando SP, BH ou Goiânia cruzarem ~5 salas publicadas,
adiciona a cidade nas campanhas de médico (Google e Meta).

**Migração de verba:** em 2–3 semanas, com custo por lead medido, movemos verba
para o canal que vencer o head-to-head de médico, e reforçamos a oferta se ela
continuar sendo o gargalo.

---

## Como deixar pronto hoje e ligar amanhã

Monta as 3 campanhas **pausadas** hoje. Amanhã (06/07), revisão final e
**ativa**. Não use "data de início agendada" — deixar pausado e ligar na mão é
mais seguro (evita gasto acidental à noite).

---

# CAMPANHA 1 — Médicos / Google Search · Brasília

**Objetivo:** Leads → tipo **Pesquisa (Search)**. Se o fluxo de meta atrapalhar,
escolha "Criar campanha sem orientação de meta"; o que importa é o tipo Search.

### Definições
| Campo | Valor |
|---|---|
| Redes | **Só Rede de Pesquisa.** Desmarque "Rede de Display" e "Parceiros de pesquisa". |
| Locais | **Brasília** — segmentação **"Presença: pessoas que estão no local"** (não "interesse"). |
| Idioma | Português |
| Orçamento | **R$ 15/dia** |
| Lances | **Maximizar cliques** com **CPC máx. R$ 3,00** nas 2 primeiras semanas. Depois de ~15–30 conversões, trocar para **Maximizar conversões**. |
| Meta de conversão | **Clique WhatsApp** |
| Horário | Todos os dias, **7h–22h** |

### Grupos de anúncios e palavras-chave (Correspondência de FRASE)

Cole em **correspondência de frase** (cada termo entre aspas `"assim"`). Como o
geo já é Brasília, o grupo genérico só aparece para quem está em Brasília.

**Grupo 1 — Sala (genérico)**
```
"alugar consultorio medico"
"consultorio medico para alugar"
"aluguel de consultorio medico"
"sublocacao consultorio medico"
"sublocar consultorio medico"
"consultorio compartilhado"
"consultorio por hora"
"consultorio medico por hora"
"coworking medico"
"sala medica para alugar"
"consultorio para sublocar"
"consultorio meio periodo"
```

**Grupo 2 — Brasília (com nome da cidade/bairros)**
```
"alugar consultorio brasilia"
"consultorio medico brasilia"
"sublocacao consultorio brasilia"
"consultorio para alugar df"
"consultorio medico asa sul"
"consultorio medico asa norte"
"consultorio medico aguas claras"
"consultorio medico setor noroeste"
```

### Palavras-chave negativas (nível campanha)
```
curso, faculdade, graduacao, residencia medica, concurso, vaga, emprego,
carreira, salario, quanto ganha, marcar consulta, agendar consulta, clinica
popular, consulta online, telemedicina, comprar consultorio, comprar clinica,
vender consultorio, vender clinica, imovel comercial, imovel residencial, casa,
apartamento, aluguel barato, imobiliaria, financiamento, gratis, de graca
```

> **Negativas de intenção de PACIENTE** (add também — evita que buscas de
> paciente por atendimento acionem o anúncio; o Grupo 2 tem termos de bairro
> que atraem paciente). Não incluir nomes de especialidade aqui (bloquearia
> médico buscando "consultório [especialidade]"):
```
paciente, atendimento, convenio, plano de saude, unimed, amil, bradesco saude,
sulamerica, sus, agendar, agendamento, marcar horario, telefone, endereco,
perto de mim, exame, hospital, pronto socorro
```
> Na 1ª manhã, abra o **relatório de Termos de Pesquisa** e negative o que
> aparecer de paciente/irrelevante.

### Landing pages (URL final)
- Grupo 1 (genérico) → `https://medspacebrasil.com.br/anuncios?city=Bras%C3%ADlia`
- Grupo 2 (Brasília) → `https://medspacebrasil.com.br/anuncios?city=Bras%C3%ADlia`

> ✅ Verificado no código: `/anuncios?city=` filtra por cidade (match exato com
> acento). O médico cai direto na lista de Brasília.

### Anúncio Responsivo de Pesquisa (RSA)

**Títulos** (máx. 30 caracteres cada):
```
Consultório em Brasília
Alugar Consultório Médico
Consultório para Sublocar
Salas por Hora ou Diária
Sem Anuidade, Sem Corretor
Sublocação Direta de Salas
Contato Direto no WhatsApp
Consultório Equipado
Coworking Médico em Brasília
Consultórios na Asa Sul
Alugue sua Sala Médica
MedSpace — Salas Médicas
```
> Fixe (📌 "pin") "Consultório em Brasília" na Posição 1.

**Descrições** (máx. 90 caracteres cada):
```
Encontre consultórios em Brasília para alugar por hora, diária ou mês.
Sublocação direta com clínicas. Sem anuidade, sem corretor. Fale no WhatsApp.
Salas equipadas para atender seus pacientes. Escolha o bairro e a especialidade.
Cadastre-se grátis e fale direto com a clínica. Comece a atender hoje.
```

**Recursos (extensões):**
- **Sitelinks:** `Ver consultórios` (/anuncios) · `Para médicos` (/para-medicos) · `Aparelhos` (/aparelhos) · `Como funciona` (/como-funciona)
- **Frases de destaque:** `Sem anuidade` · `Contato direto` · `Sem corretor` · `Por hora ou diária` · `Cadastro grátis`
- **Snippet estruturado** (cabeçalho "Bairros"): Asa Sul, Asa Norte, Águas Claras, Noroeste, Sudoeste

---

# CAMPANHA 2 — Clínicas / Meta Lead Form · 4 cidades

**Objetivo:** **Leads** → método **Formulários instantâneos** (lead form nativo;
coletado dentro do IG/FB, não depende do site nem do Pixel para rodar).

### Conjunto de anúncios
| Campo | Valor |
|---|---|
| Local | Brasília, Goiânia, São Paulo, Belo Horizonte |
| Idade | 28–60 |
| Segmentação detalhada | Interesses: *Consultório médico, Clínica, Prática médica, Empreendedorismo, Pequenas e médias empresas, Gestão de clínicas*. Ative **Advantage detailed targeting**. |
| Posicionamentos | **Advantage+ (automáticos)** |
| Orçamento | **R$ 20/dia** |
| Otimização | Leads |

### Criativo
Imagem/vídeo (a Cejana fornece): **sala/consultório vazio e bem cuidado** ou
clínica com salas. Formatos **1:1** (feed) e **4:5** (stories/reels). Sem foto de
paciente. Logo MedSpace no canto.

**Texto principal:**
```
Sua clínica tem sala ou consultório parado entre atendimentos?

Transforme esse espaço ocioso em renda extra. No MedSpace você anuncia
gratuitamente e recebe o contato direto de médicos que procuram sala para
sublocar — sem comissão sobre suas negociações.

Cadastre-se em 2 minutos. 100% gratuito durante o lançamento.
```
**Título:** `Anuncie sua sala e gere renda extra`
**Descrição:** `Grátis no lançamento. Sem comissão.`
**CTA:** `Cadastre-se`

### Formulário instantâneo
- **Título:** Anuncie sua clínica no MedSpace
- **Introdução:** Preencha e nossa equipe entra em contato pelo WhatsApp para publicar seu espaço gratuitamente.
- **Perguntas:** Nome completo · E-mail · Telefone (WhatsApp) · Cidade
- **Personalizadas:**
  - "O que você tem para anunciar?" → Sala/consultório · Coworking médico · Aparelho médico · Mais de um
  - "Você já tem o espaço disponível?" → Sim, agora · Em breve
- **Política de privacidade:** `https://medspacebrasil.com.br/politica-de-privacidade`
- **Tela final:** "Recebemos seu contato! Nossa equipe fala com você pelo WhatsApp. Quer adiantar? Cadastre-se em medspacebrasil.com.br/cadastro" → botão para `https://medspacebrasil.com.br/cadastro`

---

# CAMPANHA 3 — Médicos / Meta Interesse · Brasília

**Objetivo:** **Tráfego** (ou Leads) → site. Head-to-head com a Campanha 1
(mesma cidade, mesma verba, canal diferente).

| Campo | Valor |
|---|---|
| Local | **Brasília** |
| Idade | 25–45 |
| Segmentação | Interesses: *Medicina, Profissionais de saúde*; cargos: Médico, Médica. |
| Posicionamentos | Advantage+ |
| Orçamento | **R$ 15/dia** |
| Otimização | Cliques no link / Visualizações da página de destino |
| Destino | `https://medspacebrasil.com.br/anuncios?city=Bras%C3%ADlia` |

**Texto principal:**
```
Médico(a) em Brasília?

Encontre consultório para alugar por hora, diária ou mês — sem anuidade e sem
corretor. Fale direto com a clínica pelo WhatsApp e escolha onde atender.
```
**Título:** `Consultórios em Brasília para alugar`
**Descrição:** `Por hora, diária ou mês. Sem burocracia.`
**CTA:** `Saiba mais`

---

## Checklist de lançamento (amanhã, 06/07)

- [ ] Deploy do site no ar (tracking `AW-` ativo — testar com Google Tag Assistant)
- [ ] Meta: Pixel criado e `NEXT_PUBLIC_FB_PIXEL_ID` na Vercel (Campanhas 2 e 3 rodam sem ele, mas remarketing/medição no site dependem)
- [ ] Google Ads: forma de pagamento confirmada
- [ ] Meta: forma de pagamento confirmada
- [ ] Revisar as 3 campanhas pausadas
- [ ] **Ativar** as 3
- [ ] Cejana com 1h/dia reservada para responder leads (WhatsApp + lead forms)

## Acompanhamento (revisão semanal)

| Métrica | Meta |
|---|---|
| Custo por Clique WhatsApp — Google (médico BSB) | até R$ 15 |
| Custo por Clique WhatsApp — Meta (médico BSB) | até R$ 15 |
| Custo por Lead de clínica (Meta) | até R$ 30 |
| Salas publicadas em SP, BH e Goiânia | subir para ≥ 5 (destrava demanda) |
| Vencedor do head-to-head Google × Meta (médico) | decidir migração de verba |

---

## Changelog
- [2026-07-05] - Guia de execução. Estrutura de 3 campanhas: demanda de médico
  só em Brasília (head-to-head Google × Meta), oferta de clínica no Meta em 4
  cidades. Google não roda captação de clínica (sem volume de Search).
