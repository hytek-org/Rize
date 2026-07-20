import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

function RouteGate() {
  const { isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const isAuthRoute = segments[0] === '(auth)';

  if (isLoading) {
    return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color="#12D18E" size="large" /></View>;
  }

  if (!isAuthenticated && !isAuthRoute) return <Redirect href="/(auth)/login" />;
  if (isAuthenticated && isAuthRoute) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RouteGate />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
