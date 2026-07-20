import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

export function AuthShell({ children, eyebrow, title, subtitle }: { children: ReactNode; eyebrow: string; title: string; subtitle: string }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow px-8 pt-20 pb-12" keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/logo.png')} className="w-11 h-11 mb-8" resizeMode="contain" accessibilityLabel="Rize" />
        <Text className="text-muted font-medium text-xs tracking-wider uppercase mb-3">{eyebrow}</Text>
        <Text className="text-foreground font-medium text-4xl tracking-tight mb-3">{title}</Text>
        <Text className="text-muted font-medium text-base leading-6 mb-10">{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ErrorAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" className="w-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-[16px] p-4 mb-5">
      <Text className="text-red-600 dark:text-red-400 font-medium text-[13px] leading-5 text-center">{message}</Text>
    </View>
  );
}

export function Field({ label, error, secure, value, onChangeText, placeholder, onSubmitEditing, returnKeyType }: { label: string; error?: string; secure?: boolean; value: string; onChangeText: (value: string) => void; placeholder: string; onSubmitEditing?: () => void; returnKeyType?: 'next' | 'done' }) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full mb-5">
      <Text className="mb-2 text-xs font-medium tracking-wider uppercase text-muted">{label}</Text>
      <View className={`min-h-[56px] border rounded-2xl px-5 flex-row items-center bg-surface ${error ? 'border-error' : (focused ? 'border-primary' : 'border-border')}`}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#737373"
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={label.toLowerCase().includes('email') ? 'email-address' : 'default'}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 text-[15px] font-normal text-foreground py-3"
          accessibilityLabel={label}
        />
        {secure && (
          <Pressable onPress={() => setVisible((current) => !current)} accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} hitSlop={10}>
            <Text className="text-muted font-medium text-sm ml-2">{visible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text accessibilityLiveRegion="polite" className="text-error font-medium text-sm mt-1.5">{error}</Text>}
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
      className={`w-full h-14 rounded-full bg-primary items-center justify-center mt-2 shadow-sm shadow-primary/30 transition-all ${loading ? 'opacity-70' : 'active:opacity-85 active:scale-[0.985]'}`}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text className="text-primary-foreground font-medium text-[16px] tracking-wide">{label}</Text>
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
      className={`relative flex-row items-center justify-center w-full h-14 mb-4 rounded-2xl bg-background border border-border shadow-sm dark:shadow-none transition-all ${loading ? 'opacity-70' : 'active:scale-[0.985] active:opacity-90'}`}
    >
      <View className="absolute left-5 items-center justify-center">
        {loading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <Image
            source={require('@/assets/images/google.png')}
            resizeMode="contain"
            accessibilityLabel="Google logo"
            className="w-5 h-5"
          />
        )}
      </View>
      <Text className="text-[15px] font-medium tracking-tight text-foreground">
        {loading ? 'Connecting...' : 'Continue with Google'}
      </Text>
    </Pressable>
  );
}

export function FooterLink({ prompt, label, href }: { prompt: string; label: string; href: '/(auth)/login' | '/(auth)/sign-up' | '/(auth)/forgot' }) {
  const router = useRouter();
  return (
    <View className="flex-row justify-center mt-8">
      <Text className="text-muted font-medium text-sm">{prompt} </Text>
      <Pressable onPress={() => router.push(href)} hitSlop={10}>
        <Text className="text-foreground font-medium text-sm underline">{label}</Text>
      </Pressable>
    </View>
  );
}