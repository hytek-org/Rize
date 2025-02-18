import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, FlatList, Alert, Image } from 'react-native';
import { usePodcasts } from '@/contexts/PodcastContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface Playlist {
  id: string;
  name: string;
  episodes: Array<{
    id: string;
    title: string;
    imageUrl?: string;
  }>;
  createdAt: string;
}

const formatDate = (date: string) => {
  const now = new Date();
  const createDate = new Date(date);
  const diffInDays = Math.floor((now.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export default function PlaylistScreen() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePodcasts();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
    }
  };

  const handleRename = async (id: string) => {
    if (editName.trim()) {
      await renamePlaylist(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => deletePlaylist(id),
          style: 'destructive'
        },
      ]
    );
  };

  const renderItem = ({ item: playlist }: { item: Playlist }) => (
    <Pressable 
      className="flex-row items-center p-4 bg-white dark:bg-zinc-800 rounded-xl mb-3 shadow-sm"
      onPress={() => router.push({
        pathname: '/podcast/playlist/[id]',
        params: { id: playlist.id }
      })}
    >
      <View className="mr-4">
        {playlist.episodes[0]?.imageUrl ? (
          <Image 
            source={{ uri: playlist.episodes[0].imageUrl }}
            className="w-16 h-16 rounded-lg"
          />
        ) : (
          <View className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg items-center justify-center">
            <IconSymbol name="queue-music" size={32} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </View>
        )}
      </View>
      
      <View className="flex-1">
        {editingId === playlist.id ? (
          <View className="flex-row items-center">
            <TextInput
              value={editName}
              onChangeText={setEditName}
              onBlur={() => handleRename(playlist.id)}
              autoFocus
              className="flex-1 text-lg dark:text-white p-2 border-b dark:border-zinc-600"
              placeholder="Enter new name"
            />
            <Pressable 
              onPress={() => handleRename(playlist.id)}
              className="ml-2 p-2"
            >
              <IconSymbol name="check" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            </Pressable>
          </View>
        ) : (
          <>
            <ThemedText type="subtitle" className="text-lg font-semibold mb-1">
              {playlist.name}
            </ThemedText>
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">
              {playlist.episodes.length} episodes • Created {formatDate(playlist.createdAt)}
            </Text>
          </>
        )}
      </View>

      <View className="flex-row items-center">
        <Pressable 
          onPress={() => {
            setEditingId(playlist.id);
            setEditName(playlist.name);
          }}
          className="p-2"
        >
          <IconSymbol name="edit" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </Pressable>
        <Pressable 
          onPress={() => confirmDelete(playlist.id, playlist.name)}
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
        <ThemedText type="title" className="text-2xl font-bold mb-6">
          Your Playlists
        </ThemedText>
        
        <View className="flex-row items-center bg-white dark:bg-zinc-800 rounded-xl p-2 mb-6 shadow-sm">
          <TextInput
            value={newPlaylistName}
            onChangeText={setNewPlaylistName}
            placeholder="Create new playlist"
            className="flex-1 px-4 py-2 dark:text-white"
          />
          <Pressable
            onPress={handleCreatePlaylist}
            disabled={!newPlaylistName.trim()}
            className={`px-4 py-2 rounded-lg ${
              newPlaylistName.trim() ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <Text className="text-white font-medium">Create</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={playlists}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <IconSymbol name="queue-music" size={48} color={colorScheme === 'dark' ? '#fff' : '#000'} />
            <ThemedText type="subtitle" className="text-center mt-4">
              No playlists yet
            </ThemedText>
            <Text className="text-zinc-500 dark:text-zinc-400 text-center mt-2">
              Create your first playlist to start organizing your podcasts
            </Text>
          </View>
        }
      />
    </View>
  );
}