import AsyncStorage from '@react-native-async-storage/async-storage';

export type AudioClip = {
  uri: string;
  duration: number; // ms
};

export type Response = {
  id: string;
  audio: AudioClip;
  isCorrect: boolean;
};

export type Flashcard = {
  id: string;
  question: AudioClip | null;
  responses: Response[];
  createdAt: number;
};

export type Group = {
  id: string;
  name: string;
  color: string;
  flashcards: Flashcard[];
  createdAt: number;
};

const STORAGE_KEY = 'audio_flashcards_groups';

const GROUP_COLORS = [
  '#F0C040', '#E05C5C', '#5CAAE0', '#5CE07A',
  '#C05CE0', '#E0905C', '#5CE0D4', '#E05CA3',
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// export async function loadGroups(): Promise<Group[]> {
//   try {
//     const raw = await AsyncStorage.getItem(STORAGE_KEY);
//     return raw ? JSON.parse(raw) : [];
//   } catch {
//     return [];
//   }
// }

// export async function saveGroups(groups: Group[]): Promise<void> {
//   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
// }

export { generateId, GROUP_COLORS };
