import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Sidebar } from '../components/Sidebar';
import { EventsScreen } from './EventsScreen';
import { ProfileScreen } from './ProfileScreen';
import ChatScreen from './ChatScreen';
import FavoritesScreen from './FavoritesScreen';
import HomeScreen from './HomeScreen';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/Common';
import CreateEventScreen from '../screens/CreateEventScreen';

export const MainScreen: React.FC = () => {
  const { isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('events');

  if (isLoading) {
    return <Loading message="Cargando..." />;
  }

  const renderContent = () => {
  switch (currentScreen) {
    case 'events':
      return <EventsScreen />;

    case 'profile':
      return <ProfileScreen />;

    case 'favorites':
      return <FavoritesScreen />;

    case 'messages':
      return <ChatScreen />;

    case 'create-event':
      return <CreateEventScreen />;

    case 'home':
    default:
      return <HomeScreen onNavigate={setCurrentScreen} />;
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        <View style={styles.mainContent}>
          {currentScreen === 'events' || currentScreen === 'messages' || currentScreen === 'favorites' || currentScreen === 'home' ? (
            renderContent()
          ) : (
            <ScrollView>
              {renderContent()}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
});
