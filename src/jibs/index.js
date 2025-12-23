// Static list of jibs - avoids import.meta.glob() which bundles everything
const jibsList = [
  "Lote",
  "Matrix",
  "MultiColumnDemo",
  "Pkg",
  "Rates",
  "SalaryCalculator",
  "Shiki",
  "T90",
  "TechStack",
  "Units",
  "UnixTime",
  "UrbanSports",
];

export function getJibComponents() {
  // Define external jibs
  const externalJibs = [
    {
      name: "3d experiments",
      path: "https://foto3.pages.dev",
    },
  ];

  // Jibs to exclude from listing (but still accessible via routes)
  const unlistJibs = ["Lote"];

  const localJibs = jibsList
    .filter((name) => !unlistJibs.includes(name))
    .map((name) => ({
      name: name,
      path: `/jibs/${name.toLowerCase()}`,
      slug: name.toLowerCase(),
    }));

  return {
    paths: [...externalJibs, ...localJibs],
  };
}
