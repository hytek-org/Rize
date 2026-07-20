import { useState } from 'react';
import { Text, View } from 'react-native';
import { AuthShell, ErrorAlert, Field, FooterLink, GoogleButton, PrimaryButton } from '@/components/auth-ui';
import { useAuth } from '@/auth/AuthProvider';
import { getAuthErrorMessage } from '@/auth/auth-service';

export default function SignUpScreen() {
  const { signUpWithEmail, signInWithGoogle } = useAuth(); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm, setConfirm] = useState(''); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const submit = async (action: () => Promise<void>, validateFields = true) => { 
    if (validateFields) {
      if (!email.trim() || !password) return setError('Enter your email and password.'); 
      if (password.length < 6) return setError('Choose a password with at least 6 characters.'); 
      if (password !== confirm) return setError('Passwords do not match.'); 
    }
    setError(''); 
    setLoading(true); 
    try { 
      await action(); 
    } catch (cause) { 
      setError(getAuthErrorMessage(cause)); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  return (
    <AuthShell eyebrow="Make room to grow" title="Create account" subtitle="A calmer way to build momentum, one day at a time.">
      <GoogleButton loading={loading} onPress={() => submit(signInWithGoogle, false)} />

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
        <Text className="text-neutral-500 dark:text-neutral-400 font-medium text-[11px] tracking-widest mx-4 uppercase">Or continue with email</Text>
        <View className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800" />
      </View>

      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" returnKeyType="next" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secure returnKeyType="next" />
      <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Type it again" secure returnKeyType="done" onSubmitEditing={() => submit(() => signUpWithEmail(email, password))} />
      
      <ErrorAlert message={error} />
      
      <PrimaryButton label="Create account" loading={loading} onPress={() => submit(() => signUpWithEmail(email, password))} />
      <FooterLink prompt="Already have an account?" label="Sign in" href="/(auth)/login" />
    </AuthShell>
  );
}