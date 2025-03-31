export const DEFAULT_CHAT_MODEL: string = 'chat-model';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'chat-model-4o',
    name: '4o',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-4o-mini',
    name: '4o mini',
    description: 'Smaller and faster model',
  },
  {
    id: 'reasoning-model-o3-mini',
    name: 'o3 mini',
    description: 'Reasoning model',
  },
];
