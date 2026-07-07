// backend/src/agents/captionAgent.ts
// DISCLOSED: no OPENAI_API_KEY/ANTHROPIC_API_KEY configured in this
// sandbox. Uses deterministic template composition rather than a real
// LLM call, and says so — avoids the "illusion of functionality" failure
// mode of silently faking AI output.
import type { AgentResult, ContentMood } from '../shared/types.js';

const HOOKS: Record<ContentMood, string[]> = {
  motivational: ["You're stronger than you think.", 'This is your sign.'],
  energetic: ['Let’s go!', 'Feel the momentum.'],
  calm: ['Take a breath.', 'Slow down for a second.'],
  luxury: ['Elevate your standard.', 'This is the upgrade.'],
  playful: ['Okay but hear me out...', 'Plot twist:'],
  professional: ['Here’s what the data shows.', 'A quick insight:'],
  dramatic: ['Nobody talks about this.', 'This changes everything.'],
};

export function generateCaption(topic: string, mood: ContentMood): AgentResult<{ caption: string; hooks: string[] }> {
  const hooks = HOOKS[mood] ?? HOOKS.motivational;
  const caption = `${hooks[0]}\n\n${topic}.`;
  return {
    agentName: 'captionAgent',
    omegaScore: 78,
    data: { caption, hooks },
    ranAt: new Date().toISOString(),
  };
}
