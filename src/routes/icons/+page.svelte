<script>
    /** @type {import('./$types').PageData} */
    export let data;
    import Icon from '@iconify/svelte';
    import { toast, Toaster } from 'svelte-sonner';
    let size = '6em';

    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            toast(`+ ${text}`);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    }
</script>

<svelte:head>
    <title>Icons</title>
    <meta name="description" content="Icon gallery with {data.icons.length} icons" />
</svelte:head>

<Toaster />
<div class="p-4">
    <div 
        class="grid gap-4 justify-items-center"
        style="grid-template-columns: repeat(auto-fill, minmax({size}, {size}));"
    >
        {#each data.icons as {id}}
            <button 
                class="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative group p-2"
                style="width: {size}; height: {size};"
                title={id}
                on:click={() => copyToClipboard(id)}
            >
                <Icon icon={id} width={size} height={size} />
                <span class="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap transition-opacity">
                    {id}
                </span>
            </button>
        {/each}
    </div>
</div>

<div class="fixed bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm text-xs text-gray-500 font-light shadow-sm z-10">
    {data.icons.length.toLocaleString()} icons
</div>

<style>
    button {
        -webkit-tap-highlight-color: transparent;
    }
</style>
