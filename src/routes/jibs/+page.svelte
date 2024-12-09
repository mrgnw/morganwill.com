<script>
	import { Card } from "$lib/components/ui/card";
	import { onMount } from "svelte";

	let { data } = $props();

	let loadedComponents = $state([]);

	onMount(async () => {
		// Load all components in parallel
		const components = import.meta.glob("/src/jibs/*.svelte");

		const loaded = await Promise.all(
			data.jibs.map(async (jib) => {
				const component = components[jib.path];
				return {
					...jib,
					component: (await component()).default,
				};
			})
		);

		loadedComponents = loaded;
	});

	const gridClasses =
		"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6";
	const cardClasses = "min-h-[200px] flex flex-col relative overflow-hidden";
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

	<!-- Original grid view -->
	<div class={gridClasses}>
		{#each loadedComponents as jib}
			<Card.Root class={cardClasses}>
				<Card.Header>
					<Card.Title>
						<a href="/jibs/{jib.slug}" class="hover:underline">
							{jib.name}
						</a>
					</Card.Title>
				</Card.Header>
				<Card.Content class="flex-1">
					<div class="w-full h-full">
						{#if jib.component}
							<svelte:component this={jib.component} />
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
