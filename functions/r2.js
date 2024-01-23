export async function onRequest(context, request) {
	r2_path = request.path;
	console.log(r2_path);
  const obj = await context.env.R2_BUCKET.get(r2_path);
  if (obj === null) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(obj.body);
}