# plan-ideas

## Summary

Personal homepage and link aggregator built with SvelteKit 5 on Cloudflare Workers. Displays social/contact links with icons, QR code generation, dark mode, and per-hostname link customization. The project is clean and actively maintained with recent dark mode work. Deployed via wrangler to Cloudflare. Has a linkmaker tool at /x/linkmaker for generating custom link pages.

## Action Items

- [ ] Clean up stale vite.config.js.timestamp-* files (4 leftover temp files in root)
- [ ] Remove empty src/routes/user/ directory
- [ ] Remove empty .github/ directory
- [ ] Fix duplicate `@typedef Link` in src/lib/links.js (defined twice, lines 1-10 and 113-122)
- [ ] Review the discord link URL format (uses `discordapp.com` which may be outdated)
- [ ] Consider removing or configuring the unused service-worker.js (registration is disabled in svelte.config.js)
- [ ] Add CV/resume link template (referenced in hostDefaults for morganwill.com but not defined in linkTemplates)
- [ ] Update README (still references create-svelte scaffold, doesn't describe what the project actually does)
- [ ] Consider consolidating the QR code generation (has both pre-generated and on-demand server-side generation)
- [ ] Fix src/lib/utils.js.js double extension filename
- [ ] Prune stale git branches (54 branches, many abandoned experiments)
- [ ] Clear stash list (16 stashes, most attached to dead branches)
- [ ] Complete Lighthouse optimization checklist items from LIGHTHOUSE_OPTIMIZATIONS.md
- [ ] Review whether compose.yml, Dockerfile, tailscale/ are still relevant with Cloudflare Workers deployment

## Detailed Assessment

### Project Status

Functional and deployed. The site serves as a personal link page at morganwill.com and zenfo.co, with different default links per hostname. Supports URL-param-driven link selection (e.g., `?ig.tg.qr`), QR code mode, dark/light theme toggle, and custom links via CUSTOM_LINKS env var. Uses SvelteKit's experimental `remoteFunctions` feature. Recently added dark mode improvements.

### Git Status

Branch: `main`. Clean -- no uncommitted changes. Remote: `origin https://github.com/mrgnw/linky.git`. 54 local branches (many stale: clothingConverter, salaryCalc, docker-slim, sveltepress, etc.). 16 stashes.

### Last Activity

Last commit: 2026-02-22 (1 day ago) -- "dark mode". Recently modified files (last 7 days): package.json, LinkSelector.svelte, ThemeToggle.svelte, +layout.svelte, +page.svelte.

### Existing Plans & TODOs

No PLAN.md, no todos/ folder. LIGHTHOUSE_OPTIMIZATIONS.md has an incomplete checklist (deploy, re-audit, monitor Core Web Vitals, verify console errors). The TODO/FIXME comments found are all in `.cursorrules` (a Svelte docs reference file, 26k+ lines), not in project source code.

### Remaining Work

**Cleanup:**
- 4 stale `vite.config.js.timestamp-*` files in project root
- Empty `src/routes/user/` and `.github/` directories
- Duplicate `@typedef Link` JSDoc block in links.js
- `src/lib/utils.js.js` double extension filename
- `copilot-instructions.md`, `.rules`, `src/.cursorrules` overlap in purpose

**Potential issues:**
- `cv` is listed in hostDefaults for morganwill.com but there's no `cv` template in linkTemplates. This silently produces no link for CV.
- `service-worker.js` exists but service worker registration is disabled in svelte.config.js
- Discord URL uses old `discordapp.com` domain

**Performance:**
- Complete Lighthouse optimization checklist from LIGHTHOUSE_OPTIMIZATIONS.md
- Verify icon refactoring and SVG animation performance gains

**Git hygiene:**
- 54 branches need pruning (many are abandoned experiments)
- 16 stashes should be reviewed and cleared

### Ideas & Considerations

- The hostname-based default link selection is a nice pattern for serving different link profiles from different domains.
- The CUSTOM_LINKS env var JSON parsing enables dynamic link configuration without code changes.
- QR code generation happens in two ways: pre-generated static codes (scripts/generate-qr-codes.mjs) and on-demand server-side generation. Could simplify to just one approach.
- The project uses `mode-watcher` for theme management, which is a good choice for SvelteKit.
- The `remoteFunctions: true` experimental flag in svelte.config.js is cutting-edge. Worth monitoring for stability.
- The wrangler.jsonc has observability enabled with full logging, which is good for debugging production issues.
- The repo name on GitHub is "linky" but the local directory is "morganwill.com" and package.json name is "morg.info". The naming is inconsistent but functional.
- The `compose.yml`, `Dockerfile`, and `tailscale/` directory suggest previous self-hosting experiments that may no longer be relevant with the Cloudflare Workers deployment.
- The env-var-based link system (CUSTOM_LINKS JSON, PHONE_NUMBER, etc.) is flexible but could use documentation in the README or a dedicated config doc.
