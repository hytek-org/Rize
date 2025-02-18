import React from 'react';
import { View, Text, Pressable, FlatList, Alert, Image } from 'react-native';
import { usePodcasts } from '@/contexts/PodcastContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';
import { TabCreateIcon } from '@/components/navigation/TabBarIcon';

interface Episode {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  feedUrl?: string;
}

export default function PlaylistDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { playlists, removeFromPlaylist } = usePodcasts();
  const { playAudio, currentId, isPlaying } = useAudioPlayer();

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-4 justify-center items-center">
        <Text className="text-zinc-600 dark:text-zinc-400">Playlist not found</Text>
      </View>
    );
  }

  const confirmRemove = (episodeId: string, title: string) => {
    Alert.alert(
      'Remove Episode',
      `Remove "${title}" from playlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => removeFromPlaylist(playlist.id, episodeId),
          style: 'destructive'
        },
      ]
    );
  };

  const renderItem = ({ item: episode }: { item: Episode }) => (
    <Pressable
      className="flex-row items-center p-4 bg-white dark:bg-zinc-800 rounded-xl mb-3 shadow-sm"
      onPress={() => router.push({
        pathname: '/podcast/play/[id]',
        params: {
          id: episode.id,
          audioUrl: episode.audioUrl,
          title: episode.title,
          imageUrl: episode.imageUrl || '',
          feedUrl: episode.feedUrl || ''
        }
      })}
    >
      <Image
        source={{ uri: episode.imageUrl }}
        className="w-16 h-16 rounded-lg mr-4"
      />

      <View className="flex-1">
        <ThemedText type="subtitle" className="text-base font-semibold mb-1">
          {episode.title}
        </ThemedText>
      </View>

      <View className="flex-row items-center">

        <Pressable
          onPress={() => confirmRemove(episode.id, episode.title)}
          className="p-2"
        >
          <IconSymbol name="delete" size={24} color="#ef4444" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-4">
      <View className="mt-16 mb-6">
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-4"
          >
            <TabCreateIcon name="arrowleft" size={26} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </Pressable>
          <ThemedText type="title" className="text-2xl font-bold flex-1">
            {playlist.name}
          </ThemedText>
        </View>
        <Text className="text-zinc-500 dark:text-zinc-400">
          {playlist.episodes.length} episodes
        </Text>
      </View>

      <FlatList
        data={playlist.episodes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <IconSymbol
              name="queue-music"
              size={48}
              color={colorScheme === 'dark' ? '#fff' : '#000'}
            />
            <ThemedText type="subtitle" className="text-center mt-4">
              No episodes in playlist
            </ThemedText>
            <Text className="text-zinc-500 dark:text-zinc-400 text-center mt-2">
              Add episodes to your playlist to see them here
            </Text>
          </View>
        }
      />
    </View>
  );
}
