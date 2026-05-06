-- Adiciona coluna de avaliação nas atividades
-- rating: 1 = gostei (👍), -1 = não gostei (👎), null = sem avaliação
ALTER TABLE activities ADD COLUMN IF NOT EXISTS rating smallint;
