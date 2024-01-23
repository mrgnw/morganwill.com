export async function onRequest(context, request) {
	const r2_path = request.path.slice(3);
	console.log(r2_path);
  const obj = await context.env.R2_BUCKET.get(`${r2_path}.tsv`);
  if (obj === null) {
    return new Response('Not found', { status: 404, message: `${r2_path}.tsv` });
  }
  return new Response(obj.body);
}