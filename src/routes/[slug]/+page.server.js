import { error, redirect } from '@sveltejs/kit';

export const prerender = true;

/**
 * @type {{ [key: string]: string }}
 */
const redirects = {
	'': 'sms:morgan@textme.cc',
	'apple': 'sms:morgan@textme.cc',
	'imessage': 'sms:morgan@textme.cc',
};

// tell Svelte to reserve & pre-render each key in `redirects` as a [slug]
export function entries(){
	return Object.keys(redirects).map(
		slug => ({ slug })
	);
}

export const load = ({ params }) => {
	const { slug } = params;
	console.log(slug);
	const url = redirects[slug.toLowerCase()];

	if (url) { redirect(301, url); }
	else {
		error(404, {
        			message: 'Not found',
        		});
	}

}
