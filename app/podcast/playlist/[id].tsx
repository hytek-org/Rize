import React, { useState } from 'react';
import { View, Text, Pressable, FlatList,  Image } from 'react-native';
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
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-4 justify-center items-center">
        <Text className="text-zinc-600 dark:text-zinc-400">Playlist not found</Text>
      </View>
    );
  }

  const handleDeleteConfirm = (episode: Episode) => {
    setSelectedEpisode(episode);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setSelectedEpisode(null);
  };

  const handleDeleteConfirmed = () => {
    if (selectedEpisode && playlist) {
      removeFromPlaylist(playlist.id, selectedEpisode.id);
      setDeleteConfirmVisible(false);
      setSelectedEpisode(null);
    }
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
          onPress={() => handleDeleteConfirm(episode)}
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

      {deleteConfirmVisible && selectedEpisode && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center px-4">
          <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl w-full max-w-sm">
            <Text className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
              Remove Episode
            </Text>
            <Text className="text-md text-zinc-600 dark:text-zinc-300 mb-6">
              Are you sure you want to remove "{selectedEpisode.title}"?
            </Text>
            <View className="flex-row justify-end space-x-4">
              <Pressable
                onPress={handleDeleteCancel}
                className="px-4 py-2 rounded-lg"
              >
                <Text className="text-blue-600 dark:text-blue-400">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteConfirmed}
                className="px-4 py-2 bg-red-500 rounded-lg"
              >
                <Text className="text-white font-medium">Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
