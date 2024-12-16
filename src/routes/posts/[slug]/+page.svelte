<script>
  /** @type {import('./$types').PageData} */
  let { data } = $props();
</script>

<article>
    {data}
  <h1>{data.metadata.title || ''}</h1>
  {#if data.metadata.date}
    <p>{new Date(data.metadata.date).toLocaleDateString()}</p>
  {/if}
  
  {#if data.component}
    <data.component />
  {/if}
</article>

<div>
  <a href="/posts">← Back to posts</a>
</div> 