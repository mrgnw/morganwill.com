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
		width: 40px;
		height: 40px;
		color: var(--default, rgba(0, 0, 0, 0.5));
		opacity: 0.4;
		transition: opacity 0.3s ease, color 0.3s ease;
	}

	button:hover {
		opacity: 0.8;
	}

	button :global(.sun),
	button :global(.moon) {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	button :global(.sun) {
		opacity: 1;
		transform: rotate(0deg);
	}
	button :global(.moon) {
		opacity: 0;
		transform: rotate(-90deg);
	}

	:global(.dark) button :global(.sun) {
		opacity: 0;
		transform: rotate(90deg);
	}
	:global(.dark) button :global(.moon) {
		opacity: 1;
		transform: rotate(0deg);
	}
</style>
