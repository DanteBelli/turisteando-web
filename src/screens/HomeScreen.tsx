import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../api/services';
import { Event } from '../types';

interface HomeScreenProps {
  onNavigate?: (screenName: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAll(1, 100);
        setEvents(data.data || []);
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const quickActions = [
    { id: 'events', label: 'Explorar Eventos', icon: '🔍', color: '#28A745' },
    { id: 'favorites', label: 'Mis Favoritos', icon: '❤️', color: '#FF6B6B' },
    { id: 'messages', label: 'Mensajes', icon: '💬', color: '#4ECDC4' },
    { id: 'profile', label: 'Mi Perfil', icon: '👤', color: '#FFD93D' },
  ];

  const handleQuickAction = (actionId: string) => {
    if (onNavigate) {
      onNavigate(actionId);
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const stats = [
    { label: 'Eventos', value: loadingEvents ? '...' : String(events.length), icon: '📅' },
    { label: 'Favoritos', value: '0', icon: '❤️' },
    { label: 'Asistencias', value: '0', icon: '✓' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Bienvenido de nuevo! 👋</Text>
        <Text style={styles.userName}>{user?.name} {user?.last_name}</Text>
        <Text style={styles.subtitle}>Descubre nuevas experiencias</Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={() => handleQuickAction(action.id)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.upcomingSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          <TouchableOpacity onPress={() => handleQuickAction('events')}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>

        {loadingEvents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#28A745" />
            <Text style={styles.loadingText}>Cargando eventos...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyEvents}>
            <Text style={styles.emptyEventsText}>No hay eventos disponibles por el momento.</Text>
          </View>
        ) : (
          events.slice(0, 5).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.upcomingEventItem}
              onPress={() => handleQuickAction('events')}
            >
              <View style={styles.eventInfo}>
                <Text style={styles.eventIcon}>📍</Text>
                <View style={styles.eventDetails}>
                  <Text style={styles.eventName} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.eventDate}>📅 {formatEventDate(event.event_date as any)}</Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Consejos para viajeros</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Explora categorías</Text>
            <Text style={styles.tipText}>
              Usa los filtros para encontrar eventos según tus intereses.
            </Text>
          </View>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>🔔</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>No te pierdas nada</Text>
            <Text style={styles.tipText}>
              Revisá los eventos disponibles y confirmá tu asistencia.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#28A745',
  },
  greeting: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  upcomingSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  emptyEvents: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyEventsText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  upcomingEventItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 20,
    color: '#28A745',
    marginLeft: 8,
  },
  tipsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#28A745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});