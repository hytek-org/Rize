import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Parser from 'react-native-rss-parser';
import { Link } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';
import CustomAlert from '@/components/CustomAlert';
import { Skeleton } from '@/components/ui/Skeleton';
import { MaterialIcons } from '@expo/vector-icons';

// Add this helper function at the top of the file
const generateUniqueId = (url: string): string => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `feed-${hash}-${Date.now()}`;
};

interface Rss {
  id: string; // Changed to string type
  title: string;
  description?: string;
  language?: string;
  copyright?: string;
  lastBuildDate?: string;
  url: string;
  isDefault?: boolean;
}

export default function Index() {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [rssFeeds, setRssFeeds] = useState<Rss[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  // CustomAlert state management
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning'>('error');
  const [scaleAnim] = useState(new Animated.Value(1));
  const defaultFeeds = [
    {
      url: 'https://feeds.buzzsprout.com/1882267.rss',
      isDefault: true,
    },
    {
      url: 'https://media.rss.com/theesportsreport/feed.xml',
      isDefault: true,
    },
  ];

  useEffect(() => {
    const loadRssFeeds = async () => {
      const storedFeeds = await AsyncStorage.getItem('rssFeeds');
      const parsedStoredFeeds: Rss[] = storedFeeds ? JSON.parse(storedFeeds) : [];

      const defaultFeedPromises = defaultFeeds.map((feed) =>
        fetchRssFeed(feed.url, true)
      );
      const defaultFeedResults = await Promise.all(defaultFeedPromises);

      const nonNullDefaultFeeds = defaultFeedResults.filter(
        (feed) => feed !== null
      ) as Rss[];

      const allFeeds = [
        ...nonNullDefaultFeeds,
        ...parsedStoredFeeds,
      ].filter(
        (feed, index, self) =>
          index === self.findIndex((f) => f.url === feed.url)
      );

      setRssFeeds(allFeeds);
      saveFeedsToStorage(allFeeds);
    };

    loadRssFeeds();
  }, []);

  const saveFeedsToStorage = async (feeds: Rss[]) => {
    await AsyncStorage.setItem('rssFeeds', JSON.stringify(feeds));
  };

  const fetchRssFeed = async (
    url: string,
    isDefault: boolean = false
  ): Promise<Rss | null> => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!response.ok) throw new Error('Failed to fetch RSS');
      const rssText = await response.text();
      const feed = await Parser.parse(rssText);

      // Generate a unique ID using the helper function
      const uniqueId = generateUniqueId(url);

      return {
        id: uniqueId,
        title: feed.title || 'No Title',
        description: feed.description || 'No Description',
        language: feed.language || 'Unknown',
        copyright: feed.copyright || 'No Copyright',
        lastBuildDate: feed.lastUpdated || 'No Date',
        url,
        isDefault,
      };
    } catch (err) {
      console.error('Error fetching RSS feed:', err);
      setAlertTitle('Error');
      setAlertMessage('Failed to fetch RSS feed.');
      setAlertType('error');
      setAlertVisible(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addRssFeed = async () => {
    if (!inputUrl) return;

    const newFeed = await fetchRssFeed(inputUrl);
    if (newFeed) {
      const updatedFeeds = [...rssFeeds, newFeed];
      setRssFeeds(updatedFeeds);
      saveFeedsToStorage(updatedFeeds);
      setInputUrl('');
    }
  };

  const removeRssFeed = async (url: string) => {
    const updatedFeeds = rssFeeds.filter(
      (feed) => feed.url !== url || feed.isDefault
    );
    setRssFeeds(updatedFeeds);
    saveFeedsToStorage(updatedFeeds);
  };

  const PodcastSkeleton = () => (
    <View className="mb-5 p-5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800">
      <Skeleton height={24} className="mb-2" />
      <Skeleton height={60} className="mb-2" />
      <Skeleton height={16} width="50%" className="mb-1" />
      <Skeleton height={16} width="40%" />
    </View>
  );



  return (
    <View className="flex-1 px-4 py-5 dark:bg-zinc-900 bg-zinc-50">
      {/* Header Section */}
      <View className="mb-4 mt-6">
        <Text className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 text-center">
          Podcast Hub
        </Text>
        <Text className="text-center text-zinc-500 dark:text-zinc-400 mt-2">
          Discover and manage your favorite podcasts
        </Text>
      </View>
      {loading ? (
        <View className="space-y-4">
          <PodcastSkeleton />
          <PodcastSkeleton />
          <PodcastSkeleton />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={rssFeeds}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-6"
          ItemSeparatorComponent={() => <View className="h-4" />}
          renderItem={({ item }) => (
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700"
            >
              <View className="space-y-2">
                <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </Text>
                <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {parseHTMLContent(item.description || '')}
                </Text>
                <View className="flex-row space-x-4 mt-2">
                  <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                    <MaterialIcons name="language" size={12} color="#71717A" /> {item.language}
                  </Text>
                  <Text className="text-xs text-zinc-500 dark:text-zinc-500">
                    <MaterialIcons name="update" size={12} color="#71717A" /> {item.lastBuildDate}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                <Link
                  href={{
                    pathname: '/podcast/view/[id]',
                    params: { id: item.id, url: encodeURIComponent(item.url) },
                  }}
                >
                  <View className="flex-row items-center space-x-2">
                    <MaterialIcons name="playlist-play" size={20} color="#2563EB" />
                    <Text className="text-blue-600 dark:text-blue-400 font-medium">
                      View Episodes
                    </Text>
                  </View>
                </Link>
                {!item.isDefault && (
                  <Pressable
                    onPress={() => removeRssFeed(item.url)}
                    className="bg-red-500 py-2 px-4 rounded-lg"
                  >
                    <Text className="text-white font-medium">Remove</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}
        />
      )}
      {/* Input Section */}
      <View className=" bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm">
        {/* Navigation Links */}
        <View className="flex-row justify-between items-center px-2 mb-4">
          <Link href="/podcast/playlist">
            <View className="flex-row items-center space-x-2">
              <MaterialIcons name="playlist-play" size={20} color="#22C55E" />
              <Text className="text-green-500 font-medium">Playlist</Text>
            </View>
          </Link>
          <Link href="/podcast/download">
            <View className="flex-row items-center space-x-2">
              <MaterialIcons name="file-download" size={20} color="#22C55E" />
              <Text className="text-green-500 font-medium">Downloads</Text>
            </View>
          </Link>
        </View>
        <View className="flex-row items-center space-x-3 mb-4">
          <TextInput
            className="flex-1 h-12 bg-zinc-100 dark:bg-zinc-700 rounded-xl px-4 text-base text-zinc-800 dark:text-zinc-200"
            placeholder="Enter RSS Feed URL"
            placeholderTextColor="#9CA3AF"
            value={inputUrl}
            onChangeText={setInputUrl}
          />
          <Pressable
            onPress={() => {
              addRssFeed();
            }}
            className="h-12 px-6 ml-2 bg-green-500 rounded-xl items-center justify-center"
          >
            <MaterialIcons name="add" size={24} color="white" />
          </Pressable>
        </View>


      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        type={alertType}
      />
    </View>
  );
}
