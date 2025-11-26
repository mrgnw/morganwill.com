<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	import Projects from "$components/Projects.svelte";
	import LinkIcons from "$components/LinkIcons.svelte";

	let hostname = $state("");
	let links = $state([]);

	let { data } = $props();
	let all_links = data.all_links;

	let selected = $state(null);
	let qrMode = $state(false);
	let selected_qr = $derived(
		links.find((l) => l.title === selected)?.qr ?? null
	);
	let selectedUrl = $derived(links.find((l) => l.title === selected)?.url);

	onMount(() => {
		hostname = window.location.hostname;
		if (hostname === "morganwill.com") {
			links = get_links(["LinkedIn", "github", "bluesky", "message", "cv"]);
		} else if (hostname === "zenfo.co") {
			links = get_links(["photos", "blog", "bluesky", "message"]);
		} else {
			links = all_links.filter((link) => link.title !== "cv");
		}
		// params: set qr mode or show specific qr by its alias (li = linkedin)
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has("qr")) {
			qrMode = true;
		}
		let aliases = links.map((l) => l.alias);
		for (let alias of aliases) {
			if (urlParams.has(alias)) {
				selected = links.find((l) => l.alias === alias)?.title;
				qrMode = true;
			}
		}

		/**
		 * @param {TouchEvent} e
		 */
		function handleBodyTouch(e) {
			if (!e.target?.closest?.(".links a") && !qrMode) {
				selected = null;
			}
		}

		document.body.addEventListener("touchstart", handleBodyTouch);

		return () => {
			document.body.removeEventListener("touchstart", handleBodyTouch);
		};
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
	<h1 class="title" ondblclick={() => (qrMode = !qrMode)}>
		{#if qrMode && selected_qr}
			<div class="qr-wrapper">
				{#if qrMode && selectedUrl}
					<div class="url-display" transition:fade={{ duration: 300 }}>
						<a
							href={selectedUrl}
							target="_blank"
							class="text-sm text-muted-foreground hover:underline"
						>
							{selectedUrl}
						</a>
					</div>
				{/if}
				{#if typeof selected_qr === "string"}
					{@html selected_qr}
				{/if}
			</div>
		{:else}
			{selected ?? "Morgan"}
		{/if}
	</h1>

	<LinkIcons
		{links}
		{qrMode}
		{selected}
		onselect={(title) => (selected = title)}
	/>
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

	.title {
		font-size: 4rem;
		font-weight: 200;
		font-family: sans-serif;
		color: var(--primary);
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		user-select: none;
		min-height: 128px;
		z-index: 50;
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

	.qr-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.url-display {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--default);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 40;
		white-space: nowrap;
	}

	/* Desktop: bottom positioning */
	@media (min-width: 768px) {
		.url-display {
			top: -3rem;
		}
	}

	/* Mobile: top positioning */
	@media (max-width: 767px) {
		.url-display {
			top: -3rem;
		}
	}

	:global(.qr-code svg path) {
		transition: fill 0.3s ease;
	}

	/* Apply custom colors using CSS variables */
	.qr-wrapper :global(svg) {
		width: 164px;
		height: 164px;
	}

	.qr-wrapper :global(svg path:first-child) {
		fill: transparent;
	}

	.qr-wrapper :global(svg path:last-child) {
		stroke: var(--qr);
	}
</style>
