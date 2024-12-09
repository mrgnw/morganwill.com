import { dev } from '$app/environment';

function getJibComponents() {
	const components = import.meta.glob('$jibs/*.svelte', { eager: true });
	return Object.keys(components)
		.filter(path => !path.includes('+page'));
}

export function entries() {
	return getJibComponents().map(path => ({
		jib: path.split('/').pop().replace('.svelte', '').toLowerCase()
	}));
}

export async function load() {
	return {
		jibs: getJibComponents().map(path => ({
			name: path.split('/').pop().replace('.svelte', ''),
			path: path.toLowerCase()
			}))
	};
}
