import { dev } from "$app/environment";
import { getJibComponents } from "$jibs/index";

export function entries() {
  const { paths } = getJibComponents();
  return paths
    .filter((path) => !path.path.startsWith("http")) // Skip external links
    .map((path) => ({
      jib: path.path.split("/").pop() || path.name.toLowerCase(),
    }));
}

export async function load() {
  const { paths } = getJibComponents();

  // Return just the paths - we'll load components client-side
  return {
    jibs: paths.map((path) => ({
      name: path.name,
      path: path.path,
    })),
  };
}
