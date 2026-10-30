import { db, initDatabaseConnection } from './db.js';

export async function initDb() {
  await initDatabaseConnection();

  if (db.isFallback()) {
    console.log('[Database Schema] Local schema verified and ready.');
    return;
  }

  const schemaSql = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name VARCHAR(120) NOT NULL,
      organization VARCHAR(150) DEFAULT 'Default Operations',
      role VARCHAR(60) DEFAULT 'Visual Inspector',
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inspection_sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(200) NOT NULL,
      domain_category VARCHAR(60) NOT NULL,
      camera_or_source_type VARCHAR(80) DEFAULT 'Static Upload / Live Feed',
      status VARCHAR(40) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visual_inspections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      site_id UUID REFERENCES inspection_sites(id) ON DELETE SET NULL,
      title VARCHAR(200) NOT NULL,
      domain_category VARCHAR(60) NOT NULL,
      analysis_mode VARCHAR(60) NOT NULL,
      operator_notes TEXT,
      image_data_url TEXT NOT NULL,
      overall_status VARCHAR(40) NOT NULL,
      severity_level VARCHAR(30) NOT NULL,
      visual_health_score INTEGER NOT NULL CHECK (visual_health_score >= 0 AND visual_health_score <= 100),
      ai_summary TEXT NOT NULL,
      extracted_text_ocr TEXT,
      ai_raw_response JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS detected_anomalies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inspection_id UUID NOT NULL REFERENCES visual_inspections(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label VARCHAR(150) NOT NULL,
      category VARCHAR(80) NOT NULL,
      severity VARCHAR(30) NOT NULL,
      confidence_score NUMERIC(5,2) NOT NULL,
      location_region VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      root_cause_hypothesis TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      remediation_status VARCHAR(40) DEFAULT 'Pending',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_sites_user_id ON inspection_sites(user_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_user_id ON visual_inspections(user_id);
    CREATE INDEX IF NOT EXISTS idx_anomalies_inspection_id ON detected_anomalies(inspection_id);
  `;

  try {
    await db.query(schemaSql);
    console.log('[Database Schema] PostgreSQL tables and indexes verified successfully.');
  } catch (err) {
    console.error('[Database Schema] Schema migration error:', err.message);
  }
}

