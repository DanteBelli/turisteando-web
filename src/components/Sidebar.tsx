import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Inicio', icon: '🏠' },
    { id: 'events', label: 'Eventos', icon: '📅' },
    { id: 'favorites', label: 'Favoritos', icon: '❤️' },
    { id: 'messages', label: 'Mensajes', icon: '💬' },
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.sidebar}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Turisteando</Text>
        <Text style={styles.welcmeText}>Bienvenido, {user?.name || user?.email || 'Usuario'}</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentScreen === item.id && styles.menuItemActive,
            ]}
            onPress={() => onNavigate(item.id)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.menuLabel,
                currentScreen === item.id && styles.menuLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: '#28A745',
    height: '100%',
    flexDirection: 'column',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1e7e34',
    borderBottomWidth: 1,
    borderBottomColor: '#16573e',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcmeText: {
    fontSize: 12,
    color: '#e8f5e9',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500',
  },
  menuLabelActive: {
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});
