import type { Agent } from '../components/types';

export const exampleAgents: Agent[] = [
  {
    id: 'openai-gpt5',
    name: 'OpenAI – GPT‑5',
    accepts: ['text', 'image'],
    produces: ['chat'],
    comingSoon: false,
    description: 'General-purpose multimodal assistant',
  },
  {
    id: 'vision-llm',
    name: 'Vision-LLM',
    accepts: ['text', 'image'],
    produces: ['chat'],
    comingSoon: true,
    description: 'Vision + text reasoning',
  },
  {
    id: 'imagegen-x',
    name: 'ImageGen-X',
    accepts: ['text'],
    produces: ['image'],
    comingSoon: true,
    description: 'Text-to-image generation',
  },
  {
    id: 'audio-assistant',
    name: 'AudioAssistant',
    accepts: ['audio', 'text'],
    produces: ['audio', 'chat'],
    comingSoon: true,
    description: 'Audio-centric assistant',
  },
];
