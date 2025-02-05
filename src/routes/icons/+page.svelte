<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Icon from '@iconify/svelte';
</script>

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
    {#each data.icons as {id}}
        <div class="flex flex-col items-center p-4 border rounded hover:bg-gray-50">
            <div class="w-8 h-8 flex items-center justify-center">
                <Icon icon={id} width="24" />
            </div>
            <span class="mt-2 text-sm text-gray-600 text-center break-all">{id}</span>
        </div>
    {/each}
</div>
