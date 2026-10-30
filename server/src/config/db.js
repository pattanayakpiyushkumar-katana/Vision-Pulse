import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let poolInstance = null;
let useFallback = false;

// Embedded fallback store file path
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'visionpulse_store.json');

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      inspection_sites: [],
      visual_inspections: [],
      detected_anomalies: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readStore() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], inspection_sites: [], visual_inspections: [], detected_anomalies: [] };
  }
}

function writeStore(data) {
  ensureDataStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Resilient query executor that emulates PostgreSQL when Postgres is offline
function executeFallbackQuery(sql, params = []) {
  const store = readStore();
  const trimmed = sql.trim().replace(/\s+/g, ' ');

  // Transaction control
  if (/^(BEGIN|COMMIT|ROLLBACK)/i.test(trimmed)) {
    return { rows: [], rowCount: 0 };
  }

  // 1. SELECT 1 or health check
  if (/^SELECT\s+1/i.test(trimmed)) {
    return { rows: [{ '?column?': 1 }], rowCount: 1 };
  }

  // 2. USERS Queries
  if (/INSERT\s+INTO\s+users/i.test(trimmed)) {
    const [full_name, organization, role, email, password_hash] = params;
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('A user with this email already exists');
      err.code = '23505';
      throw err;
    }
    const newUser = {
      id: uuidv4(),
      full_name,
      organization: organization || 'Default Operations',
      role: role || 'Visual Inspector',
      email: email.toLowerCase(),
      password_hash,
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    writeStore(store);
    return {
      rows: [{
        id: newUser.id,
        full_name: newUser.full_name,
        organization: newUser.organization,
        role: newUser.role,
        email: newUser.email,
        created_at: newUser.created_at
      }],
      rowCount: 1
    };
  }

  if (/FROM\s+users\s+WHERE\s+email\s*=/i.test(trimmed)) {
    const email = params[0];
    const user = store.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (/FROM\s+users\s+WHERE\s+id\s*=/i.test(trimmed)) {
    const id = params[0];
    const user = store.users.find(u => u.id === id);
    if (user) {
      const { password_hash, ...safeUser } = user;
      return { rows: [safeUser], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 3. SITES Queries
  if (/INSERT\s+INTO\s+inspection_sites/i.test(trimmed)) {
    const [user_id, name, location, domain_category, camera_or_source_type, status] = params;
    const newSite = {
      id: uuidv4(),
      user_id,
      name,
      location,
      domain_category,
      camera_or_source_type: camera_or_source_type || 'Static Upload / Live Feed',
      status: status || 'Active',
      created_at: new Date().toISOString()
    };
    store.inspection_sites.push(newSite);
    writeStore(store);
    return { rows: [newSite], rowCount: 1 };
  }

  // Verify site by ID and user_id
  if (/FROM\s+inspection_sites\s+WHERE\s+id\s*=\s*\$1\s+AND\s+user_id\s*=\s*\$2/i.test(trimmed)) {
    const [id, user_id] = params;
    const site = store.inspection_sites.find(s => s.id === id && s.user_id === user_id);
    return { rows: site ? [site] : [], rowCount: site ? 1 : 0 };
  }

  if (/FROM\s+inspection_sites\s+WHERE\s+user_id\s*=/i.test(trimmed)) {
    const user_id = params[0];
    const sites = store.inspection_sites.filter(s => s.user_id === user_id);
    sites.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: sites, rowCount: sites.length };
  }

  if (/DELETE\s+FROM\s+inspection_sites\s+WHERE\s+id\s*=\s*\$1\s+AND\s+user_id\s*=\s*\$2/i.test(trimmed)) {
    const [id, user_id] = params;
    const initialLen = store.inspection_sites.length;
    store.inspection_sites = store.inspection_sites.filter(s => !(s.id === id && s.user_id === user_id));
    const deleted = initialLen - store.inspection_sites.length;
    if (deleted > 0) writeStore(store);
    return { rows: [], rowCount: deleted };
  }

  // 4. INSPECTIONS Queries
  if (/INSERT\s+INTO\s+visual_inspections/i.test(trimmed)) {
    const [
      user_id, site_id, title, domain_category, analysis_mode, operator_notes,
      image_data_url, overall_status, severity_level, visual_health_score,
      ai_summary, extracted_text_ocr, ai_raw_response
    ] = params;

    const newInspection = {
      id: uuidv4(),
      user_id,
      site_id: site_id || null,
      title,
      domain_category,
      analysis_mode,
      operator_notes: operator_notes || '',
      image_data_url,
      overall_status,
      severity_level,
      visual_health_score: Number(visual_health_score),
      ai_summary,
      extracted_text_ocr: extracted_text_ocr || '',
      ai_raw_response: typeof ai_raw_response === 'string' ? JSON.parse(ai_raw_response) : ai_raw_response,
      created_at: new Date().toISOString()
    };
    store.visual_inspections.push(newInspection);
    writeStore(store);
    return { rows: [newInspection], rowCount: 1 };
  }

  if (/INSERT\s+INTO\s+detected_anomalies/i.test(trimmed)) {
    const [
      inspection_id, user_id, label, category, severity, confidence_score,
      location_region, description, root_cause_hypothesis, recommended_action,
      remediation_status
    ] = params;

    const newAnomaly = {
      id: uuidv4(),
      inspection_id,
      user_id,
      label,
      category,
      severity,
      confidence_score: Number(confidence_score),
      location_region,
      description,
      root_cause_hypothesis,
      recommended_action,
      remediation_status: remediation_status || 'Pending',
      created_at: new Date().toISOString()
    };
    store.detected_anomalies.push(newAnomaly);
    writeStore(store);
    return { rows: [newAnomaly], rowCount: 1 };
  }

  if (/UPDATE\s+detected_anomalies\s+SET\s+remediation_status\s*=\s*\$1\s+WHERE\s+id\s*=\s*\$2\s+AND\s+user_id\s*=\s*\$3/i.test(trimmed)) {
    const [remediation_status, id, user_id] = params;
    const anomaly = store.detected_anomalies.find(a => a.id === id && a.user_id === user_id);
    if (anomaly) {
      anomaly.remediation_status = remediation_status;
      writeStore(store);
      return { rows: [anomaly], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 5. GET single inspection (with or without JOIN)
  if (/FROM\s+visual_inspections.*WHERE.*id\s*=\s*\$1\s+AND.*user_id\s*=\s*\$2/i.test(trimmed)) {
    const [id, user_id] = params;
    const inspection = store.visual_inspections.find(v => v.id === id && v.user_id === user_id);
    if (!inspection) return { rows: [], rowCount: 0 };
    const site = inspection.site_id ? store.inspection_sites.find(s => s.id === inspection.site_id) : null;
    return {
      rows: [{
        ...inspection,
        site_name: site ? site.name : null,
        site_location: site ? site.location : null
      }],
      rowCount: 1
    };
  }

  // 6. GET anomalies for an inspection or user
  if (/FROM\s+detected_anomalies\s+WHERE\s+inspection_id\s*=\s*\$1\s+AND\s+user_id\s*=\s*\$2/i.test(trimmed)) {
    const [inspection_id, user_id] = params;
    const anomalies = store.detected_anomalies.filter(a => a.inspection_id === inspection_id && a.user_id === user_id);
    anomalies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { rows: anomalies, rowCount: anomalies.length };
  }

  if (/FROM\s+detected_anomalies\s+WHERE\s+user_id\s*=\s*\$1/i.test(trimmed)) {
    const [user_id] = params;
    const anomalies = store.detected_anomalies.filter(a => a.user_id === user_id);
    anomalies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return { rows: anomalies, rowCount: anomalies.length };
  }

  // 7. GET list of inspections (filterable)
  if (/FROM\s+visual_inspections.*WHERE.*user_id\s*=\s*\$1/i.test(trimmed)) {
    const user_id = params[0];
    let list = store.visual_inspections.filter(v => v.user_id === user_id);

    // Filter by domain_category if present in params
    if (/domain_category\s*=/i.test(trimmed)) {
      const idx = params.findIndex((p, i) => i > 0 && typeof p === 'string' && ['MANUFACTURING_QC', 'INFRASTRUCTURE_SAFETY', 'WORKPLACE_HSE', 'DOCUMENT_OCR_AUDIT', 'RETAIL_INVENTORY'].includes(p));
      if (idx !== -1) {
        list = list.filter(v => v.domain_category === params[idx]);
      }
    }

    // Filter by severity_level if present
    if (/severity_level\s*=/i.test(trimmed)) {
      const idx = params.findIndex((p, i) => i > 0 && typeof p === 'string' && ['Critical', 'High', 'Medium', 'Low', 'None'].includes(p));
      if (idx !== -1) {
        list = list.filter(v => v.severity_level === params[idx]);
      }
    }

    // Filter by site_id if present
    if (/site_id\s*=/i.test(trimmed)) {
      const idx = params.findIndex((p, i) => i > 0 && typeof p === 'string' && store.inspection_sites.some(s => s.id === p));
      if (idx !== -1) {
        list = list.filter(v => v.site_id === params[idx]);
      }
    }

    // Search query if present
    if (/ILIKE/i.test(trimmed)) {
      const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
      if (searchParam) {
        const query = searchParam.replace(/%/g, '').toLowerCase();
        list = list.filter(v => (v.title && v.title.toLowerCase().includes(query)) || (v.ai_summary && v.ai_summary.toLowerCase().includes(query)));
      }
    }

    // Map site names and anomaly counts
    const mapped = list.map(v => {
      const site = v.site_id ? store.inspection_sites.find(s => s.id === v.site_id) : null;
      const countAnomalies = store.detected_anomalies.filter(a => a.inspection_id === v.id).length;
      return {
        ...v,
        site_name: site ? site.name : null,
        site_location: site ? site.location : null,
        anomaly_count: countAnomalies
      };
    });

    mapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: mapped, rowCount: mapped.length };
  }

  // 8. DASHBOARD STATS
  if (/dashboard/i.test(trimmed) || /COUNT\(\*\).*FROM\s+visual_inspections/i.test(trimmed)) {
    const user_id = params[0];
    const userInspections = store.visual_inspections.filter(v => v.user_id === user_id);
    const userAnomalies = store.detected_anomalies.filter(a => a.user_id === user_id);
    const userSites = store.inspection_sites.filter(s => s.user_id === user_id);

    const totalInspections = userInspections.length;
    const avgScore = totalInspections > 0
      ? Math.round(userInspections.reduce((sum, i) => sum + (i.visual_health_score || 0), 0) / totalInspections)
      : 0;

    const criticalCount = userInspections.filter(i => i.severity_level === 'Critical' || i.severity_level === 'High').length;
    const pendingRemediations = userAnomalies.filter(a => a.remediation_status === 'Pending').length;
    const inProgressRemediations = userAnomalies.filter(a => a.remediation_status === 'In Progress').length;
    const resolvedRemediations = userAnomalies.filter(a => a.remediation_status === 'Resolved').length;

    return {
      rows: [{
        total_inspections: totalInspections,
        total_sites: userSites.length,
        average_health_score: avgScore,
        critical_alerts: criticalCount,
        pending_remediations: pendingRemediations,
        in_progress_remediations: inProgressRemediations,
        resolved_remediations: resolvedRemediations
      }],
      rowCount: 1
    };
  }

  return { rows: [], rowCount: 0 };
}

// Unified Database Adapter Object
export const db = {
  async query(text, params = []) {
    if (useFallback || !poolInstance) {
      return executeFallbackQuery(text, params);
    }
    try {
      return await poolInstance.query(text, params);
    } catch (err) {
      if (!useFallback && (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.message.includes('connect'))) {
        console.warn(`[Database] PostgreSQL disconnected (${err.message}). Seamlessly engaging persistent local store.`);
        useFallback = true;
        return executeFallbackQuery(text, params);
      }
      throw err;
    }
  },

  async connect() {
    if (useFallback || !poolInstance) {
      return {
        query: (text, params) => executeFallbackQuery(text, params),
        release: () => {}
      };
    }
    try {
      return await poolInstance.connect();
    } catch (err) {
      console.warn(`[Database] Postgres client connect failed (${err.message}). Using local store transaction emulator.`);
      useFallback = true;
      return {
        query: (text, params) => executeFallbackQuery(text, params),
        release: () => {}
      };
    }
  },

  isFallback() {
    return useFallback;
  }
};

export async function initDatabaseConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.log('[Database] No DATABASE_URL provided. Activating persistent local file store.');
    useFallback = true;
    ensureDataStore();
    return;
  }

  try {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3500,
      ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : false
    });

    const client = await pool.connect();
    client.release();
    poolInstance = pool;
    useFallback = false;
    console.log(`[Database] Connected successfully to PostgreSQL at ${connectionString.replace(/:[^:@]*@/, ':****@')}`);
  } catch (err) {
    console.warn(`[Database] Notice: PostgreSQL is not reachable at ${connectionString.replace(/:[^:@]*@/, ':****@')} (${err.message}).`);
    console.log('[Database] Activating high-reliability local relational store at server/data/visionpulse_store.json.');
    useFallback = true;
    ensureDataStore();
  }
}

export default db;
