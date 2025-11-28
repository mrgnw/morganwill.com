<script>
	import { onMount } from 'svelte';

	/**
	 * @type {{
	 *   icon: import('svelte').Component,
	 *   colors: string[],
	 *   size?: string,
	 *   strokeIcon?: boolean,
	 *   class?: string
	 * }}
	 */
	let { icon: Icon, colors, size = "1em", strokeIcon = false, class: className = '' } = $props();

	let gradient = $derived(
		colors.length > 1 
			? `linear-gradient(135deg, ${colors.join(', ')})` 
			: colors[0]
	);

	/** @type {HTMLSpanElement | null} */
	let wrapper = $state(null);
	let maskUrl = $state('');

	onMount(() => {
		if (!wrapper) return;
		
		// Wait for SVG to render
		requestAnimationFrame(() => {
			if (!wrapper) return;
			const svg = wrapper.querySelector('svg');
			if (!svg) return;

			// Clone SVG and set colors to white for mask
			const clone = /** @type {SVGElement} */ (svg.cloneNode(true));
			clone.style.color = 'white';
			
			if (strokeIcon) {
				// Stroke-based icons: set stroke to white, keep fill as-is
				clone.setAttribute('stroke', 'white');
				clone.querySelectorAll('path, circle, rect, polygon, ellipse, line, polyline').forEach(el => {
					if (el.hasAttribute('stroke') || el.getAttribute('stroke') !== 'none') {
						el.setAttribute('stroke', 'white');
					}
					// Only set fill to white if it's actually filled (not 'none')
					const fill = el.getAttribute('fill');
					if (fill && fill !== 'none') {
						el.setAttribute('fill', 'white');
					}
				});
			} else {
				// Fill-based icons: set fill to white, remove strokes
				clone.setAttribute('fill', 'white');
				clone.querySelectorAll('path, circle, rect, polygon, ellipse').forEach(el => {
					el.setAttribute('fill', 'white');
					el.removeAttribute('stroke');
				});
			}

			// Serialize to data URL
			const svgString = new XMLSerializer().serializeToString(clone);
			const encoded = encodeURIComponent(svgString)
				.replace(/'/g, '%27')
				.replace(/"/g, '%22');
			
			maskUrl = `url("data:image/svg+xml,${encoded}")`;
		});
	});
</script>

<span 
	class="colored-icon {className}"
	bind:this={wrapper}
	style="
		--size: {size};
		--gradient: {gradient};
		--mask-url: {maskUrl};
		--color: {colors[0]};
	"
>
	<span class="icon-capture" class:hidden={!!maskUrl}>
		<Icon width={size} height={size} />
	</span>
	{#if maskUrl}
		<span class="gradient-layer"></span>
	{/if}
</span>

<style>
	.colored-icon {
		display: inline-flex;
		position: relative;
		width: var(--size);
		height: var(--size);
		color: var(--color);
	}

	.icon-capture {
		display: flex;
	}

	.icon-capture.hidden {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.gradient-layer {
		position: absolute;
		inset: 0;
		background: var(--gradient);
		-webkit-mask-image: var(--mask-url);
		mask-image: var(--mask-url);
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
	}
</style>
