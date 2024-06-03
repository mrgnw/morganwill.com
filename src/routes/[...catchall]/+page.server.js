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


export function entries() {
	return Object.keys(redirects).map(
		catchall => ({ catchall: [catchall] })
	);
}

export const load = ({ params }) => {
	const { catchall } = params;
	const slug = catchall[0]; // assuming catchall is an array with at least one element
	console.log(slug);
	const url = redirects[slug.toLowerCase()];

	if (url) { redirect(301, url); }
	else {
		error(404, {
			message: 'Not found',
		});
	}
}