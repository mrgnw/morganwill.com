<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	import Projects from "$components/Projects.svelte";
	import LinkIcons from "$components/LinkIcons.svelte";

	let hostname = $state("");
	let links = $state([]);

	let { data } = $props();
	let all_links = data.all_links;

	onMount(() => {
		hostname = window.location.hostname;
		
		const urlParams = new URLSearchParams(window.location.search);
		const linksParam = urlParams.get("links");
		
		// Check for ?links=li,tg,ig OR just ?li,tg,ig (keys as link identifiers)
		const paramKeys = [...urlParams.keys()];
		const matchingKeys = paramKeys.filter(key => 
			all_links.some(link => link.title === key || link.alias === key)
		);
		
		if (linksParam) {
			// Explicit ?links=li.tg.ig or ?links=li,tg,ig format
			const requestedLinks = linksParam.split(/[.,]/).map(s => s.trim().toLowerCase());
			links = requestedLinks
				.map(key => all_links.find(link => link.title === key || link.alias === key))
				.filter(Boolean);
		} else if (matchingKeys.length > 0) {
			// Shorthand ?li,tg,ig format (keys are the link identifiers)
			links = matchingKeys
				.map(key => all_links.find(link => link.title === key || link.alias === key))
				.filter(Boolean);
		} else if (hostname === "morganwill.com") {
			links = get_links(["linkedin", "github", "bluesky", "telegram", "cv"]);
		} else if (hostname === "zenfo.co") {
			links = get_links(["instagram", "blog", "bluesky", "telegram"]);
		} else {
			links = all_links.filter((link) => link.title !== "cv");
		}
	});

	/**
	 * @param {string[]} titles
	 */
	function get_links(titles) {
		return titles.reduce((acc, title) => {
			const link = all_links.find((link) => link.title === title);
			if (link) acc.push(link);
			return acc;
		}, []);
	}
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
	<LinkIcons {links} defaultTitle="Morgan" />
</div>

{#if hostname == "morganwill.com"}
	<div transition:fade={{ duration: 500 }}>
		<Projects />
	</div>
{/if}

<style>
	:root {
		--primary: #000000;
		--default: rgba(0, 0, 0, 0.8);
		--highlight: rgb(30, 131, 255);
		--qr: rgb(30, 131, 255);
		--bg: #ffffff;
		background-color: var(--bg);
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--primary: white;
			--highlight: white;
			--default: rgb(30, 255, 139);
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
