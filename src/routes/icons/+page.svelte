<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Icon from '@iconify/svelte';
    let size = '4em'
</script>

<div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 p-8">
    {#each data.icons as {id}}
        <button 
            class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative group"
            title={id}
        >
            <Icon icon={id} width="{size}" height="{size}" />
            <span class="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap transition-opacity">
                {id}
            </span>
        </button>
    {/each}
</div>

<style>
    button {
        -webkit-tap-highlight-color: transparent;
    }
</style>
