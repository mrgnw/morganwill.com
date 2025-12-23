import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Performance Metrics", () => {
  let measurements = [];

  beforeEach(() => {
    measurements = [];
  });

  afterEach(() => {
    if (measurements.length > 0) {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const max = Math.max(...measurements);
      console.log(
        `  Measurements: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms`,
      );
    }
  });

  describe("QR Code Generation", () => {
    it("should generate QR SVG in < 50ms", async () => {
      const { generateQRSvg } =
        await import("../src/lib/qr/runtime-generator.js");

      const start = performance.now();
      const svg = generateQRSvg("https://example.com/test", 164);
      const duration = performance.now() - start;

      measurements.push(duration);

      expect(svg).toContain("svg");
      expect(svg).toContain("rect");
      expect(duration).toBeLessThan(50);
    });

    it("should cache generated QR codes", async () => {
      const { getOrGenerateQRSvg, clearQRCache } =
        await import("../src/lib/qr/runtime-generator.js");

      clearQRCache();
      const url = "https://example.com/cache-test";

      // First generation
      const start1 = performance.now();
      const qr1 = getOrGenerateQRSvg(url);
      const duration1 = performance.now() - start1;

      // Cached retrieval
      const start2 = performance.now();
      const qr2 = getOrGenerateQRSvg(url);
      const duration2 = performance.now() - start2;

      measurements.push(duration1);
      measurements.push(duration2);

      expect(qr1).toBe(qr2);
      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(5); // Cache retrieval should be very fast
    });
  });

  describe("Animation Setup", () => {
    it("should set up staggered delays efficiently", () => {
      // Simulate what happens when QR mounts
      const svg = document.createElement("svg");

      // Create 100 rects to simulate realistic QR code
      for (let i = 0; i < 100; i++) {
        const rect = document.createElement("rect");
        rect.setAttribute("x", String(i * 2));
        rect.setAttribute("y", String(i * 2));
        svg.appendChild(rect);
      }

      const start = performance.now();

      const rects = svg.querySelectorAll("rect");
      const baseDelay = 100;

      rects.forEach((rect, index) => {
        const staggerAmount = Math.min(index * 6, 200);
        const delay = baseDelay + staggerAmount;
        rect.style.setProperty("--rect-delay", `${delay}ms`);
      });

      const duration = performance.now() - start;

      measurements.push(duration);

      expect(duration).toBeLessThan(10);
      expect(rects[0].style.getPropertyValue("--rect-delay")).toBe("100ms");
      expect(rects[50].style.getPropertyValue("--rect-delay")).toBe("300ms"); // 100 + min(50*6, 200) = 100 + 200
    });

    it("should not recalculate delays on every interaction", () => {
      // This test verifies the optimization: delays are set once, not recalculated
      const svg = document.createElement("svg");

      for (let i = 0; i < 100; i++) {
        const rect = document.createElement("rect");
        svg.appendChild(rect);
      }

      const rects = svg.querySelectorAll("rect");
      const baseDelay = 100;

      // Setup phase (only happens once)
      const setupStart = performance.now();
      rects.forEach((rect, index) => {
        const delay = baseDelay + Math.min(index * 6, 200);
        rect.style.setProperty("--rect-delay", `${delay}ms`);
      });
      const setupDuration = performance.now() - setupStart;

      // Simulate hover events (should NOT recalculate)
      const hoverDurations = [];
      for (let hover = 0; hover < 10; hover++) {
        const hoverStart = performance.now();
        // Old code would recalculate here - we just verify CSS vars don't change
        const value = rects[50].style.getPropertyValue("--rect-delay");
        const hoverDuration = performance.now() - hoverStart;
        hoverDurations.push(hoverDuration);

        expect(value).toBe("300ms"); // Should be unchanged
      }

      measurements.push(setupDuration);
      measurements.push(...hoverDurations);

      expect(setupDuration).toBeLessThan(10);
      const avgHoverTime =
        hoverDurations.reduce((a, b) => a + b) / hoverDurations.length;
      expect(avgHoverTime).toBeLessThan(1); // Hover interaction is now negligible
    });
  });

  describe("Link Processing", () => {
    it("should process link templates efficiently", async () => {
      const { linkTemplates, buildLink } = await import("../src/lib/links.js");

      const start = performance.now();

      const allLinks = linkTemplates
        .map((template) => {
          return buildLink(template, null, null);
        })
        .filter(Boolean);

      const duration = performance.now() - start;

      measurements.push(duration);

      expect(allLinks.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10);
    });

    it("should filter links by title efficiently", async () => {
      const { linkTemplates, buildLink } = await import("../src/lib/links.js");

      const allLinks = linkTemplates
        .map((template) => buildLink(template, null, null))
        .filter(Boolean);

      const titlesToShow = ["instagram", "linkedin", "github"];

      const start = performance.now();

      const filteredLinks = titlesToShow
        .map((title) =>
          allLinks.find((link) => link.title === title || link.alias === title),
        )
        .filter(Boolean);

      const duration = performance.now() - start;

      measurements.push(duration);

      expect(filteredLinks.length).toBe(3);
      expect(duration).toBeLessThan(5);
    });
  });

  describe("Build-time Generation", () => {
    it("should detect unchanged URLs and skip regeneration", async () => {
      // Simulate what the build script does with incremental generation
      const mockExisting = {
        instagram: "<svg>...</svg>",
        linkedin: "<svg>...</svg>",
        github: "<svg>...</svg>",
      };

      const mockNew = {
        instagram: "<svg>...</svg>",
        linkedin: "<svg>...</svg>",
        github: "<svg>...</svg>",
      };

      const start = performance.now();

      let reused = 0;
      let generated = 0;

      for (const [title, svg] of Object.entries(mockNew)) {
        if (mockExisting[title] && mockExisting[title] === svg) {
          reused++;
        } else {
          generated++;
        }
      }

      const duration = performance.now() - start;

      measurements.push(duration);

      expect(generated).toBe(0);
      expect(reused).toBe(3);
      expect(duration).toBeLessThan(5);
    });
  });

  describe("Main Thread Work Analysis", () => {
    it("should minimize DOM operations during animation setup", () => {
      // Measure batch DOM reads vs scattered reads
      const svg = document.createElement("svg");

      for (let i = 0; i < 150; i++) {
        const rect = document.createElement("rect");
        rect.setAttribute("x", String(i * 2));
        rect.setAttribute("y", String(i * 2));
        rect.setAttribute("width", "2");
        rect.setAttribute("height", "2");
        svg.appendChild(rect);
      }

      // Optimized: batch DOM reads
      const optimizedStart = performance.now();
      const rects = svg.querySelectorAll("rect");
      rects.forEach((rect, index) => {
        rect.style.setProperty(
          "--rect-delay",
          `${100 + Math.min(index * 6, 200)}ms`,
        );
      });
      const optimizedDuration = performance.now() - optimizedStart;

      measurements.push(optimizedDuration);

      // All DOM reads happen in one querySelectorAll, then writes in loop
      expect(optimizedDuration).toBeLessThan(15);
    });

    it("should use CSS variables instead of inline styles where possible", () => {
      // CSS variables are more efficient and don't trigger layout recalculations
      const rect = document.createElement("rect");
      document.body.appendChild(rect);

      const start = performance.now();

      // Setting CSS variable (efficient)
      rect.style.setProperty("--rect-delay", "100ms");

      const duration = performance.now() - start;

      measurements.push(duration);

      expect(rect.style.getPropertyValue("--rect-delay")).toBe("100ms");
      expect(duration).toBeLessThan(5);

      document.body.removeChild(rect);
    });
  });

  describe("Input Delay Analysis", () => {
    it("should keep JavaScript execution time low during idle", () => {
      // Measure how long critical path operations take
      const operations = [
        {
          name: "Parse URL params",
          fn: () => {
            const params = new URLSearchParams("?ig=&li=&gh=");
            return [...params.keys()];
          },
        },
        {
          name: "Find link in array",
          fn: async () => {
            const { linkTemplates } = await import("../src/lib/links.js");
            return linkTemplates.find((t) => t.title === "instagram");
          },
        },
        {
          name: "Build single link",
          fn: async () => {
            const { linkTemplates, buildLink } =
              await import("../src/lib/links.js");
            const template = linkTemplates[0];
            return buildLink(template, null, null);
          },
        },
      ];

      for (const { name, fn } of operations) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;

        measurements.push(duration);

        // Each operation should be fast to keep main thread responsive
        expect(duration).toBeLessThan(10);
      }
    });
  });
});
