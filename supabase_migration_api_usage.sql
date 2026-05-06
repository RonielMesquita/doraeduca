-- Tabela de rastreamento de uso e custo das APIs
CREATE TABLE IF NOT EXISTS api_usage (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID,
  provider        TEXT          NOT NULL, -- 'anthropic' | 'openai'
  model           TEXT          NOT NULL,
  tokens_input    INTEGER       NOT NULL DEFAULT 0,
  tokens_output   INTEGER       NOT NULL DEFAULT 0,
  images          INTEGER       NOT NULL DEFAULT 0,
  cost_usd        DECIMAL(10,6) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage (created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage (provider);

ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON api_usage FOR ALL TO service_role USING (true);
