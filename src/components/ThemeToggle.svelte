<script>
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	import { toggleMode } from "mode-watcher";
</script>

<button onclick={toggleMode} aria-label="Toggle theme">
	<Sun class="icon sun" />
	<Moon class="icon moon" />
</button>

<style>
	button {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: 100;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		color: var(--default, rgba(0, 0, 0, 0.5));
		opacity: 0.4;
		transition: opacity 0.2s ease;
	}

	button:hover {
		opacity: 0.8;
	}

	button :global(.sun) {
		display: block;
	}
	button :global(.moon) {
		display: none;
	}

	:global(.dark) button :global(.sun) {
		display: none;
	}
	:global(.dark) button :global(.moon) {
		display: block;
	}
</style>
