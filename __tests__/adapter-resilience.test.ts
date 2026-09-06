import { fetchBlogPage, fetchBlogPostBySlug } from '../lib/blog';
import * as wp from '../lib/wordpress';
import { getBlogEdition } from '../lib/siteEdition';
import { readBoundedJson } from '../lib/upstream';
jest.mock('../lib/sanity', () => ({}));
jest.mock('../lib/blogSourceConfig', () => ({
  getBlogContentSource: async () => 'wordpress',
  getWordpressSourceUrl: async () => 'https://tjg8.wordpress.com',
}));
jest.mock('../lib/siteEdition', () => ({ ...jest.requireActual('../lib/siteEdition'), getBlogEdition: jest.fn() }));
jest.mock('../lib/wordpress', () => ({ fetchCategories: jest.fn(), fetchTags: jest.fn(), fetchPostPage: jest.fn(), fetchPostBySlug: jest.fn(), fetchPageBySlug: jest.fn(), getFeaturedImageUrl: () => null }));
const post = { id:1,date:'2026-01-01',slug:'college-post',title:{rendered:'College post'},excerpt:{rendered:'Summary'},content:{rendered:'FULL_BODY_MUST_NOT_BE_SERIALIZED'},categories:[1],tags:[2] };
beforeEach(()=>{
 jest.clearAllMocks(); (getBlogEdition as jest.Mock).mockResolvedValue('normal');
 (wp.fetchCategories as jest.Mock).mockResolvedValue([{id:1,slug:'test',name:'Test'}]);
 (wp.fetchTags as jest.Mock).mockResolvedValue([{id:2,slug:'college',name:'College'}]);
 (wp.fetchPostPage as jest.Mock).mockResolvedValue({items:[post],hasMore:false});
 (wp.fetchPostBySlug as jest.Mock).mockResolvedValue(post);
});
it('applies the same edition boundary to direct posts and lists',async()=>{
 expect(await fetchBlogPostBySlug(post.slug)).toBeNull();
 expect((await fetchBlogPage()).posts).toEqual([]);
 (getBlogEdition as jest.Mock).mockResolvedValue('college');
 expect((await fetchBlogPostBySlug(post.slug))?.tags).toEqual(['college']);
 const page=await fetchBlogPage(); expect(page.posts).toHaveLength(1);
 expect(JSON.stringify(page)).not.toContain('FULL_BODY_MUST_NOT_BE_SERIALIZED');
 expect(page.posts[0]).not.toHaveProperty('searchText');
});
it('fails closed when edition taxonomy cannot be resolved',async()=>{
 (wp.fetchTags as jest.Mock).mockRejectedValue(new Error('Unavailable'));
 await expect(fetchBlogPostBySlug(post.slug)).rejects.toThrow('Unavailable');
 await expect(fetchBlogPage()).rejects.toThrow('Unavailable');
});
it.each([404,429,500])('keeps upstream %i distinct from a missing post result',async status=>{
 await expect(readBoundedJson(new Response('',{status}),'CMS')).rejects.toMatchObject({service:'CMS',status});
});
it('rejects malformed and oversized upstream JSON',async()=>{
 await expect(readBoundedJson(new Response('{'),'CMS')).rejects.toThrow('temporarily unavailable');
 await expect(readBoundedJson(new Response('12345'),'CMS',4)).rejects.toThrow('temporarily unavailable');
});
