import { createClient } from '@sanity/client';

// Sanity Client instance configured with Vite environment variables and guaranteed instant fallback values
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '5mczm6mo',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: import.meta.env.VITE_SANITY_API_TOKEN || undefined,
});

export { createClient };
export default client;
