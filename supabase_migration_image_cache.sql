-- Tabela de cache de imagens educacionais
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS image_cache (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  query       TEXT        NOT NULL UNIQUE,
  tema        TEXT        NOT NULL DEFAULT '',
  serie       TEXT        NOT NULL DEFAULT '',
  estilo      TEXT        NOT NULL DEFAULT 'colorido',
  url         TEXT        NOT NULL,
  thumbnail   TEXT        NOT NULL,
  fonte       TEXT        NOT NULL DEFAULT 'google',
  uso_count   INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_image_cache_tema  ON image_cache (tema);
CREATE INDEX IF NOT EXISTS idx_image_cache_serie ON image_cache (serie);

-- RLS: apenas service role pode escrever; qualquer usuário autenticado pode ler
ALTER TABLE image_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura autenticada" ON image_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Escrita via service role" ON image_cache
  FOR ALL TO service_role USING (true);
