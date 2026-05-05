import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../api/services';
import { Event, Place } from '../types';
import EventDetailScreen from './EventDetailScreen';
import { CategoryFilterModal } from '../components/CategoryFilterModal';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface EventWithPlace extends Event {
  place?: Place;
  latitude?: number;
  longitude?: number;
}

export const EventsScreen: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventWithPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventWithPlace | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Handle applying category filters
  const handleApplyFilter = async (categoryIds: number[]) => {
    try {
      setLoading(true);
      setShowFilterModal(false);
      setSelectedCategoryIds(categoryIds);
      
      let eventsData;
      if (categoryIds.length === 0) {
        // If no categories selected, fetch all events
        eventsData = await eventService.getAllWithPlaces();
      } else {
        // Fetch events filtered by selected categories
        eventsData = await eventService.getEventsByCategories(categoryIds);
      }

      // Apply date filter if selected
      let filteredEvents = eventsData;
      if (selectedDate) {
        filteredEvents = eventsData.filter(event => {
          const eventDate = new Date(event.event_date).toISOString().split('T')[0];
          return eventDate === selectedDate;
        });
      }

      // Extract latitude and longitude from place (IMPORTANT: same as initial load)
      const eventsWithCoordinates = filteredEvents.map((event: EventWithPlace) => {
        const lat = event.place?.latitude || event.latitude;
        const lng = event.place?.longitude || event.longitude;
        return {
          ...event,
          latitude: lat,
          longitude: lng
        };
      });
      
      setEvents(eventsWithCoordinates);
      setLoading(false);
    } catch (err) {
      console.error('Error applying filter:', err);
      setError('Error al filtrar eventos');
      setLoading(false);
    }
  };

  // Handle clearing filters
  const handleClearFilter = async () => {
    try {
      setLoading(true);
      setShowFilterModal(false);
      setSelectedCategoryIds([]);
      setSelectedDate('');
      
      // Reload all events
      const eventsData = await eventService.getAllWithPlaces();
      
      // Extract coordinates
      const eventsWithCoordinates = eventsData.map((event: EventWithPlace) => {
        const lat = event.place?.latitude || event.latitude;
        const lng = event.place?.longitude || event.longitude;
        return {
          ...event,
          latitude: lat,
          longitude: lng
        };
      });
      
      setEvents(eventsWithCoordinates);
      setLoading(false);
    } catch (err) {
      console.error('Error clearing filters:', err);
      setError('Error al cargar los eventos');
      setLoading(false);
    }
  };

  // Handle date filter change
  const handleDateChange = async (date: string) => {
    try {
      setLoading(true);
      setSelectedDate(date);
      
      let eventsData;
      if (selectedCategoryIds.length === 0) {
        // If no categories selected, fetch all events
        eventsData = await eventService.getAllWithPlaces();
      } else {
        // Fetch events filtered by selected categories
        eventsData = await eventService.getEventsByCategories(selectedCategoryIds);
      }

      // Apply date filter if selected
      let filteredEvents = eventsData;
      if (date) {
        filteredEvents = eventsData.filter(event => {
          const eventDate = new Date(event.event_date).toISOString().split('T')[0];
          return eventDate === date;
        });
      }

      // Extract coordinates
      const eventsWithCoordinates = filteredEvents.map((event: EventWithPlace) => {
        const lat = event.place?.latitude || event.latitude;
        const lng = event.place?.longitude || event.longitude;
        return {
          ...event,
          latitude: lat,
          longitude: lng
        };
      });
      
      setEvents(eventsWithCoordinates);
      setLoading(false);
    } catch (err) {
      console.error('Error applying date filter:', err);
      setError('Error al filtrar eventos por fecha');
      setLoading(false);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps ya estaba cargado');
        setMapLoaded(true);
        return;
      }

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      console.log('🔑 API Key presente:', !!apiKey);
      if (!apiKey) {
        setError('Google Maps API key no configurado');
        setLoading(false);
        return;
      }

      console.log('📡 Intentando cargar script de Google Maps...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Script de Google Maps cargado exitosamente!');
        setMapLoaded(true);
      };
      script.onerror = () => {
        console.error('❌ Error al cargar Google Maps - Verifica restricciones HTTP Referrer en Google Cloud Console');
        setError('No se pudo cargar Google Maps. Verifica que configuraste HTTP Referrer en Google Cloud.');
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching events...');
        const eventsData = await eventService.getAllWithPlaces();
        
        // Add latitude and longitude from place
        const eventsWithCoordinates = eventsData.map((event: EventWithPlace) => {
          const lat = event.place?.latitude || event.latitude;
          const lng = event.place?.longitude || event.longitude;
          return {
            ...event,
            latitude: lat,
            longitude: lng
          };
        });
        
        console.log('Events with coordinates:', eventsWithCoordinates);
        setEvents(eventsWithCoordinates);
        console.log('Events loaded:', eventsWithCoordinates.length, eventsWithCoordinates);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Error al cargar los eventos. Por favor intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Initialize and update map with markers
  useEffect(() => {
    console.log('🗺️ useEffect mapa:', { mapLoaded, eventsCount: events.length, mapDOMExists: !!document.getElementById('map') });
    
    if (!mapLoaded || events.length === 0 || !document.getElementById('map')) {
      return;
    }

    const initializeMap = () => {
      const mapElement = document.getElementById('map');
      console.log('📍 Inicializando mapa. Elemento DOM:', !!mapElement);
      if (!mapElement) return;

      try {
        // Find bounds for all events
        const bounds = new window.google.maps.LatLngBounds();
        let hasValidCoordinates = false;

        // Default center (Buenos Aires)
        const defaultCenter = { lat: -34.6037, lng: -58.3816 };

        // Create map
        const mapOptions: any = {
          zoom: 13,
          center: defaultCenter,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#616161' }]
            }
          ]
        };

        const googleMap = new window.google.maps.Map(mapElement, mapOptions);
        console.log('✅ Mapa de Google Maps creado exitosamente');

        // Agrupar eventos por ubicación (clustering)
        const locationMap = new Map<string, EventWithPlace[]>();
        events.forEach((event) => {
          if (event.latitude && event.longitude) {
            // Redondear a 4 decimales para agrupar eventos cercanos
            const key = `${event.latitude.toFixed(4)},${event.longitude.toFixed(4)}`;
            if (!locationMap.has(key)) {
              locationMap.set(key, []);
            }
            locationMap.get(key)!.push(event);
          }
        });

        // Crear marcadores agrupados
        const newMarkers: any[] = [];
        locationMap.forEach((eventsAtLocation, key) => {
          if (eventsAtLocation.length === 0) return;

          hasValidCoordinates = true;
          const firstEvent = eventsAtLocation[0];
          const position = { lat: firstEvent.latitude!, lng: firstEvent.longitude! };
          bounds.extend(position);

          console.log(`📍 Cluster en ${key}: ${eventsAtLocation.length} evento(s)`);

          // Crear marcador agrupado
          const markerColor = eventsAtLocation.length === 1 ? '#28A745' : '#FF9800';
          const markerScale = eventsAtLocation.length === 1 ? 10 : 14;

          const marker = new window.google.maps.Marker({
            map: googleMap,
            position: position,
            title: eventsAtLocation.length === 1 
              ? eventsAtLocation[0].title 
              : `${eventsAtLocation.length} eventos`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: markerScale,
              fillColor: markerColor,
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            },
            label: eventsAtLocation.length > 1 
              ? {
                  text: eventsAtLocation.length.toString(),
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }
              : undefined
          });

          // Si hay un solo evento, mostrar info directamente
          if (eventsAtLocation.length === 1) {
            const event = eventsAtLocation[0];
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; color: #333;">${event.title}</h3>
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${event.place?.name}</p>
                  <p style="margin: 0; font-size: 11px; color: #999;">${new Date(event.event_date).toLocaleDateString('es-ES')}</p>
                </div>
              `,
              maxWidth: 300
            });

            marker.addListener('click', () => {
              setSelectedEvent(event);
              setShowEventDetail(true);
            });

            newMarkers.push({ event, marker, position, infoWindow });
          } else {
            // Si hay múltiples eventos, mostrar lista en modal
            marker.addListener('click', () => {
              setSelectedEvent({
                ...eventsAtLocation[0],
                // Marca este como cluster para mostrar lista
                _isCluster: true,
                _clusterEvents: eventsAtLocation
              } as any);
              setShowEventDetail(true);
            });

            newMarkers.push({
              marker,
              position,
              eventsAtLocation,
              isCluster: true
            });
          }
        });

        console.log(`✅ ${newMarkers.length} markers creados`);

        // Fit bounds if we have valid coordinates
        if (hasValidCoordinates && newMarkers.length > 0) {
          console.log('Fitear bounds al mapa...');
          googleMap.fitBounds(bounds);
          setTimeout(() => {
            const zoom = googleMap.getZoom();
            if (zoom && zoom > 15) {
              googleMap.setZoom(15);
            }
          }, 100);
        } else {
          console.log('Sin coordenadas válidas. Centrando en Buenos Aires...');
          googleMap.setZoom(13);
        }

        setMap(googleMap);
        setMarkers(newMarkers);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Error al inicializar el mapa');
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(initializeMap, 100);
  }, [mapLoaded, events]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28A745" />
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      </View>
    );
  }

  if (error && !mapLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>📍 Eventos en el Mapa</Text>
          <Text style={styles.subtitle}>{events.length} eventos disponibles</Text>
        </View>
        <View style={styles.filterContainer}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={styles.dateInput}
            placeholder="Seleccionar fecha"
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategoryIds.length > 0 && styles.filterButtonActive
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterButtonText}>🔍 Filtros</Text>
            {selectedCategoryIds.length > 0 && (
              <Text style={styles.filterBadge}>{selectedCategoryIds.length}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <div
          id="map"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </View>

      {/* Event Detail Modal */}
      <Modal
        visible={showEventDetail}
        animationType="slide"
        onRequestClose={() => setShowEventDetail(false)}
      >
        <EventDetailScreen
          event={selectedEvent ? {
            id: selectedEvent.id as any,
            name: selectedEvent.title,
            category: 'Evento',
            location: selectedEvent.place?.name || 'Ubicación no disponible',
            date: new Date(selectedEvent.event_date).toISOString().split('T')[0],
            description: selectedEvent.description,
            details: selectedEvent.description,
            image_url: selectedEvent.image_url,
            _isCluster: (selectedEvent as any)._isCluster,
            _clusterEvents: (selectedEvent as any)._clusterEvents
          } : null}
          onClose={() => setShowEventDetail(false)}
        />
      </Modal>

      {/* Category Filter Modal */}
      <CategoryFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
        selectedCategoryIds={selectedCategoryIds}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28A745',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 14,
    marginRight: 8,
    backgroundColor: '#fff',
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#28A745',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  filterBadge: {
    backgroundColor: '#28A745',
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsScreen;