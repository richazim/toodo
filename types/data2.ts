/* =========================================================
 * Database Table Types
 * ========================================================= */

import { GROUP_COLORS } from "./data";

export interface Group {
  id?: number;
  name: string;
  color: string;
  createdAt: number;
}

export interface Flashcard {
  id?: number;
  group_id: number;
  question_audio_uri: string | null;
  createdAt: number;
}

export interface Response {
  id?: number;
  flashcard_id: number;
  audio_uri: string | null;
  is_correct: number; // SQLite BOOLEAN => INTEGER (0 | 1)
  // sort_order: number;
}

/* =========================================================
 * Insert Types
 * ========================================================= */

export type CreateGroup = Omit<Group, "id"> & {
  id?: number;
};

export type CreateFlashcard = Omit<Flashcard, "id"> & {
  id?: number;
};

export type CreateResponse = Omit<Response, "id"> & {
  id?: number;
};

/* =========================================================
 * Update Types
 * ========================================================= */

export type UpdateGroup = Partial<Omit<Group, "createdAt">>;

export type UpdateFlashcard = Partial<
  Omit<Flashcard, "group_id" | "createdAt">
>;

export type UpdateResponse = Partial<
  Omit<Response, "flashcard_id">
>;

/* =========================================================
 * Joined / Extended Types
 * ========================================================= */

export interface FlashcardWithResponses extends Flashcard {
  responses: Response[];
}

export interface GroupWithFlashcards extends Group {
  flashcards: FlashcardWithResponses[];
}

/* =========================================================
 * Database Map
 * ========================================================= */

export interface DatabaseTables {
  groups: Group;
  flashcards: Flashcard;
  responses: Response;
}


//////////////////////////////////////////////////

export function createGroup(name: string, colorIndex: number): GroupWithFlashcards {
  return {
    name,
    color: GROUP_COLORS[colorIndex % GROUP_COLORS.length],
    flashcards: [],
    createdAt: Date.now(),
  };
}

export function createEmptyFlashcard(group_id: number): FlashcardWithResponses {
  return {
    group_id,
    question_audio_uri: null,
    responses: [],
    createdAt: 0,
  };
}

export function createResponse(flashcard_id: number, audio_uri: string, isCorrect: boolean): Response {
  return {
    flashcard_id,
    audio_uri,
    is_correct: isCorrect ? 1 : 0,
  };
}
