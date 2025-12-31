<script>
	import LinkIcons from "$components/LinkIcons.svelte";

	let { data } = $props();
	let qrMode = $state(data.qrMode ?? false);
</script>

<svelte:head>
	<title>Morgan</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="Contact Morgan or view his other work on instagram, LinkedIn, or Github"
	/>
</svelte:head>

<div class="container">
	<LinkIcons links={data.links} defaultTitle="Morgan" bind:qrMode />
</div>

<style>
	:root {
		--primary: #000000;
		--default: rgba(0, 0, 0, 0.8);
		--highlight: rgb(30, 131, 255);
		--qr: rgb(30, 131, 255);
		--bg: #ffffff;
		background-color: var(--bg);
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--primary: white;
			--highlight: rgb(120, 180, 255);
			--default: rgba(255, 255, 255, 0.8);
			--qr: white;
			--bg: #000000;
		}
	}

	:global(html, body) {
		height: 100vh;
		margin: 0;
		padding: 0;
		background-color: var(--bg);
	}

	.container {
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
	}
</style>
