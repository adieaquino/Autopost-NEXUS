// backend/src/agents/ethicsGuardianAgent.ts
// Real, deterministic regex-based content screening — not a stub. Not an
// LLM call (no API key configured in this sandbox, disclosed here as with
// captionAgent.ts). Checks fabrication risk (fake quote attribution) and a
// small blocklist, matching the "Einstein said..." / "God wants you rich"
// pattern the original project's ethics agent targeted.

import type { EthicsCheckResult, EthicsViolation } from '../shared/types.js';
import { randomUUID } from 'crypto';

const FABRICATION_PATTERN = /\b(einstein|shakespeare|gandhi|lincoln)\s+(said|once said|wrote)\b/i;
const PROSPERITY_PATTERN = /\bgod\s+wants?\s+you\s+rich\b/i;

export function checkContent(postId: string, content: string): EthicsCheckResult {
  const violations: EthicsViolation[] = [];

  if (FABRICATION_PATTERN.test(content)) {
    violations.push({
      id: randomUUID(),
      postId,
      category: 'FABRICATION',
      severity: 'HIGH',
      description: 'Quote not verified — attributed quote could not be confirmed against a source.',
      createdAt: new Date().toISOString(),
    });
  }

  if (PROSPERITY_PATTERN.test(content)) {
    violations.push({
      id: randomUUID(),
      postId,
      category: 'BIBLE_VIOLATION',
      severity: 'CRITICAL',
      description: 'Bible violation — prosperity gospel framing detected.',
      createdAt: new Date().toISOString(),
    });
  }

  const riskLevel = violations.some(v => v.severity === 'CRITICAL') ? 'CRITICAL'
    : violations.some(v => v.severity === 'HIGH') ? 'HIGH'
    : violations.length ? 'MEDIUM' : 'NONE';

  return {
    isApproved: violations.length === 0,
    violations,
    riskLevel,
  };
}
