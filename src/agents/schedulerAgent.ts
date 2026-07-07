// backend/src/agents/schedulerAgent.ts
import type { AgentResult, Platform } from '../shared/types.js';

const PEAK_HOURS: Record<Platform, string> = {
  TIKTOK: '19:00', INSTAGRAM: '18:00', YOUTUBE: '17:00', FACEBOOK: '13:00', TWITTER: '09:00', LINKEDIN: '08:00',
};

export function recommendPostTime(platform: Platform): AgentResult<{ time: string }> {
  return { agentName: 'schedulerAgent', omegaScore: 73, data: { time: PEAK_HOURS[platform] }, ranAt: new Date().toISOString() };
}
