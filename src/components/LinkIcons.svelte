<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { innerWidth, innerHeight } from "svelte/reactivity/window";

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

	// Grid calculation - derive defaults from link count
	let initialCols = Math.ceil(Math.sqrt(links.length));
	let initialSize = Math.floor(100 / initialCols); // vh units

	// Reactive grid calculation based on window size
	let gridCalc = $derived.by(() => {
		const w = innerWidth.current ?? 0;
		const h = innerHeight.current ?? 0;
		const n = links.length;

		if (w === 0 || h === 0) {
			return { cols: initialCols, size: 0, ready: false };
		}

		let best = 0;
		let bestCols = 1;

		for (let c = 1; c <= n; c++) {
			const r = Math.ceil(n / c);
			const s = Math.min(w / c, h / r);
			if (s > best) {
				best = s;
				bestCols = c;
			}
		}

		return { cols: bestCols, size: best, ready: true };
	});

	let cols = $derived(gridCalc.cols);
	let size = $derived(gridCalc.size);
	let ready = $derived(gridCalc.ready);

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

	// Reactive size unit for grid
	let sizeUnit = $derived(size ? `${size}px` : `${initialSize}vh`);
</script>

<div class="link-icons" class:qrs-mode={qrsMode}>
	{#if qrsMode}
		<!-- All QR codes grid view -->
		<div 
			class="qrs-grid" 
			class:ready
			style="--card-size: {sizeUnit}; --cols: {cols}"
		>
			{#each links as link, index (link.title)}
				<a 
					href={link.url} 
					target="_blank" 
					class="qr-card"
					style="width: {sizeUnit}; height: {sizeUnit}; --delay: {300 + index * 250}ms;"
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

	.link-icons.qrs-mode {
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
	}

	/* ===== QRS GRID MODE ===== */
	.qrs-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		overflow: visible;
		box-sizing: border-box;
		transition: opacity 0.2s ease;
		opacity: 0;
		max-width: calc(var(--cols) * var(--card-size));
		margin: 0 auto;
	}

	.qrs-grid.ready {
		opacity: 1;
	}

	.qr-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-decoration: none;
		box-sizing: border-box;
		transition: width 0.3s ease, height 0.3s ease;
		padding: 0.25rem;
		overflow: visible;
	}

	/* QR code container */
	.qr-card-code {
		position: relative;
		overflow: visible;
		line-height: 0;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		padding: 0.5rem;
		margin: -0.5rem;
	}

	/* Animate individual QR modules (rects) popping in */
	.qr-card-code :global(svg rect) {
		opacity: 0;
		transform: scale(0);
		animation: popIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	/* Randomize hue rotation per rect using nth-child patterns */
	.qr-card-code :global(svg rect:nth-child(3n+1)) { --hue-shift: 0deg; --hue-mid1: 120deg; --hue-mid2: 240deg; }
	.qr-card-code :global(svg rect:nth-child(3n+2)) { --hue-shift: 60deg; --hue-mid1: 180deg; --hue-mid2: 300deg; }
	.qr-card-code :global(svg rect:nth-child(3n)) { --hue-shift: 30deg; --hue-mid1: 150deg; --hue-mid2: 270deg; }
	
	.qr-card-code :global(svg rect:nth-child(7n+1)) { --hue-shift: 45deg; }
	.qr-card-code :global(svg rect:nth-child(7n+3)) { --hue-shift: 90deg; }
	.qr-card-code :global(svg rect:nth-child(7n+5)) { --hue-shift: 135deg; }
	
	.qr-card-code :global(svg rect:nth-child(11n+2)) { --hue-mid1: 60deg; --hue-mid2: 180deg; }
	.qr-card-code :global(svg rect:nth-child(11n+5)) { --hue-mid1: 200deg; --hue-mid2: 320deg; }
	.qr-card-code :global(svg rect:nth-child(11n+8)) { --hue-mid1: 280deg; --hue-mid2: 40deg; }

	/* Stagger rects within each QR - waves of 20 rects at a time */
	.qr-card-code :global(svg rect:nth-child(20n+1)) { animation-delay: calc(var(--delay, 0ms) + 0ms); }
	.qr-card-code :global(svg rect:nth-child(20n+2)) { animation-delay: calc(var(--delay, 0ms) + 15ms); }
	.qr-card-code :global(svg rect:nth-child(20n+3)) { animation-delay: calc(var(--delay, 0ms) + 30ms); }
	.qr-card-code :global(svg rect:nth-child(20n+4)) { animation-delay: calc(var(--delay, 0ms) + 45ms); }
	.qr-card-code :global(svg rect:nth-child(20n+5)) { animation-delay: calc(var(--delay, 0ms) + 60ms); }
	.qr-card-code :global(svg rect:nth-child(20n+6)) { animation-delay: calc(var(--delay, 0ms) + 75ms); }
	.qr-card-code :global(svg rect:nth-child(20n+7)) { animation-delay: calc(var(--delay, 0ms) + 90ms); }
	.qr-card-code :global(svg rect:nth-child(20n+8)) { animation-delay: calc(var(--delay, 0ms) + 105ms); }
	.qr-card-code :global(svg rect:nth-child(20n+9)) { animation-delay: calc(var(--delay, 0ms) + 120ms); }
	.qr-card-code :global(svg rect:nth-child(20n+10)) { animation-delay: calc(var(--delay, 0ms) + 135ms); }
	.qr-card-code :global(svg rect:nth-child(20n+11)) { animation-delay: calc(var(--delay, 0ms) + 150ms); }
	.qr-card-code :global(svg rect:nth-child(20n+12)) { animation-delay: calc(var(--delay, 0ms) + 165ms); }
	.qr-card-code :global(svg rect:nth-child(20n+13)) { animation-delay: calc(var(--delay, 0ms) + 180ms); }
	.qr-card-code :global(svg rect:nth-child(20n+14)) { animation-delay: calc(var(--delay, 0ms) + 195ms); }
	.qr-card-code :global(svg rect:nth-child(20n+15)) { animation-delay: calc(var(--delay, 0ms) + 210ms); }
	.qr-card-code :global(svg rect:nth-child(20n+16)) { animation-delay: calc(var(--delay, 0ms) + 225ms); }
	.qr-card-code :global(svg rect:nth-child(20n+17)) { animation-delay: calc(var(--delay, 0ms) + 240ms); }
	.qr-card-code :global(svg rect:nth-child(20n+18)) { animation-delay: calc(var(--delay, 0ms) + 255ms); }
	.qr-card-code :global(svg rect:nth-child(20n+19)) { animation-delay: calc(var(--delay, 0ms) + 270ms); }
	.qr-card-code :global(svg rect:nth-child(20n+20)) { animation-delay: calc(var(--delay, 0ms) + 285ms); }

	/* Add progressive delay for later rects so animation spreads out */
	.qr-card-code :global(svg rect:nth-child(n+21)) { animation-delay: calc(var(--delay, 0ms) + 300ms + 15ms * (calc(1))); }
	.qr-card-code :global(svg rect:nth-child(n+100)) { animation-delay: calc(var(--delay, 0ms) + 400ms); }
	.qr-card-code :global(svg rect:nth-child(n+200)) { animation-delay: calc(var(--delay, 0ms) + 550ms); }
	.qr-card-code :global(svg rect:nth-child(n+300)) { animation-delay: calc(var(--delay, 0ms) + 700ms); }
	.qr-card-code :global(svg rect:nth-child(n+400)) { animation-delay: calc(var(--delay, 0ms) + 850ms); }

	@keyframes popIn {
		0% {
			opacity: 0;
			transform: scale(0) rotate(-15deg);
			fill: oklch(65% 0.25 var(--hue-shift, 0deg));
			filter: blur(4px) brightness(1.5);
		}
		20% {
			opacity: 0.7;
			transform: scale(1.4) rotate(8deg);
			fill: oklch(70% 0.3 var(--hue-mid1, 120deg));
			filter: blur(2px) brightness(1.3);
		}
		40% {
			opacity: 0.9;
			transform: scale(0.8) rotate(-5deg);
			fill: oklch(60% 0.28 var(--hue-mid2, 240deg));
			filter: blur(1px) brightness(1.1);
		}
		60% {
			opacity: 1;
			transform: scale(1.15) rotate(3deg);
			fill: oklch(55% 0.2 calc(var(--hue-shift, 0deg) + 180deg));
			filter: blur(0) brightness(1);
		}
		80% {
			transform: scale(0.95) rotate(-1deg);
			fill: oklch(40% 0.08 var(--hue-shift, 0deg));
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
			fill: var(--default, currentColor);
			filter: blur(0) brightness(1);
		}
	}

	/* Fade in title and URL with stagger */
	.qr-card-title,
	.qr-card-url {
		opacity: 0;
		animation: fadeIn 0.3s ease-out forwards;
		animation-delay: calc(var(--delay, 0ms) + 600ms);
	}

	.qr-card-url {
		animation-delay: calc(var(--delay, 0ms) + 700ms);
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}

	.qr-card-title {
		font-size: clamp(0.7rem, 2vw, 1rem);
		font-weight: 500;
		color: var(--primary);
		text-transform: capitalize;
	}

	.qr-card-code :global(svg) {
		width: auto;
		height: 100%;
		max-width: 100%;
		aspect-ratio: 1;
	}

	.qr-card-url {
		font-size: clamp(0.5rem, 1.5vw, 0.65rem);
		color: var(--default);
		max-width: 100%;
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
