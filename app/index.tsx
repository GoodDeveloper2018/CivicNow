import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CivicNow!</Text>
      <Text style={styles.subtitle}>Stay informed and engaged with local events</Text>

      <View style={styles.buttonContainer}>
        <Button title="View Events" onPress={() => router.push('/events')} />
        <Button title="Set Reminders" onPress={() => router.push('/reminders')} />
      </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#004d40',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '80%',
    justifyContent: 'space-between',
  },
});
