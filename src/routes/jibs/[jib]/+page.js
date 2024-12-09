import { error } from '@sveltejs/kit';

const components = import.meta.glob('/src/jibs/*.svelte');

export async function load({ params }) {
    // Find the actual path case-insensitively
    const actualPath = Object.keys(components).find(
        path => path.toLowerCase() === `/src/jibs/${params.jib}.svelte`.toLowerCase()
    );
    
    if (!actualPath) {
        error(404, {
            message: `Jib '${params.jib}' not found. Available paths: ${Object.keys(components).join(', ')}`
        });
    }

    const component = components[actualPath];
    return {
        component: (await component()).default
    };
} 