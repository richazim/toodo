import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useGroups } from '@/context/GroupsContext';
import { Response, FlashcardWithResponses } from '@/types/data2';

const { width: SCREEN_W } = Dimensions.get('window');

type Phase =
  | 'ready'        // waiting to start
  | 'question'     // playing question audio
  | 'pause'        // short pause after question
  | 'responses'    // playing responses one by one
  | 'reveal'       // showing correct answer
  | 'next'         // waiting before next card
  | 'done';        // all cards played

const PAUSE_AFTER_QUESTION = 1200;   // ms between question and first response
const PAUSE_BETWEEN_RESPONSES = 800; // ms between responses
const REVEAL_DURATION = 2500;        // ms to show correct answer
const NEXT_CARD_DELAY = 1000;        // ms before moving to next card

export default function AutoPlayScreen() {
  const { groupId: groupIdStr } = useLocalSearchParams<{ groupId: string }>();
  const groupId = Number(groupIdStr);
  const { groups } = useGroups();
  const router = useRouter();

  const group = groups.find(g => g.id === groupId);
  const cards: FlashcardWithResponses[] = group?.flashcards ?? [];

  const [cardIndex, setCardIndex] = useState(0);
  const [responseIndex, setResponseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [revealedResponses, setRevealedResponses] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const phaseRef = useRef<Phase>('ready');

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const currentCard = cards[cardIndex] ?? null;

  // ── Sync refs ──
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      stopSound();
      clearTimer();
    };
  }, []);

  // ── Animate card entry ──
  useEffect(() => {
    cardAnim.setValue(40);
    Animated.spring(cardAnim, { toValue: 0, useNativeDriver: true, tension: 60 }).start();
  }, [cardIndex]);

  // ── Animate progress bar ──
  useEffect(() => {
    if (cards.length === 0) return;
    Animated.timing(progressAnim, {
      toValue: (cardIndex + 1) / cards.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [cardIndex, cards.length]);

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  async function stopSound() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => { timerRef.current = setTimeout(resolve, ms); });
  }

  async function playUri(uri: string): Promise<void> {
    await stopSound();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
    return new Promise(async (resolve) => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
            soundRef.current = null;
            resolve();
          }
        });
        await sound.playAsync();
      } catch {
        resolve();
      }
    });
  }

  // ── Main playback sequence for one card ──
  const playCard = useCallback(async (card: FlashcardWithResponses) => {
    if (!card.question_audio_uri) { advanceCard(); return; }

    // Play question
    setPhase('question');
    await playUri(card.question_audio_uri);
    if (isPausedRef.current) return;

    await delay(PAUSE_AFTER_QUESTION);
    if (isPausedRef.current) return;

    // Play responses one by one
    setPhase('responses');
    for (let i = 0; i < card.responses.length; i++) {
      if (isPausedRef.current) return;
      setResponseIndex(i);
      const r = card.responses[i];
      if (r.audio_uri) await playUri(r.audio_uri);
      if (isPausedRef.current) return;
      if (i < card.responses.length - 1) await delay(PAUSE_BETWEEN_RESPONSES);
    }
    if (isPausedRef.current) return;

    // Reveal correct answers
    setPhase('reveal');
    const correctIds = card.responses.filter(r => r.is_correct).map(r => r.id?.toString()!);
    setRevealedResponses(correctIds);

    await delay(REVEAL_DURATION);
    if (isPausedRef.current) return;

    setPhase('next');
    await delay(NEXT_CARD_DELAY);
    if (isPausedRef.current) return;

    advanceCard();
  }, []);

  function advanceCard() {
    setRevealedResponses([]);
    setResponseIndex(0);
    setCardIndex(prev => {
      const next = prev + 1;
      if (next >= cards.length) {
        setPhase('done');
        return prev;
      }
      return next;
    });
  }

  // ── Trigger playCard when cardIndex changes (and not paused) ──
  useEffect(() => {
    if (phase === 'ready' || phase === 'done') return;
    if (isPaused) return;
    if (!currentCard) return;
    playCard(currentCard);
  }, [cardIndex]);

  function handleStart() {
    if (cards.length === 0) return;
    setPhase('question');
    playCard(cards[0]);
  }

  async function handlePause() {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      isPausedRef.current = false;
      if (currentCard) playCard(currentCard);
    } else {
      // Pause
      setIsPaused(true);
      isPausedRef.current = true;
      clearTimer();
      await stopSound();
    }
  }

  function handleSkip() {
    clearTimer();
    stopSound();
    setRevealedResponses([]);
    setResponseIndex(0);
    const next = cardIndex + 1;
    if (next >= cards.length) {
      setPhase('done');
    } else {
      setCardIndex(next);
      setPhase('question');
      playCard(cards[next]);
    }
  }

  function handleRestart() {
    clearTimer();
    stopSound();
    setCardIndex(0);
    setResponseIndex(0);
    setRevealedResponses([]);
    setPhase('ready');
  }

  if (!group) return null;

  const groupColor = group.color;

  // ── DONE screen ──
  if (phase === 'done') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: '#F8F7FF' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.doneContainer}>
          <View style={[styles.doneIcon, { backgroundColor: groupColor + '22' }]}>
            <Ionicons name="checkmark-circle" size={72} color={groupColor} />
          </View>
          <Text style={styles.doneTitle}>Session complete!</Text>
          <Text style={styles.doneSub}>
            You went through all {cards.length} flashcard{cards.length !== 1 ? 's' : ''} in{' '}
            <Text style={{ fontWeight: '700', color: groupColor }}>{group.name}</Text>
          </Text>
          <TouchableOpacity style={[styles.bigBtn, { backgroundColor: groupColor }]} onPress={handleRestart}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.bigBtnText}>Restart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => router.back()}>
            <Text style={[styles.outlineBtnText, { color: groupColor }]}>Back to group</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── READY screen ──
  if (phase === 'ready') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: '#F8F7FF' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={groupColor} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto-play</Text>
        </View>
        <View style={styles.readyContainer}>
          <View style={[styles.readyIcon, { backgroundColor: groupColor + '22' }]}>
            <Ionicons name="play-circle" size={80} color={groupColor} />
          </View>
          <Text style={styles.readyTitle}>{group.name}</Text>
          <Text style={styles.readySub}>
            {cards.length} flashcard{cards.length !== 1 ? 's' : ''} · audio auto-play
          </Text>
          <Text style={styles.readyDesc}>
            Each card will play the question audio, then all responses. The correct answer is revealed automatically.
          </Text>
          {cards.length === 0 ? (
            <View style={styles.noCards}>
              <Ionicons name="alert-circle-outline" size={32} color="#B4B2A9" />
              <Text style={styles.noCardsText}>No complete flashcards in this group yet.</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: groupColor }]}
              onPress={handleStart}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.bigBtnText}>Start session</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── PLAYBACK screen ──
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#F8F7FF' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={async () => { await stopSound(); clearTimer(); router.back(); }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={groupColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <Text style={styles.headerCount}>{cardIndex + 1} / {cards.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: groupColor,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Animated.View
        style={[styles.content, { transform: [{ translateY: cardAnim }] }]}
      >
        {/* Phase badge */}
        <View style={[styles.phaseBadge, { backgroundColor: groupColor + '22' }]}>
          <View style={[styles.phaseDot, { backgroundColor: phase === 'reveal' ? '#1D9E75' : groupColor }]} />
          <Text style={[styles.phaseText, { color: phase === 'reveal' ? '#1D9E75' : groupColor }]}>
            {phase === 'question' && 'Playing question…'}
            {phase === 'pause' && 'Get ready…'}
            {phase === 'responses' && `Response ${responseIndex + 1} of ${currentCard?.responses.length ?? 0}`}
            {phase === 'reveal' && '✓ Correct answer revealed'}
            {phase === 'next' && 'Next card…'}
          </Text>
        </View>

        {/* Card number */}
        <Text style={styles.cardNumber}>Card #{cardIndex + 1}</Text>

        {/* Question status */}
        <View style={[styles.questionBlock, { borderColor: groupColor + '44' }]}>
          <View style={styles.questionRow}>
            <View style={[styles.qIcon, { backgroundColor: groupColor }]}>
              <Ionicons name="help" size={18} color="#fff" />
            </View>
            <Text style={styles.questionLabel}>Question</Text>
            {phase === 'question' && (
              <View style={styles.playingIndicator}>
                {[0, 1, 2].map(i => (
                  <AudioBar key={i} delay={i * 150} color={groupColor} />
                ))}
              </View>
            )}
            {phase !== 'question' && (
              <Ionicons name="checkmark-circle" size={16} color="#1D9E75" />
            )}
          </View>
        </View>

        {/* Responses */}
        <View style={styles.responsesList}>
          {currentCard?.responses.map((r: Response, i: number) => {
            const isPlaying = phase === 'responses' && responseIndex === i;
            const isRevealed = revealedResponses.includes(r.id?.toString()!);
            const wasPlayed = phase === 'responses'
              ? i < responseIndex
              : (phase === 'reveal' || phase === 'next');

            return (
              <View
                key={r.id}
                style={[
                  styles.responseItem,
                  isPlaying && { borderColor: groupColor, borderWidth: 2 },
                  isRevealed && styles.responseCorrect,
                ]}
              >
                <View style={[
                  styles.responseIndex,
                  { backgroundColor: isRevealed ? '#1D9E75' : isPlaying ? groupColor : '#E5E3FF' },
                ]}>
                  {isRevealed
                    ? <Ionicons name="checkmark" size={14} color="#fff" />
                    : <Text style={[styles.responseIndexText, { color: isPlaying ? '#fff' : groupColor }]}>
                        {i + 1}
                      </Text>
                  }
                </View>
                <Text style={[
                  styles.responseText,
                  isRevealed && { color: '#1D9E75', fontWeight: '600' },
                  !wasPlayed && !isPlaying && { color: '#B4B2A9' },
                ]}>
                  {isRevealed
                    ? 'Correct answer'
                    : isPlaying
                    ? 'Playing…'
                    : wasPlayed
                    ? 'Response ' + (i + 1)
                    : '—'}
                </Text>
                {isPlaying && (
                  <View style={styles.playingIndicator}>
                    {[0, 1, 2].map(j => (
                      <AudioBar key={j} delay={j * 150} color={groupColor} />
                    ))}
                  </View>
                )}
                {isRevealed && (
                  <Ionicons name="star" size={14} color="#1D9E75" />
                )}
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={handleRestart}>
          <Ionicons name="refresh" size={22} color="#888780" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playPauseBtn, { backgroundColor: groupColor }]}
          onPress={handlePause}
        >
          <Ionicons name={isPaused ? 'play' : 'pause'} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn} onPress={handleSkip}>
          <Ionicons name="play-skip-forward" size={22} color="#888780" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Animated audio bar ────────────────────────────────────────────────────────
function AudioBar({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true, delay }),
        Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 3,
        height: 14,
        borderRadius: 2,
        backgroundColor: color,
        marginHorizontal: 1,
        opacity: anim,
        transform: [{ scaleY: anim }],
      }}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  headerCount: { fontSize: 13, color: '#888780', fontWeight: '500' },

  progressTrack: { height: 4, backgroundColor: '#E5E3E0', marginHorizontal: 16, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },

  content: { flex: 1, padding: 20, gap: 16 },

  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phaseDot: { width: 7, height: 7, borderRadius: 4 },
  phaseText: { fontSize: 13, fontWeight: '600' },

  cardNumber: { fontSize: 28, fontWeight: '800', color: '#1a1a2e' },

  questionBlock: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  questionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  playingIndicator: { flexDirection: 'row', alignItems: 'center' },

  responsesList: { gap: 8 },
  responseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F0EFEB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  responseCorrect: {
    backgroundColor: '#F0FBF6',
    borderColor: '#1D9E75',
  },
  responseIndex: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  responseIndexText: { fontSize: 12, fontWeight: '700' },
  responseText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a2e' },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
    paddingTop: 12,
    gap: 24,
  },
  controlBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F0EFEB',
    justifyContent: 'center', alignItems: 'center',
  },
  playPauseBtn: {
    width: 68, height: 68, borderRadius: 34,
    justifyContent: 'center', alignItems: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // Ready screen
  readyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  readyIcon: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  readyTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a2e' },
  readySub: { fontSize: 15, color: '#888780' },
  readyDesc: { fontSize: 14, color: '#888780', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  noCards: { alignItems: 'center', gap: 8, marginTop: 8 },
  noCardsText: { fontSize: 14, color: '#B4B2A9', textAlign: 'center' },

  // Done screen
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  doneIcon: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  doneTitle: { fontSize: 26, fontWeight: '800', color: '#1a1a2e' },
  doneSub: { fontSize: 15, color: '#888780', textAlign: 'center' },

  bigBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 28, marginTop: 8,
    shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  bigBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  outlineBtn: { paddingVertical: 10, paddingHorizontal: 24 },
  outlineBtnText: { fontSize: 15, fontWeight: '600' },
});
