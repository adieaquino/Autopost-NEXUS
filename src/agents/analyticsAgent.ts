// backend/src/agents/analyticsAgent.ts
import type { AgentResult, Post } from '../shared/types.js';

export function computeEngagementRate(post: Post, views: number, likes: number, comments: number, shares: number): AgentResult<{ engagementRate: number }> {
  const engagementRate = views > 0 ? Math.round(((likes + comments + shares) / views) * 10000) / 100 : 0;
  return { agentName: 'analyticsAgent', omegaScore: 69, data: { engagementRate }, ranAt: new Date().toISOString() };
}
