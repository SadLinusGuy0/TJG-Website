import { buildFlagCatalog, getFlagCatalog } from '../lib/getFlagCatalog';
import { flagsClient, type DatafileInput } from '@vercel/flags-core';

jest.mock('@vercel/flags-core', () => ({
  ...jest.requireActual('@vercel/flags-core'),
  flagsClient: { getDatafile: jest.fn() },
}));
jest.mock('../flags', () => ({
  testFlag: { key: 'test-flag', description: 'A new flag', defaultValue: true },
}));

const declared = {
  testFlag: { key: 'test-flag', description: 'A new flag', defaultValue: true },
  theme: { key: 'theme', defaultValue: 'light', options: [{ value: 'light', label: 'Light' }] },
  count: { key: 'count', defaultValue: 1 },
  precomputed: [] as readonly unknown[],
};
const data = {
  projectId: 'private-project', environment: 'preview',
  definitions: {
    'test-flag': { variants: [false, true], environments: { preview: 0, production: 1 } },
    theme: { variants: ['light', 'dark'], environments: { preview: 1 } },
    count: { variants: [1, 5], environments: { preview: 1 } },
    retired: { variants: [false, true], environments: { preview: 1 } },
  },
} satisfies DatafileInput;
const originalFlags = process.env.FLAGS;
afterEach(() => {
  if (originalFlags === undefined) delete process.env.FLAGS;
  else process.env.FLAGS = originalFlags;
  jest.useRealTimers();
  jest.clearAllMocks();
});

it('discovers new declarations, current-environment values and cloud variants without a UI registry', () => {
  const catalog = buildFlagCatalog(declared, data);
  expect(catalog).toEqual([
    expect.objectContaining({ key: 'count', type: 'number', defaultValue: '5', options: [{ value: '1', label: '1' }, { value: '5', label: '5' }] }),
    expect.objectContaining({ key: 'test-flag', type: 'boolean', defaultValue: false, source: 'vercel' }),
    expect.objectContaining({ key: 'theme', type: 'string', defaultValue: 'dark', options: [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'dark' }] }),
  ]);
  expect(JSON.stringify(catalog)).not.toMatch(/private-project|environments|retired|segments/);
});

it('uses code defaults for flags absent from Vercel or an environment', () => {
  expect(buildFlagCatalog(declared, { ...data, environment: 'unknown', definitions: {} }))
    .toContainEqual(expect.objectContaining({ key: 'test-flag', defaultValue: true, source: 'default' }));
  expect(buildFlagCatalog(declared, { ...data, environment: 'unknown' }))
    .toContainEqual(expect.objectContaining({ key: 'test-flag', defaultValue: true, source: 'default' }));
});

it('loads Vercel data only when configured and degrades cleanly on failure', async () => {
  delete process.env.FLAGS;
  expect((await getFlagCatalog()).source).toBe('default');
  expect(flagsClient.getDatafile).not.toHaveBeenCalled();
  process.env.FLAGS = 'private-sdk-key';
  (flagsClient.getDatafile as jest.Mock).mockResolvedValue(data);
  expect((await getFlagCatalog()).flags[0].defaultValue).toBe(false);
  (flagsClient.getDatafile as jest.Mock).mockRejectedValue(new Error('Network unavailable'));
  expect(await getFlagCatalog()).toEqual({ source: 'unavailable', flags: buildFlagCatalog({ testFlag: declared.testFlag }) });
});

it('bounds the wait when the provider never responds', async () => {
  jest.useFakeTimers();
  process.env.FLAGS = 'configured';
  (flagsClient.getDatafile as jest.Mock).mockReturnValue(new Promise(() => {}));
  const pending = getFlagCatalog();
  await jest.advanceTimersByTimeAsync(3000);
  expect((await pending).source).toBe('unavailable');
});
