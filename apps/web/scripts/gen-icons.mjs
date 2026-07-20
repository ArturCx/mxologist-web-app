// Generates the app icon set from the brand symbol.
//   node scripts/gen-icons.mjs   (run from apps/web)
//
// Rules that matter (see specs/app-icons-spec.md):
//   - apple-icon.png must be RGB (no alpha). iOS composites transparency over
//     black, which would swallow the dark engraving.
//   - no pre-rounded corners: iOS applies the squircle mask itself.
//   - ~12% inner padding so Android doesn't crop the art.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/brand/mxologist-symbol.png";
const BG = "#0c1322"; // midnight — same as the manifest background/theme color
const OUT = "public/icons";
const INSET = 0.8; // art occupies 80% of the canvas

await mkdir(OUT, { recursive: true });

const render = async (size) => {
  const art = Math.round(size * INSET);
  const pad = Math.round((size - art) / 2);
  const symbol = await sharp(SRC, { density: 384 })
    .resize(art, art, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
    .png()
    .toBuffer();

  return sharp(symbol).extend({
    top: pad,
    bottom: size - art - pad,
    left: pad,
    right: size - art - pad,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
};

// Transparent set: favicon + Android home screen / splash.
await (await render(512)).png().toFile(`${OUT}/icon.png`);
await (await render(512)).png().toFile(`${OUT}/icon-512.png`);
await (await render(192)).png().toFile(`${OUT}/icon-192.png`);

// iOS: solid brand background baked in, alpha channel removed.
await (await render(180))
  .flatten({ background: BG })
  .removeAlpha()
  .png({ palette: false })
  .toFile(`${OUT}/apple-icon.png`);

console.log("icons written to", OUT);
