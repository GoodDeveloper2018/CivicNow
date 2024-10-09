import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const handleViewEvents = () => {
    Alert.alert('View Events', 'Displaying upcoming local events...');
  };

  const handleSetReminders = () => {
    Alert.alert('Set Reminders', 'You can set reminders for events...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to CivicNow!</Text>
      <Text style={styles.subtitle}>Stay informed and engaged with local events</Text>
      <View style={styles.buttonContainer}>
        <Button title="View Events" onPress={handleViewEvents} color="#00796b" />
        <Button title="Set Reminders" onPress={handleSetReminders} color="#00796b" />
      </View>
    </SafeAreaView>
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
    fontSize: 16,
    marginTop: 10,
    color: '#004d40',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
    justifyContent: 'space-between',
    height: 100,
  },
});
