import { Router } from 'express';

import authRouter        from './routes/auth.js';
import socialAuthRouter  from './routes/socialAuth.js';
import ethicsRouter      from './routes/ethics.js';
import publishRouter     from './routes/publish.js';
import designRouter      from './routes/design.js';
import postsRouter       from './routes/posts.js';
import schedulesRouter   from './routes/schedules.js';
import analyticsRouter   from './routes/analytics.js';
import agentsRouter      from './routes/agents.js';
import protectionRouter  from './routes/protection.js';
import marketplaceRouter from './routes/marketplace.js';
import enterpriseRouter  from './routes/enterprise.js';

const router = Router();

router.use('/auth',        authRouter);
router.use('/social-auth', socialAuthRouter);
router.use('/ethics',      ethicsRouter);
router.use('/publish',     publishRouter);
router.use('/design',      designRouter);
router.use('/posts',       postsRouter);
router.use('/schedules',   schedulesRouter);
router.use('/analytics',   analyticsRouter);
router.use('/agents',      agentsRouter);
router.use('/protection',  protectionRouter);
router.use('/marketplace', marketplaceRouter);
router.use('/enterprise',  enterpriseRouter);

export default router;
