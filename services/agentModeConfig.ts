// Configuration for agent mode compatibility with input and output types
import type { AgentMode } from '../components/modality/agent/AgentModeSelector';

export type InputType = 'text' | 'image' | 'audio' | 'file' | 'drawing' | 'clipboard';
export type OutputType = 'chat' | 'audio' | 'image' | 'code' | 'table' | 'chart' | 'file';

export interface AgentModeConfig {
  compatibleInputs: InputType[];
  compatibleOutputs: OutputType[];
  defaultInput: InputType;
  defaultOutput: OutputType;
  description: string;
}

export const AGENT_MODE_CONFIGS: Record<AgentMode, AgentModeConfig> = {
  text: {
    compatibleInputs: ['text', 'clipboard'],
    compatibleOutputs: ['chat', 'code', 'table', 'chart'],
    defaultInput: 'text',
    defaultOutput: 'chat',
    description: 'Text-based conversation and analysis'
  },
  vision: {
    compatibleInputs: ['image', 'drawing', 'clipboard'],
    compatibleOutputs: ['chat', 'code', 'table'],
    defaultInput: 'image',
    defaultOutput: 'chat',
    description: 'Analyze and understand images'
  },
  create: {
    compatibleInputs: ['text', 'clipboard'],
    compatibleOutputs: ['image'],
    defaultInput: 'text',
    defaultOutput: 'image',
    description: 'Generate images from text descriptions'
  },
  transcribe: {
    compatibleInputs: ['audio', 'file'],
    compatibleOutputs: ['chat', 'code'],
    defaultInput: 'audio',
    defaultOutput: 'chat',
    description: 'Convert speech to text'
  },
  speak: {
    compatibleInputs: ['text', 'clipboard'],
    compatibleOutputs: ['audio'],
    defaultInput: 'text',
    defaultOutput: 'audio',
    description: 'Convert text to natural speech'
  },
  code: {
    compatibleInputs: ['text', 'file', 'clipboard'],
    compatibleOutputs: ['code', 'chat', 'file'],
    defaultInput: 'text',
    defaultOutput: 'code',
    description: 'Generate and analyze code'
  }
};

/**
 * Get compatible input types for a given agent mode
 */
export function getCompatibleInputs(agentMode: AgentMode): InputType[] {
  return AGENT_MODE_CONFIGS[agentMode].compatibleInputs;
}

/**
 * Get compatible output types for a given agent mode
 */
export function getCompatibleOutputs(agentMode: AgentMode): OutputType[] {
  return AGENT_MODE_CONFIGS[agentMode].compatibleOutputs;
}

/**
 * Check if an input type is compatible with an agent mode
 */
export function isInputCompatible(agentMode: AgentMode, inputType: InputType): boolean {
  return AGENT_MODE_CONFIGS[agentMode].compatibleInputs.includes(inputType);
}

/**
 * Check if an output type is compatible with an agent mode
 */
export function isOutputCompatible(agentMode: AgentMode, outputType: OutputType): boolean {
  return AGENT_MODE_CONFIGS[agentMode].compatibleOutputs.includes(outputType);
}

/**
 * Get the default input type for an agent mode
 */
export function getDefaultInput(agentMode: AgentMode): InputType {
  return AGENT_MODE_CONFIGS[agentMode].defaultInput;
}

/**
 * Get the default output type for an agent mode
 */
export function getDefaultOutput(agentMode: AgentMode): OutputType {
  return AGENT_MODE_CONFIGS[agentMode].defaultOutput;
}

/**
 * Filter input types to only those compatible with the agent mode
 */
export function filterInputTypes(allInputs: InputType[], agentMode: AgentMode): InputType[] {
  const compatible = getCompatibleInputs(agentMode);
  return allInputs.filter(input => compatible.includes(input));
}

/**
 * Filter output types to only those compatible with the agent mode
 */
export function filterOutputTypes(allOutputs: OutputType[], agentMode: AgentMode): OutputType[] {
  const compatible = getCompatibleOutputs(agentMode);
  return allOutputs.filter(output => compatible.includes(output));
}