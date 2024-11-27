<script>
import "../app.pcss";
import "../app.postcss";
import 'iconify-icon';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();

</script>
{@render children?.()}
