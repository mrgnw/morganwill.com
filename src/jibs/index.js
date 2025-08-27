export function getJibComponents() {
  const components = import.meta.glob("/src/jibs/*.svelte");

  // Define external jibs
  const externalJibs = [
    {
      name: "3d experiments",
      path: "https://foto3.pages.dev",
    },
  ];

  // Jibs to exclude from listing (but still accessible via routes)
  const unlistJibs = ['Lote'];

  const localJibs = Object.keys(components)
    .filter((path) => {
      if (path.includes("+page")) return false;
      const name = path.split("/").pop()?.replace(".svelte", "") || "";
      return !unlistJibs.includes(name);
    })
    .map((path) => ({
      name: path.split("/").pop()?.replace(".svelte", "") || "",
      path: path.toLowerCase(),
    }));

  return {
    components,
    paths: [...externalJibs, ...localJibs],
  };
}
