import { z } from 'zod';

// Định nghĩa schema cho env
const envSchema = z.object({
  VITE_API_URL: z.string().min(1, 'API URL is required'),
  VITE_FEATURE_FLAG_EXPERIMENTAL: z.enum(['true', 'false']).optional(),
});

// Validate env
envSchema.parse(import.meta.env);

export const API_URL = import.meta.env.VITE_API_URL;
export const FEATURE_FLAG_EXPERIMENTAL = import.meta.env.VITE_FEATURE_FLAG_EXPERIMENTAL === 'true';
