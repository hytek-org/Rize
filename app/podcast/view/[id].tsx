import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import Parser from 'react-native-rss-parser';
import { Link, useLocalSearchParams } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';

interface RSSEpisode {
  title: string;
  audioUrl: string;
  description: string;
  id: string;
}

export default function PodcastDetail() {
  const { url } = useLocalSearchParams(); // Get the URL parameter passed from the previous screen
  const [episodes, setEpisodes] = useState<RSSEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (url) {
      fetchEpisodes(url);
    }
  }, [url]);

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

      const rssEpisodes: RSSEpisode[] = feed.items
        .map((item: any) => {
          const audioUrl = item.enclosures?.[0]?.url || null;
          return {
            title: item.title,
            description: item.description,
            audioUrl: audioUrl,
            id: item.id,
          };
        })
        .filter((episode) => episode.audioUrl !== null);

      setEpisodes(rssEpisodes);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-5 py-5 bg-zinc-100 dark:bg-zinc-900">
      <Text className="text-2xl my-10 font-bold text-center text-zinc-800 dark:text-zinc-200 mb-5">
        Podcast Episodes
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="pb-5 mb-4 border-b border-zinc-300 dark:border-zinc-700">
              <Text className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </Text>
              <Text className="text-sm text-zinc-700 dark:text-zinc-400 mt-1">
                {parseHTMLContent(item.description)}
              </Text>
              <Link
                className="mt-3 bg-green-500 py-3 rounded-full text-center text-white"
                href={{
                  pathname: '/podcast/play/[id]',
                  params: { audioUrl: item.audioUrl, title: item.title },
                }}
              >
                <Text>Play Episode</Text>
              </Link>
            </View>
          )}
        />
      )}
    </View>
  );
}
