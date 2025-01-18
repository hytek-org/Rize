import { View, Text, Pressable, Image, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import { IconSymbol } from '../ui/IconSymbol'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { Link, usePathname, useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'

export default function FloatingPlayer() {
    const {
        isPlaying,
        albumArt,
        currentUrl,
        currentId,
        currentTitle,
        currentFeedUrl,
        currentAudioUrl,
        togglePlayPause,
        skipForward,
        skipBackward,
        playbackStatus,
        stopAndUnloadCurrentSound,
    } = useAudioPlayer()

    const pathname = usePathname()
    const router = useRouter()
    
    if (!currentUrl || pathname.includes('/podcast')) return null

    const progress = (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100

    const handleNavigation = () => {
        if (!currentId) return;
        
        router.push({
            pathname: '/podcast/play/[id]',
            params: {
                id: currentId,
                audioUrl: currentAudioUrl,
                title: currentTitle,
                imageUrl: albumArt,
                feedUrl: currentFeedUrl,
            }
        });
    };

    return (
        <View className="absolute bottom-12 left-0 right-0">
            {/* Progress Bar */}
            <View className="h-[2px] bg-zinc-700">
                <View 
                    className="h-full bg-green-500"
                    style={{ width: `${progress}%` }} 
                />
            </View>

            <BlurView intensity={95} tint="dark" className="overflow-hidden">
                <View className="flex-row items-center p-2 px-4 bg-black/50">
                    {/* Left section with album art and title */}
                    <Pressable 
                        className="flex-row items-center flex-1"
                        onPress={handleNavigation}
                    >
                        {albumArt && (
                            <Image
                                source={{ uri: albumArt }}
                                className="w-10 h-10 rounded"
                                style={styles.albumArt}
                            />
                        )}
                        <Text 
                            numberOfLines={1} 
                            className="text-sm font-medium text-white ml-3 flex-1"
                        >
                            {currentTitle || 'Now Playing'}
                        </Text>
                    </Pressable>

                    {/* Controls section */}
                    <View className="flex-row items-center gap-2">
                        {isPlaying ? (
                            <>
                                <Pressable
                                    onPress={skipBackward}
                                    className="p-2"
                                >
                                    <IconSymbol size={24} color="white" name="replay-30" />
                                </Pressable>

                                <Pressable
                                    onPress={togglePlayPause}
                                    className="p-2"
                                >
                                    <IconSymbol color="white" size={28} name="pause" />
                                </Pressable>

                                <Pressable
                                    onPress={skipForward}
                                    className="p-2"
                                >
                                    <IconSymbol size={24} color="white" name="forward-30" />
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Pressable
                                    onPress={togglePlayPause}
                                    className="p-2"
                                >
                                    <IconSymbol color="white" size={28} name="play-arrow" />
                                </Pressable>

                                <Pressable
                                    onPress={() => stopAndUnloadCurrentSound(true)}
                                    className="p-2"
                                >
                                    <IconSymbol color="white" size={24} name="close" />
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </BlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    albumArt: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    }
})