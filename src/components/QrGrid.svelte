<script>
    import { onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { scale } from "svelte/transition";
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
     *   links: Link[],
     *   hoveredLink?: string | null
     * }}
     */
    let { links = [], hoveredLink = null } = $props();

    // Container dimensions (updated via ResizeObserver)
    let containerWidth = $state(0);
    let containerHeight = $state(0);
    /** @type {HTMLDivElement | null} */
    let containerEl = $state(null);

    // Grid calculation - derive defaults from link count
    let initialCols = $derived(Math.ceil(Math.sqrt(links.length)));
    let initialSize = $derived(Math.floor(100 / initialCols)); // vh units

    // Reactive grid calculation based on container size
    let gridCalc = $derived.by(() => {
        const w = containerWidth;
        const h = containerHeight;
        const n = links.length;

        if (w === 0 || h === 0 || n === 0) {
            return {
                cols: initialCols,
                size: 0,
                ready: false,
                landscape: false,
            };
        }

        // Determine if we should use landscape layout (titles on side)
        const aspectRatio = w / h;
        const landscape = aspectRatio >= 1.1; // Use side titles when wider than tall

        const gap = 2; // pixels between cards

        // Special case: 3 or fewer items - single row or column
        if (n <= 3) {
            const useRow = landscape || aspectRatio >= 0.8; // Prefer row unless very tall
            const cols = useRow ? n : 1;
            const rows = useRow ? 1 : n;
            const availW = w - (cols - 1) * gap;
            const availH = h - (rows - 1) * gap;
            const size = Math.min(availW / cols, availH / rows);
            return { cols, size: Math.floor(size), ready: true, landscape };
        }

        let best = 0;
        let bestCols = 1;

        for (let c = 1; c <= n; c++) {
            const r = Math.ceil(n / c);
            // Account for gaps between cards
            const availW = w - (c - 1) * gap;
            const availH = h - (r - 1) * gap;
            // Cell size is simply the available space divided by count
            const cellW = availW / c;
            const cellH = availH / r;
            // QR must fit in both dimensions (square)
            const s = Math.min(cellW, cellH);
            if (s > best) {
                best = s;
                bestCols = c;
            }
        }

        // Return the cell size (includes space for title)
        return {
            cols: bestCols,
            size: Math.floor(best),
            ready: true,
            landscape,
        };
    });

    let cols = $derived(gridCalc.cols);
    let size = $derived(gridCalc.size);
    let ready = $derived(gridCalc.ready);
    let landscape = $derived(gridCalc.landscape);

    onMount(() => {
        if (!containerEl) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                containerWidth = entry.contentRect.width;
                containerHeight = entry.contentRect.height;
            }
        });

        resizeObserver.observe(containerEl);

        return () => resizeObserver.disconnect();
    });

    /**
     * Calculate animation delays for rects based on their position
     * Uses a simple linear stagger based on rect index
     * @param {HTMLElement} container
     * @param {number} baseDelay
     */
    function applyStaggeredDelays(container, baseDelay) {
        const svg = container.querySelector("svg");
        if (!svg) return;

        const rects = svg.querySelectorAll("rect");
        if (rects.length === 0) return;

        // Simple linear stagger: each rect gets a delay based on its index
        // This avoids expensive DOM measurements while still creating a visual wave
        rects.forEach((rect, index) => {
            const staggerAmount = Math.min(index * 6, 200); // Max 200ms of stagger
            const delay = baseDelay + staggerAmount;
            rect.style.setProperty("--rect-delay", `${delay}ms`);
        });
    }

    // Track which QR card is being hovered (internal state)
    let internalHover = $state(/** @type {number | null} */ (null));

    // Compute hovered index from external hoveredLink prop or internal hover
    let hoveredCard = $derived.by(() => {
        if (hoveredLink) {
            const idx = links.findIndex((l) => l.title === hoveredLink);
            return idx >= 0 ? idx : null;
        }
        return internalHover;
    });

    /**
     * Svelte action to apply staggered animation delays efficiently
     * @param {HTMLElement} node
     * @param {number} baseDelay
     */
    function staggerAction(node, baseDelay) {
        // Set initial delays immediately
        applyStaggeredDelays(node, baseDelay);

        return {
            /**
             * @param {number} newDelay
             */
            update(newDelay) {
                applyStaggeredDelays(node, newDelay);
            },
        };
    }

    // Reactive size unit for grid
    let sizeUnit = $derived(size ? `${size}px` : `${initialSize}vh`);
