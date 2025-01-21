export function getJibComponents() {
	const components = import.meta.glob('/src/jibs/*.svelte');
	
	// Define external jibs
	const externalJibs = [
		{
			name: '3d experiments',
			path: 'https://foto3.pages.dev'
		}
	];

	const localJibs = Object.keys(components)
		.filter(path => !path.includes('+page'))
		.map(path => ({
			name: path.split('/').pop().replace('.svelte', ''),
			path: path.toLowerCase()
		}));

	return {
		components,
		paths: [...externalJibs, ...localJibs]
	};
}