<script>
import "../app.pcss";
import "../app.postcss";
import 'iconify-icon';
import { theme } from '$lib/stores/theme';
import { onMount } from 'svelte';

onMount(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e) => theme.setDarkMode(e.matches);
  mediaQuery.addEventListener('change', handleChange);
  
  return () => mediaQuery.removeEventListener('change', handleChange);
});
</script>

{#if $theme}
<div style:--primary={$theme.colors.primary}
     style:--default={$theme.colors.default}
     style:--highlight={$theme.colors.highlight}
     style:--bg={$theme.colors.bg}>
  <slot />
</div>
{/if}

<style>
  div {
    min-height: 100vh;
    background-color: var(--bg);
  }
</style>
