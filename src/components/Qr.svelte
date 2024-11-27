<script>
	import { run } from 'svelte/legacy';

	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	
	
	/**
	 * @typedef {Object} Props
	 * @property {string} url
	 * @property {number} [size]
	 */

	/** @type {Props} */
	let { url, size = 128 } = $props();

	let canvas = $state();

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

	run(() => {
		if (url && canvas) {
			generateQR();
		}
	});

	onMount(() => {
		if (url) {
			generateQR();
		}
	});
</script>

<canvas bind:this={canvas} width={size} height={size}></canvas>

<style>
	canvas {
		max-width: 100%;
		height: auto;
	}
</style>