import { supabaseAdmin, isSupabaseConfigured } from '../config/supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'inspection-assets';
let bucketVerified = false;

export async function ensureInspectionBucket() {
  if (bucketVerified || !supabaseAdmin) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 12582912, // 12MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      });
      console.log(`[Supabase Storage] Created bucket: "${BUCKET_NAME}"`);
    }
    bucketVerified = true;
  } catch (err) {
    console.warn(`[Supabase Storage] Bucket verification check:`, err.message);
  }
}

/**
 * Uploads a base64 inspection image directly to the Supabase Storage bucket.
 * Returns the permanent public CDN URL if Supabase is connected, or retains the base64 URL.
 */
export async function uploadInspectionImage({ base64DataUrl, userId, inspectionId }) {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    return base64DataUrl;
  }

  try {
    await ensureInspectionBucket();

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
      console.warn('[Supabase Storage] Upload notice:', uploadError.message);
      return base64DataUrl;
    }

    const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    return data?.publicUrl || base64DataUrl;
  } catch (err) {
    console.warn('[Supabase Storage] Notice: Retaining inline base64 asset:', err.message);
    return base64DataUrl;
  }
}

