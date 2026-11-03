import { Tool, ToolContext, ToolResult } from './base';

export interface RenderSduiArgs {
  view_type?: 'card' | 'table' | 'tree' | 'stats_grid' | 'kanban' | 'form';
  title?: string;
  props?: Record<string, unknown>;
  elements?: Array<Record<string, unknown>>;
}

export class RenderSduiTool implements Tool {
  name = 'render_sdui';
  description = 'Dynamically synthesizes and validates a Server-Driven UI (SDUI) view schema (card, table, stats_grid, etc.) to render interactive UI in the frontend client.';
  inputSchema = {
    type: 'object',
    properties: {
      view_type: {
        type: 'string',
        description: 'The archetype of the dynamic view component',
        enum: ['card', 'table', 'tree', 'stats_grid', 'kanban', 'form'],
      },
      title: {
        type: 'string',
        description: 'Title of the synthesized view component',
      },
      props: {
        type: 'object',
        description: 'Key-value properties for display (e.g. metrics, badges, headers)',
      },
      elements: {
        type: 'array',
        description: 'List of rows, items, or child elements for tabular or tree views',
      },
    },
    required: ['view_type', 'title'],
  };

  async execute(args: Record<string, unknown>, context?: ToolContext): Promise<ToolResult> {
    const view_type = (args.view_type as string) || 'card';
    const title = (args.title as string) || 'Synthesized View';
    const props = (args.props as Record<string, unknown>) || {};
    const elements = (args.elements as Array<Record<string, unknown>>) || [];

    const sduiPayload = {
      id: `sdui_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      view_type,
      title,
      props,
      elements,
      meta: {
        actor: context?.actor || 'system',
        rendered_at: new Date().toISOString(),
      },
    };

    return {
      success: true,
      output: sduiPayload,
    };
  }
}

export const renderSduiTool = new RenderSduiTool();
