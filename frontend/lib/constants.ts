/**
 * @file Centralized constants for the frontend application.
 */

/**
 * Enum-like object for badge types. Using `as const` provides type safety
 * and allows TypeScript to infer the exact string literal types.
 */
export const BADGE_TYPES = {
  PERFECT_SCORE: 'perfect-score',
  BEGINNER: 'beginner',
  BOOKWORM: 'bookworm',
  WEEK_WARRIOR: 'week-warrior',
  QUIZ_MASTER: 'quiz-master',
  PERFECTIONIST: 'perfectionist',
  ALL_TOPICS: 'all-topics',
} as const;

/**
 * Type representing a single badge identifier.
 * This is derived from the keys of BADGE_TYPES, ensuring that any badge-related
 * logic uses a valid badge type.
 */
export type BadgeType = (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];

/**
 * A record mapping each badge type to its display information.
 * This includes the badge's name, icon, and a description of how to earn it.
 */
export const BADGE_INFO: Record<
  BadgeType,
  { name: string; icon: string; description: string }
> = {
  [BADGE_TYPES.PERFECT_SCORE]: {
    name: 'Perfektní skóre',
    icon: '🌟',
    description: '100% úspěšnost v kvízu',
  },
  [BADGE_TYPES.BEGINNER]: {
    name: 'Začátečník',
    icon: '📚',
    description: '3 dokončené lekce',
  },
  [BADGE_TYPES.BOOKWORM]: {
    name: 'Knižní mol',
    icon: '📖',
    description: '20 dokončených lekcí',
  },
  [BADGE_TYPES.WEEK_WARRIOR]: {
    name: 'Týdenní bojovník',
    icon: '🔥',
    description: '7 dní učení v řadě',
  },
  [BADGE_TYPES.QUIZ_MASTER]: {
    name: 'Kvízový mistr',
    icon: '🏆',
    description: '10 perfektních kvízů',
  },
  [BADGE_TYPES.PERFECTIONIST]: {
    name: 'Perfekcionista',
    icon: '⭐',
    description: '5 perfektních kvízů v řadě',
  },
  [BADGE_TYPES.ALL_TOPICS]: {
    name: 'Univerzální znalec',
    icon: '🎓',
    description: 'Lekce ze všech kategorií',
  },
};
