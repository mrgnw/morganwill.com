import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	// Redirect /qr to /?qr, preserving any other query params
	const params = new URLSearchParams(url.searchParams);
	params.set('qr', '');
	throw redirect(307, `/?${params.toString()}`);
}
