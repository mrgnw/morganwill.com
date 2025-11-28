<script>
	/**
	 * @type {{
	 *   qr: string,
	 *   colors: string[],
	 *   id: string,
	 *   animate?: boolean,
	 *   class?: string
	 * }}
	 */
	let { qr, colors, id, animate = true, class: className = '' } = $props();

	/**
	 * Build SVG gradient defs from colors array
	 * @param {string[]} colors
	 * @param {string} id
	 * @param {number} size
	 */
	function buildGradientDefs(colors, id, size) {
		const stops = colors.map((color, i) => {
			const offset = (i / (colors.length - 1)) * 100;
			return `<stop offset="${offset}%" stop-color="${color}"/>`;
		}).join('');
		return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${size}" y2="${size}">${stops}</linearGradient></defs>`;
	}

	// Derive the final SVG reactively
	let finalSvg = $derived.by(() => {
		// Extract the viewBox size from the SVG
		const sizeMatch = qr.match(/viewBox="0 0 (\d+) (\d+)"/);
		const svgSize = sizeMatch ? parseInt(sizeMatch[1]) : 164;

		if (colors.length > 1) {
			// Gradient: inject defs and use url(#id) fill
			const gradientDefs = buildGradientDefs(colors, id, svgSize);
			const coloredSvg = qr.replace(/fill="currentColor"/g, `fill="url(#${id})"`);
			return coloredSvg.replace(/(<svg[^>]*>)/, `$1${gradientDefs}`);
		} else {
			// Single color: just replace currentColor with the actual color
			return qr.replace(/fill="currentColor"/g, `fill="${colors[0]}"`);
		}
	});
</script>

<div class="colored-qr {className}" class:animate>
	{@html finalSvg}
</div>

<style>
	.colored-qr {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.colored-qr :global(svg) {
		width: 100%;
		height: 100%;
	}

	.colored-qr.animate :global(rect) {
		opacity: 0;
		animation: fadeIn 0.15s ease-out forwards;
	}

	@keyframes fadeIn {
		to { opacity: 1; }
	}
</style>
