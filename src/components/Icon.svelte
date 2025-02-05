<!-- @component
A wrapper around @iconify/svelte for simpler usage
@prop {string} id - The icon identifier (e.g. 'noto:thong-sandal')
@prop {string} [size='1em'] - The size of the icon
-->
<script>
    import Icon from '@iconify/svelte';
    let { id = '', size = '1em' } = $props();
</script>

<Icon icon={id} width={size} height={size} />
