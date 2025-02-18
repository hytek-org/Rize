import React, { useState } from 'react';
import { View, Text, Pressable, FlatList,  Image } from 'react-native';
import { usePodcasts } from '@/contexts/PodcastContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { formatBytes } from '@/utils/formatBytes';
import * as FileSystem from 'expo-file-system';

interface DownloadedEpisode {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  feedUrl?: string;
  downloadPath: string;
  downloadDate: string;
}

interface FileInfoWithSize {
  exists: boolean;
  size?: number;
  uri: string;
  isDirectory: boolean;
}

export default function DownloadsScreen() {
  const { downloadedEpisodes, deleteDownload } = usePodcasts();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [filesSizes, setFilesSizes] = useState<{ [key: string]: number }>({});
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<DownloadedEpisode | null>(null);

  const getFileSize = async (path: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path, { size: true }) as FileInfoWithSize;
      return fileInfo.exists ? fileInfo.size || 0 : 0;
    } catch (error) {
      console.error('Error getting file size:', error);
      return 0;
    }
  };

  React.useEffect(() => {
    const loadFileSizes = async () => {
      const sizes: { [key: string]: number } = {};
      for (const episode of downloadedEpisodes) {
        sizes[episode.id] = await getFileSize(episode.downloadPath);
      }
      setFilesSizes(sizes);
    };
    loadFileSizes();
  }, [downloadedEpisodes]);

  const handleDeleteConfirm = (episode: DownloadedEpisode) => {
    setSelectedEpisode(episode);
    setDeleteConfirmVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
    setSelectedEpisode(null);
  };

  const handleDeleteConfirmed = () => {
    if (selectedEpisode) {
      deleteDownload(selectedEpisode.id);
      setDeleteConfirmVisible(false);
      setSelectedEpisode(null);
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const downloadDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - downloadDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const renderItem = ({ item: episode }: { item: DownloadedEpisode }) => (
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
        <ThemedText type="subtitle" className="text-base font-semibold mb-1 flex-shrink">
          {episode.title}
        </ThemedText>
        <View className="flex-row items-center">
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            {formatBytes(filesSizes[episode.id] || 0)}
          </Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400 mx-2">•</Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400">
            Downloaded {formatDate(episode.downloadDate)}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => handleDeleteConfirm(episode)}
        className="p-2 ml-2"
      >
        <IconSymbol name="delete" size={24} color="#ef4444" />
      </Pressable>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-zinc-100 dark:bg-zinc-900 px-4">
      <View className="mt-16 mb-6">
        <ThemedText type="title" className="text-2xl font-bold mb-2">
          Downloads
        </ThemedText>
        <Text className="text-zinc-500 dark:text-zinc-400">
          {downloadedEpisodes.length} episodes downloaded
        </Text>
      </View>

      <FlatList
        data={downloadedEpisodes}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <IconSymbol name="download" size={48} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText type="subtitle" className="text-center mt-4">
              No downloads yet
            </ThemedText>
            <Text className="text-zinc-500 dark:text-zinc-400 text-center mt-2">
              Downloaded episodes will appear here
            </Text>
          </View>
        }
      />
      {/* Improved Delete Confirmation Modal */}
      {deleteConfirmVisible && selectedEpisode && (
        <View className="absolute inset-0 bg-black/50 flex items-center justify-center px-4">
          <View className="bg-white dark:bg-zinc-800 p-6 rounded-2xl w-full max-w-sm">
            <Text className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-4">
              Delete Download
            </Text>
            <Text className="text-md text-zinc-600 dark:text-zinc-300 mb-6">
              Are you sure you want to delete "{selectedEpisode.title}"?
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
                <Text className="text-white font-medium">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}