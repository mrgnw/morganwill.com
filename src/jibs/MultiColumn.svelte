<script>
    /** @type {string[]} */
    export let items = [];
    export let minColumnWidth = '250px';
    export let gap = '2rem';
</script>

<div class="grid" style="--min-col-width: {minColumnWidth}; --gap: {gap};">
    {#each items as item}
        <div class="grid-item">
            {item}
        </div>
    {/each}
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--min-col-width, 250px), 1fr));
        gap: var(--gap, 2rem);
        width: 100%;
    }

    .grid-item {
        break-inside: avoid;
        page-break-inside: avoid;
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        line-height: 1.6;
    }
</style>
