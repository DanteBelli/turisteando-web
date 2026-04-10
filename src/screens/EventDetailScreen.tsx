import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  category: string;
  image?: string;
  details?: string;
  attendees?: number;
}

interface EventDetailScreenProps {
  event: Event | null;
  onClose: () => void;
}

export default function EventDetailScreen({ event, onClose }: EventDetailScreenProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAttending, setIsAttending] = useState(false);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {event.image && (
          <Image
            source={{ uri: event.image }}
            style={styles.eventImage}
          />
        )}
        
        {!event.image && (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{event.name}</Text>
        
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: '#28A745' }]}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📍 Ubicación:</Text>
            <Text style={styles.infoValue}>{event.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Fecha:</Text>
            <Text style={styles.infoValue}>{event.date}</Text>
          </View>

          {event.attendees && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 Asistentes:</Text>
              <Text style={styles.infoValue}>{event.attendees}</Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {event.details || event.description}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? '❤️ Favorito' : '🤍 Agregar a favoritos'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.attendButton,
              isAttending && styles.attendButtonActive
            ]}
            onPress={() => setIsAttending(!isAttending)}
          >
            <Text style={styles.attendButtonText}>
              {isAttending ? '✓ Voy a asistir' : '+ Voy a asistir'}
            </Text>
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
                <Text style={styles.userName}>{user.nombre} {user.apellido}</Text>
                <Text style={styles.userEmail}>{user.correo}</Text>
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
});
