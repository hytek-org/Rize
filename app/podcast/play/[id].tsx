import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface RSSEpisode {
  title: string;
  audioUrl: string;
  description: string;
}

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
    // Configure audio mode
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

  const calculateProgress = () => {
    const { positionMillis, durationMillis } = playbackStatus;
    return durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;
  };

  return (
    <View style={styles.container} className='dark:bg-black'>
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
          <ProgressBar progress={calculateProgress()} />
          <View style={styles.controlsContainer}>
            <Button title="⏪ 30s" onPress={skipBackward} disabled={loading} />
            <Button title={isPlaying ? 'Pause' : 'Play'} onPress={togglePlayPause} disabled={loading} />
            <Button title="⏩ 30s" onPress={skipForward} disabled={loading} />
          </View>
        </>
      )}
    </View>
  );
}

const ProgressBar = ({ progress }: { progress: number }) => (
  <View style={styles.progressBarContainer}>
    <View style={[styles.progressBar, { width: `${progress}%` }]} />
  </View>
);

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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 10,
  },
  progressBarContainer: {
    width: '90%',
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 5,
  },
});
