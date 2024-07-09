import AppGradient from "@/components/AppGradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Audio } from "expo-av";
import CustomButton from "@/components/CustomButton";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import MEDITATION_IMAGES from "@/constants/meditation-images";
import { TimerContext } from "@/context/TimerContext";
import { MEDITATION_DATA, AUDIO_FILES } from "@/constants/MeditationData";

const Page = () => {
    const { id } = useLocalSearchParams();

    const { duration: secondsRemaining, setDuration } = useContext(TimerContext);

    const [isMeditating, setMeditating] = useState(false);
    const [audioSound, setSound] = useState<Audio.Sound>();
    const [isPlayingAudio, setPlayingAudio] = useState(false);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1000 }), // Adjust the duration as needed
            -1,
            true
        );
    }, []);
    const animatedStyle = useAnimatedStyle(() => {
        const scale = progress.value < 0.5 ? withTiming(1.2) : withTiming(1); // Scale up for "breathe in" and down for "breathe out"
        return {
            transform: [{ scale }],
        };
    });
    useEffect(() => {

        let timerId: NodeJS.Timeout;

        // Exit early when we reach 0
        if (secondsRemaining === 0) {
            if (isPlayingAudio) audioSound?.pauseAsync();
            setMeditating(false);
            setPlayingAudio(false);
            return;
        }

        if (isMeditating) {
            // Save the interval ID to clear it when the component unmounts
            timerId = setTimeout(() => {
                setDuration(secondsRemaining - 1);
            }, 1000);
        }

        // Clear timeout if the component is unmounted or the time left changes
        return () => {
            clearTimeout(timerId);
        };
    }, [secondsRemaining, isMeditating]);

    useEffect(() => {
        return () => {
            setDuration(10);
            audioSound?.unloadAsync();
        };
    }, [audioSound]);

    const initializeSound = async () => {
        const audioFileName = MEDITATION_DATA[Number(id) - 1].audio;

        const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[audioFileName]);
        setSound(sound);
        return sound;
    };

    const togglePlayPause = async () => {
        const sound = audioSound ? audioSound : await initializeSound();

        const status = await sound?.getStatusAsync();

        if (status?.isLoaded && !isPlayingAudio) {
            await sound?.playAsync();
            setPlayingAudio(true);
        } else {
            await sound?.pauseAsync();
            setPlayingAudio(false);
        }
    };

    async function toggleMeditationSessionStatus() {
        if (secondsRemaining === 0) setDuration(10);

        setMeditating(!isMeditating);

        await togglePlayPause();
    }

    const handleAdjustDuration = () => {
        if (isMeditating) toggleMeditationSessionStatus();

        router.push("/meditation/(modal)/adjust-meditation-duration");
    };

    // Format the timeLeft to ensure two digits are displayed
    const formattedTimeMinutes = String(
        Math.floor(secondsRemaining / 60)
    ).padStart(2, "0");
    const formattedTimeSeconds = String(secondsRemaining % 60).padStart(2, "0");

    return (
        <View className="flex-1">
            <ImageBackground
                source={MEDITATION_IMAGES[Number(id) - 1]}
                resizeMode="cover"
                className="flex-1"
            >
                <AppGradient colors={["transparent", "rgba(0,0,0,0.8)"]}>
                    <Pressable
                        onPress={() => router.back()}
                        className="absolute top-16 left-6 z-10"
                    >
                        <AntDesign name="leftcircleo" size={40} color="white" />
                    </Pressable>

                    <View className="flex-1 justify-center">
                        <Animated.View className="opacity-75 " style={[animatedStyle, { marginHorizontal: 'auto', backgroundColor: '#e5e7eb', borderRadius: 100, width: 176, height: 176, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text className="text-4xl text-green-800 font-medium">
                                {formattedTimeMinutes}.{formattedTimeSeconds}
                            </Text>
                        </Animated.View>
                    </View>

                    <View className="mb-5">
                        <CustomButton
                            title="Adjust duration"
                            onPress={handleAdjustDuration}
                        />
                        <CustomButton
                            title={isMeditating ? "Stop" : "Start Meditation"}
                            onPress={toggleMeditationSessionStatus}
                            containerStyles="mt-4"
                        />
                    </View>
                </AppGradient>
            </ImageBackground>
        </View>
    );
};

export default Page;
