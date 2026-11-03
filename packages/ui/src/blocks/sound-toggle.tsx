'use client';

import * as React from 'react';
import { sfx } from '../sfx/audio';

export function SoundToggle() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(sfx.isEnabled());
  }, []);

  const toggle = () => {
    const nextEnabled = !enabled;
    sfx.setEnabled(nextEnabled);
    setEnabled(nextEnabled);
  };

  return (
    <button
      className="mw-sfx-toggle"
      type="button"
      aria-pressed={enabled}
      aria-label={`Sound effects ${enabled ? 'on' : 'off'}`}
      onClick={toggle}
    >
      <span aria-hidden="true">♪</span>
      <span>Sound {enabled ? 'on' : 'off'}</span>
    </button>
  );
}
