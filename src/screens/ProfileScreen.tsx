import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Loading, ErrorBanner } from '../components/Common';

export const ProfileScreen: React.FC = () => {
  const { user, isLoading, error, clearError, logout, isAuthenticated, token } = useAuth();

  useEffect(() => {
    console.log('ProfileScreen renderizó. isAuthenticated:', isAuthenticated, 'user:', user?.email, 'token:', !!token);
  }, [isAuthenticated, user, token]);

  const handleLogout = async () => {
    console.log('DEBUG: handleLogout() fue llamada');
    
    // Intenta logout directo sin Alert primero
    try {
      console.log('DEBUG: Llamando logout()');
      await logout();
      console.log('DEBUG: logout() completado exitosamente');
    } catch (err: any) {
      console.error('DEBUG: logout() falló:', err);
    }
  };

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Not authenticated. Please login first.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorBanner message={error} onRetry={clearError} />}

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Apellido</Text>
        <Text style={styles.value}>{user.last_name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Teléfono</Text>
        <Text style={styles.value}>{user.celular || 'No especificado'}</Text>

        <Text style={styles.label}>ID de Usuario</Text>
        <Text style={styles.value}>{user.id}</Text>

        <Text style={styles.label}>Tipo de Usuario</Text>
        <Text style={styles.value}>{user.tipo_user === 4 ? 'Administrador' : 'Usuario'}</Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => {
          console.log('DEBUG: Botón presionado');
          handleLogout();
        }}
      >
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
