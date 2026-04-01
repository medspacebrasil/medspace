# Guia de Implementacao - MEDSPACE MVP

## 1) Objetivo do Produto
Construir um MVP de marketplace (estilo OLX) para conectar medicos a clinicas que oferecem salas e equipamentos para uso profissional.

Objetivo de negocio do MVP:
- Validar demanda real com baixo custo e alta velocidade.
- Gerar leads via WhatsApp (sem checkout nesta fase).
- Entregar base tecnica escalavel para Fase 2 sem retrabalho.

Prazo alvo:
- 2 a 4 semanas.

## 2) Escopo do MVP
### Incluido (MVP)
- Cadastro e login de clinicas.
- Painel da clinica para criar, editar e excluir anuncios.
- Cadastro de anuncio com:
  - Nome da clinica.
  - Cidade e bairro.
  - Especialidades permitidas.
  - Tipo de sala.
  - Equipamentos disponiveis.
  - Descricao curta e completa.
  - Upload de fotos.
  - WhatsApp de contato.
- Listagem de anuncios estilo marketplace.
- Filtros por cidade, bairro, especialidade, tipo de sala e equipamentos.
- Pagina individual do anuncio com CTA "Tenho interesse" para WhatsApp.
- Interface responsiva (mobile-first).
- Admin basico para governanca inicial.

### Fora do escopo (agora)
- Checkout/pagamento no site.
- Aplicativo mobile nativo.
- Integracoes complexas (CRM, automacoes avancadas, WhatsApp API oficial).
- Sistema de avaliacoes (estrelas/comentarios).

## 3) Stack Recomendada
### Abordagem recomendada
WordPress com modelagem estruturada:
- Custom Post Type: Clinica.
- Taxonomias: Especialidade, Tipo de Sala, Equipamento, Cidade, Bairro.
- Campos customizados: dados operacionais e midia.
- Tema customizado leve com foco em performance.

### Por que essa stack
- Reduz tempo de entrega para o prazo do MVP.
- Permite painel gerenciavel sem dependencia tecnica intensa.
- Facilita evolucao futura sem reescrever o produto.

## 4) Arquitetura Funcional
### Perfis de usuario
- Visitante/medico: pesquisa e contato com anuncios.
- Clinica anunciante: gerencia anuncios no painel.
- Admin: modera e configura plataforma.

### Fluxo principal
1. Clinica cria conta.
2. Clinica cadastra anuncio.
3. Admin aprova (se aprovacao manual estiver ativa).
4. Medico acessa listagem, aplica filtros e entra no anuncio.
5. Medico clica em "Tenho interesse" e conversa via WhatsApp.

## 5) Modelo de Dados (MVP)
### Entidade principal: Clinica/Anuncio
Campos minimos:
- Titulo do anuncio.
- Nome da clinica.
- Cidade.
- Bairro.
- Especialidades (multivalor).
- Tipo de sala (multivalor opcional).
- Equipamentos (multivalor).
- Descricao breve.
- Descricao completa.
- Galeria de fotos.
- WhatsApp.
- Status do anuncio (rascunho, pendente, publicado).
- Data de criacao/atualizacao.

### Regras importantes
- Minimo de 1 foto para publicar.
- WhatsApp obrigatorio para CTA funcionar.
- Cidade e bairro obrigatorios.
- Especialidade obrigatoria.

## 6) UX e UI (Diretriz Inicial)
Basear visual na marca enviada (MEDSPACE), com experiencia limpa e confiavel para area medica.

### Paginas essenciais
- Home:
  - Hero com proposta de valor.
  - Busca rapida.
  - Destaques de anuncios.
  - CTA para clinicas anunciarem.
- Marketplace:
  - Grid de cards.
  - Filtros visiveis e usaveis no mobile.
  - Paginação.
- Detalhe do anuncio:
  - Galeria.
  - Informacoes completas.
  - Botao WhatsApp com texto pre-preenchido.
- Painel da clinica:
  - Lista de anuncios.
  - Novo anuncio.
  - Edicao/exclusao.
- Admin:
  - Moderacao e configuracoes basicas.

