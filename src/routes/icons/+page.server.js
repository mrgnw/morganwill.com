import { icons } from '$lib/icons';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    return {
        icons: icons.map(id => ({ id }))
    };
}
