import { error, redirect } from '@sveltejs/kit';

export const prerender = true;

/**
 * @type {{ [key: string]: string }}
 */
const redirects = {
	'': 'sms:morgan@textme.cc',
};

// tell Svelte to reserve & pre-render each key in `redirects` as a [slug]
export function entries(){
	return Object.keys(redirects).map(
		slug => ({ slug })
	);
}

export const load = ({ params }) => {
	const { slug } = params;
	const url = redirects[slug.toLowerCase()];

	if (url) { throw redirect(301, url) }
	else {
		throw error(404, {
			message: 'Not found',
		});
	}

}
