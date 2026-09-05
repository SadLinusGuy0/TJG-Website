import { NextRequest } from 'next/server';
import { POST } from '../app/api/revalidate-post/route';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isValidSignature } from '@sanity/webhook';
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), revalidateTag: jest.fn() }));
jest.mock('@sanity/webhook', () => ({ SIGNATURE_HEADER_NAME: 'sanity-webhook-signature', isValidSignature: jest.fn() }));
const send = (body: string, headers: Record<string, string> = { 'x-revalidate-token': 'test-secret' }) => POST(new NextRequest('http://localhost/api/revalidate-post', { method: 'POST', body, headers }));
beforeEach(() => { jest.clearAllMocks(); process.env.REVALIDATE_SECRET = 'test-secret'; delete process.env.SANITY_WEBHOOK_SECRET; });
afterAll(() => { delete process.env.REVALIDATE_SECRET; delete process.env.SANITY_WEBHOOK_SECRET; });
it.each(['{', 'null', '[]', '{}', '{"slug":"../settings"}', '{"slug":"ok","event":"bogus"}', '{"slug":42}'])('returns 400 for invalid payload %s', async body => {
  expect((await send(body)).status).toBe(400); expect(revalidatePath).not.toHaveBeenCalled();
});
it('rejects missing and invalid authentication, including development', async () => {
  expect((await send('{"slug":"post"}', {})).status).toBe(401);
  expect((await send('{"slug":"post"}', { 'x-revalidate-token': 'wrong' })).status).toBe(401);
  delete process.env.REVALIDATE_SECRET;
  expect((await send('{"slug":"post"}', {})).status).toBe(401);
});
it('bounds streamed bodies', async () => { expect((await send(' '.repeat(17000))).status).toBe(413); });
it('invalidates old/new posts, sections, lists, homepage, and tagged data on rename', async () => {
  expect((await send('{"slug":"new-post","oldSlug":"old-post","event":"update"}')).status).toBe(200);
  for (const path of ['/', '/blog', '/blog/new-post', '/blog/old-post', '/sitemap.xml']) expect(revalidatePath).toHaveBeenCalledWith(path);
  expect(revalidatePath).toHaveBeenCalledWith('/blog/[slug]/[section]', 'page');
  expect(revalidateTag).toHaveBeenCalledWith('blog', { expire: 0 });
});
it('accepts deletion with only the old slug', async () => { expect((await send('{"oldSlug":"deleted-post","event":"delete"}')).status).toBe(200); });
it('verifies signed CMS payloads before parsing', async () => {
  process.env.SANITY_WEBHOOK_SECRET = 'cms-secret';
  (isValidSignature as jest.Mock).mockResolvedValue(false);
  expect((await send('{"slug":{"current":"post"}}', { 'sanity-webhook-signature': 'signature' })).status).toBe(401);
  (isValidSignature as jest.Mock).mockResolvedValue(true);
  expect((await send('{"slug":{"current":"post"}}', { 'sanity-webhook-signature': 'signature' })).status).toBe(200);
});
it('accepts nullable before/after slugs from Sanity delta projections', async () => {
  expect((await send('{"slug":"created-post","oldSlug":null,"event":"create"}')).status).toBe(200);
  expect((await send('{"slug":null,"oldSlug":"deleted-post","event":"delete"}')).status).toBe(200);
});
