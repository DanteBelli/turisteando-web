import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.text}>{message}</Text>
  </View>
);

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorProps> = ({ message, onRetry }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onRetry && (
      <Text style={styles.retryText} onPress={onRetry}>
        Retry
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#F8D7DA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#721C24',
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
