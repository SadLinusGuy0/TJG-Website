import { getBlogEdition, getSiteEdition } from '../lib/siteEdition';
import { cookies, headers } from 'next/headers';

jest.mock('next/headers', () => ({ cookies: jest.fn(), headers: jest.fn() }));

const mockCookies = cookies as jest.Mock;
const mockHeaders = headers as jest.Mock;

beforeEach(() => {
  mockHeaders.mockResolvedValue(new Headers({ host: 'college.thatjoshguy.me' }));
});

it.each([
  ['normal', 'normal'],
  ['college', 'college'],
  ['auto', 'college'],
  ['invalid', 'college'],
  [undefined, 'college'],
])('resolves %s blog override to %s', async (value, expected) => {
  mockCookies.mockResolvedValue({ get: () => value ? { value } : undefined });
  expect(await getBlogEdition()).toBe(expected);
});

it('does not change the hostname-based site identity', async () => {
  mockCookies.mockResolvedValue({ get: () => ({ value: 'normal' }) });
  expect(await getSiteEdition()).toBe('college');
});

it('can preview college content on the normal site', async () => {
  mockHeaders.mockResolvedValue(new Headers({ host: 'thatjoshguy.me' }));
  mockCookies.mockResolvedValue({ get: () => ({ value: 'college' }) });
  expect(await getBlogEdition()).toBe('college');
});
