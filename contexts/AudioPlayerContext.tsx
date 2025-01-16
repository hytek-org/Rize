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
  playbackStatus: PlaybackStatus;
  playAudio: (url: string, id: string) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipForward: () => Promise<void>;
  skipBackward: () => Promise<void>;
  handleSliderChange: (value: number) => Promise<void>;
  stopAndUnloadCurrentSound: (force?: boolean) => Promise<void>;
  currentId: string | null;
  setCurrentId: (id: string | null) => void;
  shouldPersist: boolean;
  setShouldPersist: (persist: boolean) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    positionMillis: 0,
    durationMillis: 1, // Avoid division by 0
  });
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [shouldPersist, setShouldPersist] = useState(false);

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
        setShouldPersist(false);
      }
    }
  };

  const playAudio = async (url: string, id: string) => {
    setLoading(true);
    setShouldPersist(true); // Enable persistence when starting playback

    try {
      if (sound) {
        // If there is a currently playing sound, stop and unload it
        await stopAndUnloadCurrentSound();
      }

      // Load and play the new audio
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setCurrentUrl(url);
      setCurrentId(id);
      setIsPlaying(true);

      // Attach playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        setPlaybackStatus({
          positionMillis: status.positionMillis || 0,
          durationMillis: status.durationMillis || 1, // Avoid 0 for duration
        });

        if (status.didJustFinish) {
          stopAndUnloadCurrentSound(); // Auto-stop after playback finishes
        }
      });

      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
      setShouldPersist(false);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
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
        setCurrentId,
        shouldPersist,
        setShouldPersist,
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
