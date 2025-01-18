import { View, Text, Pressable, Image, StyleSheet, } from 'react-native'
import React from 'react'
import { IconSymbol } from '../ui/IconSymbol'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { usePathname, useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import { useColorScheme } from '@/hooks/useColorScheme';
export default function FloatingPlayer() {
    const colorScheme = useColorScheme();
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
        <View className="absolute  bottom-12  left-0 right-0 ">
            {/* Progress Bar */}
            <View className="h-[2px] bg-black dark:bg-zinc-700">
                <View
                    className="h-full bg-green-500"
                    style={{ width: `${progress}%` }}
                />
            </View>

            <BlurView intensity={95} tint="dark" className="overflow-hidden">
                <View className="flex-row items-center  p-2 px-4 bg-white dark:bg-black/50">
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
                            className="text-sm dark:text-white font-medium  ml-3 flex-1"
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
                                    className="p-2  "
                                >
                                    <IconSymbol
                                        color={colorScheme === "dark" ? "#f1f1f1" : "#121212"}
                                        size={24}
                                        name="replay-30"
                                    />

                                </Pressable>

                                <Pressable
                                    onPress={togglePlayPause}
                                    className="p-2"
                                >
                                    <IconSymbol  color={colorScheme === "dark" ? "#f1f1f1" : "#121212"} size={28} name="pause" />
                                </Pressable>

                                <Pressable
                                    onPress={skipForward}
                                    className="p-2"
                                >
                                    <IconSymbol  color={colorScheme === "dark" ? "#f1f1f1" : "#121212"} size={24} name="forward-30" />
                                </Pressable>
                            </>
                        ) : (
                            <>
                                <Pressable
                                    onPress={togglePlayPause}
                                    className="p-2"
                                >
                                    <IconSymbol  color={colorScheme === "dark" ? "#f1f1f1" : "#121212"} size={28} name="play-arrow" />
                                </Pressable>

                                <Pressable
                                    onPress={() => stopAndUnloadCurrentSound(true)}
                                    className="p-2"
                                >
                                    <IconSymbol  color={colorScheme === "dark" ? "#f1f1f1" : "#121212"} size={24} name="close" />
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