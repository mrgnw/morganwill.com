
import { error, redirect } from '@sveltejs/kit';

let aliases = {
	'git' : 'github', 
	'insta' : 'instagram', 
	'li' : 'linkedin', 
	'tw' : 'twitter', 
	'dm' : 'telegram', 
};

let redirects = {
	'github': 'https://www.github.com/mrgnw',
	'imessage': 'sms:imessage@textme.cc',
	'instagram': 'https://www.instagram.com/mrgnw2/',
	'linkedin': 'https://www.linkedin.com/in/mrgnw/',
	'outsite': 'https://app.outsite.co/c/ZfUYmDab8',
	'telegram': 'https://t.me/mrgnw',
	'twitter': 'https://twitter.com/mrgnw',
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

