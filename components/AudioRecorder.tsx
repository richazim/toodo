import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  uri: string | null;
  onRecorded: (uri: string) => void;
  label?: string;
}

type State = 'idle' | 'recording' | 'playing';

export default function AudioRecorder({ uri, onRecorded, label = 'audio' }: Props) {
  const [state, setState] = useState<State>('idle');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Please allow microphone access to record audio.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setState('recording');
    } catch (e) {
      Alert.alert('Error', 'Could not start recording.');
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const fileUri = recordingRef.current.getURI();
      recordingRef.current = null;
      setState('idle');
      if (fileUri) onRecorded(fileUri);
    } catch (e) {
      Alert.alert('Error', 'Could not save recording.');
      setState('idle');
    }
  }

  async function playAudio() {
    if (!uri) return;
    try {
      setState('playing');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setState('idle');
        }
      });
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Error', 'Could not play audio.');
      setState('idle');
    }
  }

  async function stopPlayback() {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setState('idle');
  }

  const hasRecording = !!uri;

  return (
    <View style={styles.container}>
      {/* Record button */}
      <TouchableOpacity
        style={[styles.btn, state === 'recording' && styles.btnRecording]}
        onPress={state === 'recording' ? stopRecording : startRecording}
        disabled={state === 'playing'}
      >
        {state === 'recording' ? (
          <>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.btnText}>Stop</Text>
          </>
        ) : (
          <>
            <Ionicons name="mic" size={18} color={state === 'playing' ? '#aaa' : '#fff'} />
            <Text style={[styles.btnText, state === 'playing' && styles.disabledText]}>
              {hasRecording ? 'Re-record' : 'Record'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Play button — only if there's a recording */}
      {hasRecording && (
        <TouchableOpacity
          style={[styles.btn, styles.btnPlay, state === 'playing' && styles.btnPlaying]}
          onPress={state === 'playing' ? stopPlayback : playAudio}
          disabled={state === 'recording'}
        >
          <Ionicons
            name={state === 'playing' ? 'stop' : 'play'}
            size={18}
            color="#fff"
          />
          <Text style={styles.btnText}>{state === 'playing' ? 'Stop' : 'Play'}</Text>
        </TouchableOpacity>
      )}

      {/* Status indicator */}
      <View style={[styles.dot, hasRecording ? styles.dotDone : styles.dotEmpty]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnRecording: {
    backgroundColor: '#E24B4A',
  },
  btnPlay: {
    backgroundColor: '#1D9E75',
  },
  btnPlaying: {
    backgroundColor: '#0F6E56',
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  disabledText: {
    color: '#ccc',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  dotDone: {
    backgroundColor: '#1D9E75',
  },
  dotEmpty: {
    backgroundColor: '#D3D1C7',
  },
});
