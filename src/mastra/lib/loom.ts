/**
 * Extrai o vídeo e os metadados de um link de compartilhamento do Loom
 * (ex: https://www.loom.com/share/<id>). Funciona para vídeos públicos.
 */

/** Limite para enviar o vídeo inline ao modelo. */
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export type LoomVideo = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  data: Uint8Array;
  mediaType: 'video/mp4';
};

export const parseLoomId = (url: string) => {
  const id = url.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i)?.[1];
  if (!id) throw new Error(`URL do Loom inválida: ${url}`);
  return id;
};

const fetchMetadata = async (id: string) => {
  const res = await fetch(`https://www.loom.com/v1/oembed?url=https://www.loom.com/share/${id}`);
  if (!res.ok) throw new Error(`Não foi possível ler os dados do vídeo no Loom (${res.status}). O vídeo é público?`);
  const data = (await res.json()) as { title?: string; description?: string; duration?: number };
  return { title: data.title ?? '', description: data.description ?? '', durationSeconds: data.duration ?? 0 };
};

const fetchVideoUrl = async (id: string) => {
  const res = await fetch(`https://www.loom.com/api/campaigns/sessions/${id}/transcoded-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  const url = res.ok ? ((await res.json()) as { url?: string }).url : undefined;
  if (!url) throw new Error(`Não foi possível obter o MP4 do vídeo no Loom (${res.status}).`);
  return url;
};

export const downloadLoomVideo = async (shareUrl: string): Promise<LoomVideo> => {
  const id = parseLoomId(shareUrl);
  const [metadata, videoUrl] = await Promise.all([fetchMetadata(id), fetchVideoUrl(id)]);

  const res = await fetch(videoUrl);
  if (!res.ok) throw new Error(`Falha ao baixar o vídeo do Loom (${res.status}).`);
  const data = new Uint8Array(await res.arrayBuffer());
  if (data.byteLength > MAX_VIDEO_BYTES) {
    throw new Error(`Vídeo muito grande (${(data.byteLength / 1024 / 1024).toFixed(1)} MB). Limite: 20 MB.`);
  }

  return { id, ...metadata, data, mediaType: 'video/mp4' };
};
