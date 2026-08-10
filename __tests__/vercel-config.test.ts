const vercelConfig = require('../vercel.json');

describe('Vercel redirects', () => {
  it('redirects the One UI short link to the Figma Community file', () => {
    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: '/oneui',
          destination:
            'https://www.figma.com/community/file/1456035621603784201/one-ui-design-kit',
          permanent: false,
        },
      ]),
    );
  });
});
