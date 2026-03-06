import { error, redirect } from "@sveltejs/kit";
import { presetAliases } from "$lib/presets.js";

/**
 * @type {{ [key: string]: string }}
 */
const redirects = {
  "": "sms:morgan@textme.cc",
  apple: "sms:morgan@textme.cc",
  imessage: "sms:morgan@textme.cc",
  cal: "https://cal.com/mrgnw/hi",
  dm: "https://a.xcc.es/telegram",
};

export function entries() {
  return [
    ...Object.keys(redirects).map((catchall) => ({ catchall })),
    ...Object.keys(presetAliases).map((catchall) => ({ catchall })),
  ];
}

/** @type {import('./$types').PageServerLoad} */
export const load = ({ params }) => {
  const { catchall } = params;
  const slug = catchall.toLowerCase();

  // Check preset aliases — redirect to /?preset&qr
  if (presetAliases[slug]) {
    return redirect(302, `/?${slug}&qr`);
  }

  // Check regular redirects
  const url = redirects[slug];
  if (url) {
    return redirect(301, url);
  }

  return error(404, {
    message: "Not found",
  });
};
