
import { error, redirect } from '@sveltejs/kit';

let aliases = {
	'': 'imessage',
	'text': 'imessage',
};

let redirects = {
	'imessage': 'sms:imessage@textme.cc',
};

Object.keys(aliases).forEach(
	alias => redirects[alias] = redirects[aliases[alias]]
);

export const load = ({ params }) => {
	const { slug } = params;
	const url = redirects[slug.toLowerCase()];

	if (url) { throw redirect(301, url) }
	else {
		throw error(404, {
			message: 'Not found',
			code: 'NOT_FOUND'
		});
	}

}
