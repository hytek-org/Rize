import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, useColorScheme, Image, Animated, Dimensions, Modal, TextInput, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams } from 'expo-router';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import parseHTMLContent from '@/utils/parseHtml';
import Parser from 'react-native-rss-parser';
import { usePodcasts } from '@/contexts/PodcastContext';

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
    playOfflineAudio, // Add this
    togglePlayPause,
    skipForward,
    skipBackward,
    stopAndUnloadCurrentSound,
    handleSliderChange,
    currentId,
    shouldPersist,
    setShouldPersist,
  } = useAudioPlayer();

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { playlists, createPlaylist, addToPlaylist, downloadEpisode, isDownloaded, getDownloadPath, downloadProgress, getDownloadProgress } = usePodcasts();
  const [downloadStatus, setDownloadStatus] = useState<'none' | 'downloading' | 'downloaded'>('none');

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

  useEffect(() => {
    // Check download status on mount
    if (id && isDownloaded(id as string)) {
      setDownloadStatus('downloaded');
    }
  }, [id]);

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

  const handleDownload = async () => {
    if (!id || !url) return;

    try {
      setDownloadStatus('downloading');
      await downloadEpisode({
        id: id as string,
        title: episodeDetails?.title || title as string,
        audioUrl: url,
        imageUrl: imageUrl as string,
        feedUrl: feedUrl as string,
      });
      setDownloadStatus('downloaded');
      Alert.alert('Success', 'Episode downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('none');
      Alert.alert('Download Failed', 'Please try again.');
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!id || !url || !title) return;

    try {
      await addToPlaylist(playlistId, {
        id: id as string,
        title: episodeDetails?.title || title as string,
        audioUrl: url,
        imageUrl: imageUrl as string,
        feedUrl: feedUrl as string,
      });

      setShowPlaylistModal(false);
      Alert.alert(
        'Success',
        'Episode added to playlist',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Add to playlist error:', error);
      Alert.alert(
        'Error',
        'Failed to add episode to playlist',
        [{ text: 'OK' }]
      );
    }
  };

  const renderDownloadButton = () => {
    switch (downloadStatus) {
      case 'downloading':
        return (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#fff" />
            <Text className="text-white ml-2">
              {Math.round(getDownloadProgress(id as string) * 100)}%
            </Text>
          </View>
        );
      case 'downloaded':
        return <Text className="text-white">Downloaded</Text>;
      default:
        return <Text className="text-white">Download</Text>;
    }
  };

  const handlePlayAudio = async () => {
    const episodeId = Array.isArray(id) ? id[0] : id;
    if (!episodeId) return;

    try {
      const localPath = getDownloadPath(episodeId);
      
      // If already playing this episode, just toggle play/pause
      if (currentId === episodeId) {
        await togglePlayPause();
        return;
      }

      // Otherwise start playing the episode
      if (localPath) {
        await playOfflineAudio(localPath, episodeId, {
          title: episodeDetails?.title || title as string,
          artUrl: imageUrl as string,
          feedUrl: feedUrl as string,
        });
      } else {
        await playAudio(
          url,
          episodeId,
          imageUrl as string,
          episodeDetails?.title || title as string,
          feedUrl as string
        );
      }
    } catch (error) {
      console.error('Error handling playback:', error);
    }
  };

  // Update the play button render logic
  const renderPlayButton = () => {
    if (loading) {
      return <ActivityIndicator color="#fff" />;
    }

    const isCurrentEpisode = currentId === (Array.isArray(id) ? id[0] : id);
    const showPauseIcon = isCurrentEpisode && isPlaying;

    return (
      <IconSymbol 
        size={40}
        color="white"
        name={showPauseIcon ? 'pause' : 'play-arrow'}
      />
    );
  };

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
              onPress={handlePlayAudio}
              disabled={loading}
              className={`p-6 rounded-full ${
                loading 
                  ? 'bg-zinc-400' 
                  : 'bg-green-500'
              }`}
            >
              {renderPlayButton()}
            </Pressable>

            <Pressable 
              onPress={skipForward} 
              className="p-3 bg-zinc-200 dark:bg-zinc-800 rounded-full"
            >
              <IconSymbol size={32} name="forward-30" color={colorScheme === 'dark' ? '#fff' : '#000'}/>
            </Pressable>
          </View>

          <View className="flex-row justify-around mt-4 mb-8">
            {isDownloaded(id as string) ? (
              <Text className="text-green-500">Downloaded</Text>
            ) : (
              <Pressable
                onPress={handleDownload}
                disabled={downloadStatus === 'downloading'}
                className={`bg-blue-500 px-4 py-2 rounded-full ${
                  downloadStatus === 'downloading' ? 'opacity-75' : ''
                }`}
              >
                {renderDownloadButton()}
              </Pressable>
            )}

            <Pressable
              onPress={() => setShowPlaylistModal(true)}
              className="bg-purple-500 px-4 py-2 rounded-full"
            >
              <Text className="text-white">Add to Playlist</Text>
            </Pressable>
          </View>

          <Modal
            visible={showPlaylistModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPlaylistModal(false)}
          >
            <View className="flex-1 justify-end">
              <View className="bg-white dark:bg-zinc-800 rounded-t-3xl p-6">
                <Text className="text-xl font-bold mb-4 dark:text-white">
                  Add to Playlist
                </Text>
                
                <View className="flex-row mb-4">
                  <TextInput
                    className="flex-1 border p-2 rounded-l-lg dark:text-white"
                    placeholder="New Playlist Name"
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                  />
                  <Pressable
                    className="bg-green-500 p-2 rounded-r-lg"
                    onPress={async () => {
                      if (newPlaylistName.trim()) {
                        await createPlaylist(newPlaylistName);
                        setNewPlaylistName('');
                      }
                    }}
                  >
                    <Text className="text-white">Create</Text>
                  </Pressable>
                </View>

                <ScrollView className="max-h-80">
                  {playlists.map(playlist => (
                    <Pressable
                      key={playlist.id}
                      className="p-4 border-b dark:border-zinc-700"
                      onPress={() => handleAddToPlaylist(playlist.id)}
                    >
                      <Text className="dark:text-white">{playlist.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Pressable
                  className="mt-4 p-4 bg-zinc-200 dark:bg-zinc-700 rounded-lg"
                  onPress={() => setShowPlaylistModal(false)}
                >
                  <Text className="text-center dark:text-white">Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

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
