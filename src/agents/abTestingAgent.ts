// backend/src/agents/abTestingAgent.ts
import type { AgentResult } from '../shared/types.js';

export function pickWinningVariant(variants: { id: string; performance: number }[]): AgentResult<{ winnerId: string | null }> {
  const winner = variants.reduce<{ id: string; performance: number } | null>((best, v) =>
    !best || v.performance > best.performance ? v : best, null);
  return { agentName: 'abTestingAgent', omegaScore: 68, data: { winnerId: winner?.id ?? null }, ranAt: new Date().toISOString() };
}
