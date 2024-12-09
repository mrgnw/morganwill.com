<script>
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import IconoirMenu from "~icons/iconoir/menu";

	let { data } = $props();
	let menuOpen = $state(false);
</script>

<div class="py-8 px-4">
	<div class="flex justify-between items-center mb-8 max-w-[2000px] mx-auto">
		<h1 class="text-3xl font-bold">Jibs</h1>
		<button 
			class="p-2 hover:bg-gray-100 rounded-full transition-colors"
			on:click={() => menuOpen = !menuOpen}
		>
			<IconoirMenu width="24" height="24" />
		</button>
	</div>

	{#if menuOpen}
		<div class="mb-8 max-w-[2000px] mx-auto" transition:slide>
			<div class="flex flex-col gap-2 bg-gray-50 p-4 rounded-lg">
				{#each data.jibs as jib}
					<a 
						href="/jibs/{jib.slug}" 
						class="font-mono hover:underline text-blue-600"
					>
						{jib.name}
					</a>
				{/each}
			</div>
		</div>
	{/if}

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
