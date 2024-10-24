import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function ReminderScreen() {
  const [reminderSet, setReminderSet] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
    
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };



  const handleConfirm = async (date: Date) => {
    hideDatePicker();
    setSelectedDate(date);
    await AsyncStorage.setItem('selectedDate', date.toISOString());
    setReminderSet(true);
    scheduleNotification(date);
  };

  const scheduleNotification = async (date: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Event Reminder',
        body: 'Reminder for your selected event date.',
      },
      trigger: { date },
    });
    Alert.alert('Reminder Set', `You will receive a notification on ${date.toDateString()}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Button title="Select a Date for Reminder" onPress={showDatePicker}  />
      <DateTimePickerModal
      isVisible={isDatePickerVisible}
      mode="date"
      display = "spinner"
      onConfirm={handleConfirm}
      onCancel={hideDatePicker}
      style = {styles.datePicker}
      
      />
     

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
    backgroundColor: '#f8f4e3',
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
  datePicker:{
    marginTop:-20,
    height: 120,
  },
});