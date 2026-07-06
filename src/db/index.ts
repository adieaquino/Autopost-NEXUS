// backend/src/db/index.ts
//
// In-memory store mirroring prisma/schema.prisma's shapes.
// DISCLOSED LIMITATION: this sandbox cannot reach binaries.prisma.sh to run
// `prisma generate`, so this skeleton does not depend on @prisma/client.
// The schema file remains the documented target; swapping this module for
// a real Prisma-backed repository (as postRepository.ts did in the
// original project) is a drop-in change — every function signature here
// is written to match what a Prisma-backed equivalent would return.

import { randomUUID } from 'crypto';
import type { Post, Schedule, EthicsViolation, Platform, PostStatus, User, SocialAccount, SocialPlatformKey } from '../shared/types.js';

const posts = new Map<string, Post>();
const schedules = new Map<string, Schedule>();
const violations = new Map<string, EthicsViolation[]>();
const users = new Map<string, User>();
const usersByEmail = new Map<string, string>(); // email -> userId
const socialAccounts = new Map<string, SocialAccount>(); // key: `${userId}:${platform}`

export const db = {
  socialAccounts: {
    upsert(userId: string, platform: SocialPlatformKey, input: Omit<SocialAccount, 'id' | 'userId' | 'platform' | 'connectedAt'>): SocialAccount {
      const key = `${userId}:${platform}`;
      const existing = socialAccounts.get(key);
      const account: SocialAccount = {
        id: existing?.id ?? randomUUID(),
        userId,
        platform,
        connectedAt: existing?.connectedAt ?? new Date().toISOString(),
        ...input,
      };
      socialAccounts.set(key, account);
      return account;
    },
    find(userId: string, platform: SocialPlatformKey): SocialAccount | undefined {
      return socialAccounts.get(`${userId}:${platform}`);
    },
    findAllForUser(userId: string): SocialAccount[] {
      return [...socialAccounts.values()].filter(a => a.userId === userId);
    },
  },
  users: {
    create(input: { email: string; passwordHash: string; name?: string }): User {
      if (usersByEmail.has(input.email)) {
        throw new Error('Email already registered');
      }
      const user: User = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
      users.set(user.id, user);
      usersByEmail.set(user.email, user.id);
      return user;
    },
    findById(id: string): User | undefined {
      return users.get(id);
    },
    findByEmail(email: string): User | undefined {
      const id = usersByEmail.get(email);
      return id ? users.get(id) : undefined;
    },
  },
  posts: {
    create(input: Omit<Post, 'id' | 'createdAt' | 'status'> & { status?: PostStatus }): Post {
      const post: Post = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: input.status ?? 'DRAFT',
        ...input,
      };
      posts.set(post.id, post);
      return post;
    },
    findById(id: string): Post | undefined {
      return posts.get(id);
    },
    findByUserId(userId: string): Post[] {
      return [...posts.values()].filter(p => p.userId === userId);
    },
    update(id: string, patch: Partial<Post>): Post | undefined {
      const existing = posts.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch };
      posts.set(id, updated);
      return updated;
    },
    all(): Post[] {
      return [...posts.values()];
    },
  },
  schedules: {
    create(input: Omit<Schedule, 'id' | 'isActive'> & { isActive?: boolean }): Schedule {
      const schedule: Schedule = { id: randomUUID(), isActive: input.isActive ?? true, ...input };
      schedules.set(schedule.id, schedule);
      return schedule;
    },
    findByUserId(userId: string): Schedule[] {
      return [...schedules.values()].filter(s => s.userId === userId);
    },
    all(): Schedule[] {
      return [...schedules.values()];
    },
  },
  ethicsViolations: {
    add(postId: string, violation: Omit<EthicsViolation, 'id' | 'postId' | 'createdAt'>): EthicsViolation {
      const record: EthicsViolation = {
        id: randomUUID(),
        postId,
        createdAt: new Date().toISOString(),
        ...violation,
      };
      const list = violations.get(postId) ?? [];
      list.push(record);
      violations.set(postId, list);
      return record;
    },
    findByPostId(postId: string): EthicsViolation[] {
      return violations.get(postId) ?? [];
    },
  },
};

export default db;
