import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { initDb } from './config/initDb.js';
import db from './config/db.js';
import { isSupabaseConfigured } from './config/supabaseClient.js';
import { ensureInspectionBucket } from './services/supabaseStorageService.js';

import authRoutes from './routes/authRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import supabaseRoutes from './routes/supabaseRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { updateAnomalyStatusSchema } from './validators/schemas.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const VERCEL_URL = process.env.VERCEL_URL || '';

// Permissive CORS tailored for Vercel, Render, and local development
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin === CLIENT_URL ||
      origin === VERCEL_URL
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive CORS
  },
  credentials: true
}));

app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Health Check for Render zero-downtime health monitors
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    system: 'VisionPulse AI Backend (Render + Supabase)',
    environment: process.env.NODE_ENV || 'development',
    render_hosted: Boolean(process.env.RENDER),
    supabase_connected: isSupabaseConfigured,
    database_engine: db.isFallback() ? 'local_resilient_store' : 'postgresql',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_ai_studio_gemini_api_key'),
    timestamp: new Date().toISOString()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Direct anomaly status update endpoint
app.patch('/api/anomalies/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remediation_status } = updateAnomalyStatusSchema.parse(req.body);

    const updateRes = await db.query(
      `UPDATE detected_anomalies
       SET remediation_status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [remediation_status, id, req.user.id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Anomaly record not found or access denied' });
    }

    res.json({
      message: 'Remediation status updated successfully',
      anomaly: updateRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/supabase', supabaseRoutes);

app.use(errorHandler);

async function startBackend() {
  try {
    console.log('====================================================');
    console.log('🚀 VisionPulse Backend: Initializing Render + Supabase Engine...');
    console.log('====================================================');

    await initDb();

    if (isSupabaseConfigured) {
      await ensureInspectionBucket();
    }

    app.listen(PORT, () => {
      console.log(`[VisionPulse Backend] Listening on port: ${PORT}`);
      console.log(`[VisionPulse Backend] Health Check URL: http://localhost:${PORT}/api/health`);
      console.log(`[VisionPulse Backend] Supabase Status: http://localhost:${PORT}/api/supabase/status`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('Fatal Backend Initialization Error:', err);
    process.exit(1);
  }
}

startBackend();

