import React, { useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext, AuthProvider } from '@/hooks/authContext';
import { useRouter } from 'expo-router';
import { SOSChoicesProvider } from '@/hooks/sosServicesContext';

function Home() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  const triggerSOS = () => {
    Alert.alert("SOS Triggered!");
  };

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push('/onbording');
    }
  }, [loading, token, router]);

  // 🔄 SHOW LOADING
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  // 🔴 IF NOT LOGGED IN → NOTHING (REDIRECT WILL HAPPEN)
  if (!token) return null;

  // ✅ MAIN UI (YOUR CONTRIBUTION)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Network</Text>

      <TouchableOpacity style={styles.button} onPress={triggerSOS}>
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SOSChoicesProvider>
        <Home />
      </SOSChoicesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
    fontWeight: 'bold',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

