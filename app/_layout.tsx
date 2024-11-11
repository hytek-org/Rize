import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { initializeTemplates } from '@/utils/templateInitializer'; // Adjust the path as per your project structure
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from '@/hooks/useColorScheme';
import { TemplateProvider } from '@/contexts/TemplateContext';
import "../global.css";
import { AuthProvider } from '@/contexts/AuthProvider';
import { NotesProvider } from '@/contexts/NotesContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <TemplateProvider>
            <NotesProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </NotesProvider>
          </TemplateProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>

  );
}
