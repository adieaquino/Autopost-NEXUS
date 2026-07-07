// backend/src/agents/hookAgent.ts
import type { AgentResult } from '../shared/types.js';

const STYLES = ['question', 'shocking', 'relatable'] as const;

export function generateHooks(topic: string): AgentResult<{ style: string; text: string }[]> {
  const data = STYLES.map(style => {
    if (style === 'question') return { style, text: `Have you ever thought about ${topic}?` };
    if (style === 'shocking') return { style, text: `Nobody tells you this about ${topic}.` };
    return { style, text: `This is exactly what happened when I tried ${topic}.` };
  });
  return { agentName: 'hookAgent', omegaScore: 76, data, ranAt: new Date().toISOString() };
}
