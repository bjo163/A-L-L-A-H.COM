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
