import { loadEnvConfig } from '@next/env';
import path from 'node:path';
loadEnvConfig(path.resolve(process.cwd(), '..'));
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import post from './schemas/post';
import category from './schemas/category';
import tag from './schemas/tag';
export default defineConfig({
  name: 'tjg-blog', title: 'That Josh Guy Blog',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [structureTool()], schema: { types: [post, category, tag] },
});
