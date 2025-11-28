<script>
	import { onMount } from "svelte";
	import QrGrid from "./QrGrid.svelte";
	import LinkSelector from "./LinkSelector.svelte";

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
	 *   links: Link[],
	 *   defaultTitle?: string,
	 *   iconSize?: string,
	 *   selected?: string | null,
	 *   qrMode?: boolean
	 * }}
	 */
	let {
		links = [],
		defaultTitle = "",
		iconSize = "clamp(3.5em, 8vw, 5.5em)",
		selected = $bindable(null),
		qrMode = $bindable(false)
	} = $props();

	// Set of link titles to show QRs for (when in qrMode)
	let selectedQrs = $state(/** @type {Set<string>} */ (new Set()));

	// Links to display in the QR grid
	let qrLinks = $derived.by(() => {
		if (selectedQrs.size === 0) {
			// Show all links when none selected
			return links;
		}
		return links.filter(link => selectedQrs.has(link.title));
	});

	/**
	 * @param {string | null} title
	 */
	function handleSelect(title) {
		selected = title;
	}

	/**
	 * Toggle a QR in the selection (for qrMode)
	 * @param {string} title
	 */
	function toggleQr(title) {
		if (selectedQrs.has(title)) {
			selectedQrs.delete(title);
		} else {
			selectedQrs.add(title);
		}
		// Trigger reactivity
		selectedQrs = new Set(selectedQrs);
	}

	function activateQrMode() {
		qrMode = true;
		// Update URL without navigation
		const url = new URL(window.location.href);
		url.searchParams.set('qr', '');
		window.history.pushState({}, '', url);
	}

	function deactivateQrMode() {
		qrMode = false;
		selectedQrs = new Set();
		// Update URL without navigation
		const url = new URL(window.location.href);
		url.searchParams.delete('qr');
		window.history.pushState({}, '', url);
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
</script>

<div class="link-icons" class:qr-mode={qrMode}>
	{#if qrMode}
		<div class="qr-area">
			<QrGrid links={qrLinks} />
		</div>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<h1 class="title" ondblclick={activateQrMode}>
			{selected ?? defaultTitle}
		</h1>
	{/if}

	<LinkSelector 
		{links} 
		{selected} 
		{qrMode}
		{iconSize}
		selectedQrs={selectedQrs}
		onselect={handleSelect}
		ontoggleqr={toggleQr}
		ondeactivate={deactivateQrMode}
	/>
</div>

<style>
	.link-icons {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.link-icons.qr-mode {
		width: 100vw;
		height: 100dvh;
		height: 100vh; /* fallback */
		height: 100dvh;
		position: fixed;
		top: 0;
		left: 0;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.qr-area {
		flex: 1;
		width: 100%;
		min-height: 0;
		overflow: hidden;
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
</style>
