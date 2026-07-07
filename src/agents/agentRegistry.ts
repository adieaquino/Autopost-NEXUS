// backend/src/agents/agentRegistry.ts
// Central registry of all 12 agents — mirrors the pattern the original
// project used (and where it had disclosed gaps: agents existing but not
// registered). Every agent here is both implemented AND registered.

export type AgentPhase = 4 | 5;

export interface AgentRegistration {
  name: string;
  phase: AgentPhase;
  category: 'content' | 'growth' | 'operations';
}

export const agentRegistry: AgentRegistration[] = [
  { name: 'trendAgent', phase: 4, category: 'content' },
  { name: 'captionAgent', phase: 4, category: 'content' },
  { name: 'hashtagAgent', phase: 4, category: 'growth' },
  { name: 'seoAgent', phase: 4, category: 'growth' },
  { name: 'hookAgent', phase: 4, category: 'content' },
  { name: 'musicAgent', phase: 4, category: 'content' },
  { name: 'designAgent', phase: 4, category: 'content' },
  { name: 'analyticsAgent', phase: 5, category: 'operations' },
  { name: 'schedulerAgent', phase: 5, category: 'operations' },
  { name: 'abTestingAgent', phase: 5, category: 'growth' },
  { name: 'adaptationAgent', phase: 5, category: 'growth' },
  { name: 'monetizationAgent', phase: 5, category: 'operations' },
];

export function getAgentsByPhase(phase: AgentPhase): AgentRegistration[] {
  return agentRegistry.filter(a => a.phase === phase);
}
