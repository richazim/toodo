import {
  dbDeleteFlashcard,
  dbDeleteGroup,
  dbGetAllGroups,
  dbGetGroupById,
  dbInsertFlashcard,
  dbInsertGroup,
  dbUpdateFlashcard,
  dbUpdateGroup,
  deleteAudio,
  ensureAudioDir,
  initDb,
  persistAudio,
} from '@/database/db';
import {
  Flashcard,
  FlashcardWithResponses,
  GroupWithFlashcards,
  createEmptyFlashcard,
  createResponse
} from '@/types/data2';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface GroupsContextType {
  groups: GroupWithFlashcards[];
  loading: boolean;
  // Groups
  addGroup: (name: string, color?: string) => Promise<GroupWithFlashcards | null>;
  deleteGroup: (groupId: number) => void;
  updateGroupName: (groupId: number, name: string) => void;
  getGroup: (groupId: number) => GroupWithFlashcards | undefined;
  // Flashcards
  addEmptyFlashcard: (groupId: number) => Promise<number | null>;
  updateFlashcard: (groupId: number, card: FlashcardWithResponses) => Promise<FlashcardWithResponses>;
  deleteFlashcard: (groupId: number, cardId: number) => void;
  getFlashcard: (groupId: number, cardId: number) => Flashcard | undefined;
  // Question
  setQuestion: (groupId: number, cardId: number, audio_uri: string) => Promise<void>;
  // Responses
  addResponse: (groupId: number, cardId: number, audio_uri: string, isCorrect: boolean) => Promise<void>;
  deleteResponse: (groupId: number, cardId: number, respId: number) => void;
  setResponseCorrect: (groupId: number, cardId: number, respId: number, isCorrect: boolean) => void;
}

const GroupsContext = createContext<GroupsContextType | null>(null);

