<script>
	import { onMount } from "svelte";

	let { data } = $props();
	let loadedComponents = $state([]);

	onMount(async () => {
		// Load all components in parallel
		const components = import.meta.glob("/src/jibs/*.svelte", { eager: true });

		const loaded = data.jibs.map((jib) => {
			return {
				...jib,
				component: components[jib.path]?.default
			};
		});

		loadedComponents = loaded;
	});
</script>

<div class="container mx-auto py-8">
	<h1 class="text-3xl font-bold mb-8">Jibs</h1>

	<!-- Simple list of components -->
	<div class="flex flex-col gap-2 mb-8">
		{#each data.jibs as jib}
			<a 
				href="/jibs/{jib.slug}" 
				class="font-mono hover:underline text-blue-600"
			>
				{jib.name}
			</a>
		{/each}
	</div>

	<!-- Grid view -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each loadedComponents as jib}
			<div class="border rounded-lg p-4 shadow-sm">
				<div class="mb-4">
					<a href="/jibs/{jib.slug}" class="text-lg font-semibold hover:underline">
						{jib.name}
					</a>
				</div>
				<div class="min-h-[200px] flex flex-col relative overflow-hidden">
					{#if jib.component}
						{#key jib.component}
							<jib.component />
						{/key}
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
