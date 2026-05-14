# olhalazarieva.com behavior notes

Source URL: https://www.olhalazarieva.com/

## Global

- Visual language: severe black/white contrast, very large condensed uppercase display text, small monospaced labels, sparse grid placement, huge negative space.
- Fonts observed: `Sofia Sans Condensed` for heavy compressed titles/logo and `Spline Sans Mono` for labels, nav, body microcopy.
- Colors observed: near-black `#101010`, off-white `#f7f7f7`, white `#ffffff`, mid-gray `#999`.
- Smooth scrolling is active via Lenis classes on `<html>`: `lenis lenis-smooth`.
- Header is fixed at top with `mix-blend-mode: difference`, white text, and opacity that appears after the opening hero threshold.
- Page uses WebGL/Three/GSAP for kinetic image/text moments; console showed Three warnings and GSAP notices, but the visual behavior still rendered.

## Intro / Loader

- Loader covers the viewport, displays a percentage counter, then fades out.
- The first hero state is a white field with massive black condensed type. The title dominates the first viewport and overlays imagery.
- The reference page has very large words with slight geometric distortion/offset, plus sparse micro labels at the edges.

## Navigation

- Header logo is stacked and compressed.
- Nav items are bracketed and use split text: original text visible, cloned spaced letters underneath, sliding on hover.
- Contact link is underlined with an arrow.

## Scroll Sections

- Dark "about" section inverts the palette and keeps the fixed header readable through blend mode.
- Large phrase text is warped/rotated per line/letter while scrolling. Several letters shift opacity and color.
- Image blocks appear in a restrained grid with text arranged asymmetrically.
- Projects section appears after a long dark block and uses large media panels with small "view case" link treatment.
- Footer/contact returns to white and keeps the sparse form-line visual system.

## Responsive

- At desktop, layout is wide and very low-density.
- Mobile should keep the same large compressed title character, but stack media and reduce header navigation.
