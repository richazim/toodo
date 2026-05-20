import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../theme/theme';

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
  color?: string;
  height?: number;
}

export function Waveform({
  isActive,
  barCount = 28,
  color = Colors.accent,
  height = 40,
}: WaveformProps) {
  const animations = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    if (!isActive) {
      animations.forEach(anim => {
        Animated.spring(anim, {
          toValue: 0.15,
          useNativeDriver: true,
        }).start();
      });
      return;
    }

    const animate = (index: number) => {
      const delay = index * 40;
      const duration = 300 + Math.random() * 400;
      const toValue = 0.2 + Math.random() * 0.8;

      Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animations[index], {
              toValue,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(animations[index], {
              toValue: 0.15 + Math.random() * 0.2,
              duration,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };

    animations.forEach((_, i) => animate(i));

    return () => {
      animations.forEach(anim => anim.stopAnimation());
    };
  }, [isActive]);

  return (
    <View style={[styles.container, { height }]}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              transform: [
                {
                  scaleY: anim,
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
    transformOrigin: 'center',
  },
});
