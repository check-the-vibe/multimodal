export type InputType = 'text' | 'clipboard' | 'audio' | 'photo' | 'video';
export type OutputType = 'chat' | 'clipboard' | 'audio' | 'image' | 'code' | 'table' | 'chart' | 'file';

// Agent-related capabilities (normalized)
export type CapabilityInput = 'text' | 'audio' | 'image' | 'video';

export type Agent = {
  id: string;
  name: string;
  accepts: CapabilityInput[];
  produces: OutputType[];
  comingSoon?: boolean;
  description?: string;
};

export function mapInputToCapability(input: InputType): CapabilityInput {
  switch (input) {
    case 'clipboard':
      return 'text';
    case 'photo':
      return 'image';
    default:
      return input;
  }
}
