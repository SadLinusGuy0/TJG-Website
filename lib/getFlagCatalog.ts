import 'server-only';
import { evaluate, flagsClient, Reason, type DatafileInput } from '@vercel/flags-core';
import * as definitions from '../flags';
import { isFlagValue, type FlagCatalog, type FlagDef } from './flagCatalog';

type Definition = {
  key: string;
  description?: string;
  defaultValue?: unknown;
  options?: Array<{ value: unknown; label?: string }>;
};

/** Only serialize control metadata, never the SDK key, targeting rules or segments. */
export function buildFlagCatalog(declared: Record<string, Definition | readonly unknown[]>, data?: DatafileInput): FlagDef[] {
  return Object.values(declared).flatMap((entry): FlagDef[] => {
    if (Array.isArray(entry)) return [];
    const definition = entry as Definition;
    if (!isFlagValue(definition.defaultValue)) return [];
    const remote = data?.definitions[definition.key];
    let value = definition.defaultValue;
    let source: 'vercel' | 'default' = 'default';
    if (remote && data) {
      try {
        const result = evaluate({ definition: remote, environment: data.environment,
          segments: data.segments, defaultValue: value });
        if (result.reason !== Reason.ERROR && isFlagValue(result.value) && typeof result.value === typeof value) {
          value = result.value;
          source = 'vercel';
        }
      } catch { /* A missing environment uses the application's default. */ }
    }
    const base = {
      key: definition.key,
      name: definition.key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: definition.description ?? '',
      source,
    };
    if (typeof value === 'boolean') return [{ ...base, type: 'boolean', defaultValue: value }];
    const variants = remote?.variants ?? definition.options?.map(option => option.value);
    const options = variants?.filter(option => isFlagValue(option) && typeof option === typeof value)
      .map(option => ({ value: String(option),
        label: definition.options?.find(item => item.value === option)?.label ?? String(option) }));
    // Keep the effective fallback selectable even when cloud variants changed.
    if (options?.length && !options.some(option => option.value === String(value))) {
      options.unshift({ value: String(value), label: String(value) });
    }
    return [{ ...base, type: typeof value === 'number' ? 'number' : 'string',
      defaultValue: String(value), ...(options?.length ? { options } : {}) }];
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFlagCatalog(): Promise<FlagCatalog> {
  if (!process.env.FLAGS) return { flags: buildFlagCatalog(definitions), source: 'default' };
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const data = await Promise.race([
      flagsClient.getDatafile(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Flag catalog timed out')), 3000);
      }),
    ]);
    return { flags: buildFlagCatalog(definitions, data), source: 'vercel' };
  } catch {
    return { flags: buildFlagCatalog(definitions), source: 'unavailable' };
  } finally {
    clearTimeout(timeout);
  }
}
