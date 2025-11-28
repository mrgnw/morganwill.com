/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const data = await parent();
	return {
		...data,
		qrMode: true
	};
}
