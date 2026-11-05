'use client';

import type { ReactNode } from 'react';
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, StatePanel } from '@moonwitness/ui';
import type { SDUINode } from '@moonwitness/types';

function childNodes(node: SDUINode): SDUINode[] {
  if (Array.isArray(node.children)) return node.children;
  return [];
}

function textValue(node: SDUINode): string {
  const fromProps = node.props?.text ?? node.props?.value ?? node.props?.content;
  if (typeof fromProps === 'string') return fromProps;
  if (typeof node.children === 'string') return node.children;
  return '';
}

function stringList(node: SDUINode): string[] {
  const items = node.props?.items;
  if (Array.isArray(items)) return items.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
  return [];
}

/**
 * A minimal, self-contained renderer for the SDUINode shapes the agent emits. It
 * covers the common structural and content types and, for anything it does not
 * recognise, returns an honest StatePanel instead of the old "preview not yet
 * connected" stub. A full arsy-plugin-sdui integration remains a follow-up.
 */
export function SDUINodeView({ node }: { node: SDUINode }): ReactNode {
  switch (node.type) {
    case 'heading':
    case 'title':
      return <h3 className="text-sm font-semibold">{textValue(node) || 'Untitled heading'}</h3>;

    case 'text':
    case 'paragraph':
      return <p className="text-sm">{textValue(node)}</p>;

    case 'badge':
      return <Badge variant="gold">{textValue(node) || 'tag'}</Badge>;

    case 'stat':
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{typeof node.props?.label === 'string' ? node.props.label : 'Metric'}</CardDescription>
            <CardTitle className="text-xl hq-mono">{textValue(node)}</CardTitle>
          </CardHeader>
        </Card>
      );

    case 'keyvalue':
    case 'kv': {
      const entries = node.props && typeof node.props === 'object'
        ? Object.entries(node.props).filter(([key]) => key !== 'type')
        : [];
      return (
        <dl className="space-y-2">
          {entries.map(([key, value]) => (
            <div className="hq-kv-row" key={key}>
              <dt>{key}</dt>
              <dd className="hq-mono">{typeof value === 'string' ? value : JSON.stringify(value)}</dd>
            </div>
          ))}
        </dl>
      );
    }

    case 'list':
      return (
        <ul className="hq-log-list">
          {stringList(node).map((item, index) => (
            <li className="hq-log-item" key={index}>{item}</li>
          ))}
        </ul>
      );

    case 'card':
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{typeof node.props?.title === 'string' ? node.props.title : 'Card'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {childNodes(node).map((child, index) => <SDUINodeView key={index} node={child} />)}
          </CardContent>
        </Card>
      );

    case 'row':
    case 'columns':
    case 'grid':
      return <div className="hq-metric-grid">{childNodes(node).map((child, index) => <SDUINodeView key={index} node={child} />)}</div>;

    case 'stack':
    case 'column':
      return <div className="hq-section">{childNodes(node).map((child, index) => <SDUINodeView key={index} node={child} />)}</div>;

    case 'divider':
    case 'separator':
      return <hr className="hq-route-divider" />;

    default:
      return (
        <StatePanel
          as="h3"
          kind="permission"
          title={`Unsupported view type "${node.type}"`}
          cause="The agent generated a view this studio cannot render yet."
          nextAction="Inspect the raw payload in the reasoning timeline above."
        />
      );
  }
}
