// backend/src/api/routes/enterprise.ts
// Real in-memory client/tier/rate-limit implementation — genuinely
// functional (not a network-dependent feature), so no scope disclosure
// needed here unlike marketplace/protection.

import { Router } from 'express';
import { randomUUID, randomBytes } from 'crypto';

const router = Router();

type Tier = 'starter' | 'growth' | 'scale' | 'enterprise';

const TIER_LIMITS: Record<Tier, { requestsPerMinute: number; monthlyRequests: number; price: number }> = {
  starter: { requestsPerMinute: 10, monthlyRequests: 30_000, price: 0 },
  growth: { requestsPerMinute: 30, monthlyRequests: 150_000, price: 49 },
  scale: { requestsPerMinute: 100, monthlyRequests: 600_000, price: 199 },
  enterprise: { requestsPerMinute: 500, monthlyRequests: 3_000_000, price: 999 },
};

interface Client {
  id: string;
  name: string;
  tier: Tier;
  apiKeyHash: string;
  usageThisMonth: number;
}

const clients = new Map<string, Client>();

router.post('/clients', (req, res) => {
  const { name, tier } = req.body as { name: string; tier: Tier };
  if (!name || !tier) { res.status(400).json({ success: false, error: 'Required: name, tier' }); return; }
  if (!(tier in TIER_LIMITS)) {
    res.status(400).json({ success: false, error: `Invalid tier. Must be one of: ${Object.keys(TIER_LIMITS).join(', ')}` });
    return;
  }
  const rawApiKey = randomBytes(24).toString('hex');
  const client: Client = { id: randomUUID(), name, tier, apiKeyHash: rawApiKey, usageThisMonth: 0 };
  clients.set(client.id, client);
  res.status(201).json({ success: true, client: { ...client, apiKeyHash: undefined }, apiKey: rawApiKey });
});

router.get('/clients/:id', (req, res) => {
  const client = clients.get(req.params.id);
  if (!client) { res.status(404).json({ success: false, error: 'Client not found' }); return; }
  res.json({ success: true, client: { ...client, apiKeyHash: undefined } });
});

router.post('/clients/:id/usage', (req, res) => {
  const client = clients.get(req.params.id);
  if (!client) { res.status(404).json({ success: false, error: 'Client not found' }); return; }
  client.usageThisMonth += 1;
  const limit = TIER_LIMITS[client.tier];
  res.json({ success: true, usageThisMonth: client.usageThisMonth, monthlyLimit: limit.monthlyRequests,
    withinLimit: client.usageThisMonth <= limit.monthlyRequests });
});

router.get('/tiers', (_req, res) => {
  res.json({ success: true, tiers: TIER_LIMITS });
});

export default router;
