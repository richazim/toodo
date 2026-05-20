import AudioRecorder from '@/components/AudioRecorder';
import { useGroups } from '@/context/GroupsContext';
import { dbDeleteResponse, dbInsertResponse, dbToggleCorrectResponse, dbUpdateFlashcardQuestion, dbUpdateResponseAudio } from '@/database/db';
import { FlashcardWithResponses, Response } from '@/types/data2';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditorScreen() {
  const { groupId: groupIdStr, cardId: cardIdStr } = useLocalSearchParams<{ groupId: string; cardId: string }>();
  const groupId = Number(groupIdStr!);
  const cardId = Number(cardIdStr!);

  const { groups, addEmptyFlashcard, updateFlashcard } = useGroups();
  const router = useRouter();

  const group = groups.find(g => g.id === groupId);
  const existingCard = cardId ? group?.flashcards.find(c => c.id === cardId) : null;

  const [questionUri, setQuestionUri] = useState<string | null>(existingCard?.question_audio_uri ?? null);
  const [responses, setResponses] = useState<Response[]>(
    existingCard?.responses ?? []
  );

  const isEditing = !!existingCard;

  function addResponse(cardId: number) {
    const newResp: Response = {
      flashcard_id: cardId,
      audio_uri: '',
      is_correct: 0,
    };
    const id = dbInsertResponse(cardId, '', false, responses.length);
    const newRespWithId = { ...newResp, id };
    setResponses(prev => [...prev, newRespWithId]);
  }

  function updateResponseAudio(id: number, uri: string) {
    setResponses(prev => prev.map(r => r.id === id ? { ...r, audio_uri: uri } : r));
  }

  function toggleCorrect(id: number) {
    dbToggleCorrectResponse(id);
    setResponses(prev => prev.map(r => r.id === id ? { ...r, is_correct: r.is_correct === 1 ? 0 : 1 } : r));
  }


  function removeResponse(id: number) {
    Alert.alert('Remove response', 'Delete this response?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        dbDeleteResponse(id);
        setResponses(prev => prev.filter(r => r.id !== id));
      }},
    ]);
  }

  function validate(): string | null {
    if (!questionUri) return 'Please record the question audio.';
    if (responses.length === 0) return 'Add at least one response.';
    const incomplete = responses.some(r => !r.audio_uri);
    if (incomplete) return 'All responses must have audio recorded.';
    const hasCorrect = responses.some(r => r.is_correct);
    if (!hasCorrect) return 'Mark at least one response as correct.';
    return null;
  }

  function handleValidation() {
    const err = validate();
    if (err) { Alert.alert('Incomplete', err); return; }

    const card: FlashcardWithResponses = {
      group_id: (groupId),
      question_audio_uri: questionUri!,
      responses,
      createdAt: existingCard?.createdAt ?? Date.now(),
    };

    // if (isEditing) {
    //   updateFlashcard(groupId, card);
    // } else {
    //   addEmptyFlashcard(groupId);
    //   updateFlashcard(groupId, card);
    // }
    // updateFlashcard(groupId, card)
    router.back();
  }

  if (!group) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit flashcard' : 'New flashcard'}
        </Text>
        <TouchableOpacity onPress={handleValidation} style={[styles.saveBtn, { backgroundColor: group.color }]}>
          <Text style={styles.saveBtnText}>Validate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Question section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#EDE9FF' }]}>
              <Ionicons name="help-circle" size={16} color="#6C63FF" />
            </View>
            <Text style={styles.sectionTitle}>Question</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.instruction}>Record the question audio</Text>
            <AudioRecorder
              uri={questionUri}
              onRecorded={(uri: string) => {
                setQuestionUri(uri)
                console.log(uri)
                dbUpdateFlashcardQuestion(cardId , uri);
              }}
              label="question"
            />
            {questionUri ? (
              <View style={styles.recordedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#1D9E75" />
                <Text style={styles.recordedText}>Question recorded</Text>
              </View>
            ) : (
              <Text style={styles.hint}>Tap Record to start</Text>
            )}
          </View>
        </View>

        {/* Responses section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#E6F9F3' }]}>
              <Ionicons name="list" size={16} color="#1D9E75" />
            </View>
            <Text style={styles.sectionTitle}>Responses</Text>
            <Text style={styles.sectionCount}>{responses.length}</Text>
          </View>

          {responses.length === 0 && (
            <View style={styles.emptyResponses}>
              <Ionicons name="mic-outline" size={40} color="#D3D1C7" />
              <Text style={styles.emptyText}>No responses yet</Text>
            </View>
          )}

          {responses && responses.map((resp, idx) => (
            <View key={idx} style={[styles.card, resp.is_correct === 1 && styles.cardCorrect]}>
              <View style={styles.responseHeader}>
                <Text style={styles.responseIndex}>Response {idx + 1}</Text>
                <TouchableOpacity onPress={() => removeResponse(resp.id!)}>
                  <Ionicons name="trash-outline" size={18} color="#E24B4A" />
                </TouchableOpacity>
              </View>

              <Text style={styles.instruction}>Record response audio</Text>
              <AudioRecorder
                uri={resp.audio_uri || null}
                onRecorded={uri => {
                  updateResponseAudio(resp.id!, uri);
                  dbUpdateResponseAudio(resp.id, uri);
                }}
                label={`response ${idx + 1}`}
              />

              {resp.audio_uri ? (
                <View style={styles.recordedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#1D9E75" />
                  <Text style={styles.recordedText}>Response recorded</Text>
                </View>
              ) : (
                <Text style={styles.hint}>Tap Record to start</Text>
              )}

              {/* Correct toggle */}
              <TouchableOpacity
                style={[styles.correctToggle, resp.is_correct === 1 && styles.correctToggleActive]}
                onPress={() => toggleCorrect(resp.id!)}
              >
                <Ionicons
                  name={resp.is_correct ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={18}
                  color={resp.is_correct ? '#fff' : '#888780'}
                />
                <Text style={[styles.correctToggleText, resp.is_correct === 1 && styles.correctToggleTextActive]}>
                  {resp.is_correct ? 'Correct answer' : 'Mark as correct'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addResponseBtn} onPress={() => addResponse(cardId)}>
            <Ionicons name="add-circle" size={20} color="#6C63FF" />
            <Text style={styles.addResponseText}>Add response</Text>
          </TouchableOpacity>
        </View>

        {/* Save button at bottom */}
        <TouchableOpacity
          style={[styles.bigSaveBtn, { backgroundColor: group.color }]}
          onPress={handleValidation}
        >
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.bigSaveBtnText}>Validate flashcard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E3FF',
    backgroundColor: '#fff',
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 20, paddingBottom: 40 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBadge: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', flex: 1 },
  sectionCount: {
    backgroundColor: '#E5E3FF',
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardCorrect: {
    borderColor: '#1D9E75',
  },
  instruction: { fontSize: 13, color: '#888780', fontWeight: '500' },
  hint: { fontSize: 12, color: '#B4B2A9', fontStyle: 'italic' },
  recordedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recordedText: { fontSize: 12, color: '#1D9E75', fontWeight: '500' },
  responseHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  responseIndex: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  correctToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E5E3FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  correctToggleActive: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  correctToggleText: { fontSize: 13, color: '#888780', fontWeight: '500' },
  correctToggleTextActive: { color: '#fff' },
  addResponseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E3FF',
    borderStyle: 'dashed',
  },
  addResponseText: { fontSize: 15, color: '#6C63FF', fontWeight: '500' },
  emptyResponses: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  emptyText: { fontSize: 14, color: '#B4B2A9' },
  bigSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  bigSaveBtnText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
