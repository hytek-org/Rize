import { useState } from 'react';
import { Text } from 'react-native';
import { AuthShell, ErrorAlert, Field, FooterLink, PrimaryButton } from '@/components/auth-ui';
import { useAuth } from '@/auth/AuthProvider';
import { getAuthErrorMessage } from '@/auth/auth-service';

export default function SignUpScreen() {
  const { signUpWithEmail } = useAuth(); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm, setConfirm] = useState(''); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const submit = async () => { 
    if (!email.trim() || !password) return setError('Enter your email and password.'); 
    if (password.length < 6) return setError('Choose a password with at least 6 characters.'); 
    if (password !== confirm) return setError('Passwords do not match.'); 
    setError(''); 
    setLoading(true); 
    try { 
      await signUpWithEmail(email, password); 
    } catch (cause) { 
      setError(getAuthErrorMessage(cause)); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  return (
    <AuthShell eyebrow="Make room to grow" title="Create account" subtitle="A calmer way to build momentum, one day at a time.">
      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" returnKeyType="next" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secure returnKeyType="next" />
      <Field label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Type it again" secure returnKeyType="done" onSubmitEditing={submit} />
      
      <ErrorAlert message={error} />
      
      <PrimaryButton label="Create account" loading={loading} onPress={submit} />
      <FooterLink prompt="Already have an account?" label="Sign in" href="/(auth)/login" />
    </AuthShell>
  );
}