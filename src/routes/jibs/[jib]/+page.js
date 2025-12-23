import { error } from "@sveltejs/kit";

// Create a map of jibs for lazy loading
const jibMap = {
  pkg: () => import("/src/jibs/Pkg.svelte"),
  shiki: () => import("/src/jibs/Shiki.svelte"),
  units: () => import("/src/jibs/Units.svelte"),
  rates: () => import("/src/jibs/Rates.svelte"),
  urbansports: () => import("/src/jibs/UrbanSports.svelte"),
  salarycalculator: () => import("/src/jibs/SalaryCalculator.svelte"),
  unixtime: () => import("/src/jibs/UnixTime.svelte"),
  matrix: () => import("/src/jibs/Matrix.svelte"),
  lote: () => import("/src/jibs/Lote.svelte"),
  t90: () => import("/src/jibs/T90.svelte"),
  techstack: () => import("/src/jibs/TechStack.svelte"),
  multicolumndemo: () => import("/src/jibs/MultiColumnDemo.svelte"),
};

export async function load({ params }) {
  const jibName = params.jib.toLowerCase();

  if (!(jibName in jibMap)) {
    error(404, {
      message: `Jib '${params.jib}' not found. Available jibs: ${Object.keys(jibMap).join(", ")}`,
    });
  }

  try {
    const module = await jibMap[jibName]();
    return {
      component: module.default,
    };
  } catch (err) {
    error(500, {
      message: `Failed to load jib '${params.jib}'`,
    });
  }
}
