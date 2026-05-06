-- Tabela de investimentos em tráfego pago (Meta Ads, Google Ads, etc.)
CREATE TABLE IF NOT EXISTS meta_spend (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  data        DATE        NOT NULL,
  plataforma  TEXT        NOT NULL DEFAULT 'meta',
  valor       DECIMAL(10,2) NOT NULL,
  visitantes  INTEGER     NOT NULL DEFAULT 0,
  descricao   TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meta_spend ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON meta_spend FOR ALL TO service_role USING (true);
