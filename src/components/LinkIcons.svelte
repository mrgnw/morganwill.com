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
		<div class="qrs-grid" data-count={links.length}>
			{#each links as link, index (link.title)}
				<a 
					href={link.url} 
					target="_blank" 
					class="qr-card"
					transition:fade={{ duration: 400, delay: 80 * index }}
				>
					<span class="qr-card-title">{link.title}</span>
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

	/* ===== QRS GRID MODE ===== */
	.qrs-grid {
		display: grid;
		justify-items: center;
		align-items: center;
		justify-content: center;
		align-content: center;
		gap: 0.5rem;
		padding: 0.5rem;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		box-sizing: border-box;
	}

	.qr-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-decoration: none;
		gap: 0.25rem;
	}

	.qr-card-title {
		font-size: 1rem;
		font-weight: 500;
		color: var(--primary);
		text-transform: capitalize;
	}

	.qr-card-code {
		line-height: 0;
	}

	.qr-card-code :global(svg) {
		width: var(--qr-size, 120px);
		height: var(--qr-size, 120px);
	}

	.qr-card-url {
		font-size: 0.65rem;
		color: var(--default);
		opacity: 0.7;
		max-width: var(--qr-size, 120px);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.qr-card-code :global(svg path:first-child) {
		fill: transparent;
	}

	.qr-card-code :global(svg path:last-child) {
		stroke: var(--default);
		transition: stroke 0.15s ease;
	}

	.qr-card:hover .qr-card-code :global(svg path:last-child) {
		stroke: var(--highlight);
	}

	.qr-card:hover .qr-card-title,
	.qr-card:hover .qr-card-url {
		color: var(--highlight);
	}

	/* Desktop: Optimal grid layouts for maximum QR size
	   Goal: distribute items evenly to maximize individual QR size
	   Using grid-template-columns/rows to create balanced layouts */
	
	/* 1 item: 1x1 */
	.qrs-grid[data-count="1"] { 
		grid-template-columns: 1fr;
		--qr-size: min(80vh, 80vw);
	}

	/* 2 items: 2x1 */
	.qrs-grid[data-count="2"] { 
		grid-template-columns: 1fr 1fr;
		--qr-size: min(80vh, 45vw);
	}

	/* 3 items: 3x1 */
	.qrs-grid[data-count="3"] { 
		grid-template-columns: repeat(3, 1fr);
		--qr-size: min(80vh, 30vw);
	}

	/* 4 items: 2x2 */
	.qrs-grid[data-count="4"] { 
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 45vw);
	}

	/* 5 items: 3x2 (one empty) */
	.qrs-grid[data-count="5"] { 
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 30vw);
	}

	/* 6 items: 3x2 */
	.qrs-grid[data-count="6"] { 
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 30vw);
	}

	/* 7 items: 4x2 (one empty) */
	.qrs-grid[data-count="7"] { 
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 22vw);
	}

	/* 8 items: 4x2 */
	.qrs-grid[data-count="8"] { 
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 22vw);
	}

	/* 9 items: 3x3 */
	.qrs-grid[data-count="9"] { 
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
		--qr-size: min(28vh, 30vw);
	}

	/* 10 items: 4x3 (two empty) or 5x2 */
	.qrs-grid[data-count="10"] { 
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: repeat(2, 1fr);
		--qr-size: min(42vh, 18vw);
	}

	/* 11 items: 4x3 (one empty) */
	.qrs-grid[data-count="11"] { 
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
		--qr-size: min(28vh, 22vw);
	}

	/* 12 items: 4x3 */
	.qrs-grid[data-count="12"] { 
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(3, 1fr);
		--qr-size: min(28vh, 22vw);
	}

	.qr-card {
		--qr-size: inherit;
	}

	/* ===== MOBILE ===== */
	@media (max-width: 767px) {
		.qrs-grid {
			grid-template-columns: 1fr 1fr !important;
			grid-template-rows: auto !important;
			grid-auto-rows: auto;
			height: auto;
			min-height: 100vh;
			overflow-y: auto;
			align-content: start;
			padding: 0.5rem;
			gap: 0.75rem;
		}

		.qr-card {
			justify-self: center;
			--qr-size: 44vw;
		}

		/* First item spans full width and is bigger */
		.qrs-grid .qr-card:nth-child(1) {
			grid-column: 1 / -1;
			--qr-size: 75vw;
		}

		/* Even counts ≥6: first 2 span full width */
		.qrs-grid[data-count="6"] .qr-card:nth-child(2),
		.qrs-grid[data-count="8"] .qr-card:nth-child(2),
		.qrs-grid[data-count="10"] .qr-card:nth-child(2),
		.qrs-grid[data-count="12"] .qr-card:nth-child(2) {
			grid-column: 1 / -1;
			--qr-size: 75vw;
		}

		/* 4 or fewer: all span full width */
		.qrs-grid[data-count="1"] .qr-card,
		.qrs-grid[data-count="2"] .qr-card,
		.qrs-grid[data-count="3"] .qr-card,
		.qrs-grid[data-count="4"] .qr-card {
			grid-column: 1 / -1;
			--qr-size: 75vw;
		}

		.qr-card-url {
			max-width: var(--qr-size);
			white-space: normal;
			word-break: break-all;
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
