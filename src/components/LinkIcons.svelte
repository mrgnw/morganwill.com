<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";

	// Icon imports - managed internally
	import JamLinkedinCircle from "~icons/jam/linkedin-circle";
	import IconoirGithubCircle from "~icons/iconoir/github-circle";
	import IconoirTelegramCircle from "~icons/iconoir/telegram-circle";
	import RiBlueskyLine from "~icons/ri/bluesky-line";
	import TablerFileCv from "~icons/tabler/file-cv";
	import PhBookmarkSimpleBold from "~icons/ph/bookmark-simple-bold";
	import RiInstagramLine from "~icons/ri/instagram-line";
	import IconoirPhone from "~icons/iconoir/phone";
	import RiWhatsappLine from "~icons/ri/whatsapp-line";

	/** @type {Record<string, import('svelte').Component>} */
	const iconMap = {
		instagram: RiInstagramLine,
		linkedin: JamLinkedinCircle,
		github: IconoirGithubCircle,
		bluesky: RiBlueskyLine,
		telegram: IconoirTelegramCircle,
		blog: PhBookmarkSimpleBold,
		cv: TablerFileCv,
		phone: IconoirPhone,
		whatsapp: RiWhatsappLine
	};

	/**
	 * @typedef {Object} Link
	 * @property {string} title
	 * @property {string} alias
	 * @property {string} url
	 * @property {string} blurb
	 * @property {string} [qr]
	 */

	/**
	 * @type {{
	 *   links: Link[],
	 *   defaultTitle?: string,
	 *   iconSize?: string,
	 *   selected?: string | null,
	 *   qrMode?: boolean,
	 *   qrsMode?: boolean
	 * }}
	 */
	let {
		links = [],
		defaultTitle = "",
		iconSize = "clamp(3.5em, 8vw, 5.5em)",
		selected = $bindable(null),
		qrMode = $bindable(false),
		qrsMode = false
	} = $props();

	/**
	 * @param {string | null} title
	 */
	function handleSelect(title) {
		selected = title;
	}

	function toggleQrMode() {
		qrMode = !qrMode;
	}

	let selectedLink = $derived(links.find((l) => l.title === selected));
	let selectedQr = $derived(selectedLink?.qr ?? null);
	let selectedUrl = $derived(selectedLink?.url);

	onMount(() => {
		/**
		 * @param {TouchEvent} e
		 */
		function handleBodyTouch(e) {
			const target = /** @type {Element} */ (e.target);
			if (!target?.closest?.(".links a") && !qrMode) {
				selected = null;
			}
		}

		document.body.addEventListener("touchstart", handleBodyTouch);

		return () => {
			document.body.removeEventListener("touchstart", handleBodyTouch);
		};
	});

	/**
	 * Get the icon component for a given link title
	 * @param {string} title
	 */
	function getIcon(title) {
		return iconMap[title] ?? null;
	}
</script>

