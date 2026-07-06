// backend/src/shared/types.ts
// Canonical shared types — source of truth for the backend skeleton.

export type Platform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN';
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
export type ContentMood =
  | 'energetic' | 'calm' | 'luxury' | 'playful' | 'professional' | 'dramatic' | 'motivational';
export type EthicsSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  platform: Platform;
  content: string;
  hashtags: string[];
  status: PostStatus;
  omegaScore?: number;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  platform: Platform;
  frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CUSTOM';
  time: string;
  isActive: boolean;
}

export interface EthicsViolation {
  id: string;
  postId: string;
  category: string;
  severity: EthicsSeverity;
  description: string;
  createdAt: string;
}

export interface EthicsCheckResult {
  isApproved: boolean;
  violations: EthicsViolation[];
  riskLevel: EthicsSeverity | 'NONE';
}

export interface AgentResult<T = unknown> {
  agentName: string;
  omegaScore: number;
  data: T;
  ranAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

export type SocialPlatformKey = 'meta' | 'tiktok' | 'youtube';

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatformKey;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  platformUserId?: string;
  connectedAt: string;
}
