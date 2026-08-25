-- Habilita Row Level Security em todas as tabelas do schema public.
--
-- Contexto: a aplicacao nao usa a Data API (PostgREST) do Supabase. Todo acesso
-- a dados passa pelo Prisma, conectado como o papel dono das tabelas
-- (postgres.<ref>), e o Storage e acessado no servidor com a service role key.
-- Ambos ignoram RLS, entao habilitar RLS sem nenhuma policy nao altera em nada o
-- comportamento do site: apenas fecha a porta da Data API, que hoje esta aberta
-- para qualquer um que tenha a URL do projeto e a chave anonima.
--
-- Sem policies, o resultado e "nega tudo" para papeis anon e authenticated.
-- Se um dia o app passar a usar a Data API, sera preciso escrever policies.
--
-- Como aplicar: Supabase Dashboard > SQL Editor > cole e execute.
-- Idempotente: pode rodar mais de uma vez sem efeito colateral.

ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_specialties  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_equipment    ENABLE ROW LEVEL SECURITY;

-- Tabelas de metricas por anuncio.
ALTER TABLE public.listing_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_daily_stats ENABLE ROW LEVEL SECURITY;

-- Tabelas financeiras da cobranca por publicacao. RLS aqui vale ainda mais:
-- guardam valor, historico de pagamento e payload bruto do gateway.
ALTER TABLE public.publication_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asaas_charges         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asaas_webhook_events  ENABLE ROW LEVEL SECURITY;
