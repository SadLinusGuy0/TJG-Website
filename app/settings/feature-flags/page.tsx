import { connection } from 'next/server';
import { getFlagCatalog } from '../../../lib/getFlagCatalog';
import FeatureFlagsClient from './FeatureFlagsClient';

export default async function FeatureFlagsPage() {
  await connection();
  const catalog = await getFlagCatalog();
  return <FeatureFlagsClient catalog={catalog} />;
}
