// backend/src/agents/musicAgent.ts
import type { AgentResult, ContentMood } from '../shared/types.js';

const LIBRARY: Record<ContentMood, string> = {
  motivational: 'epic-rise-120bpm', energetic: 'upbeat-pop-128bpm', calm: 'ambient-piano-70bpm',
  luxury: 'smooth-jazz-90bpm', playful: 'quirky-ukulele-110bpm', professional: 'corporate-clean-100bpm',
  dramatic: 'cinematic-tension-80bpm',
};

export function selectMusic(mood: ContentMood): AgentResult<{ trackId: string }> {
  return {
    agentName: 'musicAgent', omegaScore: 71,
    data: { trackId: LIBRARY[mood] ?? LIBRARY.motivational },
    ranAt: new Date().toISOString(),
  };
}
