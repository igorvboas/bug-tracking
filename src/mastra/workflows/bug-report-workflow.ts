import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { createCodaBugRow } from '../lib/coda';
import { downloadLoomVideo } from '../lib/loom';
import { bugReportSchema, crmCardSchema, devAssignmentSchema } from '../schemas/bug-report';

const analyzeBugStep = createStep({
  id: 'analyze-bug',
  description: 'Baixa o vídeo do Loom e transforma o relato em um bug report estruturado (título, subtítulo, descrição).',
  inputSchema: z.object({
    videoUrl: z.string().url().describe('Link de compartilhamento do Loom com o vídeo do bug'),
  }),
  outputSchema: bugReportSchema,
  execute: async ({ inputData, mastra }) => {
    // O vídeo é baixado aqui (e não em um step separado) para não gravar os bytes no snapshot do workflow.
    const video = await downloadLoomVideo(inputData.videoUrl);

    const agent = mastra.getAgent('bugAnalystAgent');
    const response = await agent.generate(
      [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: [
                'Analise o vídeo anexado, que mostra um bug no ZAPN.',
                `Título do Loom: ${video.title || '(sem título)'}`,
                `Descrição do Loom: ${video.description || '(sem descrição)'}`,
                `Duração: ${Math.round(video.durationSeconds)}s`,
                `Link: ${inputData.videoUrl}`,
              ].join('\n'),
            },
            { type: 'file', data: video.data, mediaType: video.mediaType },
          ],
        },
      ],
      { structuredOutput: { schema: bugReportSchema } },
    );
    return response.object;
  },
});

const assignDevStep = createStep({
  id: 'assign-dev',
  description: 'Escolhe o desenvolvedor mais indicado para o bug.',
  inputSchema: bugReportSchema,
  outputSchema: z.object({
    bug: bugReportSchema,
    assignment: devAssignmentSchema,
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgent('devAssignmentAgent');
    const response = await agent.generate(
      `Bug report:\n\n${JSON.stringify(inputData, null, 2)}`,
      { structuredOutput: { schema: devAssignmentSchema } },
    );
    return { bug: inputData, assignment: response.object };
  },
});

const createCrmCardStep = createStep({
  id: 'create-crm-card',
  description: 'Cria a linha do bug na tabela BUGS do Coda, associada ao dev responsável.',
  inputSchema: z.object({
    bug: bugReportSchema,
    assignment: devAssignmentSchema,
  }),
  outputSchema: crmCardSchema,
  execute: async ({ inputData: { bug, assignment } }) => {
    const { rowId, docUrl } = await createCodaBugRow({
      title: bug.title,
      subtitle: bug.subtitle,
      description: bug.description,
      dev: assignment.developerName,
    });
    return {
      title: bug.title,
      subtitle: bug.subtitle,
      description: bug.description,
      assigneeId: assignment.developerId,
      assigneeName: assignment.developerName,
      severity: bug.severity,
      tags: bug.tags,
      crmRowId: rowId,
      crmUrl: docUrl,
    };
  },
});

export const bugReportWorkflow = createWorkflow({
  id: 'bug-report-workflow',
  description: 'Vídeo do Loom → bug report → atribuição de dev → linha no Coda.',
  inputSchema: analyzeBugStep.inputSchema,
  outputSchema: crmCardSchema,
})
  .then(analyzeBugStep)
  .then(assignDevStep)
  .then(createCrmCardStep)
  .commit();
