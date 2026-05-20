import * as FileSystem from 'expo-file-system';
import { getDatabase } from './instance';
import { Task } from './type';

export async function getAllTasks(): Promise<Task[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<Task>(
    'SELECT * FROM tasks ORDER BY created_at DESC'
  );
  return rows.map(row => ({ ...row, completed: Boolean(row.completed) }));
}

export async function getTaskById(id: number): Promise<Task | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<Task>(
    'SELECT * FROM tasks WHERE id = ?',
    [id]
  );
  if (!row) return null;
  return { ...row, completed: Boolean(row.completed) };
}

export async function createTask(
  title: string,
  audioUri?: string,
  audioDuration?: number
): Promise<Task> {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO tasks (title, completed, audio_uri, audio_duration)
     VALUES (?, 0, ?, ?)`,
    [title, audioUri ?? null, audioDuration ?? null]
  );
  const task = await getTaskById(result.lastInsertRowId);
  return task!;
}

export async function updateTaskTitle(id: number, title: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE tasks SET title = ?, updated_at = datetime('now') WHERE id = ?`,
    [title, id]
  );
}

export async function toggleTaskComplete(id: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE tasks SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END,
     updated_at = datetime('now') WHERE id = ?`,
    [id]
  );
}

export async function deleteTask(id: number): Promise<void> {
  const database = await getDatabase();
  // Get task first to delete audio file if exists
  const task = await getTaskById(id);
  if (task?.audio_uri) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(task.audio_uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(task.audio_uri);
      }
    } catch {
      // File might not exist, ignore
    }
  }
  await database.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

export async function getTaskStats(): Promise<{
  total: number;
  completed: number;
  withAudio: number;
}> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    total: number;
    completed: number;
    with_audio: number;
  }>(
    `SELECT
      COUNT(*) as total,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN audio_uri IS NOT NULL THEN 1 ELSE 0 END) as with_audio
     FROM tasks`
  );
  return {
    total: row?.total ?? 0,
    completed: row?.completed ?? 0,
    withAudio: row?.with_audio ?? 0,
  };
}
