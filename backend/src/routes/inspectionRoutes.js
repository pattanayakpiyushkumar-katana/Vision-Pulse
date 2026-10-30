import { Router } from 'express';
import db from '../config/db.js';
import {
  analyzeInspectionSchema,
  updateAnomalyStatusSchema,
  chatSchema
} from '../validators/schemas.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { analyzeVisualPayload, answerInspectionQuestion } from '../services/geminiVisionService.js';
import { uploadInspectionImage } from '../services/supabaseStorageService.js';

const router = Router();

router.use(authenticateToken);

// POST /api/inspections/analyze
router.post('/analyze', async (req, res, next) => {
  try {
    const validatedData = analyzeInspectionSchema.parse(req.body);
    const { site_id, title, domain_category, analysis_mode, operator_notes, image_data_url } = validatedData;

    // Verify site ownership if provided
    if (site_id) {
      const siteCheck = await db.query(
        'SELECT id FROM inspection_sites WHERE id = $1 AND user_id = $2',
        [site_id, req.user.id]
      );
      if (siteCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Referenced inspection site does not exist or access is denied' });
      }
    }

    // Call Gemini Multimodal Vision Service
    const aiResult = await analyzeVisualPayload({
      image_data_url,
      title,
      domain_category,
      analysis_mode,
      operator_notes
    });

    // Upload image to Supabase Storage if configured
    let finalImageUrl = image_data_url;
    try {
      finalImageUrl = await uploadInspectionImage({
        base64DataUrl: image_data_url,
        userId: req.user.id
      });
    } catch (storageErr) {
      console.warn('[Supabase Storage Hook] Storage upload skipped, using data URL:', storageErr.message);
    }

    // Transactional Save in Database
    const client = await db.connect();
    let inspectionRecord;
    let savedAnomalies = [];

    try {
      if (client.query) {
        await client.query('BEGIN');
      }

      const insertInspectionQuery = `
        INSERT INTO visual_inspections (
          user_id, site_id, title, domain_category, analysis_mode, operator_notes,
          image_data_url, overall_status, severity_level, visual_health_score,
          ai_summary, extracted_text_ocr, ai_raw_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const inspectionParams = [
        req.user.id,
        site_id || null,
        title,
        domain_category,
        analysis_mode,
        operator_notes || '',
        finalImageUrl,
        aiResult.overall_status || 'Pass',
        aiResult.severity_level || 'Low',
        Math.max(0, Math.min(100, Math.round(aiResult.visual_health_score ?? 85))),
        aiResult.ai_summary || 'Visual inspection complete.',
        aiResult.extracted_text_ocr || '',
        JSON.stringify(aiResult)
      ];

      const inspRes = await client.query(insertInspectionQuery, inspectionParams);
      inspectionRecord = inspRes.rows[0];

      // Insert child anomalies
      const rawAnomalies = Array.isArray(aiResult.anomalies) ? aiResult.anomalies : [];
      for (const a of rawAnomalies) {
        const insertAnomalyQuery = `
          INSERT INTO detected_anomalies (
            inspection_id, user_id, label, category, severity,
            confidence_score, location_region, description,
            root_cause_hypothesis, recommended_action, remediation_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        const anomalyParams = [
          inspectionRecord.id,
          req.user.id,
          a.label || 'Unlabeled Anomaly',
          a.category || 'Visual Defect',
          a.severity || 'Medium',
          Math.min(100, Math.max(0, Number(a.confidence_score) || 85.0)),
          a.location_region || 'Visual Center',
          a.description || 'Defect detected in optical analysis.',
          a.root_cause_hypothesis || 'Underlying mechanical or thermal factor.',
          a.recommended_action || 'Inspect physical site and perform verification.',
          'Pending'
        ];

        const anomRes = await client.query(insertAnomalyQuery, anomalyParams);
        savedAnomalies.push(anomRes.rows[0]);
      }

      if (client.query) {
        await client.query('COMMIT');
      }
    } catch (txError) {
      if (client.query) {
        await client.query('ROLLBACK');
      }
      throw txError;
    } finally {
      if (client.release) client.release();
    }

    res.status(201).json({
      message: 'Visual inspection analysis completed and saved successfully',
      inspection: {
        ...inspectionRecord,
        anomalies: savedAnomalies,
        operational_recommendations: aiResult.operational_recommendations || [],
        compliance_disclaimer: aiResult.compliance_disclaimer || ''
      }
    });

  } catch (err) {
    next(err);
  }
});

