<script>
	let { data } = $props();
</script>

<div class="py-8 px-4">
	<div class="flex flex-wrap gap-x-6 gap-y-2 items-baseline mb-8 max-w-[2000px] mx-auto">
		<h1 class="text-3xl font-bold">Jibs</h1>
		{#each data.jibs as jib}
			<a 
				href="/jibs/{jib.slug}" 
				class="font-mono text-sm hover:underline text-blue-600"
			>
				{jib.name}
			</a>
		{/each}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mx-auto" style="width: min(100%, 2000px);">
		{#each data.jibs as jib}
			<div class="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow" style="aspect-ratio: 3/2;">
				<div class="absolute top-0 left-0 right-0 z-10 p-4 text-center bg-gradient-to-b from-white/90 to-white/0">
					<a href="/jibs/{jib.slug}" class="text-2xl font-semibold hover:underline">
						{jib.name}
					</a>
				</div>
				<iframe 
					src="/jibs/{jib.slug}" 
					title={jib.name}
					class="absolute inset-0 w-full h-full border-none"
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	:global(body) {
		background-color: white;
	}
</style>
