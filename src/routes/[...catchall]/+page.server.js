import { error, redirect } from '@sveltejs/kit';
import { getJibComponents } from '$jibs/index';

/**
 * @type {{ [key: string]: string }}
 */
const redirects = {
	'': 'sms:morgan@textme.cc',
	'apple': 'sms:morgan@textme.cc',
	'imessage': 'sms:morgan@textme.cc',
	'cal': 'https://cal.com/mrgnw/hi',
	'dm': 'https://a.xcc.es/telegram'
};

export function entries() {
	return Object.keys(redirects).map(
		catchall => ({ catchall })
	);
}

export const load = ({ params, platform }) => {
	const { catchall } = params;
	platform?.env?.ENVIRONMENT && platform.log.debug('Catchall param:', catchall);
	
	const slug = catchall.toLowerCase();
	platform?.env?.ENVIRONMENT && platform.log.debug('Slug:', slug);
	
	// Check if the slug matches a jib component
	const { paths } = getJibComponents();
	platform?.env?.ENVIRONMENT && platform.log.debug('Available paths:', paths);
	
	const matchingJib = paths.find(path => path.slug === slug);
	platform?.env?.ENVIRONMENT && platform.log.debug('Matching jib:', matchingJib);
	
	if (matchingJib) {
		platform?.env?.ENVIRONMENT && platform.log.debug('Redirecting to:', `/jibs/${slug}`);
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