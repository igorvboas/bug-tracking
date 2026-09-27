/**
 * Perfis dos desenvolvedores usados pelo agente de atribuição, organizados
 * pelas camadas da stack do ZAPN.
 *
 * TODO: trocar `name` (hoje é a função) pelo nome de cada dev e ajustar
 * `available`. Quanto mais específico o `scope`, melhor a atribuição.
 */
export type Developer = {
  id: string;
  name: string;
  role: string;
  scope: string;
  modules: string[];
  skills: string[];
  /** Devs indisponíveis (férias, sobrecarga) ficam fora da atribuição. */
  available: boolean;
};

export const developers: Developer[] = [
  {
    id: 'frontend-bubble',
    name: 'Dev Frontend (Bubble)',
    role: 'Frontend Engineer',
    scope:
      'Responsável pela aplicação web em Bubble.io: telas, formulários, workflows do Bubble, login e controle de acesso na interface, criação de campanhas (texto, imagem, vídeo, áudio, arquivo, mapa), gestão de listas e importação de contatos por CSV. Também responde pelo envio dos dados da campanha do Bubble para o webhook do N8N.',
    modules: ['Primeiro acesso', 'Login', 'Campanhas', 'Listas de contatos', 'Importação de contatos'],
    skills: ['Bubble.io', 'Workflows Bubble', 'API Connector', 'UX'],
    available: true,
  },
  {
    id: 'backend-n8n',
    name: 'Dev Backend (N8N + RabbitMQ)',
    role: 'Backend Engineer',
    scope:
      'Responsável pelo processamento de envios: webhooks do N8N que recebem as campanhas do Bubble, publicação na fila do RabbitMQ (uma fila por usuário, criada junto com a conta), consumer que lê a fila e dispara as mensagens, agendamentos, intervalo entre envios e status de envio (enviado, erro, cancelado).',
    modules: ['Envios', 'Agendamentos', 'Status de envio', 'Filas'],
    skills: ['N8N', 'RabbitMQ', 'Webhooks', 'JavaScript'],
    available: true,
  },
  {
    id: 'integracoes',
    name: 'Dev Integrações (WhatsApp + Hotmart)',
    role: 'Integrations Engineer',
    scope:
      'Responsável pelas integrações externas: conexão de dispositivos WhatsApp, extração de contatos de grupos, bloqueios e limites do WhatsApp, integração com a Hotmart via webhooks (provisionamento automático de usuários, bloqueio/desbloqueio de contas por assinatura) e onboarding pelo WhatsApp com a Evolution API.',
    modules: ['Conexão WhatsApp', 'Extração de grupos', 'Bloqueios no WhatsApp', 'Assinatura', 'Pagamentos'],
    skills: ['Evolution API', 'Hotmart', 'N8N', 'Webhooks'],
    available: true,
  },
  {
    id: 'dados-infra',
    name: 'Dev Dados e Infra (Supabase + Docker)',
    role: 'Platform Engineer',
    scope:
      'Responsável pelo banco de dados Supabase self-hosted (tabelas, consultas, políticas de acesso, integridade dos dados) e pela infraestrutura em Docker/Portainer (containers do N8N, RabbitMQ e Supabase, deploy, disponibilidade, lentidão e quedas de serviço).',
    modules: ['Banco de dados', 'Infraestrutura', 'Disponibilidade'],
    skills: ['Supabase', 'PostgreSQL', 'Docker', 'Portainer'],
    available: true,
  },
];
