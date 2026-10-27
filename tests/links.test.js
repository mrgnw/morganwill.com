import { describe, expect, it, vi } from "vitest";
import { buildLink, linkTemplates, parseCustomLinks } from "../src/lib/links.js";

describe("custom contact links", () => {
	it("omits a value-dependent link when no value is available", () => {
		const template = linkTemplates.find((link) => link.title === "whatsapp");
		expect(template).toBeDefined();
		if (!template) throw new Error("WhatsApp template is missing");
		expect(buildLink(template, null, null)).toBeNull();
	});

	it("keeps valid links when an unknown type is supplied", () => {
		const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
		try {
			const templates = parseCustomLinks(JSON.stringify([
				{ type: "unknown", value: "unused" },
				{ type: "whatsapp", value: "+34 612 345 678" },
			]), new Map());
			expect(templates).toHaveLength(1);
			const template = templates[0];
			expect(buildLink(template, null, template.__customValue ?? null)?.url)
				.toBe("https://wa.me/34612345678");
		} finally {
			warning.mockRestore();
		}
	});

	it("gives additional links distinct names and aliases", () => {
		const templates = parseCustomLinks(JSON.stringify([
			{ type: "whatsapp", value: "34612345678" },
			{ type: "whatsapp", value: "34698765432" },
		]), new Map([["whatsapp", 1]]));
		expect(templates.map(({ title, alias }) => ({ title, alias }))).toEqual([
			{ title: "whatsapp2", alias: "wa2" },
			{ title: "whatsapp3", alias: "wa3" },
		]);
	});
});
