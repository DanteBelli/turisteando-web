import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserFavorites, removeEventFromFavorites } from '../api/event';
import EventDetailScreen from './EventDetailScreen';

interface FavoriteEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  place_id?: number;
  image_url?: string;
}

export default function FavoritesScreen() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FavoriteEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const favoriteEvents = await getUserFavorites(token);
        setFavorites(favoriteEvents);
      } catch (error) {
        console.error('Error cargando favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token]);

  const handleRemoveFavorite = async (id: number) => {
    if (!token) {
      Alert.alert('Error', 'No autenticado');
      return;
    }

    try {
      await removeEventFromFavorites(id, token);
      setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      Alert.alert('Error', 'No se pudo eliminar el favorito');
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteEvent }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.favoriteTitle}>{item.title}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
            <Text style={styles.categoryText}>Favorito</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Text style={styles.removeIcon}>❤️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.detailButton}
        onPress={() => {
          setSelectedEvent(item);
          setModalVisible(true);
        }}
      >
        <Text style={styles.detailText}>Ver Detalle</Text>
      </TouchableOpacity>

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>� {new Date(item.event_date).toLocaleDateString('es-ES')}</Text>
        <Text style={styles.infoText}>Lugar ID: {item.place_id ?? 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <React.Fragment>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Mis Favoritos</Text>
        <Text style={styles.favoritesCount}>{favorites.length} guardados</Text>
      </View>

      {!token ? (
        <ScrollView style={styles.emptyContainer}>
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyTitle}>Inicia sesión para ver tus favoritos</Text>
            <Text style={styles.emptyText}>Los eventos guardados se cargan desde tu cuenta.</Text>
          </View>
        </ScrollView>
      ) : loading ? (
        <View style={[styles.emptyContainer, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#28A745" />
          <Text style={styles.loadingText}>Cargando tus favoritos...</Text>
        </View>
      ) : favorites.length === 0 ? (
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

    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <EventDetailScreen
        event={selectedEvent ? {
          id: selectedEvent.id,
          name: selectedEvent.title,
          description: selectedEvent.description,
          location: `Place ID: ${selectedEvent.place_id ?? 'N/A'}`,
          date: selectedEvent.event_date,
          category: 'Favorito',
          image_url: selectedEvent.image_url,
        } : null}
        onClose={() => setModalVisible(false)}
      />
    </Modal>
    </React.Fragment>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
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
  detailButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
