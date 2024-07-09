export interface MeditationType {
    id: number;
    title: string;
    image: string;
    audio: string;
}

export const MEDITATION_DATA: MeditationType[] = [
    {
        id: 1,
        title: "Deep",
        image: "fog.webp",
        audio: "deep.mp3",
    },
    {
        id: 2,
        title: "Hopeful",
        image: "mist.webp",
        audio: "hopeful.mp3",
    },
    {
        id: 3,
        title: "Bright",
        image: "moist.webp",
        audio: "meditation.mp3",
    },
    {
        id: 4,
        title: "Rainy",
        image: "moon.webp",
        audio: "rainy.mp3",
    },
    {
        id: 5,
        title: "Oceanic",
        image: "stone.webp",
        audio: "sea.mp3",
    },
    {
        id: 6,
        title: "Tibetan",
        image: "sunset.webp",
        audio: "tibet.mp3",
    },
];

export const AUDIO_FILES: { [key: string]: any } = {
    "deep.mp3": require("@/assets/audio/deep.mp3"),
    "hopeful.mp3": require("@/assets/audio/hopeful.mp3"),
    "meditation.mp3": require("@/assets/audio/meditation.mp3"),
    "rainy.mp3": require("@/assets/audio/rainy.mp3"),
    "sea.mp3": require("@/assets/audio/sea.mp3"),
    "tibet.mp3": require("@/assets/audio/tibet.mp3"),
};