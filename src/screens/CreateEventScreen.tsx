import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { createEvent, createPlace, getPlaces, Place } from '../api/event';

declare global {
  interface Window {
    google: any;
  }
}

export default function CreateEventScreen() {
  const { user, token } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [image, setImage] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number; placeId?: number } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [places, setPlaces] = useState<Place[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Estado para modal de nuevo place
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [placeErrors, setPlaceErrors] = useState<{ name?: boolean; description?: boolean }>({});
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey) {
        console.warn('Google Maps API key no configurado');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        console.error('Error al cargar Google Maps');
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Inicializar mapa cuando modal se abre
  useEffect(() => {
    if (showMapModal && mapLoaded && document.getElementById('map-location-picker')) {
      initializeLocationMap();
    }
  }, [showMapModal, mapLoaded]);

  const initializeLocationMap = async () => {
    const mapElement = document.getElementById('map-location-picker');
    if (!mapElement || !window.google) {
      console.error('❌ Map element o Google Maps no disponible');
      return;
    }

    const defaultCenter = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

    const mapOptions = {
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
    console.log('✅ Mapa inicializado');

    // Cargar places desde la API
    console.log('📍 Cargando places...');
    const loadedPlaces = await getPlaces();
    console.log('✅ Places cargados:', loadedPlaces);
    
    setPlaces(loadedPlaces);

    if (!Array.isArray(loadedPlaces)) {
      console.error('❌ loadedPlaces no es un array:', loadedPlaces);
      return;
    }

    let selectedMarker: any = null;

    // Mostrar markers de los places existentes
    console.log(`📌 Agregando ${loadedPlaces.length} marcadores...`);
    loadedPlaces.forEach((place) => {
      if (place.latitude && place.longitude) {
        const marker = new window.google.maps.Marker({
          map: googleMap,
          position: { lat: place.latitude, lng: place.longitude },
          title: place.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4ECDC4',
            fillOpacity: 0.8,
            strokeColor: '#fff',
            strokeWeight: 2
          }
        });

        marker.addListener('click', () => {
          // Eliminar marcador anterior
          if (selectedMarker) {
            selectedMarker.setMap(null);
          }

          // Crear nuevo marcador para selección
          selectedMarker = new window.google.maps.Marker({
            map: googleMap,
            position: { lat: place.latitude!, lng: place.longitude! },
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#FF6B6B',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          });

          setLatitude(place.latitude!);
          setLongitude(place.longitude!);
          setSelectedLocation({
            name: place.name,
            lat: place.latitude!,
            lng: place.longitude!,
            placeId: place.id
          });
          console.log('✅ Place seleccionado:', place.name, place.id);
        });
      }
    });

    // Crear marcador inicial si ya hay ubicación seleccionada
    if (selectedLocation && !selectedLocation.placeId) {
      selectedMarker = new window.google.maps.Marker({
        map: googleMap,
        position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
        title: selectedLocation.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      });
    }

    // Click en el mapa para crear nueva ubicación
    googleMap.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Verificar si el click fue en un marcador existente
      let clickedOnMarker = false;
      loadedPlaces.forEach((place) => {
        if (place.latitude && place.longitude) {
          const distance = Math.sqrt(
            Math.pow(lat - place.latitude, 2) + Math.pow(lng - place.longitude, 2)
          );
          // Si está dentro de ~0.001 grados (~100 metros), consideramos que clickeó en el marcador
          if (distance < 0.01) {
            clickedOnMarker = true;
          }
        }
      });

      // Si clickeó en un marcador existente, no hacer nada (ya se manejó con el listener del marcador)
      if (clickedOnMarker) return;

      // Si clickeó en un punto vacío, mostrar modal para crear nuevo place
      setPendingLocation({ lat, lng });
      setPlaceName('');
      setPlaceDescription('');
      setPlaceErrors({});
      setShowPlaceModal(true);

      console.log('📍 Nueva ubicación - Abriendo modal para ingresar datos del place');
    });
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleConfirmPlace = () => {
    // Validar que se ingresaron nombre y descripción
    const errors: { name?: boolean; description?: boolean } = {};
    
    if (!placeName.trim()) {
      errors.name = true;
    }
    if (!placeDescription.trim()) {
      errors.description = true;
    }

    if (Object.keys(errors).length > 0) {
      setPlaceErrors(errors);
      return;
    }

    // Guardar ubicación con nombre y descripción del place
    if (pendingLocation) {
      setLatitude(pendingLocation.lat);
      setLongitude(pendingLocation.lng);
      setSelectedLocation({
        name: placeName,
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        placeId: undefined
      });
      console.log('✅ Ubicación guardada:', placeName, pendingLocation.lat, pendingLocation.lng);

      // Cerrar modal
      setShowPlaceModal(false);
      setPendingLocation(null);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      return '';
    }
  };

  const handleCreateEvent = async () => {
    // Validar campos
    const newErrors: { [key: string]: boolean } = {};

    if (!image) newErrors.image = true;
    if (!name) newErrors.name = true;
    if (!description) newErrors.description = true;
    if (!date) newErrors.date = true;
    if (!time) newErrors.time = true;
    if (!selectedLocation) newErrors.location = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (!token || !user) {
      Alert.alert("Error", "No autenticado");
      return;
    }

    setIsCreating(true);

    try {
      // Convertir imagen a base64
      const imageBase64 = await convertImageToBase64(image!);

      let placeId: number;

      // Si hay placeId seleccionado, usarlo
      if (selectedLocation?.placeId) {
        placeId = selectedLocation.placeId;
      } else {
        // Si no, crear un nuevo place
        console.log('📍 Creando nuevo lugar...');
        const newPlaceResponse = await createPlace(
          {
            name: selectedLocation!.name,
            city_id: 1, // Default city ID - Buenos Aires
            country_id: 1, // Default country ID - Argentina
            latitude: selectedLocation!.lat,
            longitude: selectedLocation!.lng,
            description: `Ubicación para evento: ${name}`
          },
          token
        );

        placeId = newPlaceResponse.data.place_id;
        console.log('✅ Lugar creado con ID:', placeId);
      }

      // Combinar fecha y hora en formato ISO
      const eventDateTime = `${date}T${time}:00Z`;

      // Crear evento
      console.log('📝 Creando evento...');
      const eventResponse = await createEvent(
        {
          title: name,
          description: description,
          place_id: placeId,
          event_date: eventDateTime,
          image_url: imageBase64,
          total_score: 0,
          average_score: 0
        },
        token
      );

      console.log('✅ Evento creado exitosamente:', eventResponse.data);

      Alert.alert("✅ Éxito", "Evento creado correctamente");

      // Reset
      setName('');
      setDescription('');
      setImage(null);
      setDate('');
      setTime('12:00');
      setLatitude(null);
      setLongitude(null);
      setSelectedLocation(null);
      setErrors({});
      setIsCreating(false);
    } catch (error: any) {
      console.error('❌ Error al crear evento:', error);
      const errorMessage = error.response?.data?.error || 'No se pudo crear el evento';
      Alert.alert("Error", errorMessage);
      setIsCreating(false);
    }
  };

  // 🔐 validación admin
  if (!user || user.tipo_user !== 4) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Solo administradores pueden crear eventos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Evento</Text>

      {/* Image Picker */}
      <TouchableOpacity 
        style={[
          styles.imagePickerButton,
          errors.image && styles.errorBorder
        ]} 
        onPress={handlePickImage}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>📷 Seleccionar Imagen</Text>
          </View>
        )}
      </TouchableOpacity>
      {errors.image && <Text style={styles.errorText}>La imagen es obligatoria</Text>}

      {/* Event Name */}
      <TextInput
        style={[styles.input, errors.name && styles.errorInput]}
        placeholder="Nombre del evento"
        value={name}
        onChangeText={(text) => {
          setName(text);
          if (text) setErrors({ ...errors, name: false });
        }}
        placeholderTextColor="#999"
      />
      {errors.name && <Text style={styles.errorText}>El nombre es obligatorio</Text>}

      {/* Description */}
      <TextInput
        style={[styles.input, styles.textAreaInput, errors.description && styles.errorInput]}
        placeholder="Descripción"
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          if (text) setErrors({ ...errors, description: false });
        }}
        multiline
        numberOfLines={4}
        placeholderTextColor="#999"
      />
      {errors.description && <Text style={styles.errorText}>La descripción es obligatoria</Text>}

      {/* Date Input */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeWrapper}>
          <Text style={styles.label}>📅 Fecha</Text>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (e.target.value) setErrors({ ...errors, date: false });
            }}
            style={{
              borderWidth: 1,
              borderColor: errors.date ? '#FF4444' : '#ddd',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 16,
              backgroundColor: errors.date ? '#FFE4E4' : '#f9f9f9',
              fontFamily: 'inherit',
              width: '100%',
              boxSizing: 'border-box'
            } as any}
          />
        </View>
        {errors.date && <Text style={styles.errorText}>La fecha es obligatoria</Text>}
      </View>

      {/* Time Input */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeWrapper}>
          <Text style={styles.label}>⏰ Hora</Text>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              if (e.target.value) setErrors({ ...errors, time: false });
            }}
            style={{
              borderWidth: 1,
              borderColor: errors.time ? '#FF4444' : '#ddd',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 16,
              backgroundColor: errors.time ? '#FFE4E4' : '#f9f9f9',
              fontFamily: 'inherit',
              width: '100%',
              boxSizing: 'border-box'
            } as any}
          />
        </View>
        {errors.time && <Text style={styles.errorText}>La hora es obligatoria</Text>}
      </View>

      {/* Location Picker */}
      <TouchableOpacity
        style={[styles.input, { backgroundColor: selectedLocation ? '#E8F5E9' : '#f5f5f5' }, errors.location && styles.errorInput]}
        onPress={() => setShowMapModal(true)}
      >
        <Text style={{ color: selectedLocation ? '#28A745' : '#999' }}>
          📍 {selectedLocation ? `${selectedLocation.name.substring(0, 30)}...` : 'Seleccionar Ubicación en Mapa'}
        </Text>
      </TouchableOpacity>
      {errors.location && <Text style={styles.errorText}>La ubicación es obligatoria</Text>}

      {/* Create Button */}
      <TouchableOpacity 
        style={[styles.button, isCreating && { opacity: 0.6 }]} 
        onPress={handleCreateEvent}
        disabled={isCreating}
      >
        {isCreating ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Creando...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Crear Evento</Text>
        )}
      </TouchableOpacity>

      {/* Location Picker Modal */}
      <Modal visible={showMapModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Ubicación</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {!mapLoaded ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#28A745" />
              <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
          ) : (
            <>
              <View
                id="map-location-picker"
                style={styles.mapContainer}
              />
              <View style={styles.mapFooter}>
                <Text style={styles.instructionText}>
                  Haz click en el mapa para seleccionar una ubicación
                </Text>
                {selectedLocation && (
                  <Text style={styles.coordinatesText}>
                    Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.confirmButton, !selectedLocation && styles.disabledButton]}
                  onPress={() => setShowMapModal(false)}
                  disabled={!selectedLocation}
                >
                  <Text style={styles.confirmButtonText}>Confirmar Ubicación</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* New Place Modal */}
      <Modal visible={showPlaceModal} animationType="fade" transparent={true}>
        <View style={styles.placeModalOverlay}>
          <View style={styles.placeModalContent}>
            <View style={styles.placeModalHeader}>
              <Text style={styles.placeModalTitle}>Crear Nuevo Lugar</Text>
            </View>

            <Text style={styles.placeModalLabel}>Nombre del Lugar</Text>
            <TextInput
              style={[styles.placeModalInput, placeErrors.name && styles.placeModalInputError]}
              placeholder="Ej: Parque Central, Fuente de Trevi, etc."
              value={placeName}
              onChangeText={(text) => {
                setPlaceName(text);
                if (text.trim()) setPlaceErrors({ ...placeErrors, name: false });
              }}
              placeholderTextColor="#999"
            />
            {placeErrors.name && <Text style={styles.placeModalErrorText}>El nombre es obligatorio</Text>}

            <Text style={styles.placeModalLabel}>Descripción del Lugar</Text>
            <TextInput
              style={[styles.placeModalInput, styles.placeModalTextArea, placeErrors.description && styles.placeModalInputError]}
              placeholder="Describe este lugar..."
              value={placeDescription}
              onChangeText={(text) => {
                setPlaceDescription(text);
                if (text.trim()) setPlaceErrors({ ...placeErrors, description: false });
              }}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />
            {placeErrors.description && <Text style={styles.placeModalErrorText}>La descripción es obligatoria</Text>}

            <View style={styles.placeModalButtons}>
              <TouchableOpacity
                style={styles.placeModalCancelButton}
                onPress={() => {
                  setShowPlaceModal(false);
                  setPendingLocation(null);
                  setPlaceName('');
                  setPlaceDescription('');
                  setPlaceErrors({});
                }}
              >
                <Text style={styles.placeModalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.placeModalConfirmButton}
                onPress={handleConfirmPlace}
              >
                <Text style={styles.placeModalConfirmButtonText}>Crear Lugar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333'
  },
  imagePickerButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    backgroundColor: '#f5f5f5'
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed'
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center'
  },
  errorInput: {
    borderColor: '#FF4444',
    backgroundColor: '#FFE4E4'
  },
  errorBorder: {
    borderWidth: 2,
    borderColor: '#FF4444'
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  dateTimeContainer: {
    marginBottom: 16
  },
  dateTimeWrapper: {
    marginBottom: 4
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginLeft: 4
  },
  button: {
    backgroundColor: '#28A745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 4
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 12
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: 'bold'
  },
  mapContainer: {
    flex: 1,
    width: '100%'
  },
  mapFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9f9f9'
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center'
  },
  coordinatesText: {
    fontSize: 12,
    color: '#28A745',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500'
  },
  confirmButton: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#ccc'
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666'
  },
  // Place Modal Styles
  placeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  placeModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%'
  },
  placeModalHeader: {
    marginBottom: 20,
    alignItems: 'center'
  },
  placeModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333'
  },
  placeModalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12
  },
  placeModalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333'
  },
  placeModalInputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFE4E4'
  },
  placeModalTextArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  placeModalErrorText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 12
  },
  placeModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  placeModalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center'
  },
  placeModalCancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14
  },
  placeModalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#28A745',
    alignItems: 'center'
  },
  placeModalConfirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});