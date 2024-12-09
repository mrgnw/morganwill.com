<script>
  import "../app.pcss";
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  
  let { children } = $props();
</script>

{#key $page.url.pathname}
  <div 
    in:fade={{ duration: 150, delay: 150 }} 
    out:fade={{ duration: 150 }}
  >
    {@render children?.()}
  </div>
{/key}