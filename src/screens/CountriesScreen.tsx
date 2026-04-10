import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useData } from '../context/DataContext';
import { Loading, ErrorBanner } from '../components/Common';
import { Country } from '../types';

export const CountriesScreen: React.FC = () => {
  const { countries, isLoadingCountries, error, fetchCountries, clearError } = useData();

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  if (isLoadingCountries) {
    return <Loading message="Loading countries..." />;
  }

  const renderCountry = ({ item }: { item: Country }) => (
    <View style={styles.countryCard}>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {error && <ErrorBanner message={error} onRetry={clearError} />}

      <FlatList
        data={countries}
        renderItem={renderCountry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No countries found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  countryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  countryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
