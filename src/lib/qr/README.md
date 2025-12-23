# QR Code Generation & Optimization

This directory contains the QR code generation and rendering system, optimized for performance and bundle size.

## Architecture

### Pre-generation (`generate-qr-codes.mjs`)
QR codes are pre-generated at build time and stored in `src/lib/generated-qr-codes.js`. This approach:
- **Reduces client-side dependencies**: QRCode library isn't needed in the browser
- **Improves caching**: QR SVGs are static assets that can be cached indefinitely
- **Enables optimization**: SVGs can be optimized during generation

### Runtime Generation (`runtime-generator.js`)
For dynamic/custom URLs that aren't known at build time, use the runtime generator:
- Generates QR codes on-demand in the browser
- Caches results to avoid regenerating identical URLs
- Use when you need user-provided URLs or dynamic content

## Performance Optimizations

### 1. SVG Structure
- **Individual rects per module**: Each filled module is a separate `<rect>` element
- **Seeded shuffling**: Animation order is deterministic based on URL hash, creating consistent visual effects
- **currentColor fill**: Allows CSS to override colors without regenerating SVGs

### 2. Animation
- **Efficient staggered delays**: Uses CSS variables (`--rect-delay`) set by JavaScript
- **Linear staggering**: Simpler than radial distance calculations, still visually appealing
- **CSS-driven**: Animations run on GPU with `transform` and `opacity`

### 3. Build-time vs Runtime
- **Pre-generated**: Common links (Instagram, GitHub, etc.) are pre-built
- **Incremental**: Build script only regenerates changed URLs
- **Cached**: Existing SVGs are reused if URLs haven't changed

## Usage

### Using Pre-generated QR Codes
In Svelte components:
```svelte
<script>
  import { preGeneratedQRCodes } from '$lib/generated-qr-codes.js';
  
  let qrSvg = preGeneratedQRCodes['linkedin']; // Get pre-generated SVG
</script>

{@html qrSvg}
```

### Using Runtime Generator
For dynamic URLs:
```svelte
<script>
  import { getOrGenerateQRSvg } from '$lib/qr/runtime-generator.js';
  
  let userUrl = 'https://example.com/custom';
  let qrSvg = getOrGenerateQRSvg(userUrl);
</script>

{@html qrSvg}
```

## Building

### Generate/Update QR Codes
```bash
npm run generate-qr
```

This script:
- Reads all link templates from `src/lib/links.js`
- Checks environment variables for dynamic URLs
- Reuses existing QR codes if URLs haven't changed
- Outputs to `src/lib/generated-qr-codes.js`

### Full Build
```bash
npm run build
```

Automatically runs `generate-qr` before building.

## File Size

The generated file includes all pre-generated QR codes as inline SVG strings. Typical size:
- 7 links: ~336KB (includes animation markup)
- Gzipped: ~40-50KB (highly compressible due to repetitive SVG structure)

## Future Optimizations

### Potential improvements:
1. **SVG compression**: Use SVGZ or path-based encoding instead of rects
2. **WebP format**: Pre-render to WebP with animation keyframes
3. **Lazy loading**: Load QR codes only when requested via component
4. **CDN caching**: Serve from edge with infinite cache headers

### Trade-offs:
- Simpler format (rects) = easier animation but larger file size
- Pre-generation = faster runtime but requires rebuild for new URLs
- Individual rects = flexible coloring but more elements per SVG