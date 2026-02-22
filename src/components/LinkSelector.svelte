<script>
	import { fade } from "svelte/transition";
	import Icon from "$lib/icons/Icon.svelte";
	import { iconData } from "$lib/icons/data.js";

	/** @typedef {import('$lib/links.js').Link} Link */
	/** @type {Record<string, {viewBox: string, content: string}>} */
	const icons = iconData;

	/**
	 * @type {{
	 *   links: Link[],
	 *   selected?: string | null,
	 *   qrMode?: boolean,
	 *   iconSize?: string,
	 *   selectedQrs?: Set<string>,
	 *   hoveredLink?: string | null,
	 *   onselect?: (title: string | null) => void,
	 *   ontoggleqr?: (title: string) => void,
	 *   ondeactivate?: () => void,
	 *   onhover?: (title: string | null) => void
	 * }}
	 */
	let {
		links = [],
		selected = null,
		qrMode = false,
		iconSize = "clamp(3.5em, 8vw, 5.5em)",
		selectedQrs = new Set(),
		hoveredLink = null,
		onselect,
		ontoggleqr,
		ondeactivate,
		onhover,
	} = $props();

	/**
	 * @param {string | null} title
	 */
	function handleSelect(title) {
		onselect?.(title);
	}

	/**
	 * Handle icon click - navigate or toggle QR selection
	 * @param {string} title
	 * @param {string} url
	 * @param {MouseEvent} e
	 */
	function handleClick(title, url, e) {
		if (qrMode) {
			e.preventDefault();
			ontoggleqr?.(title);
		}
		// In non-qrMode, let the link navigate naturally
	}

	// Double-tap detection for deactivating QR mode (must tap same icon twice)
	let lastTap = 0;
	let lastTappedIcon = /** @type {string | null} */ (null);

	/**
	 * Handle double-tap to deactivate QR mode
	 * @param {string} title
	 */
	function handleDoubleTap(title) {
		const now = Date.now();
		if (now - lastTap < 300 && lastTappedIcon === title) {
			// Double tap on same icon detected
			if (qrMode) {
				ondeactivate?.();
			}
		}
		lastTap = now;
		lastTappedIcon = title;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
	class="links"
	class:qr-mode={qrMode}
	ontouchmove={(e) => {
		e.preventDefault();
		const touch = e.touches[0];
		const element = document.elementFromPoint(touch.clientX, touch.clientY);
		const linkElement = element?.closest("a");
		if (linkElement) {
			const linkData = links.find(
				(link) => linkElement.getAttribute("data-title") === link.title,
			);
			if (linkData) handleSelect(linkData.title);
		} else if (!qrMode) {
			handleSelect(null);
		}
	}}
>
	{#each links as { url, blurb, title, colors }, index (title)}
		{@const isSelected = selectedQrs.has(title)}
		{@const icon = icons[title]}
		<a
			href={qrMode ? undefined : url}
			target="_blank"
			aria-label={blurb}
			data-title={title}
			style="--icon-color: {colors[0]}"
			class:active={title === selected}
			class:qr-selected={qrMode && isSelected}
			class:flash-on={qrMode}
			class:flash-off={!qrMode}
			onclick={(e) => {
				handleClick(title, url, e);
				handleDoubleTap(title);
			}}
			ontouchstart={(e) => {
				e.preventDefault();
				handleSelect(title);
			}}
			ontouchend={(e) => {
				e.preventDefault();
				handleDoubleTap(title);
				if (qrMode) {
					ontoggleqr?.(title);
				} else if (selected === title) {
					setTimeout(() => {
						window.open(url, "_blank");
					}, 100);
				}
			}}
			onmouseover={() => {
				handleSelect(title);
				onhover?.(title);
			}}
			onmouseout={() => {
				if (!qrMode) handleSelect(null);
				onhover?.(null);
			}}
			onfocus={() => {
				handleSelect(title);
				onhover?.(title);
			}}
			onblur={() => {
				if (!qrMode) handleSelect(null);
				onhover?.(null);
			}}
		>
			{#if icon}
				<Icon
					size={iconSize}
					viewBox={icon.viewBox}
					content={icon.content}
				/>
			{/if}
		</a>
	{/each}
</div>

<style>
	.links {
		display: flex;
		gap: clamp(0.5rem, 2vw, 1.5rem);
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		flex-wrap: wrap;
		max-width: 100%;
		margin: 0 auto;
		overflow: hidden;
		flex-shrink: 0;
	}

	a {
		display: flex;
		justify-content: center;
		width: auto;
		position: relative;
		transition:
			transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.2s ease,
			fill 0.2s ease;
		fill: var(--default);
		will-change: transform, opacity;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* When any icon is hovered, dim the others but keep hovered at full opacity */
	.links:hover a:not(:hover):not(.active) {
		opacity: 0.5;
	}

	/* Hovered icon gets its brand color and full opacity */
	a:hover {
		fill: var(--icon-color, var(--highlight));
		opacity: 1;
		transform: scale(1.05);
		filter: brightness(1.1);
	}

	.active {
		fill: var(--icon-color, var(--highlight));
		opacity: 1;
		transform: scale(1.1);
	}

	.qr-selected {
		transform: scale(1.15);
		fill: var(--icon-color, var(--highlight));
		opacity: 1;
	}

	@media (prefers-color-scheme: dark) {
		a {
			--icon-color: color-mix(in oklch, var(--icon-color) 60%, white);
		}
	}

	.qr-selected :global(svg) {
		filter: drop-shadow(0 0 2px var(--icon-color, var(--highlight)));
		stroke-width: 2;
	}

	.qr-mode a:not(.qr-selected):not(:hover) {
		opacity: 0.4;
		transform: scale(0.9);
	}

	@keyframes flash-on {
		0% {
			fill: var(--default);
		}

		50% {
			fill: var(--highlight);
		}

		100% {
			fill: var(--default);
		}
	}

	@keyframes flash-off {
		0% {
			fill: var(--default);
		}

		50% {
			fill: rgba(128, 128, 128, 0.8);
		}

		100% {
			fill: var(--default);
		}
	}

	.flash-on {
		animation: flash-on 0.5s ease-in-out;
	}

	.flash-off {
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
