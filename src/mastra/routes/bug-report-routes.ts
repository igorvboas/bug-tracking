import { registerApiRoute } from '@mastra/core/server';

const PAGE = /* html */ `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bug Register</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; color: #1f2328; background: #fff; }
    h1 { font-size: 1.4rem; }
    form { display: flex; gap: 8px; }
    input { flex: 1; padding: 10px; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; }
    button { padding: 10px 18px; font-size: 1rem; border: 0; border-radius: 6px; background: #1f6feb; color: #fff; cursor: pointer; }
    button:disabled { background: #8aa; cursor: wait; }
    #status { margin: 16px 0; color: #57606a; }
    .error { color: #cf222e; white-space: pre-wrap; }
    .card { border: 1px solid #d0d7de; border-radius: 8px; padding: 16px; }
    .card h2 { margin: 0 0 4px; font-size: 1.2rem; }
    .muted { color: #57606a; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #eef; font-size: .85rem; margin-right: 4px; }
    pre { white-space: pre-wrap; font-family: inherit; background: #f6f8fa; padding: 12px; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>Registrar bug a partir de vídeo</h1>
  <form id="form">
    <input id="url" type="url" required placeholder="https://www.loom.com/share/..." />
    <button id="btn" type="submit">Processar</button>
  </form>
  <div id="status"></div>
  <div id="result"></div>

  <script>
    const $ = id => document.getElementById(id);
    const el = (tag, text, cls) => { const e = document.createElement(tag); e.textContent = text; if (cls) e.className = cls; return e; };

    $('form').addEventListener('submit', async event => {
      event.preventDefault();
      $('btn').disabled = true;
      $('result').replaceChildren();
      const started = Date.now();
      const timer = setInterval(() => {
        $('status').textContent = 'Processando: baixando o vídeo, analisando, escolhendo o dev e gravando no Coda... ' + Math.round((Date.now() - started) / 1000) + 's';
      }, 500);

      try {
        const res = await fetch('/bug-report/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoUrl: $('url').value }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.error || 'Falha ao processar');

        const { card, assignment } = data;
        const box = el('div', '', 'card');
        box.append(
          el('h2', card.title),
          el('p', card.subtitle, 'muted'),
          ...[card.severity, ...card.tags].map(t => el('span', t, 'pill')),
          el('h3', 'Responsável: ' + card.assigneeName + ' (' + Math.round(assignment.confidence * 100) + '% de confiança)'),
          el('p', assignment.justification, 'muted'),
          el('h3', 'Descrição'),
          el('pre', card.description),
        );
        $('result').replaceChildren(box);
        const link = el('a', 'Abrir no Coda');
        link.href = card.crmUrl;
        link.target = '_blank';
        $('status').replaceChildren('Concluído em ' + Math.round((Date.now() - started) / 1000) + 's. Linha criada no Coda. ', link);
      } catch (error) {
        $('status').replaceChildren(el('div', 'Erro: ' + error.message, 'error'));
      } finally {
        clearInterval(timer);
        $('btn').disabled = false;
      }
    });
  </script>
</body>
</html>`;

export const bugReportRoutes = [
  registerApiRoute('/bug-report', {
    method: 'GET',
    handler: async c => c.html(PAGE),
  }),

  registerApiRoute('/bug-report/process', {
    method: 'POST',
    handler: async c => {
      const { videoUrl } = await c.req.json<{ videoUrl?: string }>();
      if (!videoUrl) return c.json({ status: 'failed', error: 'Informe a URL do vídeo.' }, 400);

      const workflow = c.get('mastra').getWorkflow('bugReportWorkflow');
      const run = await workflow.createRun();
      const result = await run.start({ inputData: { videoUrl } });

      if (result.status !== 'success') {
        const error = result.status === 'failed' ? result.error?.message : `Workflow terminou com status "${result.status}"`;
        return c.json({ status: result.status, runId: run.runId, error }, 500);
      }

      const assignStep = result.steps['assign-dev'];
      return c.json({
        status: 'success',
        runId: run.runId,
        card: result.result,
        assignment: assignStep?.status === 'success' ? assignStep.output.assignment : undefined,
      });
    },
  }),
];
