import { error, redirect } from '@sveltejs/kit';
import { getJibComponents } from '$jibs/index';

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
	const slug = catchall.toLowerCase(); // catchall is a string now, not an array

	// Check if the slug matches a jib component
	const { paths } = getJibComponents();
	const matchingJib = paths.find(path => path.slug === slug);
	if (matchingJib) {
		return redirect(301, `/jibs/${slug}`);
	}

	// Check regular redirects
	const url = redirects[slug];
	if (url) {
		return redirect(301, url);
	}

	return error(404, {
		message: 'Not found',
	});
};