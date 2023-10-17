<script>
		export let data;
		const main_col = data.columns[1]
</script>

<div>
		{#each data.data as post}
		<div>
			<span class="date">{post.date}</span>
			<span class="main">
				{post[main_col]}
				
			</span>
		</div>
		{/each}
	</div>



<style>
	.date {
		font-family: monospace;
	}
	
</style>