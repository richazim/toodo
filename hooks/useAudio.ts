import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export type RecordingState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

export interface RecordingResult {
  uri: string;
  duration: number; // in seconds
}

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setState('requesting');
      setError(null);

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        setState('error');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      startTimeRef.current = Date.now();
      setDuration(0);
      setState('recording');

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setError(message);
      setState('error');
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    try {
      if (!recordingRef.current || state !== 'recording') return null;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setState('stopped');

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) {
        setError('No audio file produced');
        setState('error');
        return null;
      }

      // Move to permanent storage
      const fileName = `task_audio_${Date.now()}.m4a`;
      const destUri = `${FileSystem.documentDirectory}audio/${fileName}`;

      // Ensure directory exists
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}audio/`,
        { intermediates: true }
      );
      await FileSystem.moveAsync({ from: uri, to: destUri });

      return { uri: destUri, duration: finalDuration };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(message);
      setState('error');
      return null;
    }
  }, [state]);

  const cancelRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    setState('idle');
    setDuration(0);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setDuration(0);
    setError(null);
  }, []);

  return {
    state,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}

// ── Playback hook ──────────────────────────────────────────────────────────────

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'finished' | 'error';

export function useAudioPlayer(uri: string | null) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [position, setPosition] = useState(0);   // seconds
  const [totalDuration, setTotalDuration] = useState(0); // seconds
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(async () => {
    if (!uri) return;
    try {
      setPlaybackState('loading');

      // Unload previous
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPosition(Math.floor((status.positionMillis ?? 0) / 1000));
          setTotalDuration(Math.floor((status.durationMillis ?? 0) / 1000));
          if (status.didJustFinish) {
            setPlaybackState('finished');
            setPosition(0);
          } else if (status.isPlaying) {
            setPlaybackState('playing');
          }
        }
      );

      soundRef.current = sound;
    } catch (err) {
      setPlaybackState('error');
    }
  }, [uri]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setPlaybackState('paused');
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setPlaybackState('playing');
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaybackState('idle');
    setPosition(0);
  }, []);

  return { playbackState, position, totalDuration, play, pause, resume, stop };
}
