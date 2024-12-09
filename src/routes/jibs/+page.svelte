<script>
    let { data } = $props();
</script>

<h1>Available Jibs</h1>

<ul>
    {#each data.jibs as jib}
        <li>
            <a href="/jibs/{jib.name.toLowerCase()}">{jib.name}</a>
        </li>
    {/each}
</ul> 