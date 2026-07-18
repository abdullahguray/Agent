-- Configuration table
CREATE TABLE IF NOT EXISTS configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  topic TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  model TEXT DEFAULT 'meta/llama-3.1-70b-instruct',
  schedule JSONB DEFAULT '{"work_min": 3, "sleep_min": 3}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own configs"
  ON configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own configs"
  ON configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own configs"
  ON configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs"
  ON configurations FOR DELETE
  USING (auth.uid() = user_id);

-- Scraped data table
CREATE TABLE IF NOT EXISTS scraped_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES configurations(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  source_url TEXT,
  raw_json JSONB,
  ai_summary TEXT,
  model_used TEXT,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scraped_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scraped data"
  ON scraped_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM configurations
      WHERE configurations.id = scraped_data.config_id
      AND configurations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert scraped data"
  ON scraped_data FOR INSERT
  WITH CHECK (true);

-- Task logs table
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES configurations(id) ON DELETE CASCADE,
  cycle_number INT DEFAULT 1,
  status TEXT CHECK (status IN ('running', 'scraping', 'sleeping', 'completed', 'error')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  error TEXT,
  items_scraped INT DEFAULT 0,
  tokens_used INT DEFAULT 0
);

ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task logs"
  ON task_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM configurations
      WHERE configurations.id = task_logs.config_id
      AND configurations.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert task logs"
  ON task_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update task logs"
  ON task_logs FOR UPDATE
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scraped_data_config_id ON scraped_data(config_id);
CREATE INDEX IF NOT EXISTS idx_scraped_data_scraped_at ON scraped_data(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_logs_config_id ON task_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_configurations_user_id ON configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_configurations_status ON configurations(status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_configurations_updated_at
  BEFORE UPDATE ON configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
