import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/auth/AuthProvider';

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  return <View style={styles.container}><Text style={styles.eyebrow}>RIZE</Text><Text style={styles.title}>Your momentum starts here.</Text><Text style={styles.email}>{user?.email ?? 'Signed in'}</Text>{user && !user.emailVerified ? <Text style={styles.notice}>Check your inbox to verify your email address.</Text> : null}<Pressable onPress={signOut} style={styles.button}><Text style={styles.buttonText}>Sign out</Text></Pressable></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 28, paddingTop: 80, backgroundColor: '#09090b' }, eyebrow: { color: '#37d998', fontWeight: '800', letterSpacing: 2 }, title: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 20, maxWidth: 340 }, email: { color: '#a3ada8', marginTop: 20 }, notice: { color: '#f2c66d', marginTop: 18, lineHeight: 21 }, button: { marginTop: 40, borderWidth: 1, borderColor: '#37d998', borderRadius: 10, minHeight: 52, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#37d998', fontWeight: '800' } });
