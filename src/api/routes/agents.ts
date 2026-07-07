import { Router } from 'express';
import { agentRegistry } from '../../agents/agentRegistry.js';
import { scrapeAllPlatforms } from '../../agents/trendAgent.js';
import { pickWinningVariant } from '../../agents/abTestingAgent.js';
import { adaptToTrend } from '../../agents/adaptationAgent.js';

const router = Router();

// GET /api/agents — list all registered agents
router.get('/', (_req, res) => {
  res.json({ success: true, agents: agentRegistry });
});

// GET /api/agents/trends — live (deterministic-mock) trend scrape
router.get('/trends', (_req, res) => {
  const result = scrapeAllPlatforms();
  res.json({ success: true, result });
});

// POST /api/agents/ab-test — pick a winning variant by performance
router.post('/ab-test', (req, res) => {
  const { variants } = req.body as { variants: { id: string; performance: number }[] };
  if (!variants?.length) { res.status(400).json({ success: false, error: 'Required: variants[]' }); return; }
  const result = pickWinningVariant(variants);
  res.json({ success: true, result });
});

// POST /api/agents/adapt — adapt a caption to a trending topic
router.post('/adapt', (req, res) => {
  const { baseCaption, trendingTopic } = req.body as { baseCaption: string; trendingTopic: string };
  if (!baseCaption || !trendingTopic) {
    res.status(400).json({ success: false, error: 'Required: baseCaption, trendingTopic' });
    return;
  }
  const result = adaptToTrend(baseCaption, trendingTopic);
  res.json({ success: true, result });
});

export default router;
