import { isPostVisibleOnEdition, resolveSiteEditionFromHost, resolveSiteContext } from '../lib/siteEdition';

const hosts = [
  ['tjg.gg', 'normal', 'production', true],
  ['www.tjg.gg', 'normal', 'production', true],
  ['college.tjg.gg', 'college', 'production', true],
  ['beta.tjg.gg', 'normal', 'preview', false],
  ['college.beta.tjg.gg', 'college', 'preview', false],
  ['thatjoshguy.me', 'normal', 'production', true],
  ['college.thatjoshguy.me', 'college', 'production', true],
  ['beta.thatjoshguy.me', 'normal', 'preview', false],
  ['college.beta.thatjoshguy.me', 'college', 'preview', false],
] as const;

describe('site editions and environments', () => {
  it.each(hosts)('resolves %s independently of edition defaults', (host, edition, environment, indexable) => {
    const site = resolveSiteContext(host, { nodeEnv: 'production', siteEdition: 'college' });
    expect(site).toEqual({ edition, environment, indexable, origin: `https://${host}`,
      canonicalOrigin: edition === 'college' ? 'https://college.tjg.gg' : 'https://tjg.gg' });
    expect(isPostVisibleOnEdition(['college', 'year-2'], site.edition)).toBe(edition === 'college');
    expect(isPostVisibleOnEdition(['android'], site.edition)).toBe(edition === 'normal');
  });

  it('keeps previews non-indexable even on a production hostname', () => {
    expect(resolveSiteContext('college.thatjoshguy.me', { vercelEnv: 'preview' }).indexable).toBe(false);
  });

  it('keeps beta and generated hosts non-indexable even with production runtime configuration', () => {
    for (const host of ['beta.tjg.gg', 'college.beta.tjg.gg', 'beta.thatjoshguy.me', 'college.beta.thatjoshguy.me', 'website-git-main.vercel.app']) {
      expect(resolveSiteContext(host, { vercelEnv: 'production' }).indexable).toBe(false);
    }
  });

  it('honors the runtime environment for local builds and favicons', () => {
    expect(resolveSiteContext('college.beta.thatjoshguy.me', { nodeEnv: 'development' }).environment).toBe('development');
    expect(resolveSiteContext('college.thatjoshguy.me', { vercelEnv: 'preview', nodeEnv: 'production' }).environment).toBe('preview');
  });

  it('preserves local ports and separates local origin from production canonical', () => {
    expect(resolveSiteContext('college.localhost:3000', { nodeEnv: 'development' })).toEqual({
      edition: 'college', environment: 'development', origin: 'http://college.localhost:3000',
      canonicalOrigin: 'https://college.tjg.gg', indexable: false,
    });
    expect(resolveSiteEditionFromHost('localhost:3000', 'college')).toBe('college');
    expect(resolveSiteEditionFromHost('COLLEGE.BETA.THATJOSHGUY.ME:443')).toBe('college');
    expect(resolveSiteEditionFromHost('www.thatjoshguy.me')).toBe('normal');
  });

  it.each(['normal', 'main', 'beta', 'invalid', undefined])('accepts %s as a normal-content fallback', siteEdition => {
    expect(resolveSiteContext('website-git-beta.vercel.app', { siteEdition }).edition).toBe('normal');
  });

  it('uses college fallback on generated previews without changing the canonical edition', () => {
    expect(resolveSiteContext('website-git-beta.vercel.app', { siteEdition: 'college', vercelEnv: 'preview' })).toMatchObject({
      edition: 'college', origin: 'https://website-git-beta.vercel.app', canonicalOrigin: 'https://college.tjg.gg', indexable: false,
    });
  });

  it.each(['college.tjg.gg.evil.test', 'evil.test/@college.tjg.gg', 'college.example.com', 'college.thatjoshguy.me.evil.test', 'evil.test/@college.thatjoshguy.me', '__proto__', undefined])('does not infer a trusted site from %s', host => {
    expect(resolveSiteContext(host, { nodeEnv: 'production' })).toMatchObject({
      edition: 'normal', origin: 'https://tjg.gg', indexable: false,
    });
  });
});
