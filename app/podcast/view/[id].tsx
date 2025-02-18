import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Dimensions } from 'react-native';
import Parser from 'react-native-rss-parser';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';
import * as FileSystem from 'expo-file-system';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { Skeleton } from '@/components/ui/Skeleton';

interface RSSEpisode {
  title: string;
  audioUrl: string;
  description: string;
  id: string;
  pubDate?: string;
}

// Keep only the needed utility functions
const getImageFilename = (url: string) => {
  return url.split('/').pop()?.split('?')[0] || 'default.jpg';
};

const getCachedImagePath = async (url: string) => {
  if (!url || !url.includes('storage.buzzsprout.com')) return url;

  // Ensure URL has query parameter for Buzzsprout
  const urlWithQuery = url.includes('?') ? url : `${url}?.jpg`;
  
  // Create a unique filename from the URL
  const filename = `${url.split('/').pop()?.split('?')[0]}_cached.jpg`;
  const filesystemUrl = `${FileSystem.cacheDirectory}podcasts/${filename}`;

  try {
    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}podcasts`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.cacheDirectory}podcasts`, { intermediates: true });
    }

    // Check if cached file exists and is valid
    const fileInfo = await FileSystem.getInfoAsync(filesystemUrl);
    if (!fileInfo.exists) {
      // Download with proper headers
      const downloadResult = await FileSystem.downloadAsync(urlWithQuery, filesystemUrl, {
        headers: {
          'Accept': 'image/jpeg,image/png,image/*',
          'User-Agent': 'Mozilla/5.0',
        }
      });
      
      if (downloadResult.status !== 200) {
        console.log('Failed to download image:', downloadResult.status);
        return null;
      }
      console.log('Image cached successfully at:', filesystemUrl);
    }

    return `file://${filesystemUrl}`;
  } catch (error) {
    console.error('Error caching image:', error);
    return null;
  }
};

export default function PodcastDetail() {
  const params = useLocalSearchParams();
  const { currentId, stopAndUnloadCurrentSound } = useAudioPlayer();
  const [episodes, setEpisodes] = useState<RSSEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [podcastImage, setPodcastImage] = useState<string | null>(null);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (params.url) {
      // Ensure url is string
      const feedUrl = Array.isArray(params.url) ? params.url[0] : params.url;
      fetchEpisodes(feedUrl);
    }
  }, [params.url]);

  const fetchEpisodes = async (url: string) => {
    if (!url) return;
    setLoading(true);

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch RSS');
      const rssText = await response.text();
      const feed = await Parser.parse(rssText);

      // Only get the main feed image
      const feedImageUrl = feed.image?.url;
      if (feedImageUrl) {
        const cachedPath = await getCachedImagePath(feedImageUrl);
        if (cachedPath) {
          setPodcastImage(cachedPath);
          console.log('Using cached image:', cachedPath);
        }
      }

      const rssEpisodes: RSSEpisode[] = feed.items
        .map((item: any, index) => ({
          title: item.title,
          description: item.description,
          audioUrl: item.enclosures?.[0]?.url || null,
          id: item.id || `episode-${index}`,
          pubDate: new Date(item.published).toLocaleDateString(),
        }))
        .filter((episode) => episode.audioUrl !== null);

      setEpisodes(rssEpisodes);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStopPlayback = async () => {
    // Only stop playback when explicitly requested
    await stopAndUnloadCurrentSound(true);
  };

  const EpisodeSkeleton = () => (
    <View className="mb-4 bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm">
      <View className="flex-row gap-4">
        <Skeleton width={80} height={80} className="rounded-lg" />
        <View className="flex-1 justify-center">
          <Skeleton height={20} className="mb-2" />
          <Skeleton height={16} width="40%" />
        </View>
      </View>
      <Skeleton height={32} className="mt-3" />
      <Skeleton height={40} className="mt-3 rounded-xl" />
    </View>
  );

  const HeaderSkeleton = () => (
    <View className="w-full">
      <Skeleton height={224} className="rounded-none" />
      <View className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-zinc-900/60 to-transparent" />
    </View>
  );

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      {/* Header Image Section */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        podcastImage && (
          <View className="w-full h-56 bg-zinc-200 dark:bg-zinc-800">
            <Image
              source={{ 
                uri: podcastImage,
                headers: {
                  'Accept': 'image/jpeg,image/png,image/*',
                  'User-Agent': 'Mozilla/5.0',
                }
              }}
              className="w-full h-full"
              resizeMode="contain"
              onError={(e) => {
                console.log('Error loading podcast image:', e.nativeEvent.error);
                setPodcastImage(null);
              }}
            />
            {/* Dark Overlay */}
            <View className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-zinc-900/60 to-transparent" />
          </View>
        )
      )}

      {/* Episodes List */}
      <View className="flex-1 -mt-5 rounded-t-3xl bg-zinc-100 dark:bg-zinc-900">
        <Text className="text-2xl px-5 pt-6 font-bold text-zinc-800 dark:text-zinc-200">
          Episodes
        </Text>

        {loading ? (
          <View className="px-4 pt-4">
            <EpisodeSkeleton />
            <EpisodeSkeleton />
            <EpisodeSkeleton />
            <EpisodeSkeleton />
          </View>
        ) : (
          <FlatList
          showsVerticalScrollIndicator={false}
            data={episodes}
            keyExtractor={(item) => item.id}
            className="px-4 pt-4"
            renderItem={({ item }) => (
              <View className="mb-4 bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm">
                <View className="flex-row gap-4">
                  {/* Episode Thumbnail */}
                  {podcastImage && (
                    <Image
                      source={{ uri: podcastImage }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  )}
                  {/* Episode Info */}
                  <View className="flex-1">
                    <Text 
                      className="text-base font-bold text-zinc-900 dark:text-zinc-100"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {item.pubDate && (
                      <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {item.pubDate}
                      </Text>
                    )}
                  </View>
                </View>

                <Text 
                  className="text-sm text-zinc-700 dark:text-zinc-400 mt-3"
                  numberOfLines={2}
                >
                  {parseHTMLContent(item.description)}
                </Text>
                
                {currentId !== item.id ? (
                  <Link
                    className="mt-3 bg-green-500 py-2.5 rounded-xl text-center"
                    href={{
                      pathname: '/podcast/play/[id]',
                      params: {
                        id: item.id,
                        audioUrl: item.audioUrl,
                        title: item.title,
                        imageUrl: podcastImage,
                        feedUrl: Array.isArray(params.url) ? params.url[0] : params.url, // Add feed URL
                      },
                    }}
                  >
                    <Text className="text-white font-semibold">Play Episode</Text>
                  </Link>
                ) : (
                  <Link  href={{
                    pathname: '/podcast/play/[id]',
                    params: {
                      id: item.id,
                      audioUrl: item.audioUrl,
                      title: item.title,
                      imageUrl: podcastImage,
                      feedUrl: Array.isArray(params.url) ? params.url[0] : params.url, // Add feed URL
                    },
                  }}className="mt-3 bg-zinc-200 dark:bg-zinc-700 py-2.5 rounded-xl">
                    <Text className="text-center text-zinc-600 dark:text-zinc-300 font-semibold">
                      Currently Playing
                    </Text>
                  </Link>
                )}
              </View>
            )}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-zinc-500 dark:text-zinc-400 text-center">
                  No episodes found
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}
