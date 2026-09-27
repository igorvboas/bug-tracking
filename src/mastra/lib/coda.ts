/**
 * Grava bugs na tabela do Coda (API v1).
 *
 * Variáveis de ambiente:
 * - CODA_API_TOKEN: token gerado em https://coda.io/account → "API settings"
 * - CODA_DOC_ID:    id do doc; é o trecho depois de "_d" na URL (…/d/BUG-TRACK_d<ID>/…)
 * - CODA_TABLE:     id ou nome da tabela (padrão: "BUGS")
 */

const API_URL = 'https://coda.io/apis/v1';

/** Nomes das colunas da tabela no Coda. */
const COLUMNS = {
  title: 'Titulo',
  subtitle: 'Subtitulo',
  description: 'Descricao',
  dev: 'Dev',
} as const;

export type CodaBugRow = Record<keyof typeof COLUMNS, string>;

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Defina ${name} no .env para gravar no Coda.`);
  return value;
};

export const createCodaBugRow = async (row: CodaBugRow) => {
  const token = requireEnv('CODA_API_TOKEN');
  const docId = requireEnv('CODA_DOC_ID');
  const table = process.env.CODA_TABLE || 'BUGS';

  const res = await fetch(`${API_URL}/docs/${docId}/tables/${encodeURIComponent(table)}/rows`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: [
        {
          cells: (Object.keys(COLUMNS) as (keyof typeof COLUMNS)[]).map(key => ({
            column: COLUMNS[key],
            value: row[key],
          })),
        },
      ],
    }),
  });

  if (!res.ok) {
    const { message } = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(`Coda recusou a criação da linha (${res.status}): ${message ?? res.statusText}`);
  }

  // 202: o Coda processa a inserção de forma assíncrona; a linha aparece em alguns segundos.
  const { addedRowIds } = (await res.json()) as { addedRowIds?: string[] };
  return { rowId: addedRowIds?.[0] ?? '', docUrl: `https://coda.io/d/_d${docId}` };
};
