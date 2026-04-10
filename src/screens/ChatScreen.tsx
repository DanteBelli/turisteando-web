import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: number;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatRoom {
  id: number;
  eventName: string;
  lastMessage: string;
  unread: number;
  participants: number;
}

interface ChatScreenProps {
  selectedChatRoom?: ChatRoom | null;
  onBack?: () => void;
}

const MOCK_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 1,
    eventName: 'Cafe Buenos Aires',
    lastMessage: 'Juan: ¡Grande! Nos vemos mañana',
    unread: 2,
    participants: 12
  },
  {
    id: 2,
    eventName: 'Tango Night',
    lastMessage: 'María: ¿A qué hora es el evento?',
    unread: 0,
    participants: 8
  },
  {
    id: 3,
    eventName: 'Festival Gastronómico',
    lastMessage: 'Admin: ¡Bienvenidos al festival!',
    unread: 5,
    participants: 47
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    userId: '1',
    userName: 'Juan',
    message: 'Hola a todos, ¿cómo están?',
    timestamp: '10:30',
    isOwn: false
  },
  {
    id: 2,
    userId: '2',
    userName: 'María',
    message: 'Yo estoy bien, ¿y ustedes?',
    timestamp: '10:35',
    isOwn: false
  },
  {
    id: 3,
    userId: 'me',
    userName: 'Tu nombre',
    message: 'Muy bien, llegando al evento',
    timestamp: '10:40',
    isOwn: true
  },
  {
    id: 4,
    userId: '1',
    userName: 'Juan',
    message: '¡Grande! Nos vemos mañana',
    timestamp: '10:45',
    isOwn: false
  }
];

export default function ChatScreen({ selectedChatRoom, onBack }: ChatScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(selectedChatRoom || null);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: messages.length + 1,
      userId: user?.id || 'unknown',
      userName: `${user?.nombre} ${user?.apellido}`,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString().slice(0, 5),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleBackFromChat = () => {
    setSelectedRoom(null);
  };

  // Chat Room List View
  if (!selectedRoom) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mensajes</Text>
        </View>

        <FlatList
          data={MOCK_CHAT_ROOMS}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRoomItem}
              onPress={() => handleSelectRoom(item)}
            >
              <View style={styles.chatRoomContent}>
                <View style={styles.chatRoomHeader}>
                  <Text style={styles.chatRoomName}>{item.eventName}</Text>
                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                <Text style={styles.participants}>👥 {item.participants} participantes</Text>
              </View>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    );
  }

  // Chat Detail View
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={handleBackFromChat}>
          <Text style={styles.backButton}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatTitle}>{selectedRoom.eventName}</Text>
          <Text style={styles.participantsCount}>👥 {selectedRoom.participants} participantes</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.isOwn && styles.messageContainerOwn
          ]}>
            <View style={[
              styles.messageBubble,
              item.isOwn && styles.messageBubbleOwn
            ]}>
              {!item.isOwn && (
                <Text style={styles.senderName}>{item.userName}</Text>
              )}
              <Text style={[
                styles.messageText,
                item.isOwn && styles.messageTextOwn
              ]}>
                {item.message}
              </Text>
              <Text style={[
                styles.timestamp,
                item.isOwn && styles.timestampOwn
              ]}>
                {item.timestamp}
              </Text>
            </View>
          </View>
        )}
        scrollEnabled={true}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  chatRoomItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatRoomContent: {
    gap: 4,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRoomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  participants: {
    fontSize: 12,
    color: '#999',
  },
  chatHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#28A745',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantsCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  messageContainer: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  messageContainerOwn: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '80%',
  },
  messageBubbleOwn: {
    backgroundColor: '#28A745',
    alignSelf: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    color: '#333',
  },
  messageTextOwn: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  timestampOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#28A745',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
});
