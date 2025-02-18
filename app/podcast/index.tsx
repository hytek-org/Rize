import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Parser from 'react-native-rss-parser';
import { Link } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';
import CustomAlert from '@/components/CustomAlert';
import { Skeleton } from '@/components/ui/Skeleton';

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
    <View className="flex-1 px-5 py-5 dark:bg-zinc-900 bg-zinc-100">
      <Text className="text-2xl mt-10 mb-5 text-center font-bold text-zinc-800 dark:text-zinc-200">
        Podcast Feeds
      </Text>

      <View className="flex-row mb-5">
        <TextInput
          className="flex-1 h-12 border border-zinc-300 dark:border-zinc-600 rounded-md px-3 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
          placeholder="Enter RSS Feed URL"
          placeholderTextColor="#888"
          value={inputUrl}
          onChangeText={setInputUrl}
        />
        <Pressable
          className="rounded-full bg-green-500 py-3 px-4 ml-4"
          onPress={addRssFeed}
        >
          <Text className="text-white">Add Feed</Text>
        </Pressable>
      </View>
      <View>
        <Link href={'/podcast/playlist'}>
          <Text className='text-green-500 text-xl'>Playlist</Text>
        </Link>
        <Link href={'/podcast/download'}>
          <Text className='text-green-500 text-xl'>Download</Text>
        </Link>
      </View>
      {loading ? (
        <>
          <PodcastSkeleton />
          <PodcastSkeleton />
          <PodcastSkeleton />
        </>
      ) : (
        <FlatList
          data={rssFeeds}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="mb-5 p-5 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800">
              <View>
                <Text selectable={true} className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </Text>
                <Text selectable={true} className="text-sm text-zinc-700 dark:text-zinc-400">
                  {parseHTMLContent(item.description || '')}
                </Text>
                <Text className="text-xs text-zinc-600 dark:text-zinc-500">
                  Language: {item.language}
                </Text>
                <Text className="text-xs text-zinc-600 dark:text-zinc-500">
                  Last Updated: {item.lastBuildDate}
                </Text>
              </View>
              <View className="flex-row justify-between mt-4">
                <Link
                  href={{
                    pathname: '/podcast/view/[id]',
                    params: { id: item.id, url: encodeURIComponent(item.url) },
                  }}
                >
                  <Text className="text-blue-600 dark:text-blue-400">
                    View Episodes
                  </Text>
                </Link>
                {!item.isDefault && (
                  <Pressable
                    onPress={() => removeRssFeed(item.url)}
                    className="bg-red-500 py-2 px-4 rounded-md"
                  >
                    <Text className="text-white">Remove</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />
      )}
      {/* Display Custom Alert */}
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
