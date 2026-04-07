import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import * as SMS from "expo-sms";
import { useRouter } from "expo-router";
import ApiConstants from "@/constants/apiConstants";

let Clipboard: any;
try {
  Clipboard = require("expo-clipboard");
} catch (e) {
  Clipboard = {
    setStringAsync: async () => true,
  };
}

const SosScreen = () => {
  const router = useRouter();

  const [sosLink, setSosLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    fetchSosLink();
    loadSavedContacts();
  }, []);

  const loadSavedContacts = async () => {
    try {
      const saved = await AsyncStorage.getItem("trustedContacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch (err) {
      console.log("Error loading contacts:", err);
    }
  };

  const fetchSosLink = async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem("alert");
      if (!data) {
        setSosLink(null);
        return;
      }

      const parsed = JSON.parse(data);
      if (!parsed?.accessCode) {
        setSosLink(null);
        return;
      }

      setSosLink(ApiConstants.WEBSITE_URL + parsed.accessCode);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to get SOS link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!sosLink) return Alert.alert("Error", "No link available");

    try {
      await Clipboard.setStringAsync(sosLink);
      Alert.alert("Copied", "SOS link copied to clipboard");
    } catch {
      if (Platform.OS !== "web" && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync("data:text/plain," + sosLink);
      } else {
        Alert.alert("Error", "Sharing not available");
      }
    }
  };

  const sendSMSToContacts = async () => {
    if (!sosLink) return alert("No SOS link");

    try {
      const saved = await AsyncStorage.getItem("trustedContacts");
      const parsed = saved ? JSON.parse(saved) : [];

      const numbers = parsed
        .map((c: any) => c.phoneNumbers?.[0]?.number)
        .filter((n: string) => n);

      if (numbers.length === 0) return alert("No contacts found");

      const available = await SMS.isAvailableAsync();
      if (!available) return alert("SMS not available");

      const { result } = await SMS.sendSMSAsync(
        numbers,
        `🚨 EMERGENCY! My SOS Link: ${sosLink}`
      );

      alert(result === "sent" ? "SMS Sent" : "SMS Failed");
    } catch (err) {
      console.log(err);
      alert("Error sending SMS");
    }
  };

  const makeEmergencyCall = async () => {
    try {
      const saved = await AsyncStorage.getItem("trustedContacts");
      const parsed = saved ? JSON.parse(saved) : [];

      const number = parsed[0]?.phoneNumbers?.[0]?.number;
      if (!number) return Alert.alert("No contact");

      Linking.openURL(`tel:${number}`);
    } catch (err) {
      console.log(err);
      Alert.alert("Call failed");
    }
  };

  const startSOS = () => {
    setSosActive(true);
    Alert.alert("SOS Activated", "Sending alerts...");
    sendSMSToContacts();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
      </View>

      <View style={styles.content}>
        {!sosActive ? (
          <View style={styles.startContainer}>
            <Text style={styles.startText}>
              Press below button in emergency to alert contacts.
            </Text>

            <TouchableOpacity style={styles.startButton} onPress={startSOS}>
              <Text style={styles.startButtonText}>ACTIVATE SOS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Link:</Text>
              <Text style={styles.codeText}>
                {isLoading ? "Loading..." : sosLink || "No link"}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#28a745" }]}
                onPress={makeEmergencyCall}
              >
                <Text style={styles.buttonText}>Call Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#0d6efd" }]}
                onPress={handleShare}
              >
                <Text style={styles.buttonText}>Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#dc3545" }]}
                onPress={sendSMSToContacts}
              >
                <Text style={styles.buttonText}>Send SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#198754" }]}
                onPress={() => router.push("/(panic)/panicHome")}
              >
                <Text style={styles.buttonText}>Open Dashboard</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default SosScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  header: {
    backgroundColor: "#dc3545",
    padding: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  startContainer: {
    alignItems: "center",
  },

  startText: {
    textAlign: "center",
    marginBottom: 20,
  },

  startButton: {
    backgroundColor: "#dc3545",
    padding: 20,
    borderRadius: 50,
    width: "80%",
    alignItems: "center",
  },

  startButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  codeContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  codeLabel: {
    fontSize: 14,
    color: "#666",
  },

  codeText: {
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonContainer: {
    gap: 10,
  },

  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});