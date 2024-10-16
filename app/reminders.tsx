import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store'; // Using SecureStore instead of AsyncStorage
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ReminderScreen() {
  const [reminderSet, setReminderSet] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const showPicker = () => {
    setShowDatePicker(true);
  };

  const hidePicker = () => {
    setShowDatePicker(false);
  };

  const handleConfirm = async (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      await SecureStore.setItemAsync('selectedDate', date.toISOString());
      setReminderSet(true);
      scheduleNotification(date);
    }
  };

  const scheduleNotification = async (date: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Event Reminder',
        body: `Reminder for your event on ${date.toDateString()}`,
      },
      trigger: {
        date,
      },
    });
    Alert.alert('Reminder Set', `You will receive a notification on ${date.toDateString()}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Button title="Select a Date for Reminder" onPress={showPicker} />

      {/* Expo-Compatible DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleConfirm}
        />
      )}

      {selectedDate && (
        <Text style={styles.subtitle}>
          Selected Date: {selectedDate.toDateString()}
        </Text>
      )}

      {reminderSet && <Text style={styles.confirmation}>Reminder has been set!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#004d40',
  },
  confirmation: {
    marginTop: 20,
    fontSize: 16,
    color: '#004d40',
  },
});
