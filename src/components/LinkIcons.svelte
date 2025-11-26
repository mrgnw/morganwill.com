<script>
	import { fade } from "svelte/transition";

	// Icon imports - managed internally
	import JamLinkedinCircle from "~icons/jam/linkedin-circle";
	import IconoirGithubCircle from "~icons/iconoir/github-circle";
	import IconoirTelegramCircle from "~icons/iconoir/telegram-circle";
	import RiBlueskyLine from "~icons/ri/bluesky-line";
	import TablerFileCv from "~icons/tabler/file-cv";
	import PhBookmarkSimpleBold from "~icons/ph/bookmark-simple-bold";
	import RiInstagramLine from "~icons/ri/instagram-line";

	/** @type {Record<string, import('svelte').Component>} */
	const iconMap = {
		photos: RiInstagramLine,
		LinkedIn: JamLinkedinCircle,
		github: IconoirGithubCircle,
		bluesky: RiBlueskyLine,
		message: IconoirTelegramCircle,
		blog: PhBookmarkSimpleBold,
		cv: TablerFileCv
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
	 *   qrMode?: boolean,
	 *   selected?: string | null,
	 *   onselect?: (title: string | null) => void,
	 *   iconSize?: string
	 * }}
	 */
	let {
		links = [],
		qrMode = false,
		selected = null,
		onselect,
		iconSize = "4.5em"
	} = $props();

	/**
	 * Get the icon component for a given link title
	 * @param {string} title
	 */
	function getIcon(title) {
		return iconMap[title] ?? null;
	}

	/**
	 * @param {string | null} title
	 */
	function handleSelect(title) {
		if (onselect) {
			onselect(title);
		}
	}
</script>

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

<style>
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

	.active {
		color: var(--highlight);
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

	a :global(svg) {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		pointer-events: none;
	}
</style>
