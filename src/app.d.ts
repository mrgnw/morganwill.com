// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

// TypeScript support for unplugin-icons
declare module '~icons/*' {
	import { SvelteComponent } from 'svelte';
	const component: typeof SvelteComponent;
	export default component;
}

declare module 'virtual:icons/*' {
	import { SvelteComponent } from 'svelte';
	const component: typeof SvelteComponent;
	export default component;
}
