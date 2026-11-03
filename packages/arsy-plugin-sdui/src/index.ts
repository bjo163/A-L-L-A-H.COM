import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ok, fail, NotFoundError } from '@allah/arsy-core';
import { modelRegistry } from '@allah/arsy-orm';

export interface SduiPluginOptions {
  prefix?: string;
}

const sduiPluginAsync: FastifyPluginAsync<SduiPluginOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/v1/sdui';

  fastify.get<{
    Params: { model: string; view_type: string };
  }>(`${prefix}/:model/:view_type`, async (request, reply) => {
    const { model, view_type } = request.params;
    const modelDef = modelRegistry.get(model);

    if (!modelDef) {
      reply.status(404);
      return fail('MODEL_NOT_FOUND', `Model '${model}' is not registered`);
    }

    // Default dynamic view schema derived directly from ORM model fields
    const fieldsList = Object.entries(modelDef.fields).map(([name, def]) => ({
      name,
      label: def.label || name,
      type: def.type,
      required: def.required || false,
    }));

    const viewSchema = {
      model,
      view_type,
      title: `${modelDef.displayName} (${view_type})`,
      arch: {
        fields: fieldsList,
      },
    };

    return ok(viewSchema);
  });
};

export const sduiPlugin = fp(sduiPluginAsync, {
  name: '@allah/arsy-plugin-sdui',
  fastify: '5.x',
});

export default sduiPlugin;

