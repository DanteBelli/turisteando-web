import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addEventToFavorites, removeEventFromFavorites, isEventFavorite, registerEventAttendance, unregisterEventAttendance } from '../api/event';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  category: string;
  image_url?: string;
  details?: string;
  attendees?: number;
  _isCluster?: boolean;
  _clusterEvents?: EventWithPlace[];
}

interface EventWithPlace {
  id: number;
  title: string;
  description: string;
  event_date: string;
  place?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

interface EventDetailScreenProps {
  event: Event | null;
  onClose: () => void;
}

export default function EventDetailScreen({ event, onClose }: EventDetailScreenProps) {
  const { user, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [selectedClusteredEvent, setSelectedClusteredEvent] = useState<Event | null>(null);

  // Convertir evento del cluster al formato esperado
  const convertEventForDisplay = (eventData: EventWithPlace): Event => {
    return {
      id: eventData.id,
      name: eventData.title,
      description: eventData.description,
      location: eventData.place?.name || 'Ubicación no disponible',
      date: new Date(eventData.event_date).toISOString().split('T')[0],
      category: 'Evento',
      image_url: eventData.image_url,
      details: eventData.description
    };
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.noEventText}>No event selected</Text>
      </View>
    );
  }

  // Si es un evento individual (no cluster), usar directamente
  const displayEvent = event._isCluster ? null : event;

  // Cargar estado de favorito cuando se abre el evento
  useEffect(() => {
    if (displayEvent && user && token) {
      checkIfEventIsFavorite();
    }
  }, [displayEvent, user, token]);

