import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import Icons from "unplugin-icons/vite";
import { execSync } from "child_process";

// Plugin to generate QR codes before build
function generateQRPlugin() {
	return {
		name: "generate-qr-codes",
		buildStart() {
			console.log("Generating QR codes...");
			try {
				execSync("node scripts/generate-qr-codes.mjs", {
					stdio: "inherit",
					env: process.env,
				});
			} catch (error) {
				console.warn("QR code generation failed:", error.message);
			}
		},
	};
}

export default defineConfig({
	plugins: [
		generateQRPlugin(),
		sveltekit(),
		Icons({
			compiler: "svelte",
			autoInstall: false,
			defaultStyle: "",
			defaultClass: "",
			scale: 1,
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Split vendor libraries into separate chunks
					if (id.includes("node_modules")) {
						if (id.includes("shiki")) {
							return "vendor-shiki";
						}
						if (
							id.includes("svelte-sonner") ||
							id.includes("bits-ui") ||
							id.includes("tailwind-merge") ||
							id.includes("tailwind-variants")
						) {
							return "vendor-ui";
						}
						if (id.includes("qrcode")) {
							return "vendor-qr";
						}
						if (
							id.includes("@iconify/svelte") ||
							id.includes("@iconify/utils") ||
							id.includes("iconify-icon") ||
							id.includes("lucide-svelte")
						) {
							return "vendor-icons";
						}
						// Default vendor chunk
						return "vendor";
					}

					// Isolate QR codes into a separate chunk
					if (id.includes("generated-qr-codes")) {
						return "qr-codes";
					}

					// Split large jibs components
					if (id.includes("/src/jibs/")) {
						const match = id.match(/\/([^/]+)\.svelte$/);
						if (match) {
							const componentName = match[1].toLowerCase();
							// Split the heaviest components
							if (
								["Pkg", "Shiki", "Units", "Rates", "UrbanSports"].includes(
									match[1],
								)
							) {
								return `jib-${componentName}`;
							}
						}
					}
				},
			},
		},
		// Increase warning limit - shiki is legitimately large as a syntax highlighter library
		chunkSizeWarningLimit: 2000,
	},
	optimizeDeps: {
		include: [
			"@sveltejs/kit",
			"svelte",
			"svelte-sonner",
			"@iconify/svelte",
			"@iconify/utils",
			"bits-ui",
		],
	},
});
