<script>
		export let data;
		const columns = data.columns
</script>

<div>
		{#each data.data as post}
		<div>
			<span class="date">{post[columns[0]]}</span>
			<span class="main">
				{post[columns[1]]}
				
			</span>
		</div>
		{/each}
	</div>



<style>
	.date {
		font-family: monospace;
	}
	
</style>