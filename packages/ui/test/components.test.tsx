import assert from 'node:assert/strict';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, composeClickHandlers } from '../src/components/button';
import { Dialog } from '../src/components/dialog';
import { FormField } from '../src/components/form';
import { Input } from '../src/components/input';
import { Link, LinkButton } from '../src/components/link';
import { Select } from '../src/components/select';
import { Textarea } from '../src/components/textarea';
import { DestinationCard } from '../src/blocks/destination-card';
import { PageHero } from '../src/blocks/page-hero';
import { RouteShell } from '../src/blocks/route-shell';
import { SectionHeading } from '../src/blocks/section-heading';
import { StatePanel, type StatePanelKind } from '../src/blocks/state-panel';
import { StatusMessage, type StatusTone } from '../src/blocks/status-message';

const controls = [
  ['Input', (props: { required?: boolean }) => <Input {...props} />],
  ['Textarea', (props: { required?: boolean }) => <Textarea {...props} />],
  ['Select', (props: { required?: boolean }) => (
    <Select {...props}>
      <option value="one">One</option>
    </Select>
  )],
] as const;

for (const [name, Control] of controls) {
  test(`${name} associates FormField label, hint, and error`, () => {
    const markup = renderToStaticMarkup(
      <FormField label="Project name" hint="Use the public name." error="A name is required." required>
        <Control />
      </FormField>
    );
    const labelId = markup.match(/<label[^>]+\sfor="([^"]+)"/)?.[1];
    const controlId = markup.match(/<(?:input|textarea|select)\b[^>]*\sid="([^"]+)"/)?.[1];
    const describedBy = markup.match(/aria-describedby="([^"]+)"/)?.[1];

    assert.ok(labelId);
    assert.equal(controlId, labelId);
    assert.match(markup, /<(?:input|textarea|select)\b[^>]*\srequired(?:=""|(?=[\s>]))/);
    assert.ok(describedBy);
    assert.ok(describedBy.includes(`${controlId}-hint`));
    assert.ok(describedBy.includes(`${controlId}-error`));
    assert.match(markup, new RegExp(`id="${controlId}-hint"[^>]*>Use the public name\\.`));
    assert.match(markup, new RegExp(`id="${controlId}-error"[^>]*>A name is required\\.`));
  });
}

test('direct Input hint is rendered and referenced by its ID', () => {
  const markup = renderToStaticMarkup(<Input label="Email" hint="Used for sign-in." />);
  const hintId = markup.match(/<p[^>]+id="([^"]+)"[^>]*>Used for sign-in\.<\/p>/)?.[1];

  assert.ok(hintId);
  assert.match(markup, new RegExp(`aria-describedby="${hintId}"`));
});

test('Link and LinkButton announce and protect new-tab navigation consistently', () => {
  const link = renderToStaticMarkup(<Link href="https://example.com" external>Open site</Link>);
  const button = renderToStaticMarkup(<LinkButton href="https://example.com" external>Open site</LinkButton>);
  const sameTab = renderToStaticMarkup(<Link href="/inside" target="_self">Open page</Link>);

  for (const markup of [link, button]) {
    assert.match(markup, /target="_blank"/);
    assert.match(markup, /rel="noopener noreferrer"/);
    assert.match(markup, /Opens in a new tab\./);
  }
  assert.match(sameTab, /target="_self"/);
  assert.doesNotMatch(sameTab, /Opens in a new tab\./);
});

test('Button asChild preserves child and button click handlers', () => {
  const calls: string[] = [];
  let prevented = false;
  let stopped = false;
  const handler = composeClickHandlers(
    () => calls.push('child'),
    () => calls.push('button')
  );

  handler({
    preventDefault: () => { prevented = true; },
    stopPropagation: () => { stopped = true; },
  });

  assert.deepEqual(calls, ['child', 'button']);
  assert.equal(prevented, false);
  assert.equal(stopped, false);
});

test('disabled composed controls block activation', () => {
  let activated = false;
  let prevented = false;
  let stopped = false;
  const handler = composeClickHandlers(
    () => { activated = true; },
    () => { activated = true; },
    true
  );

  handler({
    preventDefault: () => { prevented = true; },
    stopPropagation: () => { stopped = true; },
  });

  assert.equal(activated, false);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
});

test('Button asChild renders a single link with public button styling', () => {
  const markup = renderToStaticMarkup(
    <Button asChild variant="outline">
      <a href="/account">Account</a>
    </Button>
  );

  assert.match(markup, /^<a href="\/account" class="mw-button whitespace-nowrap select-none mw-button--outline mw-button--size-default" data-slot="button">Account<\/a>$/);
});

test('Dialog renders native modal semantics and a named title', () => {
  const markup = renderToStaticMarkup(
    <Dialog open={false} onOpenChange={() => {}} title="Confirm action" description="Review the change.">
      Continue?
    </Dialog>
  );

  assert.match(markup, /^<dialog[^>]+data-slot="dialog"/);
  assert.match(markup, /aria-labelledby="[^"]+"/);
  assert.match(markup, /<h2[^>]+>Confirm action<\/h2>/);
});

