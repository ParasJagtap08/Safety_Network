import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ContactsScreen() {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contacts, setContacts] = useState([]);

  // 🔄 Load saved contacts when screen opens
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await AsyncStorage.getItem('contacts');
      if (data) {
        setContacts(JSON.parse(data));
      }
    } catch (error) {
      console.log("Error loading contacts", error);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    } catch (error) {
      console.log("Error saving contacts", error);
    }
  };

  const addContact = () => {
    if (!name || !phone) return;

    const newContact = { id: Date.now().toString(), name, phone };
    const updatedContacts = [...contacts, newContact];

    setContacts(updatedContacts);
    saveContacts(updatedContacts);

    setName('');
    setPhone('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Contacts</Text>

      <TextInput
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Enter Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={addContact}>
        <Text style={styles.buttonText}>Add Contact</Text>
      </TouchableOpacity>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text>{item.name} - {item.phone}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  contactItem: {
    padding: 10,
    borderBottomWidth: 1,
  },
});