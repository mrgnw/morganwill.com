<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import * as Tooltip from '$lib/components/ui/tooltip';

	/** @type {string} */
	export let url;
	/** @type {number} */
	export let size = 128;
	/** @type {string} */
	export let color = '#ff0000';  // Bright red

	let qrSvg = '';
	let debugInfo = '';

	async function generateQR() {
		debugInfo = `URL: ${url}\nColor: ${color}`;
		try {
			const fullUrl = url.startsWith('http') ? url : `https://${url}`;
			
			qrSvg = await QRCode.toString(fullUrl, {
				type: 'svg',
				width: size,
				margin: 1,
				color: {
					dark: color,
					light: '#ffffff00'
				},
				rendererOpts: {
					pathFillType: 'fill'
				}
			});
			console.debug('Generated QR SVG:', qrSvg);
			debugInfo += '\nSVG Generated: Yes';
		} catch (err) {
			debugInfo += '\nError: ' + err.message;
		}
	}

	$: if (url && color) {
		generateQR();
	}

	onMount(() => {
		if (url) {
			generateQR();
		}
	});
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<div class="qr-container">
			{#if qrSvg}
				{@html qrSvg}
			{:else}
				<p>No QR code generated yet</p>
			{/if}
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content>
		<pre class="debug-info">{debugInfo}</pre>
	</Tooltip.Content>
</Tooltip.Root>

<style>
	.qr-container {
		position: relative;
		max-width: 100%;
		height: auto;
		min-height: 128px;
	}
	.qr-container :global(svg) {
		width: 100%;
		height: auto;
	}
	.debug-info {
		font-family: monospace;
		font-size: 12px;
		white-space: pre;
		margin: 0;
	}
</style>