// backend/src/agents/seoAgent.ts
import type { AgentResult } from '../shared/types.js';

export function extractKeywords(topic: string): AgentResult<string[]> {
  const words = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  return { agentName: 'seoAgent', omegaScore: 70, data: [...new Set(words)], ranAt: new Date().toISOString() };
}
