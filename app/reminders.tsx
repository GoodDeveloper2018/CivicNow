import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a type for Event
type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  category?: string;
  geo?: {
    address?: {
      formatted_address?: string;
    };
  };
};

export default function Reminders() {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [reminderSet, setReminderSet] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    loadFavorites();
    requestNotificationPermissions();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission not granted', 'You need to enable notifications.');
    }
  };

  const showDatePicker = (event: Event) => {
    setSelectedEvent(event);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (date: Date) => {
    hideDatePicker();
    setSelectedDate(date);
    if (selectedEvent) {
      await AsyncStorage.setItem(`reminder_${selectedEvent.id}`, date.toISOString());
      setReminderSet(true);
      console.log(`Scheduling notification for: ${date.toISOString()}`);
      scheduleNotification(date, selectedEvent.title);
    }
  };

  const scheduleNotification = async (date: Date, eventTitle: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Event Reminder',
          body: `Reminder for your event: ${eventTitle}`,
        },
        trigger: { date },
      });
      Alert.alert('Reminder Set', `You will receive a notification on ${date.toDateString()} for "${eventTitle}".`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const debugFavorites = () => {
    console.log('Current favorites:', favorites);
    Alert.alert('Current favorites', JSON.stringify(favorites, null, 2));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites & Reminders</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item: Event) => item.id}
          renderItem={({ item }: { item: Event }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDetails}>{`Date: ${new Date(item.start).toDateString()}`}</Text>
              <Text style={styles.eventDetails}>{`Location: ${item.geo?.address?.formatted_address || 'Not specified'}`}</Text>
              <TouchableOpacity onPress={() => showDatePicker(item)} style={styles.reminderButton}>
                <Text style={styles.reminderButtonText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noFavoritesText}>No favorite events found.</Text>
      )}

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        display="spinner"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {selectedDate && reminderSet && (
        <Text style={styles.confirmation}>
          Reminder set for: {selectedDate.toDateString()}
        </Text>
      )}

      {/* Debug Button */}
      <Button title="Debug Favorites" onPress={debugFavorites} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f4e3',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
    marginVertical: 20,
  },
  eventItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  eventDetails: {
    fontSize: 14,
    color: '#004d40',
  },
  reminderButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#00796b',
    borderRadius: 5,
    alignItems: 'center',
  },
  reminderButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  noFavoritesText: {
    fontSize: 18,
    color: '#004d40',
  },
  confirmation: {
    marginTop: 20,
    fontSize: 16,
    color: '#004d40',
  },
});
