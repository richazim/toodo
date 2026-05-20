import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '@/hooks/useAudio';
import { Colors, Spacing, Radius, FontSize } from '../theme/theme';

interface AudioPlayerProps {
  uri: string;
  duration: number | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function AudioPlayer({ uri, duration }: AudioPlayerProps) {
  const { playbackState, position, totalDuration, play, pause, resume, stop } =
    useAudioPlayer(uri);

  const displayDuration = totalDuration || duration || 0;
  const progress = displayDuration > 0 ? position / displayDuration : 0;

  const handlePress = async () => {
    if (playbackState === 'idle' || playbackState === 'finished') {
      await play();
    } else if (playbackState === 'playing') {
      await pause();
    } else if (playbackState === 'paused') {
      await resume();
    }
  };

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        style={styles.playButton}
        activeOpacity={0.75}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={14}
            color={Colors.accent}
          />
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {isPlaying || playbackState === 'paused'
              ? formatTime(position)
              : formatTime(displayDuration)}
          </Text>
          <Text style={styles.label}>voice note</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accentDim,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  playButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 4,
  },
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSize.xs,
    color: Colors.accent,
    fontVariant: ['tabular-nums'],
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
