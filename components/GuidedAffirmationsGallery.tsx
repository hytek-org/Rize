import { Image, View, Text, FlatList, Pressable } from "react-native";
import images from "@/constants/affirmation-images";
import { GalleryPreviewData } from "@/constants/models/AffirmationCategory";
import { Link } from "expo-router";

interface GuidedAffirmationsGalleryProps {
    title: string;
    products: GalleryPreviewData[];
}

const GuidedAffirmationsGallery = ({
    title,
    products,
}: GuidedAffirmationsGalleryProps) => {
    return (
        <View className="my-5">
            <View className="mb-2">
                <Text className="text-white font-medium text-base">{title}</Text>
            </View>
            <View className="space-y-2">
                <FlatList
                    data={products}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                        <Link href={`/meditation/inspirations/${item.id}`} asChild>
                            <Pressable>
                                <View className="relative max-w-sm rounded-xl  mr-4">
                                    <Image
                                        source={item.image}
                                        resizeMode="cover"
                                        className=" rounded-md w-[250px] h-[200px] "
                                    />
                                    <Text className="absolute bg-zinc-50 dark:bg-zinc-950 opacity-70 dark:opacity-80 text-black dark:text-white h-16 rounded-t-xl bg-opacity-5 w-full px-2.5 py-2 text-base tracking-tighter leading-6  bottom-0">{item.title}</Text>
                                </View>
                            </Pressable>
                        </Link>
                    )}
                    horizontal
                />
            </View>
        </View>
    );
};

export default GuidedAffirmationsGallery;
