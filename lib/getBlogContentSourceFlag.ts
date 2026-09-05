const DEFAULT_SOURCE = 'sanity';

export async function getBlogContentSource(ignoreOverrides = false): Promise<string> {
  if (!ignoreOverrides) try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const override = cookieStore.get('ff-blog-content-source');
    if (override?.value === 'sanity' || override?.value === 'wordpress') return override.value;
  } catch {
    // cookies() not available during static generation
  }

  // Sanity is the primary source after migration. If the project is configured,
  // do not let an older cloud flag value silently keep the site on WordPress.
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return 'sanity';
  }

  if (!process.env.FLAGS) {
    return DEFAULT_SOURCE;
  }
  try {
    const { blogContentSource } = await import('../flags');
    const result = await blogContentSource();
    return (result === 'sanity' || result === 'wordpress') ? result : DEFAULT_SOURCE;
  } catch {
    return DEFAULT_SOURCE;
  }
}
