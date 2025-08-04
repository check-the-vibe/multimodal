import { mapInputToCapability, type Agent } from '../components/types';
import { exampleAgents } from '../data/agents';

describe('Agent capability mapping', () => {
  it('maps UI input to capability', () => {
    expect(mapInputToCapability('text' as any)).toBe('text');
    expect(mapInputToCapability('audio' as any)).toBe('audio');
    expect(mapInputToCapability('photo' as any)).toBe('image');
    expect(mapInputToCapability('video' as any)).toBe('video');
  });
});

describe('Agent filtering', () => {
  const agents: Agent[] = exampleAgents;
  const filterAgents = (cap: any) => agents.filter((a) => a.accepts.includes(cap));
  const outputsFor = (id: string) => (agents.find((a) => a.id === id)?.produces ?? []);

  it('text input allows Vision-LLM and ImageGen-X', () => {
    const cap = mapInputToCapability('text' as any);
    const visible = filterAgents(cap).map((a) => a.id);
    expect(visible).toEqual(expect.arrayContaining(['vision-llm', 'imagegen-x']));
  });

  it('photo input allows Vision-LLM', () => {
    const cap = mapInputToCapability('photo' as any);
    const visible = filterAgents(cap).map((a) => a.id);
    expect(visible).toEqual(expect.arrayContaining(['vision-llm']));
    expect(visible).not.toEqual(expect.arrayContaining(['imagegen-x']));
  });

  it('ImageGen-X produces only image', () => {
    const outs = outputsFor('imagegen-x');
    expect(outs).toEqual(['image']);
  });
});

