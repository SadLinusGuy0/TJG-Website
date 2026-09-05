import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import LightboxClient from '../../../app/components/LightboxClient';
import BlogContent from '../../../app/blog/BlogContent';
import { BlogSearchProvider } from '../../../app/blog/BlogSearchWrapper';
import FloatingSearchBar from '../../../app/blog/FloatingSearchBar';
import BlogPostsWithSearch from '../../../app/blog/BlogPostsWithSearch';
const content = '<h2>Media</h2><figure><img src="/images/preview.png" width="600" height="315" alt="Landscape preview" loading="lazy"></figure><figure class="wp-block-jetpack-image-compare"><img src="/images/preview.png" width="600" height="315" alt="Before"><img src="/images/preview.png" width="600" height="315" alt="After"></figure><figure><img src="/images/preview.png" width="600" height="315" alt="" loading="lazy"></figure><p>End of media.</p>';
function Fixture() {
 const [mounted, setMounted] = useState(true);
 return <><main id="main-content"><h1>Article controls</h1><button onClick={() => setMounted(false)}>Unmount viewer</button>
 <BlogContent content={content}/>
 <BlogSearchProvider initialPage={{ posts: [], hasMore: false }}><BlogPostsWithSearch categoryMap={{}}/><FloatingSearchBar categories={[{id:'test',slug:'test',name:'Testing'}]}/></BlogSearchProvider>
 </main>{mounted && <LightboxClient/>}</>;
}
createRoot(document.getElementById('fixture')!).render(<Fixture/>);
