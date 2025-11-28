<script>
	import { fade } from "svelte/transition";
	import ColoredIcon from "./ColoredIcon.svelte";

	// Icon imports
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
	 * @property {string[]} [colors]
	 * @property {boolean} [strokeIcon]
	 */

	/**
	 * @type {{
	 *   links: Link[],
	 *   selected?: string | null,
	 *   qrMode?: boolean,
	 *   iconSize?: string,
	 *   selectedQrs?: Set<string>,
	 *   onselect?: (title: string | null) => void,
	 *   ontoggleqr?: (title: string) => void,
	 *   ondeactivate?: () => void
	 * }}
	 */
	let {
		links = [],
		selected = null,
		qrMode = false,
		iconSize = "clamp(3.5em, 8vw, 5.5em)",
		selectedQrs = new Set(),
		onselect,
		ontoggleqr,
		ondeactivate
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

	// Double-tap detection for deactivating QR mode
	let lastTap = 0;
	function handleDoubleTap() {
		const now = Date.now();
		if (now - lastTap < 300) {
			// Double tap detected
			if (qrMode) {
				ondeactivate?.();
			}
		}
		lastTap = now;
	}

	/**
	 * Get the icon component for a given link title
	 * @param {string} title
	 */
	function getIcon(title) {
		return iconMap[title] ?? null;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<div
	class="links"
	class:qr-mode={qrMode}
	onclick={handleDoubleTap}
	ontouchend={handleDoubleTap}
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
	{#each links as { url, blurb, title, colors, strokeIcon }, index (title)}
		{@const icon = getIcon(title)}
		{@const isSelected = selectedQrs.has(title)}
		{@const primaryColor = colors?.[0] ?? 'var(--highlight)'}
		<a
			href={qrMode ? undefined : url}
			target="_blank"
			aria-label={blurb}
			data-title={title}
			class:active={title === selected}
			class:qr-selected={qrMode && isSelected}
			class:flash-on={qrMode}
			class:flash-off={!qrMode}
			style={qrMode && isSelected ? `--icon-color: ${primaryColor}` : ''}
			onclick={(e) => handleClick(title, url, e)}
			ontouchstart={(e) => {
				e.preventDefault();
				handleSelect(title);
			}}
			ontouchend={(e) => {
				e.preventDefault();
				if (qrMode) {
					ontoggleqr?.(title);
				} else if (selected === title) {
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
				{@const iconColors = colors ?? ['var(--default)']}
				{#if qrMode && isSelected}
					<ColoredIcon icon={Icon} colors={iconColors} size={iconSize} strokeIcon={strokeIcon} />
				{:else}
					<Icon
						width={iconSize}
						height={iconSize}
					/>
				{/if}
			{/if}
		</a>
	{/each}
</div>

<style>
	.links {
		display: flex;
		gap: clamp(0.75rem, 3vw, 1.5rem);
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		flex-wrap: nowrap;
		max-width: 100%;
		margin: 0 auto;
		overflow-x: auto;
		flex-shrink: 0;
	}

	a {
		display: flex;
		justify-content: center;
		width: auto;
		position: relative;
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
		color: var(--default);
	}

	.active {
		color: var(--highlight);
	}

	.qr-selected {
		transform: scale(1.15);
		color: var(--icon-color, var(--highlight));
	}

	.qr-mode a:not(.qr-selected) {
		opacity: 0.5;
		transform: scale(0.9);
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
