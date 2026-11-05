import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar } from '../src/components/avatar';
import { Emblem } from '../src/components/emblem';
import { Icon, hasIconName, iconNames } from '../src/components/icon';
import { Link } from '../src/components/link';
import { EcosystemNavbar } from '../src/blocks/navbar';
import { RouteShell } from '../src/blocks/route-shell';
import { SessionCard } from '../src/blocks/session-card';
import { SoundToggle } from '../src/blocks/sound-toggle';
import { VisualEffectsToggle } from '../src/blocks/visual-effects-toggle';
import { WorldArtwork } from '../src/blocks/world-artwork';
import { buildAppIcons, skinIds, skinRegistry, type SkinId } from '../src/skins/registry';

const { createElement: h } = React;

/**
 * Which apps are allowed to serve each world's artwork. A skin's hero lives in
 * the public directory of every app that renders it, so this map is the
 * existence-check contract between packages/ui and the apps.
 */
const artworkOwners: Record<SkinId, string[]> = {
  'imperium-lumen': ['dock', 'gate'],
  'lunar-chronicles': ['id'],
  rocksoul: ['gate', 'jizz', 'harbor'],
  'nexus-paradox': ['headquarter'],
  'riot-anarchy': ['jizz', 'moonsky'],
  mycelium: ['jizz'],
  'simpul-nusantara': ['e-isp'],
};

const brandApps = ['dock', 'e-isp', 'gate', 'harbor', 'headquarter', 'id', 'jizz', 'moonsky'];

test('every skin declares identity artwork and a valid theme color', () => {
  for (const id of skinIds) {
    const { hero, emblem, themeColor } = skinRegistry[id].identity;

    assert.match(hero, new RegExp(`^/artwork/${id}\\.png$`), `${id}: hero path must follow the /artwork/<skin>.png convention`);
    assert.match(emblem, /^\/brand\/[a-z-]+\.svg$/, `${id}: emblem path must be under /brand/ and end in .svg`);
    assert.match(themeColor, /^#[0-9a-f]{6}$/i, `${id}: themeColor must be a hex value`);
  }
});

test('registry artwork paths resolve to files in the owning apps', () => {
  const missing: string[] = [];

  for (const id of skinIds) {
    const { hero } = skinRegistry[id].identity;

    for (const app of artworkOwners[id]) {
      if (!existsSync(join(process.cwd(), 'apps', app, `public${hero}`))) {
        missing.push(`apps/${app}/public${hero}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test('public world previews match their source skin and retain HD dimensions', () => {
  for (const id of skinIds) {
    const { hero } = skinRegistry[id].identity;
    const expectedSvg = renderToStaticMarkup(h(WorldArtwork, { skin: id }));

    for (const app of artworkOwners[id]) {
      const base = join(process.cwd(), 'apps', app, 'public', 'artwork', id);
      const svg = readFileSync(`${base}.svg`, 'utf8');
      const png = readFileSync(`${base}.png`);

      assert.equal(svg, expectedSvg, `${app}/${id}.svg must match the shared WorldArtwork source`);
      assert.match(svg, new RegExp(`data-world-artwork="${id}"`), `${app}/${id}.svg must identify its source skin`);
      assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${app}/${id}.png must be PNG`);
      assert.equal(png.readUInt32BE(16), 1600, `${app}/${id}.png must be 1600px wide`);
      assert.equal(png.readUInt32BE(20), 900, `${app}/${id}.png must be 900px tall`);
      assert.ok(png.length <= 350_000, `${app}/${id}.png exceeds the reviewed 350KB hero-image budget`);
      assert.ok(hero.endsWith(`${id}.png`));
    }
  }
});

test('stroked artwork shapes declare their fill behavior', () => {
  for (const skin of skinIds) {
    const markup = renderToStaticMarkup(h(WorldArtwork, { skin }));
    const artworkShapes = markup.match(/<(?:path|circle|ellipse|rect|polygon|polyline)\b[^>]*>/g) ?? [];

    for (const shape of artworkShapes) {
      if (/\bstroke=/.test(shape)) {
        assert.match(shape, /\bfill=/, `${skin} has a stroked shape with an implicit SVG fill`);
      }
    }
  }
});

test('every app serves the brand emblem the favicon factory points at', () => {
  const missing: string[] = [];

  for (const app of brandApps) {
    if (!existsSync(join(process.cwd(), 'apps', app, 'public/brand/emblem.svg'))) {
      missing.push(`apps/${app}/public/brand/emblem.svg`);
    }
  }

  assert.deepEqual(missing, []);
});

test('buildAppIcons derives favicon and apple-touch entries from the registry', () => {
  const icons = buildAppIcons('rocksoul');

  assert.equal(icons.icon.length, 1);
  assert.equal(icons.icon[0]?.url, skinRegistry.rocksoul.identity.emblem);
  assert.equal(icons.icon[0]?.rel, 'icon');
  assert.equal(icons.apple[0]?.url, skinRegistry.rocksoul.identity.emblem);
  assert.equal(icons.apple[0]?.sizes, '180x180');
});

test('icon registry names are kebab-case and resolve through the single Icon owner', () => {
  for (const name of iconNames) {
    assert.match(name, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
    assert.ok(hasIconName(name));
  }

  assert.ok(!hasIconName('BookOpen'));
  const markup = renderToStaticMarkup(h(Icon, { name: 'compass' }));
  assert.match(markup, /data-slot="icon"/);
  assert.match(markup, /<svg/);
});

test('shared components expose their data-slot hooks in rendered markup', () => {
  const assertions: Array<[string, RegExp]> = [
    [renderToStaticMarkup(h(Avatar, { name: 'Ada Oracle' })), /data-slot="avatar"/],
    [renderToStaticMarkup(h(Emblem)), /data-slot="emblem"/],
    [
      renderToStaticMarkup(h(Link, { href: '/explore', asChild: true }, h('a', null, 'Explore'))),
      /data-slot="link"/,
    ],
    [
      renderToStaticMarkup(h(SessionCard, { id: 1, expiresAt: '2026-11-04T00:00:00Z' })),
      /data-slot="session-card"/,
    ],
    [renderToStaticMarkup(h(SoundToggle)), /data-slot="sound-toggle"/],
    [renderToStaticMarkup(h(VisualEffectsToggle)), /data-slot="effects-toggle"/],
    [
      renderToStaticMarkup(h(RouteShell, { as: 'main' }, 'Content')),
      /<main[^>]*id="main-content"[^>]*data-slot="route"/,
    ],
    [
      renderToStaticMarkup(h(EcosystemNavbar, { currentApp: 'gate', showAuthActions: false })),
      /data-slot="navbar"/,
    ],
  ];

  for (const [markup, pattern] of assertions) {
    assert.match(markup, pattern);
  }
});

test('session revocation buttons identify the device they affect', () => {
  const markup = renderToStaticMarkup(
    h(SessionCard, {
      id: 1,
      deviceName: 'Workstation Chrome',
      expiresAt: '2026-11-04T00:00:00Z',
      onRevoke: () => {},
    })
  );

  assert.match(markup, /aria-label="Revoke session for Workstation Chrome"/);
});
