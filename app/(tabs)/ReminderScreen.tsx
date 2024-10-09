import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';

export default function ReminderScreen() {
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    PushNotification.localNotificationSchedule({
      message: "Reminder for an event", 
      date: new Date(Date.now() + 5 * 1000), // Schedules a notification for 5 seconds later
    });
    setReminderSet(true);
    Alert.alert('Reminder Set', 'You will receive a notification for your event.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Button title="Set Reminder for Event" onPress={handleSetReminder} />
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
  confirmation: {
    marginTop: 20,
    fontSize: 16,
    color: '#004d40',
  },
});
