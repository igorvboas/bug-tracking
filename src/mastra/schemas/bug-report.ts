import { z } from 'zod';

export const severitySchema = z.enum(['critical', 'high', 'medium', 'low']);

/** Output of the bug analyst agent (step 1). */
export const bugReportSchema = z.object({
  title: z.string().describe('Título curto e objetivo do bug (máx. ~80 caracteres)'),
  subtitle: z.string().describe('Uma frase resumindo o impacto e onde o bug ocorre'),
  description: z
    .string()
    .describe(
      'Descrição completa em Markdown: contexto, passos para reproduzir, comportamento esperado, comportamento atual, módulo afetado e evidências',
    ),
  affectedModule: z.string().describe('Funcionalidade do ZAPN afetada, com o nome usado na documentação/interface'),
  severity: severitySchema,
  tags: z.array(z.string()).describe('Palavras-chave técnicas úteis para triagem'),
});

export type BugReport = z.infer<typeof bugReportSchema>;

/** Output of the dev assignment agent (step 2). */
export const devAssignmentSchema = z.object({
  developerId: z.string().describe('ID do desenvolvedor escolhido, exatamente como retornado pela tool'),
  developerName: z.string(),
  justification: z.string().describe('Por que este dev é o mais indicado, citando o escopo dele'),
  confidence: z.number().min(0).max(1).describe('Confiança na escolha, de 0 a 1'),
  alternatives: z
    .array(
      z.object({
        developerId: z.string(),
        developerName: z.string(),
        reason: z.string(),
      }),
    )
    .describe('Até 2 alternativas, caso o dev principal não esteja disponível'),
});

export type DevAssignment = z.infer<typeof devAssignmentSchema>;

/** Card created in the CRM (Coda) in step 3. */
export const crmCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  assigneeId: z.string(),
  assigneeName: z.string(),
  severity: severitySchema,
  tags: z.array(z.string()),
  crmRowId: z.string(),
  crmUrl: z.string(),
});

export type CrmCard = z.infer<typeof crmCardSchema>;
