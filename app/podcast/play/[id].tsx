import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider'; // Import Slider

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PlayEpisode() {
  const { audioUrl, title } = useLocalSearchParams();
  const url = audioUrl as string;

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState({
    positionMillis: 0,
    durationMillis: 0,
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    return () => {
      stopAndUnloadCurrentSound();
    };
  }, []);

  const stopAndUnloadCurrentSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const playAudio = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await stopAndUnloadCurrentSound();

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setIsPlaying(true);
      setLoading(false);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPlaybackStatus({
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis || 0,
          });
          if (status.didJustFinish) stopAndUnloadCurrentSound();
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setLoading(false);
    }
  };

  const skipForward = async () => {
    if (sound) {
      const newPosition = Math.min(
        playbackStatus.positionMillis + 30000,
        playbackStatus.durationMillis
      );
      await sound.setPositionAsync(newPosition);
    }
  };

  const skipBackward = async () => {
    if (sound) {
      const newPosition = Math.max(playbackStatus.positionMillis - 30000, 0);
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleSliderChange = async (value) => {
    if (sound) {
      const newPosition = playbackStatus.durationMillis * value;
      await sound.setPositionAsync(newPosition);
    }
  };

  // Function to format time as mm:ss
  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>{title}</ThemedText>

      <Pressable onPress={playAudio} disabled={loading} style={styles.playButton}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.playText}>{isPlaying ? 'Playing...' : 'Play'}</Text>
        )}
      </Pressable>

      {sound && (
        <>
          <View style={styles.progressBarContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={playbackStatus.positionMillis / playbackStatus.durationMillis}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor="#3b82f6"
            />
          </View>

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(playbackStatus.positionMillis)} / {formatTime(playbackStatus.durationMillis)}
            </Text>
          </View>

          <View style={styles.controlsContainer}>
            <Pressable onPress={skipBackward} style={styles.button}>
              <IconSymbol size={28} name="replay-30" />
            </Pressable>

            <Pressable onPress={togglePlayPause} style={styles.button}>
              <IconSymbol size={28} name={isPlaying ? 'pause' : 'play-arrow'} />
            </Pressable>

            <Pressable onPress={skipForward} style={styles.button}>
              <IconSymbol size={28} name="forward-30" />
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  playText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '90%',
    marginVertical: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#888',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
});
