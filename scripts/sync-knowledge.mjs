// Baixa a documentação do ZAPN (GitBook) e salva como Markdown em src/mastra/knowledge/platform-docs/.
// Uso: pnpm run sync:knowledge
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = 'https://documentacao-geniosdossistemas.gitbook.io/zapn';
const OUT_DIR = join(import.meta.dirname, '..', 'src', 'mastra', 'knowledge', 'platform-docs');

const fetchText = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ao baixar ${url}`);
  return res.text();
};

/** Lê o índice llms.txt: "- [Título](url.md): descrição" */
const parseIndex = llms =>
  [...llms.matchAll(/^- \[(.+?)\]\((\S+?\.md)\)(?::\s*(.*))?$/gm)].map(([, title, url, description]) => ({
    title,
    url,
    description: description?.trim() ?? '',
    id: url.replace(`${BASE_URL}/`, '').replace(/\.md$/, '').replaceAll('/', '--'),
  }));

/** Remove o HTML do GitBook e mantém só o texto útil para o agente. */
const clean = md =>
  md
    // cabeçalho "For the complete documentation index..."
    .replace(/^> For the complete documentation index[^\n]*\n+/, '')
    // imagens: mantém só a legenda, se houver
    .replace(/<figure>.*?<\/figure>/gs, figure => {
      const caption = figure.match(/<figcaption>(?:<p>)?(.*?)(?:<\/p>)?<\/figcaption>/s)?.[1]?.trim();
      return caption ? `_[Imagem: ${caption}]_` : '';
    })
    .replace(/<img[^>]*>/g, '')
    // tabelas em modo "cards": cada linha vira um item de lista (sem links de imagem)
    .replace(/<table[^>]*>.*?<\/table>/gs, table =>
      [...table.matchAll(/<tbody>(.*?)<\/tbody>/gs)]
        .flatMap(([, tbody]) => [...tbody.matchAll(/<tr>(.*?)<\/tr>/gs)])
        .map(([, row]) =>
          [...row.matchAll(/<td>(.*?)<\/td>/gs)]
            .map(([, cell]) =>
              cell
                .replace(/<a [^>]*>[^<]*\.(png|jpe?g|gif|webp)<\/a>/gi, '')
                .replace(/<h\d>(.*?)<\/h\d>/g, '**$1** — ')
                .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                .replace(/<[^>]+>/g, '')
                .trim(),
            )
            .filter(Boolean)
            .join(' — '),
        )
        .filter(Boolean)
        .map(item => `* ${item}`)
        .join('\n'),
    )
    // blocos do GitBook: hints, abas e embeds
    .replace(/\{% hint[^%]*%\}\s*(.*?)\s*\{% endhint %\}/gs, (_, text) => `> **Nota:** ${text.replace(/\n/g, '\n> ')}`)
    .replace(/\{% tab title="(.*?)" %\}/g, '#### $1')
    .replace(/\{% (end)?tabs? %\}/g, '')
    .replace(/\{% embed url="<?(.*?)>?" %\}/g, '[Vídeo/embed: $1]')
    // FAQ em <details>/<summary> vira pergunta em negrito + resposta
    .replace(/<summary>(.*?)<\/summary>/gs, '**P: $1**')
    .replace(/<\/?details>/g, '')
    // destaques coloridos e demais tags inline
    .replace(/<mark[^>]*>(.*?)<\/mark>/gs, '$1')
    .replace(/<\/?(p|span|div|br)[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\\\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const pages = parseIndex(await fetchText(`${BASE_URL}/llms.txt`));
if (pages.length === 0) throw new Error('Nenhuma página encontrada no llms.txt');

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

for (const page of pages) {
  const body = clean(await fetchText(page.url));
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(page.title)}`,
    `description: ${JSON.stringify(page.description)}`,
    `source: ${page.url.replace(/\.md$/, '')}`,
    '---',
  ].join('\n');
  await writeFile(join(OUT_DIR, `${page.id}.md`), `${frontmatter}\n\n${body}\n`);
  console.log(`✓ ${page.id}`);
}

console.log(`\n${pages.length} páginas salvas em ${OUT_DIR}`);
