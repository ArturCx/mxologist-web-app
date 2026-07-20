// Generates the app icon set from the brand symbol.
//   node scripts/gen-icons.mjs   (run from apps/web)
//
// Rules that matter (see specs/app-icons-spec.md):
//   - apple-icon.png must be RGB (no alpha). iOS composites transparency over
//     black, which would swallow the dark engraving.
//   - no pre-rounded corners: iOS applies the squircle mask itself.
//   - inner padding so Android doesn't crop the art.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/brand/mxologist-symbol.png";
const BG = { r: 0x0c, g: 0x13, b: 0x22 }; // midnight — matches the manifest colors
const OUT = "public/icons";
const INSET = 0.86; // art occupies 86% of the canvas (~7% margin per side)

await mkdir(OUT, { recursive: true });

// The symbol, centered on a transparent square canvas of `size`.
const symbolOn = async (size) => {
  const art = Math.round(size * INSET);
  const pad = Math.round((size - art) / 2);
  const symbol = await sharp(SRC, { density: 384 })
    // Trim the source's own transparent margin so INSET is the real margin.
    .trim()
    .resize(art, art, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: "lanczos3",
    })
    .png()
    .toBuffer();

  return sharp(symbol)
    .extend({
      top: pad,
      bottom: size - art - pad,
      left: pad,
      right: size - art - pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
};

// Transparent set: favicon + Android home screen / splash.
for (const [name, size] of [
  ["icon.png", 512],
  ["icon-512.png", 512],
  ["icon-192.png", 192],
]) {
  await sharp(await symbolOn(size)).toFile(`${OUT}/${name}`);
}

// iOS: composite onto an opaque brand-colored canvas. Note this does NOT use
// .flatten() on the padded symbol — sharp doesn't apply flatten after extend,
// so the extended margin would come out black and the icon would show a black
// frame on the home screen.
await sharp({
  create: { width: 180, height: 180, channels: 3, background: BG },
})
  .composite([{ input: await symbolOn(180) }])
  .removeAlpha() // compositing reintroduces the alpha channel
  .png({ palette: false })
  .toFile(`${OUT}/apple-icon.png`);

console.log("icons written to", OUT);
