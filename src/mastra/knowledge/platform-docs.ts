import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/**
 * Documentação de uso do ZAPN, lida de `src/mastra/knowledge/platform-docs/*.md`.
 * Para atualizar os arquivos a partir do GitBook: `pnpm run sync:knowledge`.
 */
export type PlatformDoc = {
  id: string;
  title: string;
  description: string;
  source: string;
  content: string;
};

const DOCS_SUBDIR = join('src', 'mastra', 'knowledge', 'platform-docs');

/**
 * O servidor roda com cwd diferente em dev (src/mastra/public) e build (.mastra/output),
 * então sobe os diretórios a partir do cwd até achar a pasta de docs.
 * `KNOWLEDGE_DIR` sobrescreve a busca (ex: em deploy).
 */
const findDocsDir = () => {
  if (process.env.KNOWLEDGE_DIR) return join(resolve(process.env.KNOWLEDGE_DIR), 'platform-docs');

  let dir = process.cwd();
  while (true) {
    const candidate = join(dir, DOCS_SUBDIR);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Pasta ${DOCS_SUBDIR} não encontrada a partir de ${process.cwd()}`);
    dir = parent;
  }
};

const parseDoc = (id: string, raw: string): PlatformDoc => {
  const [, frontmatter = '', content = raw] = raw.match(/^---\n(.*?)\n---\n(.*)$/s) ?? [];
  const field = (name: string) => {
    const value = frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1]?.trim() ?? '';
    return value.startsWith('"') ? JSON.parse(value) : value;
  };
  return { id, title: field('title') || id, description: field('description'), source: field('source'), content: content.trim() };
};

let cache: PlatformDoc[] | undefined;

export const loadPlatformDocs = (): PlatformDoc[] => {
  if (cache) return cache;
  const dir = findDocsDir();
  cache = readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .sort()
    .map(file => parseDoc(file.replace(/\.md$/, ''), readFileSync(join(dir, file), 'utf8')));
  return cache;
};
