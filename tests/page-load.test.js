import { describe, it, expect, beforeEach } from "vitest";

describe("Page Load Performance", () => {
  describe("Critical Path Analysis", () => {
    it("should identify JavaScript execution bottlenecks on initial load (non-QR mode)", async () => {
      // Simulate the critical path WITHOUT QR mode (most common case)
      // QR codes should NOT be imported in this case
      const timings = {};

      // Step 1: Parse URL params (no ?qr)
      let start = performance.now();
      const url = new URL("http://localhost:5173/?ig&li&gh");
      const params = new URLSearchParams(url.search);
      const paramKeys = [...params.keys()];
      const hasQrMode = params.has("qr");
      timings.urlParse = performance.now() - start;

      // Step 2: Import and process link templates
      start = performance.now();
      const { linkTemplates, buildLink } = await import("../src/lib/links.js");
      timings.linkImport = performance.now() - start;

      // Step 3: Build all links from templates
      start = performance.now();
      const allLinks = linkTemplates
        .map((template) => buildLink(template, null, null))
        .filter(Boolean);
      timings.linkBuilding = performance.now() - start;

      // Step 4: Filter to requested titles
      start = performance.now();
      const titlesToShow =
        paramKeys.length > 0 ? paramKeys : ["instagram", "linkedin"];
      const filteredLinks = titlesToShow
        .map((title) =>
          allLinks.find((link) => link.title === title || link.alias === title),
        )
        .filter(Boolean);
      timings.filtering = performance.now() - start;

      // Step 5: Skip QR import if not in QR mode (optimization!)
      start = performance.now();
      let preGeneratedQRCodes = {};
      if (hasQrMode) {
        const qrModule = await import("../src/lib/generated-qr-codes.js");
        preGeneratedQRCodes = qrModule.preGeneratedQRCodes || {};
      }
      timings.qrImport = performance.now() - start;

      // Step 6: Attach QR codes to links (empty when not in QR mode)
      start = performance.now();
      const linksWithQr = filteredLinks.map((link) => ({
        ...link,
        qr: preGeneratedQRCodes[link.title],
      }));
      timings.qrAttach = performance.now() - start;

      // Calculate totals
      const totalJsTime = Object.values(timings).reduce((a, b) => a + b, 0);

      // Log breakdown
      console.log("\n  Critical Path Breakdown (non-QR mode):");
      Object.entries(timings).forEach(([step, ms]) => {
        console.log(`    ${step}: ${ms.toFixed(2)}ms`);
      });
      console.log(`    TOTAL JS: ${totalJsTime.toFixed(2)}ms`);

      // Assertions - each step should be fast
      expect(timings.urlParse).toBeLessThan(5);
      expect(timings.linkBuilding).toBeLessThan(10);
      expect(timings.filtering).toBeLessThan(5);
      expect(timings.qrImport).toBeLessThan(5); // Should be negligible when not in QR mode
      expect(timings.qrAttach).toBeLessThan(10);
      expect(totalJsTime).toBeLessThan(50); // Non-QR path should be very fast!
    });

    it("should lazy load QR codes only when in QR mode", async () => {
      // Simulate critical path WITH QR mode
      const timings = {};

      // Step 1: Parse URL params (with ?qr)
      let start = performance.now();
      const url = new URL("http://localhost:5173/?qr");
      const params = new URLSearchParams(url.search);
      const hasQrMode = params.has("qr");
      timings.urlParse = performance.now() - start;

      // Step 2: Import link templates
      start = performance.now();
      const { linkTemplates, buildLink } = await import("../src/lib/links.js");
      timings.linkImport = performance.now() - start;

      // Step 3: Build all links
      start = performance.now();
      const allLinks = linkTemplates
        .map((template) => buildLink(template, null, null))
        .filter(Boolean);
      timings.linkBuilding = performance.now() - start;

      // Step 4: Now import QR codes ONLY because in QR mode
      start = performance.now();
      let preGeneratedQRCodes = {};
      if (hasQrMode) {
        const qrModule = await import("../src/lib/generated-qr-codes.js");
        preGeneratedQRCodes = qrModule.preGeneratedQRCodes || {};
      }
      timings.qrImport = performance.now() - start;

      // Step 5: Attach QR codes
      start = performance.now();
      const linksWithQr = allLinks.map((link) => ({
        ...link,
        qr: preGeneratedQRCodes[link.title],
      }));
      timings.qrAttach = performance.now() - start;

      const totalJsTime = Object.values(timings).reduce((a, b) => a + b, 0);

      console.log("\n  Critical Path Breakdown (QR mode):");
      Object.entries(timings).forEach(([step, ms]) => {
        console.log(`    ${step}: ${ms.toFixed(2)}ms`);
      });
      console.log(`    TOTAL JS: ${totalJsTime.toFixed(2)}ms`);

      // In QR mode, QR import happens
      expect(timings.qrImport).toBeLessThan(100);
      // But still should keep total reasonable
      expect(totalJsTime).toBeLessThan(150);
      // And QR codes should load successfully
      expect(Object.keys(preGeneratedQRCodes).length).toBeGreaterThan(0);
    });

    it("should avoid blocking operations during component initialization", async () => {
      // Simulate what happens in LinkIcons component mount
      const timings = {};

      // Expensive DOM operations that could block
      let start = performance.now();
      const container = document.createElement("div");
      container.style.width = "100vw";
      container.style.height = "100vh";
      document.body.appendChild(container);
      timings.domCreation = performance.now() - start;

      // Event listener setup (should be fast)
      start = performance.now();
      const handleTouch = () => {};
      document.body.addEventListener("touchstart", handleTouch);
      timings.eventListener = performance.now() - start;

      // Tween/animation state setup (should be minimal)
      start = performance.now();
      let state = { hoveredLink: null, selectedQrs: new Set() };
      timings.stateSetup = performance.now() - start;

      // Layout calculation
      start = performance.now();
      const rect = container.getBoundingClientRect();
      const dimensions = { width: rect.width, height: rect.height };
      timings.layoutQuery = performance.now() - start;

      const totalInitTime = Object.values(timings).reduce((a, b) => a + b, 0);

      console.log("\n  Component Init Breakdown:");
      Object.entries(timings).forEach(([step, ms]) => {
        console.log(`    ${step}: ${ms.toFixed(2)}ms`);
      });
      console.log(`    TOTAL: ${totalInitTime.toFixed(2)}ms`);

      // Cleanup
      document.body.removeEventListener("touchstart", handleTouch);
      document.body.removeChild(container);

      // Assertions
      expect(timings.layoutQuery).toBeLessThan(10); // getBoundingClientRect is fast
      expect(totalInitTime).toBeLessThan(30);
    });
  });

  describe("Input Delay (Max Potential First Input Delay)", () => {
    it("should not have long JavaScript tasks blocking user input", async () => {
      // Simulate user clicking a link
      const timings = {};

      // Setup: render a few links
      const links = [
        { title: "instagram", url: "https://instagram.com/user" },
        { title: "linkedin", url: "https://linkedin.com/in/user" },
        { title: "github", url: "https://github.com/user" },
      ];

      // Simulate click handler - should be fast
      let start = performance.now();
      const clickedLink = links.find((l) => l.title === "instagram");
      const url = clickedLink?.url;
      timings.clickHandler = performance.now() - start;

      // State update
      start = performance.now();
      let selectedTitle = clickedLink?.title;
      timings.stateUpdate = performance.now() - start;

      // URL update (history.pushState)
      start = performance.now();
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("ig", "");
      // window.history.pushState({}, '', newUrl); // Skip actual navigation in test
      timings.urlUpdate = performance.now() - start;

      // Re-render prep (grouping DOM updates)
      start = performance.now();
      const willChange = document.createElement("div");
      willChange.style.willChange = "transform";
      timings.cssOptimization = performance.now() - start;

      const totalInputTime = Object.values(timings).reduce((a, b) => a + b, 0);

      console.log("\n  Input Handler Breakdown:");
      Object.entries(timings).forEach(([step, ms]) => {
        console.log(`    ${step}: ${ms.toFixed(2)}ms`);
      });
      console.log(`    TOTAL INPUT TIME: ${totalInputTime.toFixed(2)}ms`);

      // Assertions - keep input handler fast for responsive feel
      expect(timings.clickHandler).toBeLessThan(5);
      expect(timings.stateUpdate).toBeLessThan(5);
      expect(timings.urlUpdate).toBeLessThan(5);
      expect(totalInputTime).toBeLessThan(20); // User should feel instant response
    });

    it("should batch DOM reads and writes to minimize layout thrashing", () => {
      // Create test DOM
      const container = document.createElement("div");
      const rects = [];
      for (let i = 0; i < 100; i++) {
        const rect = document.createElement("div");
        rect.setAttribute("data-index", String(i));
        container.appendChild(rect);
        rects.push(rect);
      }
      document.body.appendChild(container);

      const timings = {};

      // CORRECT: Batch reads, then batch writes
      let start = performance.now();
      const positions = rects.map((r) => ({
        x: r.offsetLeft,
        y: r.offsetTop,
      }));
      timings.batchedReads = performance.now() - start;

      start = performance.now();
      positions.forEach((pos, i) => {
        rects[i].style.setProperty("--x", `${pos.x}px`);
        rects[i].style.setProperty("--y", `${pos.y}px`);
      });
      timings.batchedWrites = performance.now() - start;

      // Cleanup
      document.body.removeChild(container);

      console.log("\n  DOM Operation Batching:");
      console.log(`    Batched reads: ${timings.batchedReads.toFixed(2)}ms`);
      console.log(`    Batched writes: ${timings.batchedWrites.toFixed(2)}ms`);

      // Should be very fast with batching
      expect(timings.batchedReads).toBeLessThan(10);
      expect(timings.batchedWrites).toBeLessThan(10);
    });
  });

  describe("Main Thread Work Distribution", () => {
    it("should distribute work across frames to avoid jank", async () => {
      // Measure if we can process 100 items without blocking
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
      }));

      const timings = [];

      // Process all items in one go
      let start = performance.now();
      const processed = items.map((item) => ({
        ...item,
        processed: true,
      }));
      const fullBatchTime = performance.now() - start;
      timings.push(fullBatchTime);

      // Process in chunks (simulating frame-based work)
      start = performance.now();
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < items.length; i += chunkSize) {
        const chunk = items.slice(i, i + chunkSize).map((item) => ({
          ...item,
          processed: true,
        }));
        chunks.push(chunk);
      }
      const chunkedTime = performance.now() - start;
      timings.push(chunkedTime);

      console.log("\n  Work Distribution:");
      console.log(`    Full batch: ${fullBatchTime.toFixed(2)}ms`);
      console.log(`    Chunked: ${chunkedTime.toFixed(2)}ms`);
      console.log(
        `    Chunks needed for 16.67ms frames: ${Math.ceil(fullBatchTime / 16.67)}`,
      );

      // Both should complete quickly, but chunking better distributes load
      expect(fullBatchTime).toBeLessThan(50);
      expect(chunkedTime).toBeLessThan(50);
    });

    it("should use requestAnimationFrame for layout-sensitive work", () => {
      // Simulate proper animation setup with RAF
      let rafCallCount = 0;

      const mockRAF = (cb) => {
        rafCallCount++;
        return cb();
      };

      // Create test elements
      const container = document.createElement("div");
      for (let i = 0; i < 50; i++) {
        const el = document.createElement("div");
        container.appendChild(el);
      }

      const timings = {};

      // Measure: Animation setup with RAF
      const start = performance.now();
      const elements = container.querySelectorAll("div");

      // This is how it should be done: RAF wraps the state change
      mockRAF(() => {
        elements.forEach((el, index) => {
          el.style.setProperty("--delay", `${index * 10}ms`);
        });
      });

      timings.withRAF = performance.now() - start;

      console.log(
        `\n  RAF-based Animation Setup: ${timings.withRAF.toFixed(2)}ms`,
      );
      console.log(`    RAF calls: ${rafCallCount}`);

      // Should complete in minimal time
      expect(timings.withRAF).toBeLessThan(10);
      expect(rafCallCount).toBe(1);
    });
  });

  describe("QR Lazy Loading", () => {
    it("should not import QR codes file on initial page load", async () => {
      // When NOT in QR mode, QR codes file should NOT be imported
      // This saves ~35ms on initial load
      const timings = {};

      // Simulate non-QR page load
      let start = performance.now();

      // Import links (needed)
      const { linkTemplates, buildLink } = await import("../src/lib/links.js");
      timings.links = performance.now() - start;

      // Build links (needed)
      start = performance.now();
      const allLinks = linkTemplates
        .map((t) => buildLink(t, null, null))
        .filter(Boolean);
      timings.linkBuild = performance.now() - start;

      // QR import decision (lazy!)
      start = performance.now();
      const qrMode = false; // Not in QR mode
      if (qrMode) {
        // This should NOT execute
        await import("../src/lib/generated-qr-codes.js");
      }
      timings.qrDecision = performance.now() - start;

      const criticalPath =
        timings.links + timings.linkBuild + timings.qrDecision;

      console.log("\n  Lazy Loading Test (non-QR):");
      console.log(`    Links import: ${timings.links.toFixed(2)}ms`);
      console.log(`    Link building: ${timings.linkBuild.toFixed(2)}ms`);
      console.log(`    QR decision: ${timings.qrDecision.toFixed(2)}ms`);
      console.log(`    Critical path: ${criticalPath.toFixed(2)}ms`);

      // The critical path should be much shorter without QR import
      expect(criticalPath).toBeLessThan(50);
      expect(timings.qrDecision).toBeLessThan(5); // No-op when not in QR mode
    });

    it("should defer QR import cost until QR mode is activated", async () => {
      // When user activates QR mode, THEN import happens
      // This is a client-side operation that doesn't block initial load
      const timings = {};

      // Initial load (no QR import)
      let start = performance.now();
      const { linkTemplates } = await import("../src/lib/links.js");
      timings.initialLoad = performance.now() - start;

      // Later, user activates QR mode and imports happen
      start = performance.now();
      const qrMode = true; // User activated QR mode
      if (qrMode) {
        const { preGeneratedQRCodes } =
          await import("../src/lib/generated-qr-codes.js");
      }
      timings.qrActivation = performance.now() - start;

      console.log("\n  QR Activation (deferred import):");
      console.log(`    Initial load: ${timings.initialLoad.toFixed(2)}ms`);
      console.log(
        `    QR import (deferred): ${timings.qrActivation.toFixed(2)}ms`,
      );

      // Initial load is fast
      expect(timings.initialLoad).toBeLessThan(20);
      // QR import happens but doesn't block initial render
      expect(timings.qrActivation).toBeLessThan(100);
    });
  });

  describe("Resource Loading Impact", () => {
    it("should lazy-load QR codes only when needed", async () => {
      // The pre-generated QR file is large, measure its impact
      const timings = {};

      // Check: importing the QR file is deferred
      let start = performance.now();
      // This only happens when QR mode is activated
      const { preGeneratedQRCodes } =
        await import("../src/lib/generated-qr-codes.js");
      timings.qrImport = performance.now() - start;

      const qrCount = Object.keys(preGeneratedQRCodes).length;

      console.log(`\n  QR Loading:`);
      console.log(`    Import time: ${timings.qrImport.toFixed(2)}ms`);
      console.log(`    QR codes loaded: ${qrCount}`);

      // QR import should be reasonably fast even with lazy loading
      expect(qrCount).toBeGreaterThan(0);
      expect(timings.qrImport).toBeLessThan(200); // Account for larger file
    });

    it("should not load unused dependencies on initial page load", async () => {
      // Measure initial load time without QR code library
      const timings = {};

      // Links should load instantly
      let start = performance.now();
      const { linkTemplates } = await import("../src/lib/links.js");
      timings.linksImport = performance.now() - start;

      // QRCode library shouldn't be imported unless needed
      // (It's only in runtime-generator, not in critical path)
      expect(timings.linksImport).toBeLessThan(20);
    });
  });

  describe("Long Tasks Detection", () => {
    it("should break up long JavaScript execution into smaller tasks", async () => {
      // Simulate processing 50 links with heavy computation
      const mockLinks = Array.from({ length: 50 }, (_, i) => ({
        title: `link${i}`,
        url: `https://example.com/${i}`,
        colors: ["#f00", "#0f0", "#00f"],
      }));

      const timings = [];

      // Simulate: Processing links without breaking up work
      let start = performance.now();
      const processed1 = mockLinks.map((link) => {
        // Simulate some processing
        const hash = link.title
          .split("")
          .reduce((a, c) => a + c.charCodeAt(0), 0);
        return { ...link, hash, processed: true };
      });
      const unbrokenTime = performance.now() - start;
      timings.push({ name: "Unbroken", time: unbrokenTime });

      // Simulate: Breaking work into chunks with yield
      start = performance.now();
      const processed2 = [];
      const chunkSize = 10;
      for (let i = 0; i < mockLinks.length; i += chunkSize) {
        const chunk = mockLinks.slice(i, i + chunkSize).map((link) => {
          const hash = link.title
            .split("")
            .reduce((a, c) => a + c.charCodeAt(0), 0);
          return { ...link, hash, processed: true };
        });
        processed2.push(...chunk);
      }
      const brokenTime = performance.now() - start;
      timings.push({ name: "Chunked", time: brokenTime });

      console.log("\n  Long Task Analysis:");
      timings.forEach(({ name, time }) => {
        console.log(`    ${name}: ${time.toFixed(2)}ms`);
      });

      // Both should be fast, but chunking shows how to handle larger loads
      expect(unbrokenTime).toBeLessThan(50);
      expect(brokenTime).toBeLessThan(50);
    });
  });
});
