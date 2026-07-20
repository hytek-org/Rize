import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function AuthShell({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-8 pt-20 pb-12" keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/logo.png')} className="w-11 h-11 mb-8" resizeMode="contain" accessibilityLabel="Rize" />
        <Text className="text-muted font-inter-semibold text-xs tracking-wider uppercase mb-3">{eyebrow}</Text>
        <Text className="text-foreground font-inter-bold text-4xl tracking-tight mb-3">{title}</Text>
        <Text className="text-muted font-inter text-base leading-6 mb-10">{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Field({ label, error, secure, value, onChangeText, placeholder, onSubmitEditing, returnKeyType }: { label: string; error?: string; secure?: boolean; value: string; onChangeText: (value: string) => void; placeholder: string; onSubmitEditing?: () => void; returnKeyType?: 'next' | 'done' }) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-5">
      <Text className="text-foreground font-inter-medium text-sm mb-2">{label}</Text>
      <View className={`min-h-[52px] border rounded-xl px-4 flex-row items-center bg-element ${error ? 'border-error' : (focused ? 'border-foreground' : 'border-border')}`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A1A1AA"
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={label.toLowerCase().includes('email') ? 'email-address' : 'default'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 text-foreground font-inter text-base py-3"
          accessibilityLabel={label}
        />
        {secure && (
          <Pressable onPress={() => setVisible((current) => !current)} accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} hitSlop={10}>
            <Text className="text-muted font-inter-medium text-sm ml-2">{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text accessibilityLiveRegion="polite" className="text-error font-inter text-sm mt-1.5">{error}</Text>}
    </View>
  );
}

export function PrimaryButton({ label, loading, onPress }: { label: string; loading?: boolean; onPress: () => void }) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`min-h-[52px] rounded-xl bg-primary items-center justify-center mt-2 ${loading ? 'opacity-70' : 'active:opacity-80'}`}
    >
      {loading ? (
        <ActivityIndicator color="#FAFAFA" />
      ) : (
        <Text className="text-primary-foreground font-inter-semibold text-base">{label}</Text>
      )}
    </Pressable>
  );
}



interface GoogleButtonProps {
  loading?: boolean;
  onPress: () => void;
}

export function GoogleButton({ loading, onPress }: GoogleButtonProps) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      className={`
        relative flex-row items-center justify-center w-full min-h-[56px] mb-6 rounded-full
        bg-white border border-gray-200 shadow-sm
        dark:bg-[#121212] dark:border-zinc-800 dark:shadow-none
        active:scale-[0.98] active:opacity-80
        ${loading ? 'opacity-70' : 'opacity-100'}
      `}
    >
      {/* Icon Container - Anchored to the left for a premium balanced look */}
      <View className="absolute left-6 justify-center items-center h-full">
        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (

          <Image source={require('@/assets/images/google.svg')} resizeMode="contain" accessibilityLabel="Google logo" className="size-12" />
        )}
      </View>

      {/* Centered Text */}
      <Text className="text-base font-semibold text-gray-900 dark:text-white">
        {loading ? 'Connecting...' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
}

export function FooterLink({ prompt, label, href }: { prompt: string; label: string; href: '/(auth)/login' | '/(auth)/sign-up' | '/(auth)/forgot' }) {
  const router = useRouter();
  return (
    <View className="flex-row justify-center mt-8">
      <Text className="text-muted font-inter text-sm">{prompt} </Text>
      <Pressable onPress={() => router.push(href)} hitSlop={10}>
        <Text className="text-foreground font-inter-semibold text-sm underline">{label}</Text>
      </Pressable>
    </View>
  );
}