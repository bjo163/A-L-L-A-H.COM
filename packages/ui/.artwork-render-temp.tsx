import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorldArtwork } from "./src/blocks/world-artwork";
import type { SkinId } from "./src/skins/registry";

const owners: Record<SkinId, string[]> = {
  "imperium-lumen": ["dock", "gate"],
  "lunar-chronicles": ["id"],
  rocksoul: ["gate", "jizz", "harbor"],
  "nexus-paradox": ["headquarter"],
  "riot-anarchy": ["jizz", "moonsky"],
  mycelium: ["jizz"],
};

const manifest: Array<{ app: string; skin: SkinId; htmlPath: string; pngPath: string }> = [];
const root = join(process.cwd(), "..", "..");

for (const skin of Object.keys(owners) as SkinId[]) {
  const svg = renderToStaticMarkup(createElement(WorldArtwork, { skin }));

  for (const app of owners[skin]) {
    const artworkPath = join(root, "apps", app, "public", "artwork", `${skin}.svg`);
    const htmlPath = join(tmpdir(), `${app}-${skin}.html`);
    const pngPath = join(root, "apps", app, "public", "artwork", `${skin}.png`);
    writeFileSync(artworkPath, svg);
    writeFileSync(htmlPath, `<!doctype html><html><body style="margin:0">${svg}</body></html>`);
    manifest.push({ app, skin, htmlPath, pngPath });
  }
}

writeFileSync(join(tmpdir(), "world-artwork-manifest.json"), JSON.stringify(manifest));
