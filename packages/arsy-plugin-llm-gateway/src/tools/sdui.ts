import { modelRegistry } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';
import type { Tool, ToolContext, ToolResult } from './base';
import type { SDUIRoot } from '@moonwitness/types';

export class RenderSduiTool implements Tool {
  readonly name = 'render_sdui';
  readonly description = 'Render a Generative Server-Driven UI (SDUI) schema representation (card, tree, table, form, stats-grid, kanban). Validates against canonical SDUI view schema and returns embedded rendering payload for instant client hydration.';
  readonly inputSchema: Record<string, unknown> = {
    type: 'object',
    properties: {
      view_type: {
        type: 'string',
        enum: ['card', 'tree', 'table', 'form', 'stats-grid', 'kanban'],
        description: 'Type of SDUI view to render.',
      },
      model: {
        type: 'string',
        description: 'ORM model name to derive field schema from (optional for static views).',
      },
      title: {
        type: 'string',
        description: 'Title/display name for the SDUI view.',
      },
      props: {
        type: 'object',
        description: 'View-specific properties and data to render.',
        properties: {
          status: { type: 'string' },
          records: { type: 'number' },
          fields: {
            type: 'array',
            description: 'Field definitions for form/card views.',
            items: { type: 'object' },
          },
          data: {
            type: 'array',
            description: 'Row data for table/kanban views.',
            items: { type: 'object' },
          },
        },
        required: [],
      },
    },
    required: ['view_type'],
  };

  async execute(args: Record<string, unknown>, _context?: ToolContext): Promise<ToolResult> {
    const viewType = args.view_type as string;
    const model = args.model as string | undefined;
    const title = args.title as string | undefined;
    const props = args.props as Record<string, any> | undefined;

    if (!viewType) {
      return { success: false, error: 'view_type is required', output: null };
    }

    if (!['card', 'tree', 'table', 'form', 'stats-grid', 'kanban'].includes(viewType)) {
      return {
        success: false,
        error: `Invalid view_type: '${viewType}'. Must be one of: card, tree, table, form, stats-grid, kanban`,
        output: null,
      };
    }

    let schema: any;
    let renderingPayload: SDUIRoot;

    // If model is provided, derive schema from ORM model fields
    if (model) {
      try {
        const modelDef = modelRegistry.get(model);
        if (!modelDef) {
          return {
            success: false,
            error: `Model '${model}' not found in registry`,
            output: null,
          };
        }

        const fieldsList = Object.entries(modelDef.fields).map(([name, def]) => ({
          name,
          label: def.label || name,
          type: def.type,
          required: def.required || false,
        }));

        schema = {
          model,
          view_type: viewType,
          title: title || `${model} (${viewType})`,
          arch: {
            fields: fieldsList,
          },
        };

        renderingPayload = {
          version: '1.0.0',
          title: schema.title,
          layout: {
            type: 'card',
            props: { title: schema.title },
            children: [
              {
                type: 'vbox',
                children: fieldsList.map((field) => ({
                  type: 'input',
                  props: {
                    label: field.label,
                    type: field.type,
                    required: field.required,
                    placeholder: field.name,
                  },
                })),
              },
            ],
          },
        };
      } catch (err: any) {
        logger.error({ err, model }, 'Failed to derive SDUI schema from model');
        return { success: false, error: err.message || 'Failed to derive SDUI schema', output: null };
      }
    } else {
      // Static view schemas for common types
      renderingPayload = this.getStaticSduiPayload(viewType, title, props || {});
    }

    return {
      success: true,
      output: {
        view_type: renderingPayload.version,
        schema: renderingPayload,
        title: renderingPayload.title,
      },
      error: null,
    };
  }

  private getStaticSduiPayload(viewType: string, title?: string, props?: Record<string, any>): SDUIRoot {
    const baseTitle = title || `SDUI ${viewType}`;

    switch (viewType) {
      case 'card': {
        const status = props?.status || 'nominal';
        const records = props?.records || 0;
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'card',
            props: { title: baseTitle, status, records },
            children: [
              {
                type: 'div',
                props: { class: 'p-4' },
                children: [
                  {
                    type: 'h3',
                    children: baseTitle,
                  },
                  {
                    type: 'p',
                    children: `Status: ${status}`,
                  },
                  {
                    type: 'p',
                    children: `Records: ${records}`,
                  },
                ],
              },
            ],
          },
        };
      }

      case 'stats-grid': {
        const records = props?.records || 0;
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'hbox',
            props: { gap: 4 },
            children: [
              {
                type: 'div',
                props: { class: 'stat-box' },
                children: [
                  {
                    type: 'div',
                    children: `${records}+`,
                  },
                  {
                    type: 'div',
                    children: 'Records',
                  },
                ],
              },
            ],
          },
        };
      }

      case 'form': {
        const fields = props?.fields || [];
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'vbox',
            children: fields.map((field: any) => ({
              type: 'div',
              props: { class: 'form-field' },
              children: [
                {
                  type: 'label',
                  children: field.label || field.name,
                },
                {
                  type: 'input',
                  props: {
                    type: field.type || 'text',
                    placeholder: field.placeholder,
                  },
                },
              ],
            })),
          },
        };
      }

      case 'table': {
        const data = props?.data || [];
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'table',
            children: [
              {
                type: 'thead',
                children: [
                  {
                    type: 'tr',
                    children: [
                      {
                        type: 'th',
                        children: 'Field',
                      },
                      {
                        type: 'th',
                        children: 'Value',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'tbody',
                children: data.map((row: any, i: number) => ({
                  type: 'tr',
                  children: Object.entries(row).map(([, value]) => ({
                    type: 'td',
                    key: i,
                    children: [value],
                  })),
                })),
              },
            ],
          },
        };
      }

      case 'kanban': {
        const columns = props?.columns || ['To Do', 'In Progress', 'Done'];
        const items = props?.items || [];
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'vbox',
            children: columns.map((col: string) => ({
              type: 'div',
              props: { class: 'kanban-column' },
              children: [
                {
                  type: 'h4',
                  children: col,
                },
                {
                  type: 'div',
                  props: { class: 'kanban-tasks' },
                  children: items
                    .filter((item: any) => item.column === col)
                    .map((item: any) => ({
                      type: 'div',
                      props: { class: 'kanban-task' },
                      children: item.title,
                    })),
                },
              ],
            })),
          },
        };
      }

      case 'tree': {
        const nodes = props?.nodes || [];
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'tree',
            children: nodes.map((node: any) => ({
              type: 'tree-node',
              props: { label: node.label || node.name },
              children: node.children
                ? node.children.map((child: any) => this.createTreeNode(child))
                : [],
            })),
          },
        };
      }

      default:
        return {
          version: '1.0.0',
          title: baseTitle,
          layout: {
            type: 'card',
            props: { title: baseTitle },
            children: [
              {
                type: 'p',
                children: `SDUI ${viewType} view`,
              },
            ],
          },
        };
    }
  }

  private createTreeNode(node: any): any {
    return {
      type: 'tree-node',
      props: { label: node.label || node.name },
      children: node.children?.map((child: any) => this.createTreeNode(child)),
    };
  }
}

export const renderSduiTool = new RenderSduiTool();

export async function renderSdui(viewType: string, options?: { model?: string; title?: string; props?: Record<string, any> }): Promise<{ success: boolean; schema: SDUIRoot }> {
  const result = await renderSduiTool.execute({ view_type: viewType, ...(options || {}) }, {});
  if (!result.success) {
    throw new Error(result.error || 'SDUI render failed');
  }
  return {
    success: true,
    schema: result.output!.schema as SDUIRoot,
  };
}