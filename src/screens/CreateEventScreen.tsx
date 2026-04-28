import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function CreateEventScreen() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  const handleCreateEvent = async () => {
    if (!name || !description || !location || !date) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      // 🔥 ACA vas a pegarle a tu API GO
      console.log({
        name,
        description,
        location,
        date,
        user_id: user?.id
      });

      Alert.alert("Éxito", "Evento creado correctamente");

      // reset
      setName('');
      setDescription('');
      setLocation('');
      setDate('');
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el evento");
    }
  };

  // 🔐 validación admin
  if (!user || user.tipo_user !== 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Solo administradores pueden crear eventos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del evento"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
        <Text style={styles.buttonText}>Crear Evento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  button: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 40
  }
});