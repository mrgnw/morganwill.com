import { dev } from '$app/environment';
import { getJibComponents } from '$jibs/index';

export function entries() {
	return getJibComponents().map(path => ({
		jib: path.split('/').pop().replace('.svelte', '').toLowerCase()
	}));
}

export async function load() {
	return {
		jibs: getJibComponents().paths.map(path => ({
			name: path.name,
			path: path.path
		}))
	};
}
