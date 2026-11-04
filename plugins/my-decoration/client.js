window.__ModuleLoader__.load({
  id: '@local/my-decoration',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    function StarBadge() {
      return h('svg', {
        viewBox: '0 0 64 64', width: 40, height: 40,
        'aria-hidden': true,
        style: { display: 'block', pointerEvents: 'none' },
      }, h('polygon', {
        points: '32,6 40,24 59,24 44,36 50,55 32,44 14,55 20,36 5,24 24,24',
        fill: '#f5a623',
        stroke: '#c9801a',
        strokeWidth: 1.5,
      }));
    }
    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock', id: 'my-decoration', order: 5,
        }, StarBadge));
      },
    };
  },
});