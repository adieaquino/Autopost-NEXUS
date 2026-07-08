// backend/src/api/routes/protection.ts
// DISCLOSED SCOPE: the full spec describes 6 anti-copycat layers including
// blockchain notarization and AI similarity detection — those require
// external chain RPC access and a trained similarity model, neither
// available in this sandbox. This route implements the one layer that's
// honestly buildable locally: a deterministic content hash as a real,
// verifiable originality fingerprint (not a placeholder value).

import { Router } from 'express';
import { createHash, randomUUID } from 'crypto';
import { db } from '../../db/index.js';

const router = Router();

interface OwnershipProof {
  id: string;
  postId: string;
  contentHash: string;
  registeredAt: string;
}

const proofs = new Map<string, OwnershipProof>();

// POST /api/protection/register/:postId — real SHA-256 fingerprint of the post content
router.post('/register/:postId', (req, res) => {
  const post = db.posts.findById(req.params.postId);
  if (!post) { res.status(404).json({ success: false, error: 'Post not found' }); return; }

  const contentHash = createHash('sha256').update(post.content).digest('hex');
  const proof: OwnershipProof = {
    id: randomUUID(),
    postId: post.id,
    contentHash,
    registeredAt: new Date().toISOString(),
  };
  proofs.set(post.id, proof);

  res.status(201).json({
    success: true,
    proof,
    note: 'Local SHA-256 fingerprint only — blockchain notarization and AI similarity scanning are out of scope for this sandbox (no chain RPC or trained model available).',
  });
});

// GET /api/protection/status/:postId
router.get('/status/:postId', (req, res) => {
  const proof = proofs.get(req.params.postId);
  if (!proof) { res.status(404).json({ success: false, error: 'No ownership proof registered for this post' }); return; }
  res.json({ success: true, proof });
});

export default router;
