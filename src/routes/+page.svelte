<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	import Projects from "$components/Projects.svelte";
	import PhPanorama from "virtual:icons/ph/panorama";
	import IconoirInstagram from "~icons/iconoir/instagram";
	import JamLinkedinCircle from "~icons/jam/linkedin-circle";
	import IconoirGithubCircle from "~icons/iconoir/github-circle";
	import IconoirTelegramCircle from "~icons/iconoir/telegram-circle";
	import RiBlueskyLine from "~icons/ri/bluesky-line";
	import TablerFileCv from '~icons/tabler/file-cv'

	let hostname = $state("");
	let links = $state([]);

	let { data } = $props();
	let all_links = data.all_links;
	let link_icons = {
		photos: PhPanorama,
		instagram: IconoirInstagram,
		LinkedIn: JamLinkedinCircle,
		github: IconoirGithubCircle,
		bluesky: RiBlueskyLine,
		message: IconoirTelegramCircle,
		cv: TablerFileCv
	};

	let selected = $state(null);
	let qrMode = $state(false);
	let selected_qr = $derived(
		links.find((l) => l.title === selected)?.qr ?? null
	);
	let selectedUrl = $derived(links.find((l) => l.title === selected)?.url);

	onMount(() => {
		
		all_links.forEach((link) => {
			link["icon"] = link_icons[link.title];
		});
		
		hostname = window.location.hostname;
		if (hostname === "morganwill.com") {
			links = get_links(["LinkedIn", "github", "bluesky", "message", "cv"]);
		} else if (hostname === "zenfo.co") {
			links = get_links(["photos", "instagram", "bluesky", "message"]);
		} else {
			links = all_links.filter(link => link.title !== "cv");
		}
		// params: set qr mode or show specific qr by its alias (li = linkedin)
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('qr')) {
			qrMode = true;
		}
		let aliases = links.map((l) => l.alias);
		for (let alias of aliases) {
			if (urlParams.has(alias)) {
				selected = links.find((l) => l.alias === alias)?.title;
				qrMode = true;
			}
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
		content="Contact Morgan or view his other work on 500px, Instagram, LinkedIn, or Github"
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

	<div class="links">
		{#each links as { url, icon, blurb, title }, index}
			<a
				href={qrMode ? undefined : url}
				target="_blank"
				aria-label={blurb}
				class:active={title === selected}
				class:flash-on={qrMode}
				class:flash-off={!qrMode}
				onmouseover={() => {
					selected = title;
				}}
				onfocus={() => {
					selected = title;
				}}
				onmouseout={() => {
					if (!qrMode) selected = null;
				}}
				onblur={() => {
					if (!qrMode) selected = null;
				}}
				transition:fade={{ duration: 800, delay: 150 * index }}
			>
				{#if icon}
					{@const Icon = icon}
					<Icon
						style="color: {title === selected
							? 'var(--highlight)'
							: 'var(--default)'}"
						width="4.5em"
						height="4.5em"
					/>
				{/if}
			</a>
		{/each}
	</div>
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

	.active {
		color: var(--highlight);
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
		height: 128px;
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

	.links {
		display: flex;
		gap: 2rem;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	a {
		display: flex;
		justify-content: center;
		width: auto;
		position: relative;
		transition: transform 0.3s ease;
	}

	@media (max-width: 767px) {
		.links {
			display: grid;
			grid-template-columns: 1fr;
			width: min(100%, 300px);
			gap: 1rem;
			padding: 1rem;
			margin: 0 auto;
		}

		@media (max-height: 800px) {
			.links {
				grid-template-columns: repeat(2, 1fr);
				width: min(100%, 200px);
				justify-items: center;
				align-items: center;
			}

			a {
				width: auto;
			}
		}
	}

	@keyframes flash-on {
		0% {
			color: var(--default);
		}

		50% {
			color: var(--highlight);
		}

		100% {
			color: var(--default);
		}
	}

	@keyframes flash-off {
		0% {
			color: var(--default);
		}

		50% {
			color: rgba(128, 128, 128, 0.8);
		}

		100% {
			color: var(--default);
		}
	}

	.flash-on :global(svg) {
		animation: flash-on 0.5s ease-in-out;
	}

	.flash-off :global(svg) {
		animation: flash-off 0.5s ease-in-out;
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
	.qr-wrapper :global(svg path:first-child) {
		fill: rgba(0, 0, 0, 0);
	}

	.qr-wrapper :global(svg path:last-child) {
		stroke: var(--qr);
	}
</style>