  const checkIfEventIsFavorite = async () => {
    if (!displayEvent || !token) return;
    
    try {
      const favorite = await isEventFavorite(displayEvent.id, token);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!displayEvent || !user || !token) {
      Alert.alert('Error', 'Debes estar autenticado');
      return;
    }

    setIsLoadingFavorite(true);

    try {
      if (isFavorite) {
        // Remover de favoritos
        await removeEventFromFavorites(displayEvent.id, token);
        setIsFavorite(false);
        console.log('✅ Evento eliminado de favoritos');
      } else {
        // Agregar a favoritos
        await addEventToFavorites(displayEvent.id, token);
        setIsFavorite(true);
        console.log('✅ Evento agregado a favoritos');
      }
    } catch (error) {
      console.error('❌ Error al actualizar favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar los favoritos');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleToggleAttendance = async () => {
    if (!displayEvent || !user || !token) {
      Alert.alert('Error', 'Debes estar autenticado');
      return;
    }

    setIsLoadingAttendance(true);

    try {
      if (isAttending) {
        // Desregistrar de la asistencia
        await unregisterEventAttendance(displayEvent.id, token);
        setIsAttending(false);
        console.log('✅ Desregistrado de la asistencia');
      } else {
        // Registrar la asistencia
        await registerEventAttendance(displayEvent.id, token);
        setIsAttending(true);
        console.log('✅ Registrado para asistir');
      }
    } catch (error) {
      console.error('❌ Error al actualizar asistencia:', error);
      Alert.alert('Error', 'No se pudo actualizar la asistencia');
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  // Mostrar lista de eventos si es un cluster
  if (event._isCluster && event._clusterEvents) {
    // Si hay un evento seleccionado del cluster, mostrar su detalle
    if (selectedClusteredEvent) {
      return (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSelectedClusteredEvent(null)}
            >
              <Text style={styles.closeButtonText}>‹</Text>
            </TouchableOpacity>
            
            {selectedClusteredEvent.image_url ? (
              <Image
                source={{ uri: selectedClusteredEvent.image_url }}
                style={styles.eventImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📷</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{selectedClusteredEvent.name}</Text>
            
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
                <Text style={styles.categoryText}>{selectedClusteredEvent.category}</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Información</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Ubicación:</Text>
                <Text style={styles.infoValue}>{selectedClusteredEvent.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Fecha:</Text>
                <Text style={styles.infoValue}>{selectedClusteredEvent.date}</Text>
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>
                {selectedClusteredEvent.details || selectedClusteredEvent.description}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeMainButton}
              onPress={() => setSelectedClusteredEvent(null)}
            >
              <Text style={styles.closeMainButtonText}>Volver a eventos</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    // Mostrar lista de eventos del cluster
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>📍 {event._clusterEvents.length} Eventos en esta ubicación</Text>

          <View style={styles.clusterListContainer}>
            {event._clusterEvents.map((clusteredEvent, index) => {
              const displayEvent = convertEventForDisplay(clusteredEvent);
              return (
                <TouchableOpacity
                  key={clusteredEvent.id}
                  style={styles.clusterEventItem}
                  onPress={() => setSelectedClusteredEvent(displayEvent)}
                >
                  {displayEvent.image_url && (
                    <Image
                      source={{ uri: displayEvent.image_url }}
                      style={styles.clusterEventImage}
                    />
                  )}
                  <View style={styles.clusterEventInfo}>
                    <Text style={styles.clusterEventTitle} numberOfLines={2}>{displayEvent.name}</Text>
                    <Text style={styles.clusterEventDate}>
                      📅 {displayEvent.date}
                    </Text>
                    <Text style={styles.clusterEventLocation} numberOfLines={1}>
                      📍 {displayEvent.location}
                    </Text>
                  </View>
                  <Text style={styles.clusterEventArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.closeMainButton}
            onPress={onClose}
          >
            <Text style={styles.closeMainButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {displayEvent.image_url ? (
          <Image
            source={{ uri: displayEvent.image_url }}
            style={styles.eventImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{displayEvent.name}</Text>
        
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
            <Text style={styles.categoryText}>{displayEvent.category}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Ubicación:</Text>
            <Text style={styles.infoValue}>{displayEvent.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Fecha:</Text>
            <Text style={styles.infoValue}>{displayEvent.date}</Text>
          </View>

          {displayEvent.attendees && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 Asistentes:</Text>
              <Text style={styles.infoValue}>{displayEvent.attendees}</Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {displayEvent.details || displayEvent.description}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={handleToggleFavorite}
            disabled={isLoadingFavorite}
          >
            {isLoadingFavorite ? (
              <ActivityIndicator size="small" color={isFavorite ? '#fff' : '#28A745'} />
            ) : (
              <Text style={[styles.favoriteButtonText, isFavorite && { color: '#fff' }]}>
                {isFavorite ? '❤️ Favorito' : '🤍 Agregar a favoritos'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.attendButton,
              isAttending && styles.attendButtonActive
            ]}
            onPress={handleToggleAttendance}
            disabled={isLoadingAttendance}
          >
            {isLoadingAttendance ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.attendButtonText}>
                {isAttending ? '✓ Voy a asistir' : '+ Voy a asistir'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Detalles del evento</Text>
          <View style={styles.detailsCard}>
            <Text style={styles.detailsText}>
              Este evento es organizado como parte de la experiencia turística de Turisteando. 
              Disfruta de la experiencia y comparte con otros viajeros.
            </Text>
          </View>

          {user && (
            <View style={styles.userSection}>
              <Text style={styles.sectionTitle}>Tu perfil</Text>
              <View style={styles.userCard}>
                <Text style={styles.userName}>{user.name} {user.last_name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.closeMainButton}
          onPress={onClose}
        >
          <Text style={styles.closeMainButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  eventImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
  },
  placeholderImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 80,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    color: '#333',
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  favoriteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#28A745',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#28A745',
  },
  favoriteButtonText: {
    color: '#28A745',
    fontWeight: '600',
    fontSize: 14,
  },
  attendButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendButtonActive: {
    backgroundColor: '#1e7e34',
  },
  attendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSection: {
    marginBottom: 20,
  },
  detailsCard: {
    backgroundColor: '#f0f7f0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
    marginBottom: 20,
  },
  detailsText: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
  userSection: {
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
  },
  closeMainButton: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeMainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noEventText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
  clusterListContainer: {
    marginBottom: 20,
  },
  clusterEventItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  clusterEventImage: {
    width: 80,
    height: 80,
    backgroundColor: '#ddd',
  },
  clusterEventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  clusterEventTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontSize: 14,
  },
  clusterEventDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  clusterEventLocation: {
    fontSize: 12,
    color: '#999',
  },
  clusterEventArrow: {
    fontSize: 20,
    color: '#28A745',
    marginRight: 12,
  },
});
