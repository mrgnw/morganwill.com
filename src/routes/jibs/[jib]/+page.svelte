<script>
	let { data } = $props();
</script>

{#if data.component}
	<div class="container mx-auto py-8">
		<data.component />
	</div>
{/if}
