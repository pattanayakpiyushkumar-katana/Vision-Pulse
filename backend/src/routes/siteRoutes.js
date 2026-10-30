import { Router } from 'express';
import db from '../config/db.js';
import { siteSchema } from '../validators/schemas.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

// GET /api/sites
router.get('/', async (req, res, next) => {
  try {
    const sitesRes = await db.query(
      `SELECT id, user_id, name, location, domain_category, camera_or_source_type, status, created_at
       FROM inspection_sites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ sites: sitesRes.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/sites
router.post('/', async (req, res, next) => {
  try {
    const validatedData = siteSchema.parse(req.body);
    const { name, location, domain_category, camera_or_source_type, status } = validatedData;

    const insertRes = await db.query(
      `INSERT INTO inspection_sites (user_id, name, location, domain_category, camera_or_source_type, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, location, domain_category, camera_or_source_type, status, created_at`,
      [req.user.id, name, location, domain_category, camera_or_source_type || 'Static Upload / Live Feed', status || 'Active']
    );

    res.status(201).json({
      message: 'Inspection site registered in database',
      site: insertRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/sites/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleteRes = await db.query(
      `DELETE FROM inspection_sites
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({ error: 'Inspection site not found or access denied' });
    }

    res.json({ message: 'Inspection site deleted successfully', id });
  } catch (err) {
    next(err);
  }
});

export default router;

