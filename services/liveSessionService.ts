
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createBlob } from './audioUtils';

let nextStartTime = 0;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
const sources = new Set<AudioBufferSourceNode>();
let stream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;

const SYSTEM_INSTRUCTION = `You are Aura, a gentle, emotionally attuned AI reflection companion. 
Your role is to help the user pause, reflect, and orient themselves through calm dialogue. 
You are not a therapist, coach, or productivity assistant.

Tone:
- Warm, soft, calm, and reassuring
- Emotionally supportive without being overly verbose.

Guidelines:
- Keep responses concise.
- Reflect the user’s words back with empathy.
- Avoid judgment or pressure.`;

export interface LiveSessionCallbacks {
  onTranscription?: (text: string, role: 'user' | 'assistant') => void;
  onStateChange?: (active: boolean) => void;
  onError?: (err: any) => void;
}

export async function startLiveSession(callbacks: LiveSessionCallbacks) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => {
        callbacks.onStateChange?.(true);
        const source = inputAudioContext!.createMediaStreamSource(stream!);
        scriptProcessor = inputAudioContext!.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext!.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        // Handle audio output
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContext) {
          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
          const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContext.destination);
          source.addEventListener('ended', () => sources.delete(source));
          source.start(nextStartTime);
          nextStartTime += audioBuffer.duration;
          sources.add(source);
        }

        // Handle transcription
        if (message.serverContent?.inputTranscription) {
          callbacks.onTranscription?.(message.serverContent.inputTranscription.text, 'user');
        }
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscription?.(message.serverContent.outputTranscription.text, 'assistant');
        }

        if (message.serverContent?.interrupted) {
          for (const s of sources) {
            s.stop();
          }
          sources.clear();
          nextStartTime = 0;
        }
      },
      onerror: (e) => callbacks.onError?.(e),
      onclose: () => callbacks.onStateChange?.(false),
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return sessionPromise;
}

export function stopLiveSession() {
  scriptProcessor?.disconnect();
  stream?.getTracks().forEach(t => t.stop());
  inputAudioContext?.close();
  outputAudioContext?.close();
  for (const s of sources) s.stop();
  sources.clear();
}
