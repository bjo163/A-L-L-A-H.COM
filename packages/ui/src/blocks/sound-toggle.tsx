'use client';

import * as React from 'react';
import { sfx } from '../sfx/audio';
import { Icon } from '../components/icon';

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
      data-slot="sound-toggle"
      aria-pressed={enabled}
      aria-label={`Sound effects ${enabled ? 'on' : 'off'}`}
      onClick={toggle}
    >
      <Icon name={enabled ? 'volume-2' : 'volume-x'} size={16} aria-hidden />
      <span>Sound {enabled ? 'on' : 'off'}</span>
    </button>
  );
}
