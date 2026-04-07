import React, { useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext, AuthProvider } from '@/hooks/authContext';
import { useRouter } from 'expo-router';
import { SOSChoicesProvider } from '@/hooks/sosServicesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

function Home() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  // 🔥 FINAL SOS FUNCTION (WITH AUTO CALL)
  const triggerSOS = async () => {
    try {
      const data = await AsyncStorage.getItem('contacts');

      if (!data) {
        Alert.alert("No emergency contacts found!");
        return;
      }

      const contacts = JSON.parse(data);

      if (contacts.length === 0) {
        Alert.alert("No contacts added!");
        return;
      }

      const firstContact = contacts[0];

      // Show alert
      Alert.alert(
        "🚨 SOS Triggered",
        `Calling ${firstContact.name} (${firstContact.phone})`
      );

      // 📞 AUTO CALL
      Linking.openURL(`tel:${firstContact.phone}`);

    } catch (error) {
      console.log("Error triggering SOS", error);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push('/onbording');
    }
  }, [loading, token, router]);

  // 🔄 Loading screen
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  // 🔴 Not logged in
  if (!token) return null;

  // ✅ MAIN UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Network</Text>

      {/* 🚨 SOS BUTTON */}
      <TouchableOpacity style={styles.button} onPress={triggerSOS}>
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>

      {/* ➕ NAVIGATE TO CONTACTS */}
      <TouchableOpacity onPress={() => router.push('/contacts')}>
        <Text style={styles.link}>Go to Emergency Contacts</Text>
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
  link: {
    marginTop: 20,
    color: 'blue',
    fontSize: 16,
  },
});

// auto call feature added