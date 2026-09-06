import { createClient } from '@vercel/edge-config';
import { DEFAULT_PROJECTS, getProjects } from '../lib/projects';

jest.mock('@vercel/edge-config', () => ({ createClient: jest.fn() }));
const read = jest.fn();
const originalConnection = process.env.EDGE_CONFIG;

beforeEach(() => {
  jest.clearAllMocks();
  read.mockReset();
  process.env.EDGE_CONFIG = 'test-connection';
  jest.mocked(createClient).mockReturnValue({ get: read } as unknown as ReturnType<typeof createClient>);
});

afterAll(() => {
  if (originalConnection === undefined) delete process.env.EDGE_CONFIG;
  else process.env.EDGE_CONFIG = originalConnection;
});

it('reads current cards on each request, preserving remote order and edits', async () => {
  const remote = { ...DEFAULT_PROJECTS[0], title: 'An independently added project', thumbnail: 'https://new-cdn.example/card.png' };
  read.mockResolvedValueOnce([remote, DEFAULT_PROJECTS[1]])
    .mockResolvedValueOnce([{ ...remote, title: 'Edited without a deployment' }]);
  expect(await getProjects()).toEqual([remote, DEFAULT_PROJECTS[1]]);
  expect((await getProjects()).map(p => p.title)).toEqual(['Edited without a deployment']);
  expect(createClient).toHaveBeenCalledWith('test-connection', { cache: 'no-store' });
  expect(read).toHaveBeenCalledWith('projects');
  expect(read).toHaveBeenCalledTimes(2);
});

it('respects an empty or entirely disabled list instead of restoring fallback cards', async () => {
  read.mockResolvedValueOnce([]).mockResolvedValueOnce(DEFAULT_PROJECTS.map(p => ({ ...p, enabled: false })));
  expect(await getProjects()).toEqual([]);
  expect(await getProjects()).toEqual([]);
});

it('supports the previous url/tag fields and supplies presentation defaults', async () => {
  read.mockResolvedValue([{ title: 'Concept', thumbnail: '/concept.png', url: 'https://example.com', tag: 'UI concept' }]);
  expect(await getProjects()).toEqual([{
    title: 'Concept', thumbnail: '/concept.png', description: 'UI concept',
    bodyUrl: 'https://example.com', actionUrl: 'https://example.com',
    tone: 'dark', action: 'link', actionIcon: 'open',
  }]);
});

it('skips malformed cards and unsafe links without losing valid cards', async () => {
  read.mockResolvedValue([
    null, { ...DEFAULT_PROJECTS[0], thumbnail: 'javascript:alert(1)' },
    { ...DEFAULT_PROJECTS[0], actionUrl: '//evil.example' },
    { ...DEFAULT_PROJECTS[0], tone: 'invalid' },
    { ...DEFAULT_PROJECTS[0], actionIcon: 'unknown' },
    DEFAULT_PROJECTS[3],
  ]);
  expect(await getProjects()).toEqual([DEFAULT_PROJECTS[3]]);
});

it('uses the offline fallback for absent, unavailable or non-array configuration', async () => {
  delete process.env.EDGE_CONFIG;
  expect(await getProjects()).toEqual(DEFAULT_PROJECTS);
  expect(createClient).not.toHaveBeenCalled();
  process.env.EDGE_CONFIG = 'test-connection';
  read.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(undefined).mockResolvedValueOnce({});
  expect(await getProjects()).toEqual(DEFAULT_PROJECTS);
  expect(await getProjects()).toEqual(DEFAULT_PROJECTS);
  expect(await getProjects()).toEqual(DEFAULT_PROJECTS);
});
