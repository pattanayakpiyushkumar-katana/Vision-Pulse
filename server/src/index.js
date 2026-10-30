import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from server/.env or root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { initDb } from './config/initDb.js';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { updateAnomalyStatusSchema } from './validators/schemas.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);
    // Allow localhost/127.0.0.1 on any port in development
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    if (origin === CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly permissive CORS
  },
  credentials: true
}));

// Payload Limits (§18): 12mb for base64 image data
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'VisionPulse AI Server',
    database: db.isFallback() ? 'local_resilient_store' : 'postgresql',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_ai_studio_gemini_api_key'),
    timestamp: new Date().toISOString()
  });
});

// Direct route for /api/anomalies/:id/status (§12 specification)
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

// Application Routes (§6 & §12)
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized Error Handling (§18)
app.use(errorHandler);

// Server startup with automated DB initialization (§10)
async function startServer() {
  try {
    console.log('----------------------------------------------------');
    console.log('⚡ Starting VisionPulse AI Engine...');
    console.log('----------------------------------------------------');

    await initDb();

    app.listen(PORT, () => {
      console.log(`[VisionPulse API] Running at: http://localhost:${PORT}`);
      console.log(`[VisionPulse API] Health status: http://localhost:${PORT}/api/health`);
      console.log('----------------------------------------------------');
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

startServer();

