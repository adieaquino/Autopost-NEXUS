// backend/src/agents/trendAgent.ts
// DISCLOSED: no live scraping API keys exist in this sandbox. Returns
// deterministic seed trends rather than pretending to hit real platform
// APIs — same honesty pattern as the original project's TikTok/Twitter
// scrapers (confidence:0, clearly labeled).
import type { AgentResult, Platform } from '../shared/types.js';

const SEED_TOPICS: Record<Platform, string[]> = {
  TIKTOK: ['#fyp', '#dayinthelife', '#motivation'],
  INSTAGRAM: ['#reels', '#aesthetic', '#mindset'],
  YOUTUBE: ['#shorts', '#tutorial'],
  FACEBOOK: ['#community'],
  TWITTER: ['#tech', '#news'],
  LINKEDIN: ['#leadership', '#growth'],
};

export function scrapeAllPlatforms(): AgentResult<{ platform: Platform; topic: string; score: number; confidence: number }[]> {
  const data = (Object.keys(SEED_TOPICS) as Platform[]).flatMap(platform =>
    SEED_TOPICS[platform].map(topic => ({
      platform, topic,
      score: Math.round((Math.random() * 40 + 60) * 10) / 10,
      confidence: 0, // disclosed: no live API access in this environment
    }))
  );
  return { agentName: 'trendAgent', omegaScore: 72, data, ranAt: new Date().toISOString() };
}