<div class="link-icons" class:qrs-mode={qrsMode}>
	{#if qrsMode}
		<!-- All QR codes grid view -->
		<div class="qrs-grid">
			{#each links as link, index (link.title)}
				{@const icon = getIcon(link.title)}
				<a 
					href={link.url} 
					target="_blank" 
					class="qr-card"
					transition:fade={{ duration: 400, delay: 80 * index }}
				>
					<div class="qr-card-header">
						{#if icon}
							{@const Icon = icon}
							<Icon width="1.25em" height="1.25em" style="color: var(--default)" />
						{/if}
						<span class="qr-card-title">{link.title}</span>
					</div>
					<div class="qr-card-code">
						{@html link.qr}
					</div>
					<div class="qr-card-url">{link.url}</div>
				</a>
			{/each}
		</div>
	{:else}
		<h1 class="title" ondblclick={toggleQrMode}>
			{#if qrMode && selectedQr}
				<div class="qr-wrapper">
					{#if selectedUrl}
						<div class="url-display" transition:fade={{ duration: 300 }}>
							<a
								href={selectedUrl}
								target="_blank"
								class="url-link"
							>
								{selectedUrl}
							</a>
						</div>
					{/if}
					{#if typeof selectedQr === "string"}
						{@html selectedQr}
					{/if}
				</div>
			{:else}
				{selected ?? defaultTitle}
			{/if}
		</h1>

		<div
			class="links"
			ontouchmove={(e) => {
				e.preventDefault();
				const touch = e.touches[0];
				const element = document.elementFromPoint(touch.clientX, touch.clientY);
				const linkElement = element?.closest('a');
				if (linkElement) {
					const linkData = links.find(link => 
						linkElement.getAttribute('data-title') === link.title
					);
					if (linkData) handleSelect(linkData.title);
				} else if (!qrMode) {
					handleSelect(null);
				}
			}}
		>
			{#each links as { url, blurb, title }, index (title)}
				{@const icon = getIcon(title)}
				<a
					href={qrMode ? undefined : url}
					target="_blank"
					aria-label={blurb}
				data-title={title}
				class:active={title === selected}
				class:flash-on={qrMode}
				class:flash-off={!qrMode}
				ontouchstart={(e) => {
					e.preventDefault();
					handleSelect(title);
				}}
				ontouchend={(e) => {
					e.preventDefault();
					if (selected === title && !qrMode) {
						setTimeout(() => {
							window.open(url, '_blank');
						}, 100);
					}
				}}
				onmouseover={() => handleSelect(title)}
				onmouseout={() => !qrMode && handleSelect(null)}
				onfocus={() => handleSelect(title)}
				onblur={() => !qrMode && handleSelect(null)}
				transition:fade={{ duration: 800, delay: 150 * index }}
			>
				{#if icon}
					{@const Icon = icon}
					<Icon
						style="color: {title === selected
							? 'var(--highlight)'
							: 'var(--default)'}"
						width={iconSize}
						height={iconSize}
					/>
				{/if}
			</a>
		{/each}
		</div>
	{/if}
</div>

<style>
	.link-icons {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* All QR codes grid mode */
	.qrs-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: stretch;
		align-content: center;
		gap: 1.5rem;
		padding: 0.5rem;
		width: 100%;
		max-width: 100vw;
		min-height: 100vh;
	}

	.qr-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		text-decoration: none;
		flex: 1 1 auto;
		min-width: 200px;
		max-width: 100%;
		gap: 0.25rem;
	}

	.qr-card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.qr-card-title {
		font-size: clamp(1rem, 2.5vw, 1.5rem);
		font-weight: 500;
		color: var(--primary);
		text-transform: capitalize;
	}

	.qr-card-code {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		flex: 1;
	}

	/* Force all QR SVGs to be square and same size */
	.qr-card-code :global(svg) {
		width: min(85vw, 600px);
		height: min(85vw, 600px);
		max-height: 75vh;
	}

	/* Scale QR based on number of items - desktop */
	@media (min-width: 768px) {
		.qrs-grid:has(> :nth-child(2)) .qr-card-code :global(svg) {
			width: min(44vw, 500px);
			height: min(44vw, 500px);
			max-height: 70vh;
		}

		.qrs-grid:has(> :nth-child(3)) .qr-card-code :global(svg) {
			width: min(30vw, 450px);
			height: min(30vw, 450px);
			max-height: 65vh;
		}

		.qrs-grid:has(> :nth-child(4)) .qr-card-code :global(svg) {
			width: min(23vw, 400px);
			height: min(23vw, 400px);
			max-height: 60vh;
		}

		.qrs-grid:has(> :nth-child(5)) .qr-card-code :global(svg) {
			width: min(18vw, 320px);
			height: min(18vw, 320px);
			max-height: 50vh;
		}

		.qrs-grid:has(> :nth-child(7)) .qr-card-code :global(svg) {
			width: min(14vw, 260px);
			height: min(14vw, 260px);
			max-height: 45vh;
		}
	}

	.qr-card-code :global(svg path:first-child) {
		fill: transparent;
	}

	.qr-card-code :global(svg path:last-child) {
		stroke: var(--qr);
	}

	.qr-card-url {
		font-size: clamp(0.65rem, 1.5vw, 0.85rem);
		color: var(--default);
		word-break: break-all;
		text-align: center;
		opacity: 0.7;
	}

	/* Mobile */
	@media (max-width: 767px) {
		.qrs-grid {
			flex-direction: column;
			gap: 0.5rem;
			padding: 0.25rem;
		}

		.qr-card {
			width: 100%;
			padding: 0.25rem;
		}

		/* Force square QRs on mobile too */
		.qrs-grid:has(> :only-child) .qr-card-code :global(svg),
		.qrs-grid:has(> :nth-child(2)):not(:has(> :nth-child(3))) .qr-card-code :global(svg) {
			width: 85vw;
			height: 85vw;
			max-height: 45vh;
		}

		.qrs-grid:has(> :nth-child(3)) .qr-card-code :global(svg),
		.qrs-grid:has(> :nth-child(4)):not(:has(> :nth-child(5))) .qr-card-code :global(svg) {
			width: 42vw;
			height: 42vw;
			max-height: 28vh;
		}

		.qrs-grid:has(> :nth-child(5)) .qr-card-code :global(svg) {
			width: 38vw;
			height: 38vw;
			max-height: 20vh;
		}

		/* 5+ items: 2-column grid on mobile */
		.qrs-grid:has(> :nth-child(5)) {
			flex-direction: row;
			flex-wrap: wrap;
		}

		.qrs-grid:has(> :nth-child(5)) .qr-card {
			flex: 1 1 45%;
			min-width: 45%;
		}
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

	.qr-wrapper {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

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

	.url-display {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		top: -3rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid var(--default);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		z-index: 40;
		white-space: nowrap;
	}

	.url-link {
		font-size: 0.875rem;
		color: var(--default);
		text-decoration: none;
	}

	.url-link:hover {
		text-decoration: underline;
	}

	.links {
		display: flex;
		gap: clamp(1.5rem, 5vw, 3rem);
		align-items: center;
		justify-content: center;
		padding: clamp(1rem, 4vw, 2rem);
		flex-wrap: wrap;
		max-width: min(90vw, 800px);
		margin: 0 auto;
	}

	a {
		display: flex;
		justify-content: center;
		width: auto;
		position: relative;
		transition: transform 0.3s ease;
	}

	.active {
		color: var(--highlight);
	}

	@media (max-width: 767px) {
		.links {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
			width: min(100vw - 2rem, 400px);
			gap: clamp(1rem, 4vw, 2rem);
			padding: clamp(1rem, 4vw, 2rem);
			margin: 0 auto;
		}

		@media (max-height: 800px) {
			.links {
				grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
				width: min(100vw - 1rem, 350px);
				gap: clamp(0.75rem, 3vw, 1.5rem);
				justify-items: center;
				align-items: center;
			}

			a {
				width: auto;
			}
		}

		@media (max-height: 650px) {
			.links {
				grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
				width: min(100vw - 1rem, 320px);
				gap: clamp(0.5rem, 2vw, 1rem);
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

	a :global(svg) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		pointer-events: none;
	}
</style>
