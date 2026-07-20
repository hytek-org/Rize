import { useAuth } from '@/auth/AuthProvider';
import { getAuthErrorMessage } from '@/auth/auth-service';
import { AuthShell, ErrorAlert, Field, FooterLink, GoogleButton, PrimaryButton } from '@/components/auth-ui';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (action: () => Promise<void>, validateEmailPassword = true) => {
    if (validateEmailPassword && !email.trim()) return setError('Enter your email address.');
    if (validateEmailPassword && !password) return setError('Enter your password.');
    setError('');
    setLoading(true);
    try {
      await action();
    } catch (cause: any) {
      setError(getAuthErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Your momentum, uninterrupted" title="Welcome back" subtitle="Sign in to pick up where you left off.">
      <GoogleButton loading={loading} onPress={() => submit(signInWithGoogle, false)} />

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
        <Text className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px] tracking-widest mx-4 uppercase">Or continue with email</Text>
        <View className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
      </View>

      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" onSubmitEditing={() => passwordRef.current?.focus()} returnKeyType="next" />

      <View className="relative">
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secure onSubmitEditing={() => submit(() => signInWithEmail(email, password))} returnKeyType="done" />
        <Pressable 
          onPress={() => router.push('/(auth)/forgot')} 
          hitSlop={10} 
          className="absolute right-0 top-0 mt-0.5 z-10"
        >
          <Text className="text-[#12D18E] font-medium text-xs tracking-wider uppercase">Forgot?</Text>
        </Pressable>
      </View>

      <ErrorAlert message={error} />

      <PrimaryButton label="Sign in" loading={loading} onPress={() => submit(() => signInWithEmail(email, password))} />
      <FooterLink prompt="New to Rize?" label="Create an account" href="/(auth)/sign-up" />
    </AuthShell>
  );
}