import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Audio } from 'expo-av';

type PlaybackStatus = {
  positionMillis: number;
  durationMillis: number;
};

type AudioPlayerContextType = {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  loading: boolean;
  currentUrl: string | null;
  albumArt: string | null;
  setAlbumArt: (art: string | null) => void;  // Fixed type definition
  playbackStatus: PlaybackStatus;
  playAudio: (url: string, id: string, artUrl?: string, title?: string, feedUrl?: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  handleSliderChange: (value: number) => Promise<void>;
  stopAndUnloadCurrentSound: (force?: boolean) => Promise<void>;
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
  shouldPersist: boolean;
  setShouldPersist: (persist: boolean) => void;
  currentTitle: string | null;
  setCurrentTitle: (title: string | null) => void;
  currentFeedUrl: string | null;
  setCurrentFeedUrl: (url: string | null) => void;
  currentAudioUrl: string | null;
  setCurrentAudioUrl: (url: string | null) => void;
  playOfflineAudio: (localPath: string, id: string, metadata: {
    title: string;
    artUrl?: string;
    feedUrl?: string;
  }) => Promise<void>;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [albumArt, setAlbumArt] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    positionMillis: 0,
    durationMillis: 1, // Avoid division by 0
  });
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [shouldPersist, setShouldPersist] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [currentFeedUrl, setCurrentFeedUrl] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };

    setupAudioMode();
  }, []);

  const stopAndUnloadCurrentSound = async (force: boolean = false) => {
    if (!force && shouldPersist) return; // Don't stop if persisting

    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          // Stop and unload only if the sound is loaded
          await sound.stopAsync();
          await sound.unloadAsync();
        }
      } catch (error) {
        console.error('Error stopping or unloading sound:', error);
      } finally {
        // Reset state after attempting to unload
        setSound(null);
        setIsPlaying(false);
        setCurrentUrl(null);
        setCurrentId(null);
        setAlbumArt(null);  // Clear album art when stopping
        setCurrentTitle(null);
        setCurrentFeedUrl(null);
        setCurrentAudioUrl(null);
        setShouldPersist(false);
      }
    }
  };

  const playAudio = async (url: string, id: string, artUrl?: string, title?: string, feedUrl?: string) => {
    setLoading(true);
    setShouldPersist(true);

    try {
      // If the same audio is already loaded, just resume playback
      if (sound && currentUrl === url) {
        await sound.playAsync();
        setIsPlaying(true);
        setLoading(false);
        return;
      }

      // Stop previous sound before playing new one
      if (sound) {
        await stopAndUnloadCurrentSound(true);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          
          setPlaybackStatus({
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis || 1,
          });

          setIsPlaying(status.isPlaying || false);
        }
      );

      setSound(newSound);
      setCurrentUrl(url);
      setCurrentId(id);
      setCurrentAudioUrl(url);
      if (artUrl) setAlbumArt(artUrl);
      if (title) setCurrentTitle(title);
      if (feedUrl) setCurrentFeedUrl(feedUrl);

      await newSound.playAsync();
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing audio:', error);
      setShouldPersist(false);
    } finally {
      setLoading(false);
    }
  };

  const playOfflineAudio = async (localPath: string, id: string, metadata: {
    title: string;
    artUrl?: string;
    feedUrl?: string;
  }) => {
    setLoading(true);
    setShouldPersist(true);

    try {
      // Always stop previous sound before playing new one
      if (sound) {
        await stopAndUnloadCurrentSound(true); // Force stop previous playback
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: localPath },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentUrl(localPath);
      setCurrentId(id);
      setCurrentAudioUrl(localPath);
      if (metadata.artUrl) setAlbumArt(metadata.artUrl);
      if (metadata.title) setCurrentTitle(metadata.title);
      if (metadata.feedUrl) setCurrentFeedUrl(metadata.feedUrl);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        setPlaybackStatus({
          positionMillis: status.positionMillis || 0,
          durationMillis: status.durationMillis || 1,
        });

        // Update isPlaying based on status
        setIsPlaying(status.isPlaying);

        if (status.didJustFinish) {
          setIsPlaying(false);
          // Optional: decide if you want to stop or just pause at end
          // stopAndUnloadCurrentSound();
        }
      });

    } catch (error) {
      console.error('Error playing offline audio:', error);
      setShouldPersist(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      
      setIsPlaying(!status.isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setIsPlaying(false);
    }
  };

  const skipForward = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.min(
        playbackStatus.positionMillis + 30000,
        playbackStatus.durationMillis
      );
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  };

  const skipBackward = async () => {
    if (!sound) return;

    try {
      const newPosition = Math.max(playbackStatus.positionMillis - 30000, 0);
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  };

  const handleSliderChange = async (value: number) => {
    if (!sound) return;

    try {
      const newPosition = playbackStatus.durationMillis * value;
      await sound.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error seeking position:', error);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        albumArt,
        sound,
        currentUrl,
        isPlaying,
        loading,
        playbackStatus,
        playAudio,
        togglePlayPause,
        skipForward,
        skipBackward,
        handleSliderChange,
        stopAndUnloadCurrentSound,
        currentId,
        setAlbumArt,
        setCurrentId,
        shouldPersist,
        setShouldPersist,
        currentTitle,
        setCurrentTitle,
        currentFeedUrl,
        setCurrentFeedUrl,
        currentAudioUrl,
        setCurrentAudioUrl,
        playOfflineAudio,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
