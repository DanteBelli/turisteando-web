import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { DataProvider } from '@/src/context/DataContext';
import LoginScreen from '@/app/auth/login';
import { MainScreen } from '@/src/screens/MainScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, token } = useAuth();

  useEffect(() => {
    console.log('RootLayoutNav actualizado. isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'token:', !!token);
  }, [isAuthenticated, isLoading, token]);

  console.log('RootLayoutNav render() - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('DEBUG: Renderizando Loader');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#28A745" />
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    console.log('DEBUG: Renderizando LoginScreen (isAuthenticated=false)');
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LoginScreen />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  // Show main screen with sidebar if authenticated
  console.log('DEBUG: Renderizando MainScreen (isAuthenticated=true)');
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <MainScreen />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <RootLayoutNav />
      </DataProvider>
    </AuthProvider>
  );
}
