export function getJibComponents() {
    const components = import.meta.glob('/src/jibs/*.svelte');
    return {
        components,
        paths: Object.keys(components)
            .filter(path => !path.includes('+page'))
            .map(path => ({
                name: path.split('/').pop().replace('.svelte', ''),
                path: path.toLowerCase(),
                slug: path.split('/').pop().replace('.svelte', '').toLowerCase()
            }))
    };
} 