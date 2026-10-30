import { Router } from 'express';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch inspections
    const inspRes = await db.query(
      `SELECT
        id, site_id, title, domain_category, overall_status,
        severity_level, visual_health_score, created_at
       FROM visual_inspections
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const inspections = inspRes.rows;

    // Fetch sites
    const sitesRes = await db.query(
      `SELECT id, name, location, domain_category, status FROM inspection_sites WHERE user_id = $1`,
      [userId]
    );
    const sites = sitesRes.rows;

    // Fetch anomalies
    const anomaliesRes = await db.query(
      `SELECT id, inspection_id, severity, remediation_status FROM detected_anomalies WHERE user_id = $1`,
      [userId]
    );
    const anomalies = anomaliesRes.rows;

    const totalInspections = inspections.length;
    const averageHealthScore = totalInspections > 0
      ? Math.round(inspections.reduce((sum, i) => sum + (Number(i.visual_health_score) || 0), 0) / totalInspections)
      : 100;

    const criticalAlerts = inspections.filter(i => i.severity_level === 'Critical' || i.severity_level === 'High').length;
    const pendingRemediations = anomalies.filter(a => a.remediation_status === 'Pending').length;
    const inProgressRemediations = anomalies.filter(a => a.remediation_status === 'In Progress').length;
    const resolvedRemediations = anomalies.filter(a => a.remediation_status === 'Resolved').length;

    // Domain breakdown
    const domainCounts = {};
    for (const i of inspections) {
      domainCounts[i.domain_category] = (domainCounts[i.domain_category] || 0) + 1;
    }

    // Severity breakdown
    const severityCounts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      None: 0
    };
    for (const i of inspections) {
      if (severityCounts[i.severity_level] !== undefined) {
        severityCounts[i.severity_level]++;
      } else {
        severityCounts[i.severity_level] = 1;
      }
    }

    // Recent 5 inspections with site name
    const recent = inspections.slice(0, 5).map(i => {
      const site = sites.find(s => s.id === i.site_id);
      const countAnomalies = anomalies.filter(a => a.inspection_id === i.id).length;
      return {
        ...i,
        site_name: site ? site.name : 'Ad-Hoc Inspection',
        anomaly_count: countAnomalies
      };
    });

    res.json({
      stats: {
        total_inspections: totalInspections,
        total_sites: sites.length,
        average_health_score: averageHealthScore,
        critical_alerts: criticalAlerts,
        pending_remediations: pendingRemediations,
        in_progress_remediations: inProgressRemediations,
        resolved_remediations: resolvedRemediations
      },
      severity_breakdown: severityCounts,
      domain_breakdown: domainCounts,
      recent_inspections: recent
    });

  } catch (err) {
    next(err);
  }
});

export default router;

