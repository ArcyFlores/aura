
export interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ReflectionState {
  dailyImageUrl: string | null;
  isGeneratingImage: boolean;
  messages: Message[];
  isThinking: boolean;
  isGenerating: boolean;
  isLive: boolean;
}
