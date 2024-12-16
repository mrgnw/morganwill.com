<script context="module">
import { mdsvex } from 'mdsvex';
export async function load({ params }) {
    const { slug } = params;
    const post = await import(`$content/${slug}.md`);
    return {
        props: {
            Component: post.default,
            metadata: post.metadata || {}
        }
    };
}
</script>

<script>
    export let Component;
    export let metadata;
</script>

<svelte:head>
    <title>{metadata.title}</title>
</svelte:head>
<Component />
