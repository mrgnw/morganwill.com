<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<article>
  <svelte:component this={data.content} />
</article>

<div>
  <a href="/posts">← Back to posts</a>
</div> 