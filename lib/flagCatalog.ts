export type FlagValue = boolean | string | number;
type FlagBase = {
  key: string;
  name: string;
  description: string;
  source?: 'vercel' | 'default';
};
export type FlagDef = FlagBase & (
  | { type: 'boolean'; defaultValue: boolean }
  | { type: 'string' | 'number'; defaultValue: string; options?: Array<{ value: string; label: string }> }
);
export type FlagCatalog = {
  flags: FlagDef[];
  source: 'vercel' | 'default' | 'unavailable';
};

export function isFlagValue(value: unknown): value is FlagValue {
  return typeof value === 'boolean' || typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value));
}
