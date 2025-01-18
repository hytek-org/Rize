import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useColorScheme, Image, Animated, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import parseHTMLContent from '@/utils/parseHtml';
import Parser from 'react-native-rss-parser';
interface EpisodeDetails {
  title: string;
  description: string;
  pubDate?: string;
}

export default function PlayEpisode() {
  const { audioUrl, title, imageUrl, feedUrl, id } = useLocalSearchParams();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const scrollY = new Animated.Value(0);
  const [episodeDetails, setEpisodeDetails] = useState<EpisodeDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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
    currentId,
    shouldPersist,
    setShouldPersist,
  } = useAudioPlayer();

  // Add function to fetch episode details
  const fetchEpisodeDetails = async () => {
    if (!feedUrl) return;
    setLoadingDetails(true);

    try {
      const response = await fetch(feedUrl as string, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch RSS');
      
      const rssText = await response.text();
      const feed = await Parser.parse(rssText);
      
      // Find matching episode by audio URL
      const episode = feed.items.find(
        (item: any) => item.enclosures?.[0]?.url === audioUrl
      );

      if (episode) {
        setEpisodeDetails({
          title: episode.title,
          description: episode.description,
          pubDate: new Date(episode.published).toLocaleDateString(),
        });
      }
    } catch (err) {
      console.error('Error fetching episode details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchEpisodeDetails();
    setShouldPersist(true); // Enable persistence when entering player

    return () => {
      // Don't stop playback on unmount
      setShouldPersist(true);
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

  // Calculate parallax effect
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-screenHeight, 0, screenHeight],
    outputRange: [screenHeight/2, 0, -screenHeight/2],
    extrapolate: 'clamp'
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-screenHeight, 0, screenHeight],
    outputRange: [2, 1, 1],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, screenHeight * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      {/* Background Image with Parallax */}
      <Animated.View 
        className="absolute top-0 left-0 right-0"
        style={[
          { height: screenHeight * 0.7 },
          {
            transform: [
              { translateY: imageTranslateY },
              { scale: imageScale }
            ]
          }
        ]}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl as string }}
            className="absolute w-full h-full"
            resizeMode="cover"
            blurRadius={10}
          />
        )}
        <View className="absolute inset-0 bg-black/60" />
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {/* Top Spacing for Content */}
        <View style={{ height: screenHeight * 0.4 }}>
          {imageUrl && (
            <Image
              source={{ uri: imageUrl as string }}
              style={{
                width: screenWidth * 0.6,
                height: screenWidth * 0.6,
                alignSelf: 'center',
                marginTop: screenHeight * 0.1,
              }}
              className="rounded-2xl shadow-2xl"
              resizeMode="cover"
            />
          )}
        </View>

        {/* Content Container */}
        <View className="bg-zinc-100 dark:bg-zinc-900 min-h-screen rounded-t-[32px] -mt-10 px-6 pt-8">
          {/* Title and Date Section */}
          <ThemedText type="subtitle" className="text-2xl font-bold text-center mb-2">
            {episodeDetails?.title || title}
          </ThemedText>
          {episodeDetails?.pubDate && (
            <Text className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              {episodeDetails.pubDate}
            </Text>
          )}

          {/* Progress Section */}
          <View className="mb-6 mt-4">
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={progress}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor={sliderStyles.minimumTrackTintColor}
              maximumTrackTintColor={sliderStyles.maximumTrackTintColor}
              thumbTintColor={sliderStyles.thumbTintColor}
            />
            
            {/* Time Display */}
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatTime(position)}
              </Text>
              <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Controls Section with Glass Effect */}
          <View className="flex-row items-center justify-around mb-8 p-4 bg-white/10 backdrop-blur-lg rounded-2xl">
            <Pressable 
              onPress={skipBackward} 
              className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-full"
            >
              <IconSymbol size={32} name="replay-30" color={colorScheme === 'dark' ? '#fff' : '#000'}/>
            </Pressable>

            <Pressable
              onPress={() => {
                if (!isPlaying && url !== currentUrl) {
                  playAudio(
                    url,
                    id as string,
                    imageUrl as string,
                    episodeDetails?.title || title as string,
                    feedUrl as string
                  );
                } else {
                  togglePlayPause();
                }
              }}
              disabled={loading}
              className={`p-6 rounded-full ${
                loading 
                  ? 'bg-zinc-400' 
                  : 'bg-green-500'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <IconSymbol
                  size={40}
                  color="white"
                  name={isPlaying && url === currentUrl ? 'pause' : 'play-arrow'}
                />
              )}
            </Pressable>

            <Pressable 
              onPress={skipForward} 
              className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-full"
            >
              <IconSymbol size={32} name="forward-30" color={colorScheme === 'dark' ? '#fff' : '#000'}/>
            </Pressable>
          </View>

          {/* Description Section */}
          {loadingDetails ? (
            <View className="mt-4 pb-8 items-center">
              <ActivityIndicator color="#22c55e" />
            </View>
          ) : episodeDetails?.description ? (
            <View className="mt-4 pb-32">
              <Text className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
                Episode Details
              </Text>
              <Text className="text-base text-zinc-600 dark:text-zinc-400 leading-6">
                {parseHTMLContent(episodeDetails.description)}
              </Text>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});
