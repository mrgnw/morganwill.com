<script>
	import { fade } from "svelte/transition";
	import ColoredQr from "./ColoredQr.svelte";

	/**
	 * @typedef {Object} Link
	 * @property {string} title
	 * @property {string} alias
	 * @property {string} url
	 * @property {string} blurb
	 * @property {string} [qr]
	 * @property {string[]} [colors]
	 */

	/**
	 * @type {{
	 *   link: Link,
	 *   ondblclick?: () => void
	 * }}
	 */
	let { link, ondblclick } = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="qr-single" ondblclick={ondblclick}>
	<div class="qr-wrapper">
		{#if link.url}
			<div class="url-display" transition:fade={{ duration: 300 }}>
				<a
					href={link.url}
					target="_blank"
					class="url-link"
				>
					{link.url}
				</a>
			</div>
		{/if}
		{#if link.qr}
			<ColoredQr 
				qr={link.qr} 
				colors={link.colors ?? ['#888']} 
				id="qr-{link.title}"
				animate={false}
			/>
		{/if}
	</div>
</div>

<style>
	.qr-single {
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

	.qr-wrapper :global(.colored-qr) {
		width: 164px;
		height: 164px;
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
</style>