</script>

<div
    class="qrs-grid"
    class:ready
    class:landscape
    style="--card-size: {sizeUnit}; --cols: {cols}"
    bind:this={containerEl}
>
    {#each links as link, index (link.title)}
        <a
            href={link.url}
            target="_blank"
            class="qr-card"
            class:shrink={hoveredCard !== null && hoveredCard !== index}
            onmouseenter={() => (internalHover = index)}
            onmouseleave={() => (internalHover = null)}
            animate:flip={{ duration: 300 }}
            transition:scale={{ duration: 250, start: 0.8 }}
        >
            <div class="qr-card-code" use:staggerAction={100 + index * 80}>
                {#if link.qr}
                    <ColoredQr
                        qr={link.qr}
                        colors={link.colors ?? ["#888"]}
                        id="qr-{link.title}"
                        animate={false}
                    />
                {/if}
            </div>
            <span class="qr-card-title">{link.title}</span>
        </a>
    {/each}
</div>

<style>
    .qrs-grid {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        box-sizing: border-box;
        transition: opacity 0.2s ease;
        opacity: 0;
        gap: 2px;
    }

    .qrs-grid.ready {
        opacity: 1;
    }

    .qr-card {
        display: grid;
        grid-template-rows: 1fr auto;
        text-decoration: none;
        box-sizing: border-box;
        transition:
            transform 0.25s ease,
            opacity 0.25s ease,
            filter 0.25s ease;
        overflow: hidden;
        position: relative;
        width: var(--card-size);
        height: var(--card-size);
        flex-shrink: 0;
        content-visibility: auto;
        contain: layout style paint;
    }

    /* Landscape: title on left side */
    .qrs-grid.landscape .qr-card {
        grid-template-rows: 1fr;
        grid-template-columns: auto 1fr;
    }

    .qr-card.shrink {
        transform: scale(0.92);
        opacity: 0.7;
        filter: saturate(0.3);
    }

    /* QR code container */
    .qr-card-code {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        width: 100%;
        height: 100%;
        min-width: 0;
        min-height: 0;
        position: relative;
    }

    .qr-card-code :global(svg) {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .qr-card-title {
        font-size: clamp(0.5rem, 1.5vw, 0.9rem);
        font-weight: 700;
        color: #888;
        text-transform: capitalize;
        line-height: 1;
        text-align: center;
        padding: 0.25em 0.5em;
        transition: color 0.2s ease;
        z-index: 2;
        position: relative;
        opacity: 0;
        animation: fadeSlideIn 0.4s ease-out forwards;
        animation-delay: var(--title-delay, 0ms);
    }

    .qr-card:hover .qr-card-title {
        color: #3b82f6;
    }

    /* Landscape: rotate title on left side - text reads bottom to top */
    .qrs-grid.landscape .qr-card .qr-card-title {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        padding: 0.4em 0.2em;
        align-self: center;
        order: -1;
    }

    /* Ensure hover doesn't affect transform in landscape */
    .qrs-grid.landscape .qr-card:hover .qr-card-title {
        color: #3b82f6;
    }

    /* Animate individual QR modules (rects) with staggered timing */
    .qr-card-code :global(svg rect) {
        opacity: 0;
        transform-origin: center center;
        transform: scale(0) rotate(180deg);
        animation: radialBloom 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        animation-delay: var(--rect-delay, 0ms);
    }

    @keyframes radialBloom {
        0% {
            opacity: 0;
            transform: scale(0) rotate(180deg);
            filter: blur(2px);
        }
        45% {
            opacity: 0.8;
            transform: scale(1.3) rotate(-10deg);
            filter: blur(0.5px);
        }
        70% {
            opacity: 1;
            transform: scale(0.9) rotate(5deg);
            filter: blur(0);
        }
        100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: blur(0);
        }
    }

    @keyframes fadeSlideIn {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .qr-card-code :global(svg path:first-child) {
        fill: transparent;
    }

    .qr-card:hover .qr-card-code :global(svg path:last-child) {
        stroke: var(--highlight);
    }

    .qr-card:hover .qr-card-title {
        color: var(--highlight);
    }
</style>
