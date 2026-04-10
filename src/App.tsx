import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { CountriesScreen } from './src/screens/CountriesScreen';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Turisteando</Text>
            <Text style={styles.headerSubtitle}>Explorar el mundo</Text>
          </View>
          
          <CountriesScreen />
        </View>
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E0FF',
    marginTop: 4,
  },
});