## 7) Roadmap de Execucao (4 semanas)
## Semana 1 - Foundation e Modelagem
- Configurar dominio, hospedagem, SSL, ambiente e repositorio.
- Criar estrutura base do projeto.
- Modelar CPT, taxonomias e campos customizados.
- Implementar autenticacao basica (cadastro/login/logout).

Entregavel:
- Base pronta para cadastros e painel.

## Semana 2 - Painel da Clinica e CRUD
- Construir formulario de criacao de anuncio.
- Implementar upload de imagens com validacoes.
- Implementar editar/excluir anuncio.
- Garantir responsividade completa no formulario.

Entregavel:
- Clinica publica e gerencia anuncios sem suporte tecnico.

## Semana 3 - Marketplace, Filtros e Pagina de Detalhe
- Construir listagem com cards e paginação.
- Implementar filtros combinados (cidade, bairro, especialidade, tipo, equipamento).
- Implementar pagina de detalhe com CTA para WhatsApp.
- Ajustar SEO tecnico por pagina.

Entregavel:
- Fluxo principal de descoberta e contato funcionando ponta a ponta.

## Semana 4 - Admin, QA, Go-live e Suporte Inicial
- Implementar admin basico de moderacao.
- Rodar testes funcionais e responsivos.
- Ajustes de performance e estabilidade.
- Publicar em producao com checklist de lancamento.
- Iniciar suporte assistido pos-lancamento.

Entregavel:
- MVP publicado e monitorado.

## 8) Critérios de Aceite
Checklist minimo para considerar o MVP pronto:
- Clinica consegue se cadastrar e entrar no painel.
- Clinica consegue criar, editar e excluir anuncio.
- Anuncios aparecem corretamente na listagem.
- Filtros retornam resultados coerentes em combinacoes comuns.
- Pagina de detalhe mostra dados completos e fotos.
- Botao "Tenho interesse" abre WhatsApp com mensagem pronta.
- Experiencia mobile funcional nas principais jornadas.
- Sem erros criticos de navegacao no ambiente de producao.

## 9) Plano de Testes
### Testes funcionais
- Cadastro/login.
- CRUD de anuncios.
- Filtros e paginação.
- Abertura correta do WhatsApp.

### Testes de usabilidade
- Testar em mobile real e desktop.
- Verificar clareza de campos e mensagens de erro.

### Testes tecnicos
- Validacao de campos obrigatorios.
- Upload de imagem com limites.
- Smoke test em deploy.

## 10) Riscos e Mitigacao
- Mudanca de escopo durante execucao.
  - Mitigacao: congelar escopo do MVP e registrar mudancas para Fase 2.
- Baixa performance em listagem/filtros.
  - Mitigacao: estrutura de dados correta e consultas otimizadas.
- Base inicial sem anuncios suficientes.
  - Mitigacao: criar dados seed para lancamento e testes.
- Problemas de UX no mobile.
  - Mitigacao: mobile-first desde semana 1.

## 11) Metricas de Validacao do MVP (30 dias)
### Negocio
- Numero de clinicas cadastradas.
- Numero de anuncios publicados.
- Cliques no botao de WhatsApp por anuncio.
- Taxa de conversao visita -> clique em contato.

### Produto
- Tempo medio nas paginas de anuncio.
- Taxa de abandono na listagem.
- Filtros mais usados.

### Operacao
- Uptime.
- Erros criticos em producao.
- Tempo medio de resposta.

## 12) Backlog de Fase 2 (pos-validacao)
- Avaliacoes por estrelas/comentarios.
- Busca textual avancada.
- Destaque pago de anuncios.
- Checkout e repasse (se modelo de monetizacao confirmar necessidade).
- Dashboard de metricas para clinicas.
- Automacoes de notificacao.

## 13) Decisoes de Produto
- Posicionamento inicial: plataforma de conexao, nao de transacao.
- Monetizacao inicial: validar uso antes de cobrar.
- Arquitetura: construir fundacao escalavel ja no MVP.

## 14) Proximo Passo Operacional
Sequencia imediata para iniciar projeto:
1. Validar dominio final e contratar hospedagem.
2. Fechar stack e ferramentas.
3. Configurar ambiente e iniciar Semana 1.
4. Registrar board de tarefas por fase (Kanban) com criterio de aceite por card.

---
Documento pronto para orientar implementacao tecnica e acompanhamento com cliente.
