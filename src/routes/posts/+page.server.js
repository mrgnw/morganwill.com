import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // Use import.meta.glob to get all markdown files
    const posts = import.meta.glob('$content/*.md');
    const postPromises = Object.entries(posts).map(async ([path, resolver]) => {
      const post = await resolver();
      const slug = path.split('/').pop()?.replace('.md', '');
      
      return {
        slug,
        ...post.metadata
      };
    });

    const loadedPosts = await Promise.all(postPromises);
    
    // Sort posts by date if available
    loadedPosts.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    return {
      posts: loadedPosts
    };
  } catch (e) {
    console.error('Error loading posts:', e);
    return {
      posts: []
    };
  }
}