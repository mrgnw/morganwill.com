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
		// Use visualViewport height if available (more accurate on mobile)
		const h = (typeof window !== 'undefined' && window.visualViewport?.height) 
			? window.visualViewport.height 
			: (innerHeight.current ?? 0);
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

		// Subtract a small buffer to prevent any overflow
		return { cols: bestCols, size: Math.floor(best * 0.98), ready: true };
	});

	let cols = $derived(gridCalc.cols);
	let size = $derived(gridCalc.size);
	let ready = $derived(gridCalc.ready);

	/**
	 * Apply radial wave animation - expands from center outward
	 * @param {HTMLElement} container
	 * @param {number} baseDelay
	 */
	function applyWaveAnimation(container, baseDelay) {
		const svg = container.querySelector('svg');
		if (!svg) return;
		
		const rects = svg.querySelectorAll('rect');
		if (rects.length === 0) return;
		
		// Find the center of the QR code
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		
		rects.forEach(rect => {
			const x = parseFloat(rect.getAttribute('x') ?? '0');
			const y = parseFloat(rect.getAttribute('y') ?? '0');
			const w = parseFloat(rect.getAttribute('width') ?? '1');
			const h = parseFloat(rect.getAttribute('height') ?? '1');
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x + w);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y + h);
		});
		
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		const maxDistance = Math.sqrt(Math.pow(maxX - centerX, 2) + Math.pow(maxY - centerY, 2));
		
		// Calculate distance from center for each rect and apply delay
		rects.forEach(rect => {
			const x = parseFloat(rect.getAttribute('x') ?? '0');
			const y = parseFloat(rect.getAttribute('y') ?? '0');
			const w = parseFloat(rect.getAttribute('width') ?? '1');
			const h = parseFloat(rect.getAttribute('height') ?? '1');
			
			// Distance from rect center to QR center
			const rectCenterX = x + w / 2;
			const rectCenterY = y + h / 2;
			const distance = Math.sqrt(Math.pow(rectCenterX - centerX, 2) + Math.pow(rectCenterY - centerY, 2));
			
			// Normalize distance to 0-1 range and convert to delay
			const normalizedDistance = distance / maxDistance;
			const delay = baseDelay + (normalizedDistance * 300); // 300ms spread from center to edge
			
			// @ts-ignore
			rect.style.animationDelay = `${delay}ms`;
		});
	}

	// Generate random order for QR cards (shuffled indices)
	let cardOrder = $derived.by(() => {
		const indices = links.map((_, i) => i);
		// Fisher-Yates shuffle
		for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
		}
		// Return a map of original index -> animation order
		/** @type {Map<number, number>} */
		const orderMap = new Map();
		indices.forEach((originalIndex, animationOrder) => {
			orderMap.set(originalIndex, animationOrder);
		});
		return orderMap;
	});

	// Track which QR card is being hovered
	let hoveredCard = $state(/** @type {number | null} */ (null));

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
				if (title) title.style.animationDelay = `${baseDelay + 200}ms`;
				// @ts-ignore
				if (url) url.style.animationDelay = `${baseDelay + 280}ms`;
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
				{@const animOrder = cardOrder.get(index) ?? index}
				<a 
					href={link.url} 
					target="_blank" 
					class="qr-card"
					class:shrink={hoveredCard !== null && hoveredCard !== index}
					style="width: {sizeUnit}; height: {sizeUnit};"
					onmouseenter={() => hoveredCard = index}
					onmouseleave={() => hoveredCard = null}
				>
					<div class="qr-card-code" use:waveAction={100 + animOrder * 80}>
						{@html link.qr}
					</div>
					<span class="qr-card-title">{link.title}</span>
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
		height: 100dvh;
		height: 100vh; /* fallback */
		height: 100dvh;
		position: fixed;
		top: 0;
		left: 0;
		overflow: hidden;
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
		max-height: 100%;
		overflow: hidden;
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
		justify-content: center;
		text-decoration: none;
		box-sizing: border-box;
		transition: width 0.3s ease, height 0.3s ease, transform 0.25s ease, opacity 0.25s ease;
		padding: 0.125rem;
		overflow: visible;
		position: relative;
		gap: 0.25rem;
	}

	.qr-card.shrink {
		transform: scale(0.92);
		opacity: 0.7;
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
		color: var(--qr, var(--primary));
	}

	.qr-card-title {
		font-size: clamp(0.65rem, 2vw, 0.9rem);
		font-weight: 600;
		color: var(--primary);
		text-transform: capitalize;
		line-height: 1;
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.qr-card:hover .qr-card-title {
		transform: scale(1.05);
	}

	/* Animate individual QR modules (rects) with radial bloom effect */
	.qr-card-code :global(svg rect) {
		fill: currentColor;
		opacity: 0;
		transform-origin: center center;
		transform: scale(0) rotate(180deg);
		animation: radialBloom 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
		/* Default delay - will be overridden by JS for radial staggering */
		animation-delay: 0ms;
	}

	@keyframes radialBloom {
		0% {
			opacity: 0;
			transform: scale(0) rotate(180deg);
			filter: blur(2px);
		}
		45% {
			opacity: 0.8;
			transform: scale(1.3) rotate(-10deg);
			filter: blur(0.5px);
		}
		70% {
			opacity: 1;
			transform: scale(0.9) rotate(5deg);
			filter: blur(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(0deg);
			filter: blur(0);
		}
	}

	/* Fade in title with stagger - delay set by JS */
	.qr-card-title {
		opacity: 0;
		animation: fadeSlideIn 0.4s ease-out forwards;
		animation-delay: 0ms; /* Will be overridden by JS */
	}

	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.qr-card-code :global(svg) {
		width: auto;
		height: 100%;
		max-width: 100%;
		aspect-ratio: 1;
	}

	.qr-card-url {
		position: absolute;
		bottom: -1.2em;
		left: 50%;
		transform: translateX(-50%);
		font-size: clamp(0.5rem, 1.5vw, 0.65rem);
		color: var(--default);
		max-width: 90%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}

	.qr-card:hover .qr-card-url {
		opacity: 1;
		pointer-events: auto;
	}

	.qr-card-code :global(svg path:first-child) {
		fill: transparent;
	}

	.qr-card:hover .qr-card-code {
		color: var(--highlight);
	}

	.qr-card:hover .qr-card-code :global(svg path:last-child) {
		stroke: var(--highlight);
	}

	.qr-card:hover .qr-card-code :global(svg rect) {
		fill: currentColor;
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
