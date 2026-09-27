import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { loadPlatformDocs } from '../knowledge/platform-docs';

const STOPWORDS = new Set(['como', 'para', 'que', 'com', 'uma', 'nao', 'dos', 'das', 'por', 'meu', 'minha', 'sao', 'ser']);

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const countOccurrences = (haystack: string, term: string) => haystack.split(term).length - 1;

export const searchPlatformDocsTool = createTool({
  id: 'search-platform-docs',
  description:
    'Consulta a documentação de uso do ZAPN para saber como uma funcionalidade DEVERIA funcionar. Sem query, lista todas as páginas (id, título, descrição). Com query, retorna o conteúdo completo das páginas mais relevantes.',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('Termos de busca (ex: "agendar campanha", "importar contatos excel"). Omita para listar as páginas.'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        source: z.string(),
        content: z.string().optional(),
      }),
    ),
  }),
  execute: async ({ query }) => {
    const docs = loadPlatformDocs();

    if (!query?.trim()) {
      return { results: docs.map(({ id, title, description, source }) => ({ id, title, description, source })) };
    }

    const terms = normalize(query)
      .split(/\W+/)
      .filter(term => term.length >= 3 && !STOPWORDS.has(term));

    const scored = docs
      .map(doc => {
        const header = normalize(`${doc.id} ${doc.title} ${doc.description}`);
        const body = normalize(doc.content);
        // termos no título/descrição pesam mais que no corpo
        const score = terms.reduce(
          (sum, term) => sum + countOccurrences(header, term) * 5 + countOccurrences(body, term),
          0,
        );
        return { doc, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return { results: scored.map(({ doc }) => doc) };
  },
});
