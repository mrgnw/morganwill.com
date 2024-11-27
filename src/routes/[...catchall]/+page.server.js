import { error, redirect } from '@sveltejs/kit';

export const prerender = true;

/**
 * @type {{ [key: string]: string }}
 */
const redirects = {
	'': 'sms:morgan@textme.cc',
	'apple': 'sms:morgan@textme.cc',
	'imessage': 'sms:morgan@textme.cc',
	'cal': 'https://cal.com/mrgnw/hi',
};


export function entries() {
	return Object.keys(redirects).map(
		catchall => ({ catchall })
	);
}

export const load = ({ params }) => {
	const { catchall } = params;
	const slug = catchall; // catchall is a string now, not an array
	console.log(slug);
	const url = redirects[slug.toLowerCase()];

	if (url) {
		return redirect(301, url);
	} else {
		return error(404, {
			message: 'Not found',
		});
	}
}