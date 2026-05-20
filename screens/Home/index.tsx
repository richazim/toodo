import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard } from './components/TaskCard';
import { RecordTaskModal } from './components/RecordTaskModal';
import { EditTaskModal } from './components/EditTaskModal';
import { StatsBar } from './components/StatsBar';
import { Colors, Spacing, Radius, FontSize } from './theme/theme';
import { 
  getAllTasks, 
  getTaskStats,
  toggleTaskComplete,
  createTask,
  deleteTask,
  updateTaskTitle,
} from '@/database/model';
import { Task } from '@/database/type';

type Filter = 'all' | 'active' | 'done';

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, withAudio: 0 });
  const fabAnim = React.useRef(new Animated.Value(0)).current;

  const loadTasks = useCallback(async () => {
    const [allTasks, taskStats] = await Promise.all([
      getAllTasks(),
      getTaskStats(),
    ]);
    setTasks(allTasks);
    setStats(taskStats);
  }, []);

  useEffect(() => {
    loadTasks();
    // Animate FAB in
    Animated.spring(fabAnim, {
      toValue: 1,
      delay: 400,
      useNativeDriver: true,
      damping: 14,
      stiffness: 200,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleAddTask = async (
    title: string,
    audioUri?: string,
    audioDuration?: number
  ) => {
    await createTask(title, audioUri, audioDuration);
    await loadTasks();
  };

  const handleToggle = async (id: number) => {
    await toggleTaskComplete(id);
    await loadTasks();
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    await loadTasks();
  };

  const handleEditSave = async (id: number, title: string) => {
    await updateTaskTitle(id, title);
    await loadTasks();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const fabScale = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>AudioTodo</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="mic" size={20} color={Colors.accent} />
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Stats */}
            <StatsBar
              total={stats.total}
              completed={stats.completed}
              withAudio={stats.withAudio}
            />

            {/* Filter tabs */}
            <View style={styles.filters}>
              {(['all', 'active', 'done'] as Filter[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterTab, filter === f && styles.filterTabActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === f && styles.filterTextActive,
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎙️</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </Text>
            <Text style={styles.emptyHint}>
              Tap the button below to add a voice or typed task
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={setEditingTask}
          />
        )}
      />

      {/* FAB */}
      <Animated.View
        style={[styles.fabContainer, { transform: [{ scale: fabScale }] }]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="mic" size={22} color={Colors.bg} />
          <Text style={styles.fabLabel}>New Task</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modals */}
      <RecordTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddTask}
      />
      <EditTaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleEditSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.accent,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.bg,
    letterSpacing: 0.3,
  },
});
