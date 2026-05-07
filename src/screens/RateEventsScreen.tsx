import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getPastEventsToRate, rateEvent } from '../api/event';
import { Event } from '../types/event';

export default function RateEventsScreen() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingEvent, setRatingEvent] = useState<Event | null>(null);
  const [score, setScore] = useState<number>(5);
  const [review, setReview] = useState<string>('');

  useEffect(() => {
    if (user && token) {
      loadPastEvents();
    }
  }, [user, token]);

  const loadPastEvents = async () => {
    try {
      const pastEvents = await getPastEventsToRate(user!.id, token!);
      setEvents(pastEvents);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los eventos pasados');
    } finally {
      setLoading(false);
    }
  };

  const handleRateEvent = async () => {
    if (!ratingEvent) return;

    try {
      await rateEvent(ratingEvent.id, { score, review }, token!);
      Alert.alert('Éxito', 'Evento puntuado correctamente');
      setRatingEvent(null);
      setScore(5);
      setReview('');
      loadPastEvents(); // Recargar la lista
    } catch (error) {
      Alert.alert('Error', 'No se pudo puntuar el evento');
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => setRatingEvent(item)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>
        {new Date(item.event_date).toLocaleDateString()}
      </Text>
      <Text style={styles.rateText}>Toca para puntuar</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (ratingEvent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Puntuar Evento</Text>
        <Text style={styles.eventTitle}>{ratingEvent.title}</Text>

        <Text style={styles.label}>Calificación (1-10):</Text>
        <View style={styles.scoreContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[styles.scoreButton, score === num && styles.scoreButtonActive]}
              onPress={() => setScore(num)}
            >
              <Text style={[styles.scoreText, score === num && styles.scoreTextActive]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Review (opcional):</Text>
        <TextInput
          style={styles.reviewInput}
          value={review}
          onChangeText={setReview}
          placeholder="Escribe tu review..."
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setRatingEvent(null)}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleRateEvent}>
            <Text style={styles.submitButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos para Puntuar</Text>
      {events.length === 0 ? (
        <Text style={styles.noEvents}>No hay eventos pasados para puntuar</Text>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rateText: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#fff',
  },
  scoreButtonActive: {
    backgroundColor: '#28A745',
  },
  scoreText: {
    fontSize: 16,
    color: '#28A745',
    fontWeight: '600',
  },
  scoreTextActive: {
    color: '#fff',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#6c757d',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  noEvents: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
});