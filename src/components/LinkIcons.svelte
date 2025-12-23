<script>
    import { onMount, tick } from "svelte";
    import { Tween } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { fade } from "svelte/transition";
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
        qrMode = $bindable(false),
    } = $props();

    // Set of link titles to show QRs for (when in qrMode)
    let selectedQrs = $state(/** @type {Set<string>} */ (new Set()));

    // Shared hover state between icon selector and QR grid
    let hoveredLink = $state(/** @type {string | null} */ (null));

    // FLIP animation for LinkSelector
    /** @type {HTMLDivElement | null} */
    let selectorWrapper = $state(null);
    let selectorY = new Tween(0, { duration: 300, easing: cubicOut });
    let lastY = $state(0);

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
        if (selectedQrs.has(title)) {
            selectedQrs.delete(title);
        } else {
            selectedQrs.add(title);
        }
        // Trigger reactivity
        selectedQrs = new Set(selectedQrs);
    }

    async function activateQrMode() {
        // Capture position before
        if (selectorWrapper) {
            lastY = selectorWrapper.getBoundingClientRect().top;
        }

        qrMode = true;
        // Update URL without navigation
        const url = new URL(window.location.href);
        url.searchParams.set("qr", "");
        window.history.pushState({}, "", url);

        // After layout updates, calculate offset and animate
        await tick();
        if (selectorWrapper) {
            const newY = selectorWrapper.getBoundingClientRect().top;
            const deltaY = lastY - newY;
            selectorY.set(deltaY, { duration: 0 }); // Start at old position
            selectorY.set(0); // Animate to new position
        }
    }

    async function deactivateQrMode() {
        // Capture position before layout change
        const startY = selectorWrapper?.getBoundingClientRect().top ?? 0;

        qrMode = false;
        selectedQrs = new Set();
        // Update URL without navigation
        const url = new URL(window.location.href);
        url.searchParams.delete("qr");
        window.history.pushState({}, "", url);

        // The qr-area fades out over 250ms but layout won't change until it's gone.
        // We need to animate the selector from bottom to center during this time.
        // Calculate where it will end up (roughly center of viewport)
        const viewportHeight = window.innerHeight;
        const selectorHeight =
            selectorWrapper?.getBoundingClientRect().height ?? 80;
        const endY = (viewportHeight - selectorHeight) / 2 + 64; // Account for title
        const deltaY = startY - endY;

        // Animate from current position (0 offset) to negative delta (moving up)
        selectorY.set(0, { duration: 0 });
        selectorY.set(-deltaY, { duration: 350 });

        // After animation completes, reset offset since layout will have changed
        setTimeout(() => {
            selectorY.set(0, { duration: 0 });
        }, 360);
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
        <div class="qr-area" out:fade={{ duration: 250 }}>
            <QrGrid links={qrLinks} {hoveredLink} />
        </div>
    {:else}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <h1
            class="title"
            ondblclick={activateQrMode}
            in:fade={{ duration: 200, delay: 250 }}
        >
            {selected ?? defaultTitle}
        </h1>
    {/if}

    <div
        class="selector-wrapper"
        bind:this={selectorWrapper}
        style:transform="translateY({selectorY.current}px)"
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
            ondeactivate={deactivateQrMode}
            onhover={(title) => (hoveredLink = title)}
        />
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
        will-change: transform;
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
