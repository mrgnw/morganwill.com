import { dev } from '$app/environment';
import { getJibComponents } from '$jibs/index';

export function entries() {
	return getJibComponents().paths.map(path => ({
		jib: path.slug
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
