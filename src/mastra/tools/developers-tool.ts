import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { developers } from '../knowledge/developers';

export const listDevelopersTool = createTool({
  id: 'list-developers',
  description:
    'Lista os desenvolvedores do time com seu escopo de atuação, módulos, skills e disponibilidade. Use antes de escolher quem assume um bug.',
  inputSchema: z.object({
    onlyAvailable: z.boolean().default(true).describe('Retornar apenas devs disponíveis'),
  }),
  outputSchema: z.object({
    developers: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        role: z.string(),
        scope: z.string(),
        modules: z.array(z.string()),
        skills: z.array(z.string()),
        available: z.boolean(),
      }),
    ),
  }),
  execute: async ({ onlyAvailable }) => ({
    developers: onlyAvailable ? developers.filter(dev => dev.available) : developers,
  }),
});
