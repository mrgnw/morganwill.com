<script>
  /** @type {import('./$types').PageData} */
  let { data } = $props();
</script>
<article>
  {#if data.metadata.date}
    <p>{new Date(data.metadata.date).toLocaleDateString()}</p>
  {/if}
  
  {#if data.component}
    <data.component />
  {/if}
</article>

<pre>{JSON.stringify(data, null, 2)}</pre>

