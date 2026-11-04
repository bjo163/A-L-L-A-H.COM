// One-off rasterizer: converts the two authored world SVGs' compositions into
// token-accurate flat PNG heroes (1600x900) so next/image and OG cards resolve.
// Deterministic, dependency-free (Node zlib only). Keep for regenerating heroes.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const W = 1600;
const H = 900;

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(pixels) {
  const flat = Buffer.alloc(H * (W * 3 + 1));
  for (let y = 0; y < H; y++) {
    flat[y * (W * 3 + 1)] = 0;
    pixels.copy(flat, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(flat, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function canvas(top, bottom) {
  const px = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const t = y / (H - 1);
    const r = Math.round(top[0] + (bottom[0] - top[0]) * t);
    const g = Math.round(top[1] + (bottom[1] - top[1]) * t);
    const b = Math.round(top[2] + (bottom[2] - top[2]) * t);
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      px[i] = r; px[i + 1] = g; px[i + 2] = b;
    }
  }
  return {
    px,
    rect(x, y, w, h, [r, g, b], alpha = 1) {
      const x0 = Math.max(0, Math.round(x)), y0 = Math.max(0, Math.round(y));
      const x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * W + xx) * 3;
          px[i] = Math.round(px[i] + (r - px[i]) * alpha);
          px[i + 1] = Math.round(px[i + 1] + (g - px[i + 1]) * alpha);
          px[i + 2] = Math.round(px[i + 2] + (b - px[i + 2]) * alpha);
        }
      }
      return this;
    },
    outline(x, y, w, h, color, t = 2) {
      this.rect(x, y, w, t, color);
      this.rect(x, y + h - t, w, t, color);
      this.rect(x, y, t, h, color);
      this.rect(x + w - t, y, t, h, color);
      return this;
    },
  };
}

const hex = (v) => [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16)];

// ROCKSOUL: rain-night street, block towers, gold windows, one crimson sign.
{
  const c = canvas(hex('#17181a'), hex('#0e0f10'));
  c.rect(0, 612, W, 288, hex('#1a1c1e'));
  c.rect(120, 196, 320, 416, hex('#1d1e20'));
  c.rect(480, 284, 180, 328, hex('#1d1e20'));
  c.rect(1160, 156, 340, 456, hex('#1d1e20'));
  for (const [wx, wy] of [[164, 240], [224, 240], [344, 298], [284, 414], [524, 356], [1204, 240], [1264, 240], [1384, 298], [1324, 414], [1504, 356], [804, 380], [864, 438]]) {
    c.rect(wx, wy, 26, 34, hex('#efd278'), 0.5);
  }
  c.rect(1464, 336, 58, 20, hex('#bd4144'));
  c.rect(1099, 384, 6, 228, hex('#8f949a'), 0.4);
  c.rect(1084, 356, 38, 72, hex('#8f949a'), 0.4);
  c.rect(772, 562, 64, 154, hex('#0f1011'));
  c.rect(786, 522, 36, 40, hex('#0f1011'));
  c.rect(770, 724, 68, 3, hex('#bd4144'), 0.4);
  c.rect(780, 742, 48, 3, hex('#bd4144'), 0.4);
  c.rect(790, 760, 28, 3, hex('#bd4144'), 0.4);
  c.rect(0, 610, W, 2, hex('#aaa39b'), 0.3);
  for (const rx of [194, 314, 526, 742, 906, 1074, 1238, 1366, 82, 642, 1202, 980, 420, 1350]) {
    c.rect(rx, 96 + (rx % 7) * 28, 3, 56, hex('#c7c0b8'), 0.14);
  }
  writeFileSync(join('apps/gate/public/artwork/rocksoul.png'), encodePng(c.px));
  writeFileSync(join('apps/jizz/public/artwork/rocksoul.png'), encodePng(c.px));
}

// RIOT ANARCHY: cream newsprint, hard ink rules, crimson/cobalt blocks.
{
  const c = canvas(hex('#e9e3d3'), hex('#e4ddca'));
  for (let yy = 0; yy < H; yy += 16) {
    for (let xx = 0; xx < W; xx += 16) {
      c.rect(xx + 4, yy + 4, 5, 5, hex('#171715'), 0.1);
    }
  }
  c.outline(96, 96, 1408, 708, hex('#171715'), 4);
  c.rect(170, 150, 520, 308, hex('#171715'));
  c.rect(730, 130, 330, 240, hex('#a5282d'));
  c.rect(1120, 210, 330, 330, hex('#0759a8'));
  c.rect(170, 460, 430, 250, hex('#f5f0e2'));
  c.outline(170, 460, 430, 250, hex('#171715'), 5);
  c.rect(210, 500, 330, 6, hex('#171715'));
  c.rect(210, 546, 300, 6, hex('#171715'));
  c.rect(210, 592, 250, 6, hex('#171715'));
  c.rect(680, 520, 380, 234, hex('#a5282d'));
  c.rect(1120, 514, 330, 286, hex('#171715'));
  c.rect(1160, 640, 250, 6, hex('#fffaf1'));
  c.rect(1160, 700, 250, 6, hex('#fffaf1'));
  c.rect(1160, 760, 180, 6, hex('#fffaf1'));
  c.rect(210, 700, 150, 40, hex('#0759a8'));
  c.rect(410, 700, 150, 40, hex('#0759a8'));
  const m = 16;
  c.rect(96 - m / 2, 96 - m / 2, m, m, hex('#a5282d'));
  c.rect(1504 - m / 2, 96 - m / 2, m, m, hex('#a5282d'));
  writeFileSync(join('apps/jizz/public/artwork/riot-anarchy.png'), encodePng(c.px));
}

console.log('world heroes written');
