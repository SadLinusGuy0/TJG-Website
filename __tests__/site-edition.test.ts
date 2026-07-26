import {
  isPostVisibleOnEdition,
  resolveSiteEditionFromHost,
} from '../lib/siteEdition';

describe('site editions', () => {
  it.each([
    ['thatjoshguy.me', 'main'],
    ['www.thatjoshguy.me', 'main'],
    ['college.thatjoshguy.me', 'college'],
    ['college.thatjoshguy.me:443', 'college'],
    ['beta.thatjoshguy.me', 'beta'],
    ['beta.localhost:3000', 'beta'],
  ] as const)('maps %s to the %s edition', (host, expected) => {
    expect(resolveSiteEditionFromHost(host)).toBe(expected);
  });

  it('uses the configured fallback for local and Vercel-generated hosts', () => {
    expect(resolveSiteEditionFromHost('localhost:3000', 'college')).toBe('college');
    expect(resolveSiteEditionFromHost('tjg-website-git-main.vercel.app', 'beta')).toBe('beta');
  });

  it('shows college-tagged posts only on college', () => {
    expect(isPostVisibleOnEdition(['college', 'year-2'], 'college')).toBe(true);
    expect(isPostVisibleOnEdition(['college', 'year-2'], 'main')).toBe(false);
    expect(isPostVisibleOnEdition(['college', 'year-2'], 'beta')).toBe(false);
  });

  it('shows non-college posts only on main and beta', () => {
    expect(isPostVisibleOnEdition(['android'], 'main')).toBe(true);
    expect(isPostVisibleOnEdition(['android'], 'beta')).toBe(true);
    expect(isPostVisibleOnEdition(['android'], 'college')).toBe(false);
  });
});
