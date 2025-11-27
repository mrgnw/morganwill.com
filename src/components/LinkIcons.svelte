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

	/**
	 * Apply row-based wave animation delays to QR code rects
	 * @param {HTMLElement} container
	 * @param {number} baseDelay
	 */
	function applyWaveAnimation(container, baseDelay) {
		const svg = container.querySelector('svg');
		if (!svg) return;
		
		const rects = svg.querySelectorAll('rect');
		if (rects.length === 0) return;
		
		// Get all unique y values and sort them to determine rows
		/** @type {Map<number, Element[]>} */
		const rowMap = new Map();
		
		rects.forEach(rect => {
			const y = parseFloat(rect.getAttribute('y') ?? '0');
			if (!rowMap.has(y)) {
				rowMap.set(y, []);
			}
			rowMap.get(y)?.push(rect);
		});
		
		// Sort rows by y position
		const sortedYValues = [...rowMap.keys()].sort((a, b) => a - b);
		
		// Apply staggered delay per row (35ms between rows for wave effect)
		sortedYValues.forEach((y, rowIndex) => {
			const rowRects = rowMap.get(y) ?? [];
			rowRects.forEach(rect => {
				const delay = baseDelay + (rowIndex * 35);
				// @ts-ignore
				rect.style.animationDelay = `${delay}ms`;
			});
		});
	}

	/**
	 * Svelte action to apply wave animation when element mounts
	 * @param {HTMLElement} node
	 * @param {number} baseDelay
	 */
	function waveAction(node, baseDelay) {
		// Use requestAnimationFrame to ensure SVG is rendered
		requestAnimationFrame(() => {
			applyWaveAnimation(node, baseDelay);
			
			// Also set delays for sibling title and URL elements
			const card = node.closest('.qr-card');
			if (card) {
				const title = card.querySelector('.qr-card-title');
				const url = card.querySelector('.qr-card-url');
				// @ts-ignore
				if (title) title.style.animationDelay = `${baseDelay + 400}ms`;
				// @ts-ignore
				if (url) url.style.animationDelay = `${baseDelay + 500}ms`;
			}
		});
		
		return {
			/**
			 * @param {number} newDelay
			 */
			update(newDelay) {
				applyWaveAnimation(node, newDelay);
			}
		};
	}

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
					style="width: {sizeUnit}; height: {sizeUnit};"
				>
					<span class="qr-card-title">{link.title}</span>
					<div class="qr-card-code" use:waveAction={200 + index * 180}>
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

	/* Animate individual QR modules (rects) with wave/rug-unroll effect */
	.qr-card-code :global(svg rect) {
		opacity: 0;
		transform-origin: center top;
		transform: perspective(200px) rotateX(-90deg) translateY(-50%);
		animation: waveUnroll 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
		/* Default delay - will be overridden by JS for proper row staggering */
		animation-delay: 0ms;
	}

	@keyframes waveUnroll {
		0% {
			opacity: 0;
			transform: perspective(200px) rotateX(-90deg) translateY(-50%) scaleY(0.5);
		}
		30% {
			opacity: 0.7;
			transform: perspective(200px) rotateX(-15deg) translateY(-8%) scaleY(1.05);
		}
		55% {
			opacity: 0.95;
			transform: perspective(200px) rotateX(10deg) translateY(3%) scaleY(1);
		}
		75% {
			opacity: 1;
			transform: perspective(200px) rotateX(-5deg) translateY(-1%);
		}
		90% {
			transform: perspective(200px) rotateX(2deg) translateY(0.5%);
		}
		100% {
			opacity: 1;
			transform: perspective(200px) rotateX(0deg) translateY(0) scaleY(1);
		}
	}

	/* Fade in title and URL with stagger - delays set by JS */
	.qr-card-title,
	.qr-card-url {
		opacity: 0;
		animation: fadeIn 0.4s ease-out forwards;
		animation-delay: 0ms; /* Will be overridden by JS */
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
