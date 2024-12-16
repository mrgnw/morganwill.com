import { error } from '@sveltejs/kit';

const posts = import.meta.glob('$content/*.md');

export async function load({ params }) {
    try {
        const matchingPost = Object.entries(posts).find(([path]) =>
            path.toLowerCase().endsWith(`${params.slug.toLowerCase()}.md`)
        );

        if (!matchingPost) {
            throw error(404, `Could not find post '${params.slug}'`);
        }

        const post = await matchingPost[1]();

        return {
            metadata: post.metadata || {},
            component: post.default
        };
    } catch (e) {
        console.error('Error loading post:', e);
        throw error(404, `Could not find post '${params.slug}'`);
    }
}