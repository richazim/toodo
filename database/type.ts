export interface Task {
  id: number;
  title: string;
  completed: boolean;
  audio_uri: string | null;
  audio_duration: number | null;
  created_at: string;
  updated_at: string;
}
