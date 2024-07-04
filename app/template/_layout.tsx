
import { Stack } from 'expo-router';

export default function TemplateLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Create a new Template',
        headerShown: true,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  );
}
