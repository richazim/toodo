import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { initDatabase } from './migration';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('audiotodo.db');
    await initDatabase(db);
  }
  return db;
}