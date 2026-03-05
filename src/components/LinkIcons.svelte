<script>
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { goto, preloadData } from "$app/navigation";
	import QrGrid from "./QrGrid.svelte";
	import LinkSelector from "./LinkSelector.svelte";

	/** @typedef {import('$lib/links.js').Link} Link */

	/**
	 * @type {{
	 *   links: Link[],
	 *   defaultTitle?: string,
	 *   iconSize?: string,
	 *   selected?: string | null,
	 *   qrMode?: boolean,
	 *   email?: string | null
	 * }}
	 */
	let {
		links = [],
		defaultTitle = "",
		iconSize = "clamp(3.5em, 8vw, 5.5em)",
		selected = $bindable(null),
		qrMode = false,
		email = null,
	} = $props();

	// Set of link titles to show QRs for (when in qrMode)
	let selectedQrs = $state(/** @type {Set<string>} */ (new Set()));

	// Shared hover state between icon selector and QR grid
	let hoveredLink = $state(/** @type {string | null} */ (null));

	// Selector wrapper ref
	/** @type {HTMLDivElement | null} */
	let selectorWrapper = $state(null);

	// Links to display in the QR grid
	let qrLinks = $derived.by(() => {
		if (selectedQrs.size === 0) {
			// Show all links when none selected
			return links;
		}
		return links.filter((link) => selectedQrs.has(link.title));
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
		selectedQrs.has(title)
			? selectedQrs.delete(title)
			: selectedQrs.add(title);
		selectedQrs = new Set(selectedQrs);
	}

	function toggleQrMode() {
		const url = new URL(window.location.href);
		if (qrMode) {
			selectedQrs = new Set();
			url.searchParams.delete("qr");
		} else {
			url.searchParams.set("qr", "");
		}
		goto(url.toString(), { noScroll: true, keepFocus: true });
	}

	onMount(() => {
		if (!qrMode) {
			const url = new URL(window.location.href);
			url.searchParams.set("qr", "");
			preloadData(url.toString());
		}

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
			<QrGrid links={qrLinks} {hoveredLink} />
		</div>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<main>
			<h1 class="title" ondblclick={toggleQrMode}>
				{selected ?? defaultTitle}
			</h1>
		</main>
	{/if}

	<div
		class="selector-wrapper"
		bind:this={selectorWrapper}
		transition:fade={{ duration: 250 }}
	>
		<LinkSelector
			{links}
			{selected}
			{qrMode}
			{iconSize}
			{selectedQrs}
			{hoveredLink}
			onselect={handleSelect}
			ontoggleqr={toggleQr}
			ondeactivate={toggleQrMode}
			onhover={(title) => (hoveredLink = title)}
		/>
		{#if email}
			<a href="mailto:{email}" class="email-link">{email}</a>
		{/if}
	</div>
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

	.selector-wrapper {
		width: 100%;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.email-link {
		font-size: clamp(0.8rem, 2vw, 1rem);
		color: var(--default);
		text-decoration: none;
		opacity: 0.7;
		transition: opacity 0.2s ease, color 0.2s ease;
	}

	.email-link:hover {
		opacity: 1;
		color: var(--highlight);
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