export function GroupsProvider({ children }: {children: React.ReactNode }) {
  const [groups, setGroups] = useState<GroupWithFlashcards[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Init DB on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try{
        await ensureAudioDir();
      } catch (e) {
        console.error(e);
      }
      initDb();
      setGroups(dbGetAllGroups());
      setLoading(false);
    })();
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Met à jour l'état local ET écrit la carte modifiée en SQLite */
  function updateCardInState(
    groupId: number,
    cardId: number,
    updater: (card: FlashcardWithResponses) => FlashcardWithResponses
  ): Flashcard | null {
    let updatedCard: FlashcardWithResponses | null = null;
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        const flashcards = g.flashcards.map(c => {
          if (c.id !== cardId) return c;
          updatedCard = updater(c);
          return updatedCard;
        });
        return { ...g, flashcards };
      })
    );
    if (updatedCard) dbUpdateFlashcard(updatedCard);
    return updatedCard;
  }

  // ── Groups ──────────────────────────────────────────────────────────────────

  async function addGroup(name: string, color: string = '#000000'): Promise<GroupWithFlashcards | null> {
    // const group = createGroup(name, groups.length);

    try{
      const groupId = await dbInsertGroup({name, color, createdAt: Date.now()});
      const group: GroupWithFlashcards | null = await dbGetGroupById(groupId);
      setGroups((prev: GroupWithFlashcards[]) => group ? [...prev, group] : prev);
      return group!;
    }catch(e) {
      console.log(e);
    }
    return null;
  }

  function deleteGroup(groupId: number): void {
    dbDeleteGroup(groupId); // supprime aussi les fichiers audio en cascade
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }

  function updateGroupName(groupId: number, name: string): void {
    setGroups(prev => {
      const updated = prev.map(g => g.id === groupId ? { ...g, name } : g);
      const group = updated.find(g => g.id === groupId);
      if (group) dbUpdateGroup(group);
      return updated;
    });
  }

  function getGroup(groupId: number): GroupWithFlashcards | undefined {
    return groups.find(g => g.id === groupId);
  }

  // ── Flashcards ──────────────────────────────────────────────────────────────

  async function addEmptyFlashcard(groupId: number): Promise<number | null> {
    const card = createEmptyFlashcard(groupId);
    const rowId = dbInsertFlashcard(groupId, card);
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, flashcards: [...g.flashcards, card] }
          : g
      )
    );
    return rowId!;
  }

  async function updateFlashcard(groupId: number, card: FlashcardWithResponses): Promise<FlashcardWithResponses> {
    const persisted = await persistCardAudio(card);
    dbUpdateFlashcard(persisted);
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, flashcards: g.flashcards.map(c => c.id === card.id ? persisted : c) }
          : g
      )
    );
    return persisted;
  }

  function deleteFlashcard(groupId: number, cardId: number): void {
    dbDeleteFlashcard(cardId); // supprime aussi les .m4a
    setGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, flashcards: g.flashcards.filter(c => c.id !== cardId) }
          : g
      )
    );
  }

  function getFlashcard(groupId: number, cardId: number): Flashcard | undefined {
    return groups.find(g => g.id === groupId)?.flashcards.find(c => c.id === cardId);
  }

  // ── Question ────────────────────────────────────────────────────────────────

  async function setQuestion(
    groupId: number,
    cardId: number,
    audio_uri: string
  ): Promise<void> {
    const persistedUri = isTemp(audio_uri)
      ? await persistAudio(audio_uri, 'q_' + cardId)
      : audio_uri;
    // const persistedAudio: AudioClip = { ...audio, uri: persistedUri };
    const persistedAudio: string = persistedUri;

    updateCardInState(groupId, cardId, (c: FlashcardWithResponses): FlashcardWithResponses => {
      // Supprime l'ancien fichier si différent
      if (c.question_audio_uri && c.question_audio_uri !== persistedUri) {
        deleteAudio(c.question_audio_uri);
      }
      return { ...c, question_audio_uri: persistedAudio };
    });
  }

  // ── Responses ───────────────────────────────────────────────────────────────

  async function addResponse(
    groupId: number,
    cardId: number,
    audio_uri: string,
    isCorrect: boolean
  ): Promise<void> {
    const persistedUri = isTemp(audio_uri)
      ? await persistAudio(audio_uri, 'r_' + Date.now())
      : audio_uri;
    const resp = createResponse(cardId, persistedUri, isCorrect);

    updateCardInState(groupId, cardId, (c: FlashcardWithResponses): FlashcardWithResponses => ({
      ...c,
      responses: [...c.responses, resp],
    }));
  }

  function deleteResponse(groupId: number, cardId: number, respId: number): void {
    updateCardInState(groupId, cardId, c => {
      const resp = c.responses.find(r => r.id === respId);
      if (resp?.audio_uri) deleteAudio(resp.audio_uri);
      return { ...c, responses: c.responses.filter(r => r.id !== respId) };
    });
  }

  function setResponseCorrect(
    groupId: number,
    cardId: number,
    respId: number,
    isCorrect: boolean
  ): void {
    updateCardInState(groupId, cardId, c => ({
      ...c,
      responses: c.responses.map(r =>
        r.id === respId ? { ...r, isCorrect } : r
      ),
    }));
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <GroupsContext.Provider
      value={{
        groups, loading,
        addGroup, deleteGroup, updateGroupName, getGroup,
        addEmptyFlashcard, updateFlashcard, deleteFlashcard, getFlashcard,
        setQuestion,
        addResponse, deleteResponse, setResponseCorrect,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useGroups must be used inside GroupsProvider');
  return ctx;
}

// ── Helpers privés ────────────────────────────────────────────────────────────

async function persistCardAudio(card: FlashcardWithResponses): Promise<FlashcardWithResponses> {
  let question = card?.question_audio_uri;
  if (question && isTemp(question)) {
    const uri = await persistAudio(question, 'q_' + card.id);
    question = uri;
  }

  const responses = await Promise.all(
    card.responses.map(async (r) => {
      if (r.audio_uri && isTemp(r.audio_uri)) {
        const uri = await persistAudio(r.audio_uri, 'r_' + r.id);
        return { ...r, audio_uri: uri  };
      }
      return r;
    })
  );

  return { ...card, question_audio_uri: question, responses };
}

function isTemp(uri: string): boolean {
  return (
    uri.includes('/tmp/') ||
    uri.includes('/Caches/') ||
    uri.includes('/cache/') ||
    uri.includes('ExponentExperienceData') ||
    !uri.includes('audio/')
  );
}