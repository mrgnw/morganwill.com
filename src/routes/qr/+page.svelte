<script>
	import { fade } from "svelte/transition";

	import Projects from "$components/Projects.svelte";
	import LinkIcons from "$components/LinkIcons.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Morgan - QR Codes</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta
		name="description"
		content="QR codes for Morgan's links"
	/>
</svelte:head>

<div class="container">
	<LinkIcons links={data.links} defaultTitle="Morgan" qrMode={data.qrMode} />
</div>

<style>
	.container {
		height: 100%;
	}
</style>
