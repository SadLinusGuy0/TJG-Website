import { sanityConfig } from '../lib/sanity.config';

describe('Sanity client configuration', () => {
  it('uses the published perspective for every public content query', () => {
    expect(sanityConfig.perspective).toBe('published');
  });
});
