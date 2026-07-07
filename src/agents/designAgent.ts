// backend/src/agents/designAgent.ts
import type { AgentResult, ContentMood } from '../shared/types.js';

const PALETTES: Record<ContentMood, string[]> = {
  motivational: ['#DC2626', '#FBBF24'], energetic: ['#F97316', '#FACC15'], calm: ['#0EA5E9', '#F1F5F9'],
  luxury: ['#111827', '#D4AF37'], playful: ['#EC4899', '#8B5CF6'], professional: ['#1E3A8A', '#F3F4F6'],
  dramatic: ['#7C3AED', '#111827'],
};

export function generateDesign(mood: ContentMood): AgentResult<{ palette: string[]; font: string }> {
  return {
    agentName: 'designAgent', omegaScore: 80,
    data: { palette: PALETTES[mood] ?? PALETTES.motivational, font: mood === 'motivational' ? 'Bebas Neue' : 'Inter' },
    ranAt: new Date().toISOString(),
  };
}
