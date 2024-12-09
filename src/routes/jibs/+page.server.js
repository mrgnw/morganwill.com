import { dev } from '$app/environment';
import { getJibComponents } from '$jibs/index';

export function entries() {
	return getJibComponents().paths.map(path => ({
		jib: path.slug
	}));
}

export async function load() {
	const { paths, components } = getJibComponents();
	
	// Return just the paths - we'll load components client-side
	return {
		jibs: paths.map(path => ({
			name: path.name,
			path: path.path,
			slug: path.slug
		}))
	};
}
