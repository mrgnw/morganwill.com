<script>
	import { cn } from "$lib/utils.js.js";
	let className = undefined;
	export { className as class };
</script>

<tbody class={cn("[&_tr:last-child]:border-0", className)} {...$$restProps}>
	<slot />
</tbody>
