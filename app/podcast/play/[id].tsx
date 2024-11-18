import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PlayEpisode() {
  const { audioUrl, title } = useLocalSearchParams();
  const url = audioUrl as string;
  const colorScheme = useColorScheme();
  

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
  // Define slider colors based on color scheme
  const sliderStyles = {
    minimumTrackTintColor: colorScheme === 'dark' ? '#d9ffdc' : '#0aaf1d', // Green in dark mode, blue in light mode
    maximumTrackTintColor: colorScheme === 'dark' ? '#e0e0e0' : '#101010', // Darker gray in dark mode, light gray in light mode
    thumbTintColor: colorScheme === 'dark' ? '#d9ffdc' : '#0aaf1d', // Light green in dark mode, green in light mode
  };
  return (
    <View className="flex-1 justify-center   p-4 ">
      {/* Episode Title */}
      <ThemedText type="subtitle" className='text-center' >
        {title}
      </ThemedText>
      {/* Progress Slider */}
      <View className="mt-4">
        <Slider
          style={styles.slider} // Keep native styles for the slider
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onSlidingComplete={(value) => handleSliderChange(value)}
          minimumTrackTintColor={sliderStyles.minimumTrackTintColor}
          maximumTrackTintColor={sliderStyles.maximumTrackTintColor}
          thumbTintColor={sliderStyles.thumbTintColor}
        />
      </View>

      {/* Time Display */}
      <View className="mt-2">
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">
          {formatTime(position)} / {formatTime(duration)}
        </Text>
      </View>

      {/* Playback Controls */}
      <View className="flex flex-row items-center justify-around mt-4 space-x-6">
        {/* Skip Backward */}
        <Pressable onPress={skipBackward} className="p-2 bg-zinc-600 rounded-full ">
          <IconSymbol size={28} name="replay-30" color={'white'}/>
        </Pressable>

        {/* Play/Pause Button */}
        <Pressable
          onPress={() => {
            if (!isPlaying && url !== currentUrl) {
              playAudio(url);
            } else {
              togglePlayPause();
            }
          }}
          disabled={loading}
          className={`p-3 rounded-full ${loading ? 'bg-zinc-500 opacity-50 ' : 'bg-white dark:bg-zinc-700 '
            }`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <IconSymbol
              size={28} color={colorScheme === "dark" ? 'white':'black'}
              name={isPlaying && url === currentUrl ? 'pause' : 'play-arrow'}
             
            />
          )}
        </Pressable>

        {/* Skip Forward */}
        <Pressable onPress={skipForward} className="p-2 bg-zinc-600 rounded-full  dark:text-zinc-300">
          <IconSymbol size={28} name="forward-30" color={'white'}/>
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

    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
});
