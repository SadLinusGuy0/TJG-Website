const DEFAULT_SOURCE = 'wordpress';

export async function getBlogContentSource(): Promise<string> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-blog-content-source');
    if (override?.value) return override.value;
  } catch {
    // cookies() not available during static generation
  }

  if (!process.env.FLAGS) {
    return DEFAULT_SOURCE;
  }
  try {
    const { blogContentSource } = await import('../flags');
    const result = await blogContentSource();
    return (typeof result === 'string' && result) ? result : DEFAULT_SOURCE;
  } catch {
    return DEFAULT_SOURCE;
  }
}
