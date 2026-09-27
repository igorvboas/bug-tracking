# bug-register-ai

Recebe o relato de um bug (vídeo), gera um bug report em Markdown, escolhe o dev mais indicado e cria o card no CRM. Construído com [Mastra](https://mastra.ai).

## Fluxo

`bug-report-workflow`:

1. **analyze-bug** — baixa o vídeo do Loom; `bugAnalystAgent` (Gemini) assiste ao vídeo, consulta a documentação de uso do ZAPN e devolve título, subtítulo, descrição (Markdown), módulo afetado, severidade e tags.
2. **assign-dev** — `devAssignmentAgent` compara o bug com o escopo de cada dev e devolve o responsável, a justificativa e alternativas.
3. **create-crm-card** — cria a linha na tabela `BUGS` do Coda (colunas Titulo, Subtitulo, Descricao, Dev).

## Estrutura

```
scripts/
└── sync-knowledge.mjs
src/mastra/
├── agents/       bug-analyst-agent.ts, dev-assignment-agent.ts
├── tools/        platform-docs-tool.ts, developers-tool.ts
├── knowledge/
│   ├── platform-docs/   documentação do ZAPN em Markdown (gerada pelo sync)
│   ├── platform-docs.ts loader da documentação
│   └── developers.ts    ← devs de exemplo, substituir
├── schemas/      bug-report.ts
├── workflows/    bug-report-workflow.ts
├── routes/       bug-report-routes.ts (página /bug-report)
├── lib/          loom.ts (download do vídeo), coda.ts (gravação no Coda)
└── index.ts
```

## Base de conhecimento

A documentação vem do [GitBook do ZAPN](https://documentacao-geniosdossistemas.gitbook.io/zapn). Para atualizar `src/mastra/knowledge/platform-docs/` depois de mudanças na documentação:

```shell
pnpm run sync:knowledge
```

Em deploy, se o projeto não estiver acima do diretório de execução, defina `KNOWLEDGE_DIR` com o caminho de `src/mastra/knowledge`.

## Rodando

Configure no `.env` a `GOOGLE_API_KEY` (agente analista, que precisa ler vídeo) e a `OPENAI_API_KEY` (agente de atribuição), além de `CODA_API_TOKEN`, `CODA_DOC_ID` e `CODA_TABLE` (veja `.env.example`). Depois rode:

```shell
pnpm run dev
```

Abra http://localhost:4111/bug-report, cole o link do Loom e clique em **Processar**. O Studio fica em http://localhost:4111. Também dá para executar o workflow pela CLI:

```shell
npx mastra api workflow run start bug-report-workflow '{"inputData":{"videoUrl":"https://www.loom.com/share/<id>"}}'
```
