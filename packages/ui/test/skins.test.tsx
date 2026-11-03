import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
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

test('component recipes remain scoped to SkinRoot', () => {
  const styles = readFileSync(new URL('../src/skins.css', import.meta.url), 'utf8');

  assert.doesNotMatch(styles, /^\s*\.(?:mw-(?:button|card|input|badge|avatar|navbar|session-card))/m);
  assert.doesNotMatch(styles, /^\s*\[data-moonframe-skin=/m);
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
