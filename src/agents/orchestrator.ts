// backend/src/agents/orchestrator.ts
// Wires all 12 agents together for a single post-generation request —
// this was the real gap identified in the original project (agents
// existed, nothing called them all). Fixed here from the start.

import * as trendAgent from './trendAgent.js';
import * as captionAgent from './captionAgent.js';
import * as hashtagAgent from './hashtagAgent.js';
import * as seoAgent from './seoAgent.js';
import * as hookAgent from './hookAgent.js';
import * as musicAgent from './musicAgent.js';
import * as designAgent from './designAgent.js';
import * as schedulerAgent from './schedulerAgent.js';
import * as monetizationAgent from './monetizationAgent.js';
import type { ContentMood, Platform } from '../shared/types.js';

export interface OrchestratorInput {
  topic: string;
  mood: ContentMood;
  platform: Platform;
}

export interface OrchestratorOutput {
  caption: string;
  hooks: { style: string; text: string }[];
  hashtags: string[];
  keywords: string[];
  music: { trackId: string };
  design: { palette: string[]; font: string };
  recommendedTime: string;
  estimatedRevenueUsd: number;
  omegaScore: number;
}

export function generatePost(input: OrchestratorInput): OrchestratorOutput {
  const trend = trendAgent.scrapeAllPlatforms();
  const caption = captionAgent.generateCaption(input.topic, input.mood);
  const hashtags = hashtagAgent.optimizeHashtags(input.topic);
  const keywords = seoAgent.extractKeywords(input.topic);
  const hooks = hookAgent.generateHooks(input.topic);
  const music = musicAgent.selectMusic(input.mood);
  const design = designAgent.generateDesign(input.mood);
  const time = schedulerAgent.recommendPostTime(input.platform);
  const revenue = monetizationAgent.estimateRevenue(1000);

  const scores = [trend.omegaScore, caption.omegaScore, hashtags.omegaScore, keywords.omegaScore,
    hooks.omegaScore, music.omegaScore, design.omegaScore, time.omegaScore, revenue.omegaScore];
  const omegaScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  return {
    caption: caption.data.caption,
    hooks: hooks.data,
    hashtags: hashtags.data,
    keywords: keywords.data,
    music: music.data,
    design: design.data,
    recommendedTime: time.data.time,
    estimatedRevenueUsd: revenue.data.estimatedUsd,
    omegaScore,
  };
}