test('PageHero wires its title to the section name and skips empty slots', () => {
  const plain = renderToStaticMarkup(<PageHero title="Threshold" kicker="entry" summary="Cross over." />);
  const full = renderToStaticMarkup(
    <PageHero
      titleId="hero"
      title="Threshold"
      summary="Cross over."
      actions={<LinkButton href="/account">Account</LinkButton>}
      media={<img src="art.png" alt="" />}
      captionLeft="IMPERIUM LUMEN"
      captionRight="01"
    />
  );

  assert.match(plain, /<h1 class="mw-hero__title">Threshold<\/h1>/);
  assert.match(plain, /<p class="mw-kicker mw-hero__kicker" data-slot="kicker">entry<\/p>/);
  assert.doesNotMatch(plain, /aria-labelledby/);
  assert.doesNotMatch(plain, /<figcaption/);
  assert.match(full, /<section class="mw-hero" data-slot="hero" aria-labelledby="hero">/);
  assert.match(
    full,
    /<figure class="mw-hero__art"><img src="art\.png" alt=""\/><figcaption class="mw-hero__caption"><span>IMPERIUM LUMEN<\/span><span>01<\/span><\/figcaption><\/figure>/
  );
  assert.match(full, /<div class="mw-hero__actions"><a class="mw-button/);
});

test('RouteShell renders one landmark and no header when the route supplies its own title', () => {
  const bare = renderToStaticMarkup(<RouteShell><p>body</p></RouteShell>);
  const titled = renderToStaticMarkup(
    <RouteShell as="main" kicker="operations" title="Sessions" description="Active sessions." titleId="t">
      <p>body</p>
    </RouteShell>
  );

  assert.equal(bare, '<div class="mw-route" data-slot="route"><p>body</p></div>');
  assert.match(
    titled,
    /^<main id="main-content" tabindex="-1" class="mw-route" data-slot="route"><header class="mw-route__header">/
  );
  assert.match(titled, /<p class="mw-kicker mw-route__kicker" data-slot="kicker">operations<\/p>/);
  assert.match(titled, /<h1 class="mw-route__title" id="t">Sessions<\/h1>/);
});

test('SectionHeading keeps the outline level chosen by the page', () => {
  const markup = renderToStaticMarkup(
    <SectionHeading title="Destinations" description="One per world." as="h3" trailing={<Button>Refresh</Button>} />
  );

  assert.match(markup, /<h3 class="mw-section-heading__title">Destinations<\/h3>/);
  assert.match(markup, /<div class="mw-section-heading__trailing"><button[^>]+class="mw-button/);
});

const tones: StatusTone[] = ['info', 'success', 'warning', 'danger'];

for (const tone of tones) {
  test(`StatusMessage announces ${tone} by role and by glyph`, () => {
    const markup = renderToStaticMarkup(
      <StatusMessage tone={tone} title="Session" action={<Button>Retry</Button>}>
        The hub did not answer.
      </StatusMessage>
    );
    const expectedRole = tone === 'danger' ? 'alert' : 'status';

    assert.match(markup, new RegExp(`role="${expectedRole}"`));
    assert.match(markup, new RegExp(`data-tone="${tone}"`));
    assert.match(markup, /<span class="mw-status__marker" aria-hidden="true">[^<]+<\/span>/);
    assert.match(markup, /The hub did not answer\./);
  });
}

const kinds: StatePanelKind[] = ['empty', 'loading', 'error', 'offline', 'permission'];

for (const kind of kinds) {
  test(`StatePanel ${kind} names a cause, a next step, and the right live region`, () => {
    const markup = renderToStaticMarkup(
      <StatePanel kind={kind} cause="No record matches this filter." nextAction="Clear the filter to see all records." />
    );
    const expectedRole = kind === 'error' || kind === 'offline' ? 'alert' : 'status';

    assert.match(markup, new RegExp(`role="${expectedRole}"`));
    assert.match(markup, new RegExp(`data-kind="${kind}"`));
    assert.match(markup, /class="mw-state__label">[^<]+<\/p>/);
    assert.match(markup, /class="mw-state__cause">No record matches this filter\.<\/p>/);
    assert.match(markup, /class="mw-state__next">Clear the filter to see all records\.<\/p>/);
  });
}

test('StatePanel marks loading busy and keeps the heading out of the alert path', () => {
  const markup = renderToStaticMarkup(<StatePanel kind="loading" cause="Fetching sessions." />);

  assert.match(markup, /aria-busy="true"/);
  assert.match(markup, /<h2 class="mw-state__title">Loading<\/h2>/);
});

test('DestinationCard routes through Link and keeps its label out of the ARIA role', () => {
  const card = renderToStaticMarkup(
    <DestinationCard index="02" role="observatory" title="World Observatory" description="Six worlds." href="/obs" />
  );
  const external = renderToStaticMarkup(<DestinationCard title="Archive" href="https://example.com" external />);

  assert.match(card, /^<a class="mw-link mw-destination" data-slot="destination" href="\/obs">/);
  assert.doesNotMatch(card, /role="/);
  assert.match(card, /<span class="mw-destination__role">observatory<\/span>/);
  assert.match(card, /<h3 class="mw-destination__title">World Observatory<\/h3>/);
  assert.match(external, /rel="noopener noreferrer"/);
  assert.match(external, /Opens in a new tab\./);
});
