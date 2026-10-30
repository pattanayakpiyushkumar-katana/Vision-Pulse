import { z } from 'zod';

export const DOMAIN_CATEGORIES = [
  'MANUFACTURING_QC',
  'INFRASTRUCTURE_SAFETY',
  'WORKPLACE_HSE',
  'DOCUMENT_OCR_AUDIT',
  'RETAIL_INVENTORY'
];

export const ANALYSIS_MODES = [
  'Standard Anomaly Detection',
  'Deep Defect & Root-Cause Audit',
  'Safety & Compliance Check',
  'Document OCR & Verification'
];

export const REMEDIATION_STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const registerSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  organization: z.string().trim().optional().default('Default Operations'),
  role: z.string().trim().optional().default('Visual Inspector'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const siteSchema = z.object({
  name: z.string().trim().min(2, 'Site name must be at least 2 characters'),
  location: z.string().trim().min(2, 'Location must be at least 2 characters'),
  domain_category: z.enum(DOMAIN_CATEGORIES, {
    errorMap: () => ({ message: `Domain category must be one of: ${DOMAIN_CATEGORIES.join(', ')}` })
  }),
  camera_or_source_type: z.string().trim().optional().default('Static Upload / Live Feed'),
  status: z.string().optional().default('Active')
});

export const analyzeInspectionSchema = z.object({
  site_id: z.string().uuid().nullable().optional().or(z.literal('')).transform(val => val === '' ? null : val),
  title: z.string().trim().min(3, 'Inspection title must be at least 3 characters'),
  domain_category: z.enum(DOMAIN_CATEGORIES, {
    errorMap: () => ({ message: `Invalid domain category. Must be one of: ${DOMAIN_CATEGORIES.join(', ')}` })
  }),
  analysis_mode: z.string().trim().min(2, 'Analysis mode is required'),
  operator_notes: z.string().trim().optional().default(''),
  image_data_url: z.string().refine(
    (val) => val.startsWith('data:image/'),
    { message: 'Visual source must be a valid base64 data URL (e.g. data:image/jpeg;base64,...)' }
  )
});

export const updateAnomalyStatusSchema = z.object({
  remediation_status: z.enum(REMEDIATION_STATUSES, {
    errorMap: () => ({ message: `Remediation status must be one of: ${REMEDIATION_STATUSES.join(', ')}` })
  })
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Chat message cannot be empty')
});

