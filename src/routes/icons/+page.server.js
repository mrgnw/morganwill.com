import { icons } from '$lib/icons';
import { getIconData, searchForIcon } from '@iconify/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const iconData = icons.map((iconId) => {
        const [prefix, name] = iconId.split(':');
        return {
            id: iconId,
            prefix,
            name
        };
    });
    
    return { icons: iconData };
}
