<script>
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	/** @type {string} */
	export let url;
	/** @type {number} */
	export let size = 128;

	let canvas;

	async function generateQR() {
		if (!canvas) return;

		try {
			const fullUrl = url.startsWith('http') ? url : `https://${url}`;
			await QRCode.toCanvas(canvas, fullUrl, {
				width: size,
				margin: 1,
				color: {
					dark: getComputedStyle(document.documentElement)
						.getPropertyValue('--primary')
						.trim() || '#000000',
					light: '#ffffff00' // transparent background
				}
			});
		} catch (err) {
			console.error('Error generating QR code:', err);
		}
	}

	$: if (url && canvas) {
		generateQR();
	}

	onMount(() => {
		if (url) {
			generateQR();
		}
	});
</script>

<canvas bind:this={canvas} width={size} height={size} />

<style>
	canvas {
		max-width: 100%;
		height: auto;
	}
</style>