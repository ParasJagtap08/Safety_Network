import React, { useContext, useEffect } from 'react';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext, AuthProvider } from '@/hooks/authContext';
import { useRouter } from 'expo-router';
import { SOSChoicesProvider } from '@/hooks/sosServicesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location'; // ✅ ADDED

function Home() {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  // 🚨 FINAL SOS FUNCTION (AUTO CALL + LOCATION)
  const triggerSOS = async () => {
    try {
      const data = await AsyncStorage.getItem('contacts');

      if (!data) {
        Alert.alert("No emergency contacts found!");
        return;
      }

      const contacts = JSON.parse(data);

      if (!contacts || contacts.length === 0) {
        Alert.alert("No contacts added!");
        return;
      }

      const firstContact = contacts[0];

      // 📍 LOCATION PERMISSION
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert("Permission denied for location");
        return;
      }

      // 📍 GET LOCATION
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const locationLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      // 🚨 ALERT WITH LOCATION
      Alert.alert(
        "🚨 SOS Triggered",
        `Calling ${firstContact.name} (${firstContact.phone})\n\nLocation:\n${locationLink}`
      );

      // 📞 CALL
      const url = `tel:${firstContact.phone}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Calling not supported on this device");
      }

    } catch (error) {
      console.log("Error triggering SOS:", error);
    }
  };

  // 📳 SHAKE DETECTION
  useEffect(() => {
    let lastTrigger = 0;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const totalForce = Math.abs(x + y + z);
      const now = Date.now();

      if (totalForce > 1.8) {
        if (now - lastTrigger > 2000) {
          lastTrigger = now;
          triggerSOS();
        }
      }
    });

    Accelerometer.setUpdateInterval(300);

    return () => {
      subscription.remove();
    };
  }, []);

  // 🔐 AUTH CHECK
  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.push('/onbording');
    }
  }, [loading, token]);

  // 🔄 LOADING SCREEN
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking authentication...</Text>
      </View>
    );
  }

  // 🔴 NOT LOGGED IN
  if (!token) return null;

  // ✅ MAIN UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Safety Network</Text>

      {/* 🚨 SOS BUTTON */}
      <TouchableOpacity style={styles.button} onPress={triggerSOS}>
        <Text style={styles.buttonText}>SOS</Text>
      </TouchableOpacity>

      {/* ➕ CONTACTS */}
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

// ✅ FINAL VERSION: Auto Call + Shake + Live Location 🚀