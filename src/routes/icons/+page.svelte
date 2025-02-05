<script>
    /** @type {import('./$types').PageData} */
    export let data;
</script>

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
    {#each data.icons as {id, prefix, name}}
        <div class="flex flex-col items-center p-4 border rounded hover:bg-gray-50">
            <div class="w-8 h-8">
                <iconify-icon icon={id} />
            </div>
            <span class="mt-2 text-sm text-gray-600 text-center break-all">{id}</span>
        </div>
    {/each}
</div>
