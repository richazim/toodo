import { useGroups } from '@/context/GroupsContext';
import { Response } from '@/types/data2';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FlashcardsScreen() {
  const { groupId: groupIdStr } = useLocalSearchParams<{ groupId: string }>();
  const groupId = parseInt(groupIdStr!);
  const { groups, addEmptyFlashcard, deleteFlashcard } = useGroups();
  const router = useRouter();

  const group = groups.find(g => g.id === groupId);
  if (!group) return null;

  const completeCards = group.flashcards.filter(
    c => c.question_audio_uri && c.responses.length > 0 && c.responses.some(r => r.is_correct)
  );

  function confirmDelete(cardId: number) {
    Alert.alert('Delete flashcard', 'Remove this flashcard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFlashcard(group?.id!, cardId) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#F8F7FF' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        <View style={[styles.groupIcon, { backgroundColor: group.color }]}>
          <Ionicons name="albums" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{group.name}</Text>
          <Text style={styles.subtitle}>
            {group.flashcards.length} flashcard{group.flashcards.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Auto-play banner */}
      {group.flashcards.length > 0 && (
        <TouchableOpacity
          style={[styles.autoPlayBanner, { backgroundColor: group.color }]}
          onPress={() =>
            router.push({ pathname: '/flashcards/autoplay', params: { groupId: group.id } })
          }
          activeOpacity={0.85}
        >
          <View style={styles.autoPlayLeft}>
            <View style={styles.autoPlayIconWrap}>
              <Ionicons name="play-circle" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.autoPlayTitle}>Auto-play session</Text>
              <Text style={styles.autoPlaySub}>
                {completeCards.length} card{completeCards.length !== 1 ? 's' : ''} ready · question + responses
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      <FlatList
        data={group.flashcards}
        keyExtractor={c => c?.id?.toString()!}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={64} color="#D3D1C7" />
            <Text style={styles.emptyText}>No flashcards yet</Text>
            <Text style={styles.emptyHint}>Tap + to create your first card</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const correctCount = item.responses.filter((r: Response) => r.is_correct).length;
          
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/editor',
                  params: { groupId: group.id, cardId: item.id },
                })
              }
              onLongPress={() => confirmDelete(item.id!)}
              activeOpacity={0.7}
            >
              <View style={[styles.indexBadge, { backgroundColor: group.color }]}>
                <Text style={styles.indexText}>#{index + 1}</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.row}>
                  <Ionicons name="mic" size={14} color="#6C63FF" />
                  <Text style={styles.cardLabel}>
                    {item.question_audio_uri ? 'Question recorded' : 'No question yet'}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Ionicons name="list" size={14} color="#888780" />
                  <Text style={styles.cardMeta}>
                    {item.responses.length} response{item.responses.length !== 1 ? 's' : ''}
                    {correctCount > 0 ? ` · ${correctCount} correct` : ''}
                  </Text>
                </View>
              </View>

              {/* Delete button */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => confirmDelete(item.id!)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={16} color="#E24B4A" />
              </TouchableOpacity>

              <Ionicons name="chevron-forward" size={18} color="#B4B2A9" />
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: group.color }]}
        onPress={async () => {
          const cardId = await addEmptyFlashcard(group.id!);
          router.push({
            pathname: '/editor',
            params: { 
              groupId: group.id,
              cardId
             },
          });
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  groupIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  subtitle: { fontSize: 13, color: '#888780' },

  autoPlayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  autoPlayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  autoPlayIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  autoPlayTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  autoPlaySub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  indexBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  indexText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  cardContent: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a2e' },
  cardMeta: { fontSize: 12, color: '#888780' },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#B4B2A9' },
  emptyHint: { fontSize: 14, color: '#B4B2A9' },
  fab: {
    position: 'absolute',
    bottom: 32, right: 24,
    width: 60, height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    shadowOpacity: 0.35, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
