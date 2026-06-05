# Feru AI Video Backgrounds

Drop the following `.mp4` files in this directory:

| File              | Used by      | Suggested content                                  |
| ----------------- | ------------ | -------------------------------------------------- |
| `hero-bg.mp4`     | Hero section | Looping dark particle / neural-mesh / data flow    |
| `features-bg.mp4` | Features    | Dark circuit-board / abstract data texture        |
| `pricing-bg.mp4`  | Pricing     | Soft abstract gradient light waves                 |
| `cta-bg.mp4`      | Final CTA   | Slow, sweeping gradient wave animation             |

Tips for great results:

- **Codec:** H.264 MP4 for broadest browser support
- **Resolution:** 1920×1080 or 2560×1440 — videos cover full bleed
- **Length:** 8–20 seconds, seamless loop
- **Size:** Keep each file under ~6 MB for fast first paint (the components use `preload="metadata"`)
- **Color:** Stay in the dark-blue / indigo / cyan family to match the design system

If a video fails to load (missing file, network error, or user has `prefers-reduced-motion`), the components automatically fall back to an animated CSS gradient — so the site looks correct even before you add the files.
