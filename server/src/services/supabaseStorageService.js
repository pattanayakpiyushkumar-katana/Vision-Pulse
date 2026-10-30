import { supabaseAdmin, isSupabaseConfigured } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'inspection-assets';
let bucketVerified = false;

async function ensureInspectionBucket() {
  if (bucketVerified || !supabaseAdmin) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 12582912, // 12MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      });
      console.log(`[Supabase Storage] Created bucket: "${BUCKET_NAME}"`);
    }
    bucketVerified = true;
  } catch (err) {
    console.warn(`[Supabase Storage] Bucket verification notice:`, err.message);
  }
}

/**
 * Uploads a base64 data URL to Supabase Storage and returns a public URL.
 * Falls back to returning the base64 URL if Supabase is not configured.
 */
export async function uploadInspectionImage({ base64DataUrl, userId, inspectionId }) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return base64DataUrl; // Store inline if Supabase Storage is not configured
  }

  try {
    await ensureInspectionBucket();

    // Parse base64 header
    const match = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!match) {
      return base64DataUrl;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const ext = mimeType.split('/')[1]?.replace('+xml', '') || 'jpg';
    const filePath = `${userId || 'public'}/${inspectionId || uuidv4()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.warn('[Supabase Storage] Upload error:', uploadError.message);
      return base64DataUrl;
    }

    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data?.publicUrl || base64DataUrl;
  } catch (err) {
    console.warn('[Supabase Storage] Unexpected error, retaining inline data URL:', err.message);
    return base64DataUrl;
  }
}

