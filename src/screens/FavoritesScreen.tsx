import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface FavoriteEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  category: string;
  savedDate: string;
}

const MOCK_FAVORITES: FavoriteEvent[] = [
  {
    id: 1,
    name: 'Cafe Buenos Aires',
    description: 'Disfruta de un auténtico café porteño',
    location: 'San Telmo, CABA',
    date: '2026-04-15',
    category: 'Gastronomía',
    savedDate: '2 días ago'
  },
  {
    id: 3,
    name: 'Festival Gastronómico',
    description: 'Prueba los mejores platos de la región',
    location: 'Recoleta, CABA',
    date: '2026-04-25',
    category: 'Gastronomía',
    savedDate: '1 semana ago'
  }
];

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>(MOCK_FAVORITES);

  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteEvent }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.favoriteTitle}>{item.name}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Text style={styles.removeIcon}>❤️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📍 {item.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>📅 {item.date}</Text>
        <Text style={styles.savedDate}>Guardado: {item.savedDate}</Text>
      </View>

      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>Ver Detalle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Mis Favoritos</Text>
        <Text style={styles.favoritesCount}>{favorites.length} guardados</Text>
      </View>

      {favorites.length === 0 ? (
        <ScrollView style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={styles.emptyTitle}>No tienes favoritos aún</Text>
            <Text style={styles.emptyText}>
              Guarda tus eventos favoritos haciendo click en el corazón para acceder rápidamente.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 4,
  },
  favoritesCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
  },
  savedDate: {
    fontSize: 12,
    color: '#999',
  },
  viewButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
