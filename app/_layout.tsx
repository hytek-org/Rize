import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import { initializeTemplates } from '@/utils/templateInitializer';
import { NotesProvider } from '@/contexts/NotesContext';
import { TemplateProvider } from '@/contexts/TemplateContext';
import { AuthProvider } from '@/contexts/AuthProvider';
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext';
import { PodcastProvider } from '@/contexts/PodcastContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    const fetchTemplates = async () => {
      try {
        const templates = await initializeTemplates();
        // console.log('Initialized templates:', templates.filter(template => template.public).map((template) => (template.title)));
        // Now you can use the 'templates' array in your application state or component
      } catch (error) {
        console.error('Failed to initialize templates:', error);
        // Handle error appropriately (e.g., show an error message to the user)
      }
    };

    fetchTemplates();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TemplateProvider>
          <NotesProvider>
            <PodcastProvider>
              <AudioPlayerProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false,  }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </AudioPlayerProvider>
            </PodcastProvider>
          </NotesProvider>
        </TemplateProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
