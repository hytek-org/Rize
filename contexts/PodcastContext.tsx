import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

interface PodcastEpisode {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  feedUrl?: string;
  downloadPath?: string;
}

interface Playlist {
  id: string;
  name: string;
  episodes: PodcastEpisode[];
  createdAt: string;
}

interface DownloadedEpisode extends PodcastEpisode {
  downloadPath: string;
  downloadDate: string;
}

interface DownloadProgress {
  [key: string]: number;
}

interface PodcastContextType {
  playlists: Playlist[];
  downloadedEpisodes: DownloadedEpisode[];
  createPlaylist: (name: string) => Promise<void>;
  addToPlaylist: (playlistId: string, episode: PodcastEpisode) => Promise<void>;
  removeFromPlaylist: (playlistId: string, episodeId: string) => Promise<void>;
  downloadEpisode: (episode: PodcastEpisode, retryCount?: number) => Promise<string>;
  deleteDownload: (episodeId: string) => Promise<void>;
  isDownloaded: (episodeId: string) => boolean;
  getDownloadPath: (episodeId: string) => string | undefined;
  downloadProgress: DownloadProgress;
  removePlaylist: (playlistId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  getDownloadProgress: (episodeId: string) => number;
}

const PodcastContext = createContext<PodcastContextType | null>(null);

export const PodcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<DownloadedEpisode[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});

  // Load saved data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('@podcast_playlists');
      const storedDownloads = await AsyncStorage.getItem('@podcast_downloads');
      
      if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists));
      if (storedDownloads) setDownloadedEpisodes(JSON.parse(storedDownloads));
    } catch (error) {
      console.error('Error loading podcast data:', error);
    }
  };

  // Playlist Management
  const createPlaylist = async (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      episodes: [],
      createdAt: new Date().toISOString()
    };
    const updatedPlaylists = [...playlists, newPlaylist];
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const addToPlaylist = async (playlistId: string, episode: PodcastEpisode) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        // Check if episode already exists in playlist
        if (!playlist.episodes.some(ep => ep.id === episode.id)) {
          return {
            ...playlist,
            episodes: [...playlist.episodes, episode]
          };
        }
      }
      return playlist;
    });
    
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const removeFromPlaylist = async (playlistId: string, episodeId: string) => {
    const updatedPlaylists = playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          episodes: playlist.episodes.filter(ep => ep.id !== episodeId)
        };
      }
      return playlist;
    });
    
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const removePlaylist = async (playlistId: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const renamePlaylist = async (playlistId: string, newName: string) => {
    const updatedPlaylists = playlists.map(playlist =>
      playlist.id === playlistId ? { ...playlist, name: newName } : playlist
    );
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const deletePlaylist = async (playlistId: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    await AsyncStorage.setItem('@podcast_playlists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  // Download Management
  const downloadEpisode = async (episode: PodcastEpisode, retryCount = 3): Promise<string> => {
    const downloadDir = `${FileSystem.documentDirectory}podcasts/`;
    const fileExtension = episode.audioUrl.match(/\.(mp3|m4a|mp4)(?:\?.*)?$/i)?.[1] || 'mp3';
    const filename = `${episode.id}.${fileExtension}`;
    const downloadPath = `${downloadDir}${filename}`;

    try {
      // Create directory if doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(downloadDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
      }

      // Check if already downloaded
      const fileInfo = await FileSystem.getInfoAsync(downloadPath);
      if (fileInfo.exists && fileInfo.size && fileInfo.size > 0) {
        console.log('File already exists and is valid');
        
        // Add to downloads if not already tracked
        if (!isDownloaded(episode.id)) {
          const newDownload: DownloadedEpisode = {
            ...episode,
            downloadPath,
            downloadDate: new Date().toISOString()
          };
          const updatedDownloads = [...downloadedEpisodes, newDownload];
          await AsyncStorage.setItem('@podcast_downloads', JSON.stringify(updatedDownloads));
          setDownloadedEpisodes(updatedDownloads);
        }
        return downloadPath;
      } else if (fileInfo.exists) {
        // Delete invalid file
        await FileSystem.deleteAsync(downloadPath);
      }

      // Start download with proper headers
      const downloadResumable = FileSystem.createDownloadResumable(
        episode.audioUrl,
        downloadPath,
        {
          headers: {
            'Accept': 'audio/mpeg,audio/mp4,audio/*',
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-', // Support resumable downloads
          },
          sessionType: FileSystem.FileSystemSessionType.BACKGROUND, // Enable background downloads
        },
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(prev => ({
            ...prev,
            [episode.id]: progress
          }));
        }
      );

      console.log('Starting download from:', episode.audioUrl);
      const download = await downloadResumable.downloadAsync();
      console.log('Download completed:', download);

      if (!download?.uri) {
        throw new Error('Download failed - no URI received');
      }

      // Verify downloaded file
      const downloadedFileInfo = await FileSystem.getInfoAsync(download.uri, { size: true });
      console.log('Downloaded file info:', downloadedFileInfo);

      if (!downloadedFileInfo.exists || (downloadedFileInfo as any).size === 0) {
        throw new Error('Downloaded file is invalid');
      }

      // Save download info
      const newDownload: DownloadedEpisode = {
        ...episode,
        downloadPath: download.uri,
        downloadDate: new Date().toISOString()
      };

      const updatedDownloads = [...downloadedEpisodes, newDownload];
      await AsyncStorage.setItem('@podcast_downloads', JSON.stringify(updatedDownloads));
      setDownloadedEpisodes(updatedDownloads);

      // Clear progress
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[episode.id];
        return updated;
      });

      return download.uri;

    } catch (error) {
      console.error('Download error:', error);
      // Clean up failed download
      try {
        const fileInfo = await FileSystem.getInfoAsync(downloadPath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(downloadPath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up failed download:', cleanupError);
      }
      
      // Clear progress and rethrow
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[episode.id];
        return updated;
      });

      if (retryCount > 0) {
        console.log(`Retrying download (${retryCount} attempts left)...`);
        return downloadEpisode(episode, retryCount - 1);
      } else {
        throw error;
      }
    }
  };

  const deleteDownload = async (episodeId: string) => {
    const episode = downloadedEpisodes.find(ep => ep.id === episodeId);
    if (!episode) return;

    try {
      // Delete the file
      await FileSystem.deleteAsync(episode.downloadPath);
      
      // Update state and storage
      const updatedDownloads = downloadedEpisodes.filter(ep => ep.id !== episodeId);
      await AsyncStorage.setItem('@podcast_downloads', JSON.stringify(updatedDownloads));
      setDownloadedEpisodes(updatedDownloads);
    } catch (error) {
      console.error('Error deleting download:', error);
      throw error;
    }
  };

  const isDownloaded = (episodeId: string): boolean => {
    return downloadedEpisodes.some(episode => episode.id === episodeId);
  };

  const getDownloadPath = (episodeId: string): string | undefined => {
    return downloadedEpisodes.find(episode => episode.id === episodeId)?.downloadPath;
  };

  const getDownloadProgress = (episodeId: string): number => {
    return downloadProgress[episodeId] || 0;
  };

  return (
    <PodcastContext.Provider value={{
      playlists,
      downloadedEpisodes,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      downloadEpisode,
      deleteDownload,
      isDownloaded,
      getDownloadPath,
      downloadProgress,
      removePlaylist,
      renamePlaylist,
      deletePlaylist,
      getDownloadProgress,
    }}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcasts = () => {
  const context = useContext(PodcastContext);
  if (!context) {
    throw new Error('usePodcasts must be used within a PodcastProvider');
  }
  return context;
};