// GET /api/inspections (Filterable List)
router.get('/', async (req, res, next) => {
  try {
    const { domain_category, severity_level, site_id, search } = req.query;

    let queryText = `
      SELECT
        v.id, v.user_id, v.site_id, v.title, v.domain_category, v.analysis_mode,
        v.overall_status, v.severity_level, v.visual_health_score, v.ai_summary,
        v.created_at,
        s.name AS site_name, s.location AS site_location,
        COUNT(a.id) AS anomaly_count
      FROM visual_inspections v
      LEFT JOIN inspection_sites s ON v.site_id = s.id
      LEFT JOIN detected_anomalies a ON v.id = a.inspection_id
      WHERE v.user_id = $1
    `;

    const params = [req.user.id];
    let paramIndex = 2;

    if (domain_category && domain_category !== 'ALL') {
      queryText += ` AND v.domain_category = $${paramIndex++}`;
      params.push(domain_category);
    }

    if (severity_level && severity_level !== 'ALL') {
      queryText += ` AND v.severity_level = $${paramIndex++}`;
      params.push(severity_level);
    }

    if (site_id && site_id !== 'ALL') {
      queryText += ` AND v.site_id = $${paramIndex++}`;
      params.push(site_id);
    }

    if (search && search.trim().length > 0) {
      queryText += ` AND (v.title ILIKE $${paramIndex} OR v.ai_summary ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    queryText += `
      GROUP BY v.id, s.name, s.location
      ORDER BY v.created_at DESC
    `;

    const result = await db.query(queryText, params);
    res.json({ inspections: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/inspections/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const inspectionRes = await db.query(
      `SELECT
        v.*,
        s.name AS site_name, s.location AS site_location
       FROM visual_inspections v
       LEFT JOIN inspection_sites s ON v.site_id = s.id
       WHERE v.id = $1 AND v.user_id = $2`,
      [id, req.user.id]
    );

    if (inspectionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection report not found or access denied' });
    }

    const inspection = inspectionRes.rows[0];

    const anomaliesRes = await db.query(
      `SELECT * FROM detected_anomalies
       WHERE inspection_id = $1 AND user_id = $2
       ORDER BY created_at ASC`,
      [id, req.user.id]
    );

    let rawAi = inspection.ai_raw_response;
    if (typeof rawAi === 'string') {
      try { rawAi = JSON.parse(rawAi); } catch { rawAi = {}; }
    }

    res.json({
      inspection: {
        ...inspection,
        anomalies: anomaliesRes.rows,
        operational_recommendations: rawAi?.operational_recommendations || [],
        compliance_disclaimer: rawAi?.compliance_disclaimer || ''
      }
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/anomalies/:id/status
router.patch('/anomalies/:id/status', async (req, res, next) => {
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

// POST /api/inspections/:id/chat
router.post('/:id/chat', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = chatSchema.parse(req.body);
    const chatHistory = Array.isArray(req.body.history) ? req.body.history : [];

    const inspRes = await db.query(
      'SELECT * FROM visual_inspections WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (inspRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inspection report not found or access denied' });
    }

    const inspection = inspRes.rows[0];

    const anomaliesRes = await db.query(
      'SELECT * FROM detected_anomalies WHERE inspection_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    const answer = await answerInspectionQuestion({
      inspection,
      anomalies: anomaliesRes.rows,
      chatHistory,
      userMessage: message
    });

    res.json({
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export default router;

