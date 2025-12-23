<!-- @component
A wrapper around @iconify/svelte for simpler usage, with support for pre-rendered icons via unplugin-icons
@prop {string} id - The icon identifier (e.g. 'noto:thong-sandal')
@prop {string} [size='1em'] - The size of the icon
@prop {typeof SvelteComponent} [component] - Pre-rendered icon component from unplugin-icons (takes precedence over id)
-->
<script>
    import Icon from '@iconify/svelte';
    let { id = '', size = '1em', component = null } = $props();
</script>

{#if component}
    {@const SvelteComponent = component}
    <SvelteComponent width={size} height={size} />
{:else}
    <Icon icon={id} width={size} height={size} />
{/if}
