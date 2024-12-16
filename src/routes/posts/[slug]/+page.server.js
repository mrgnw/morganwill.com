import { error } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    // Use the $content alias instead of relative path
    const post = await import(`$content/${params.slug}.md`);
    
    return {
      content: post.default,
      metadata: post.metadata
    };
  } catch (e) {
    console.error('Error loading post:', e);
    throw error(404, `Could not find post '${params.slug}'`);
  }
}