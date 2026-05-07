import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { addEventToFavorites, removeEventFromFavorites, isEventFavorite, registerEventAttendance, unregisterEventAttendance, getEventById } from '../api/event';

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
  average_score?: number;
  total_score?: number;
  attendees_count?: number;
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
  const [isLoadingEventDetails, setIsLoadingEventDetails] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [selectedClusteredEvent, setSelectedClusteredEvent] = useState<Event | null>(null);

  const currentEvent = selectedClusteredEvent || (event && !event._isCluster ? event : null);

  useEffect(() => {
    if (currentEvent?.id) {
      fetchEventDetails(currentEvent.id);
    }
  }, [currentEvent]);

  const fetchEventDetails = async (eventId: number) => {
    try {
      setIsLoadingEventDetails(true);
      const response = await getEventById(eventId);
      if (response && response.event) {
        setEventDetails({
          ...currentEvent,
          ...response.event,
          attendees_count: response.total_count,
        });
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  const convertEventForDisplay = (eventData: EventWithPlace): Event => ({
    id: eventData.id,
    name: eventData.title,
    description: eventData.description,
    location: eventData.place?.name || 'Ubicación no disponible',
    date: new Date(eventData.event_date).toISOString().split('T')[0],
    category: 'Evento',
    image_url: eventData.image_url,
    details: eventData.description,
  });

  useEffect(() => {
    if (!event) {
      setEventDetails(null);
    }
  }, [event]);

  useEffect(() => {
    if (displayEvent && user && token) {
      checkIfEventIsFavorite();
    }
  }, [displayEvent, user, token]);

  const displayEvent = eventDetails || (event?._isCluster ? selectedClusteredEvent : event);

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
        await removeEventFromFavorites(displayEvent.id, token);
        setIsFavorite(false);
      } else {
        await addEventToFavorites(displayEvent.id, token);
        setIsFavorite(true);
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
        await unregisterEventAttendance(displayEvent.id, token);
        setIsAttending(false);
      } else {
        await registerEventAttendance(displayEvent.id, token);
        setIsAttending(true);
      }
    } catch (error) {
      console.error('❌ Error al actualizar asistencia:', error);
      Alert.alert('Error', 'No se pudo actualizar la asistencia');
    } finally {
      setIsLoadingAttendance(false);
    }
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

  if (event._isCluster && event._clusterEvents) {
    if (selectedClusteredEvent) {
      return renderEventDetail(eventDetails || selectedClusteredEvent);
    }

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
            {event._clusterEvents.map((clusteredEvent) => {
              const displayEvent = convertEventForDisplay(clusteredEvent);
              return (
                <TouchableOpacity
                  key={clusteredEvent.id}
                  style={styles.clusterEventItem}
                  onPress={() => setSelectedClusteredEvent(displayEvent)}
                >
                  {displayEvent.image_url && (
                    <Image source={{ uri: displayEvent.image_url }} style={styles.clusterEventImage} />
                  )}
                  <View style={styles.clusterEventInfo}>
                    <Text style={styles.clusterEventTitle} numberOfLines={2}>{displayEvent.name}</Text>
                    <Text style={styles.clusterEventDate}>📅 {displayEvent.date}</Text>
                    <Text style={styles.clusterEventLocation} numberOfLines={1}>📍 {displayEvent.location}</Text>
                  </View>
                  <Text style={styles.clusterEventArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.closeMainButton} onPress={onClose}>
            <Text style={styles.closeMainButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!displayEvent) {
    return null;
  }

  return renderEventDetail(displayEvent);

  function renderEventDetail(eventToRender: Event) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {eventToRender.image_url ? (
            <Image source={{ uri: eventToRender.image_url }} style={styles.eventImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{eventToRender.name}</Text>

          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
              <Text style={styles.categoryText}>{eventToRender.category}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Información</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 Ubicación:</Text>
              <Text style={styles.infoValue}>{eventToRender.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Fecha:</Text>
              <Text style={styles.infoValue}>{eventToRender.date}</Text>
            </View>

            {eventToRender.average_score !== undefined && eventToRender.average_score !== null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>⭐ Puntaje promedio:</Text>
                <Text style={styles.infoValue}>{eventToRender.average_score.toFixed(1)}</Text>
              </View>
            )}

            {eventToRender.attendees_count !== undefined ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👥 Asistentes:</Text>
                <Text style={styles.infoValue}>{eventToRender.attendees_count}</Text>
              </View>
            ) : eventToRender.attendees !== undefined ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👥 Asistentes:</Text>
                <Text style={styles.infoValue}>{eventToRender.attendees}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
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
              style={[styles.attendButton, isAttending && styles.attendButtonActive]}
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
}
