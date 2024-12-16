<script>
  /** @type {import('./$types').PageData} */
  let { data } = $props();
</script>
<div>
    <a href="/posts">← Back to posts</a>
</div> 

<article>
  {#if data.metadata.date}
    <p>{new Date(data.metadata.date).toLocaleDateString()}</p>
  {/if}
  
  {#if data.component}
    <data.component />
  {/if}
</article>

<pre>{JSON.stringify(data, null, 2)}</pre>

