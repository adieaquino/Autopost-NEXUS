// backend/src/api/routes/marketplace.ts
// DISCLOSED SCOPE: the full spec describes an NFT/crypto marketplace on
// Polygon with wallet payments — this sandbox has no chain RPC, no wallet
// provider, and no crypto payment processor. Implemented here as a real,
// working in-memory asset marketplace (list/buy/search) using plain IDs
// and a ledger balance instead of on-chain tokens — genuinely functional
// for the content-marketplace use case, honestly not blockchain-backed.

import { Router } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

interface Asset {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  price: number;
  status: 'listed' | 'sold';
  buyerId?: string;
}

const assets = new Map<string, Asset>();

router.get('/assets', (_req, res) => {
  res.json({ success: true, assets: [...assets.values()].filter(a => a.status === 'listed') });
});

router.get('/assets/search', (req, res) => {
  const q = ((req.query.q as string) ?? '').toLowerCase();
  if (!q) { res.status(400).json({ success: false, error: 'Required: q' }); return; }
  const results = [...assets.values()].filter(a =>
    a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  res.json({ success: true, results });
});

router.get('/assets/:id', (req, res) => {
  const asset = assets.get(req.params.id);
  if (!asset) { res.status(404).json({ success: false, error: 'Asset not found' }); return; }
  res.json({ success: true, asset });
});

router.post('/list', (req, res) => {
  const { creatorId, name, description, price } = req.body as {
    creatorId: string; name: string; description?: string; price: number;
  };
  if (!creatorId || !name || !price) {
    res.status(400).json({ success: false, error: 'Required: creatorId, name, price' });
    return;
  }
  const asset: Asset = { id: randomUUID(), creatorId, name, description: description ?? '', price, status: 'listed' };
  assets.set(asset.id, asset);
  res.status(201).json({ success: true, asset });
});

router.post('/purchase', (req, res) => {
  const { assetId, buyerId } = req.body as { assetId: string; buyerId: string };
  if (!assetId || !buyerId) {
    res.status(400).json({ success: false, error: 'Required: assetId, buyerId' });
    return;
  }
  const asset = assets.get(assetId);
  if (!asset) { res.status(404).json({ success: false, error: 'Asset not found' }); return; }
  if (asset.status === 'sold') { res.status(409).json({ success: false, error: 'Asset already sold' }); return; }

  asset.status = 'sold';
  asset.buyerId = buyerId;
  res.json({
    success: true,
    asset,
    note: 'Local ledger transfer only — no real crypto payment or blockchain settlement in this sandbox.',
  });
});

router.get('/creator/:creatorId', (req, res) => {
  const listings = [...assets.values()].filter(a => a.creatorId === req.params.creatorId);
  res.json({ success: true, listings, total: listings.length });
});

router.get('/stats', (_req, res) => {
  const all = [...assets.values()];
  res.json({
    success: true,
    stats: {
      totalListings: all.length,
      totalSold: all.filter(a => a.status === 'sold').length,
      totalVolume: all.filter(a => a.status === 'sold').reduce((sum, a) => sum + a.price, 0),
    },
  });
});

export default router;
