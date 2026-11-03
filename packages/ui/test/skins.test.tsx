import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Textarea } from '../src/components/textarea';
import { EcosystemNavbar } from '../src/blocks/navbar';
import { VisualEffectsToggle } from '../src/blocks/visual-effects-toggle';
import { RawCluster, RawContainer, RawGrid, RawSection, RawStack } from '../src/raw';
import { VisualEffectsProvider } from '../src/primitives/visual-effects';
import { SkinRoot } from '../src/skins/root';
import {
  defaultSkinId,
  resolveSkinId,
  skinIds,
  skinRegistry,
} from '../src/skins/registry';

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255);
  assert.ok(channels);

  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test('skin registry contains the six approved worlds and a deterministic fallback', () => {
  assert.deepEqual(Object.keys(skinRegistry).sort(), [...skinIds].sort());
  assert.equal(resolveSkinId(undefined), defaultSkinId);
  assert.equal(resolveSkinId('nexus-paradox'), 'nexus-paradox');
});

test('each skin keeps semantic text and control colors legible', () => {
  const failures: string[] = [];

  for (const id of skinIds) {
    const { colors } = skinRegistry[id].tokens;

    for (const background of [colors.canvas, colors.surface, colors.elevatedSurface]) {
      if (contrast(colors.text, background) < 4.5) failures.push(`${id}: text on ${background}`);
      if (contrast(colors.mutedText, background) < 4.5) failures.push(`${id}: muted text on ${background}`);
      if (contrast(colors.focus, background) < 3) failures.push(`${id}: focus on ${background}`);
      if (contrast(colors.border, background) < 3) failures.push(`${id}: border on ${background}`);
    }

    if (contrast(colors.accentText, colors.accent) < 4.5) failures.push(`${id}: accent label`);
    if (contrast(colors.dangerText, colors.danger) < 4.5) failures.push(`${id}: danger label`);
    if (contrast(colors.success, colors.surface) < 4.5) failures.push(`${id}: success label`);
    if (contrast(colors.danger, colors.surface) < 4.5) failures.push(`${id}: danger label on surface`);
  }

  assert.deepEqual(failures, []);
});

test('all six skins have distinct geometry, typography, and motion recipes', () => {
  const recipes = skinIds.map((id) => {
    const { geometry, typography, motion } = skinRegistry[id].tokens;
    return JSON.stringify({
      controlRadius: geometry.controlRadius,
      surfaceRadius: geometry.surfaceRadius,
      display: typography.display,
      ambientDuration: motion.ambientDuration,
      easing: motion.easing,
    });
  });

  assert.equal(new Set(recipes).size, skinIds.length);
});

test('SkinRoot renders the selected skin in server markup', () => {
  const markup = renderToStaticMarkup(
    <SkinRoot skin="lunar-chronicles">
      <span>Archive</span>
    </SkinRoot>
  );

  assert.match(markup, /data-moonframe-skin="lunar-chronicles"/);
  assert.match(markup, /--mw-canvas:#101923/);
  assert.match(markup, /<span>Archive<\/span>/);
});

test('visual effects render paused by default with an actionable control', () => {
  const markup = renderToStaticMarkup(
    <VisualEffectsProvider>
      <VisualEffectsToggle />
    </VisualEffectsProvider>
  );

  assert.match(markup, /data-effects-paused="true"/);
  assert.match(markup, /class="mw-ambient-layer" aria-hidden="true"/);
  assert.match(markup, /aria-pressed="false"/);
  assert.match(markup, /aria-label="Resume ambient visual effects"/);
  assert.match(markup, />Resume effects<\/button>/);
});

test('navbar uses clear public application names instead of internal abbreviations', () => {
  const headquarter = renderToStaticMarkup(
    <EcosystemNavbar currentApp="headquarter" showAuthActions={false} />
  );
  const observatory = renderToStaticMarkup(
    <EcosystemNavbar currentApp="jizz" showAuthActions={false} />
  );

  assert.match(headquarter, />HQ<\/span>/);
  assert.match(observatory, />OBSERVATORY<\/span>/);
  assert.doesNotMatch(observatory, />JIZZ<\/span>/);
});

test('raw layout primitives preserve semantic tags and gap choices', () => {
  const markup = renderToStaticMarkup(
    <>
      <RawContainer>Content</RawContainer>
      <RawSection aria-label="Records">Records</RawSection>
      <RawStack gap="tight">Stack</RawStack>
      <RawCluster gap="loose">Cluster</RawCluster>
      <RawGrid gap="regular">Grid</RawGrid>
    </>
  );

  assert.match(markup, /class="mw-raw-container">Content<\/div>/);
  assert.match(markup, /<section[^>]*aria-label="Records"/);
  assert.match(markup, /class="mw-raw-stack"/);
  assert.match(markup, /data-gap="tight"/);
  assert.match(markup, /data-gap="loose"/);
  assert.match(markup, /data-gap="regular"/);
});

test('Textarea exposes its visible label and associated error state', () => {
  const markup = renderToStaticMarkup(
    <Textarea label="Tool arguments" error="Enter valid JSON." />
  );

  assert.match(markup, /<label[^>]+for="([^"]+)"[^>]*>Tool arguments<\/label>/);
  assert.match(markup, /<textarea[^>]+aria-invalid="true"/);
  assert.match(markup, /aria-describedby="[^"]+-error"/);
  assert.match(markup, /role="alert">Enter valid JSON\.<\/p>/);
});

test('component recipes remain scoped to SkinRoot', () => {
  const styles = readFileSync(new URL('../src/skins.css', import.meta.url), 'utf8');

  assert.doesNotMatch(styles, /^\s*\.(?:mw-(?:button|card|input|badge|avatar|navbar|session-card))/m);
  assert.doesNotMatch(styles, /^\s*\[data-moonframe-skin=/m);

  for (const id of skinIds) {
    assert.match(styles, new RegExp(`\\.mw-skin-root\\[data-moonframe-skin='${id}'\\] \\.mw-ambient-layer`));
  }
  assert.match(styles, /data-effects-paused='true'\].*animation-play-state: paused/s);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

test('invalid runtime skin IDs are reported before the safe fallback is used', () => {
  const originalWarn = console.warn;
  const warnings: string[] = [];

  console.warn = (message: string) => warnings.push(message);
  try {
    assert.equal(resolveSkinId('unknown'), defaultSkinId);
    assert.equal(resolveSkinId(''), defaultSkinId);
  } finally {
    console.warn = originalWarn;
  }

  assert.equal(warnings.length, 2);
  assert.ok(warnings.every((message) => message.includes('Invalid MoonFrame skin identifier')));
});
