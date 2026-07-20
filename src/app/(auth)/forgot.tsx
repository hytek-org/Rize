import { useState } from 'react';
import { Text } from 'react-native';
import { AuthShell, ErrorAlert, Field, FooterLink, PrimaryButton } from '@/components/auth-ui';
import { useAuth } from '@/auth/AuthProvider';
import { getAuthErrorMessage } from '@/auth/auth-service';

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth(); 
  const [email, setEmail] = useState(''); 
  const [message, setMessage] = useState(''); 
  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const submit = async () => { 
    if (!email.trim()) return setError('Enter your email address.'); 
    setError(''); 
    setLoading(true); 
    try { 
      await sendPasswordReset(email); 
      setMessage('If an account exists for this email, a reset link is on its way.'); 
    } catch (cause) { 
      setError(getAuthErrorMessage(cause)); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  return (
    <AuthShell eyebrow="A fresh start" title="Reset password" subtitle="We will send a secure link to your inbox so you can get back in.">
      <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" returnKeyType="done" onSubmitEditing={submit} />
      
      {message ? <Text className="text-primary font-medium text-sm mb-4 leading-5">{message}</Text> : null}
      <ErrorAlert message={error} />
      
      <PrimaryButton label="Send reset link" loading={loading} onPress={submit} />
      <FooterLink prompt="Remembered it?" label="Back to sign in" href="/(auth)/login" />
    </AuthShell>
  );
}