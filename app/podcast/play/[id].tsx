import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PlayEpisode() {
  const { audioUrl, title } = useLocalSearchParams();
  const url = audioUrl as string;

  const {
    isPlaying,
    loading,
    currentUrl,
    playbackStatus,
    playAudio,
    togglePlayPause,
    skipForward,
    skipBackward,
    stopAndUnloadCurrentSound,
    handleSliderChange,
  } = useAudioPlayer();
  useEffect(() => {
    return () => {
      stopAndUnloadCurrentSound();
    };
  }, []);

  const formatTime = (millis: number = 0) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const position = playbackStatus?.positionMillis || 0;
  const duration = playbackStatus?.durationMillis || 1; // Avoid division by 0
  const progress = position / duration;

  return (
    <View style={styles.container} >
      {/* Episode Title */}
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {/* Progress Slider */}
      <View style={styles.progressBarContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onSlidingComplete={(value) => handleSliderChange(value)}
          minimumTrackTintColor="#3b82f6"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#3b82f6"
        />
      </View>
      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>
      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        {/* Skip Backward */}
        <Pressable onPress={skipBackward} style={styles.button}>
          <IconSymbol size={28} name="replay-30" />
        </Pressable>
        <Pressable
          onPress={() => {
            if (!isPlaying && url !== currentUrl) {
              // If audio is not playing and the URL is different, call playAudio
              playAudio(url);
            } else {
              // Otherwise, toggle play/pause
              togglePlayPause();
            }
          }}
          disabled={loading}
          style={[styles.playButton, loading && styles.disabledButton]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <IconSymbol size={28} color={'white'} name={isPlaying && url === currentUrl ? 'pause' : 'play-arrow'} />
          )}
        </Pressable>


        {/* Skip Forward */}
        <Pressable onPress={skipForward} style={styles.button}>
          <IconSymbol size={28} name="forward-30" />
        </Pressable>
      </View>


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
    color: '#333',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  playText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
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
