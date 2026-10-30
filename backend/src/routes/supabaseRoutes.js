import { Router } from 'express';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabaseClient.js';
import db from '../config/db.js';

const router = Router();

// GET /api/supabase/status
router.get('/status', async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key');
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_supabase_service_role_key');
  const hasDbUrl = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.com'));

  let storageActive = false;
  let bucketsList = [];
  let storageMessage = 'Not tested';

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (!error) {
        storageActive = true;
        bucketsList = data.map(b => b.name);
        storageMessage = 'Connected and authenticated';
      } else {
        storageMessage = error.message;
      }
    } catch (err) {
      storageMessage = err.message;
    }
  }

  res.json({
    supabase_configured: isSupabaseConfigured,
    supabase_url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'Not configured',
    has_anon_key: hasAnonKey,
    has_service_role_key: hasServiceKey,
    has_supabase_postgres_url: hasDbUrl,
    storage: {
      active: storageActive,
      buckets: bucketsList,
      message: storageMessage
    },
    database_mode: db.isFallback() ? 'local_resilient_store' : 'postgresql',
    render_environment: Boolean(process.env.RENDER)
  });
});

export default router;

