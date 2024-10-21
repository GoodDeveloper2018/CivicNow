import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import Chatbot from './chatbot'; // Import your Chatbot component


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Link href="/about" style={styles.button}>
        Go to About screen
      </Link>
      <Text style={styles.title}>Welcome to CivicNow!</Text>
      <Text style={styles.subtitle}>Stay informed and engaged with local events</Text>

      <View style={styles.buttonContainer}>
        <Button title="View Events" onPress={() => router.push('/events')} />
        <Button title="Set Reminders" onPress={() => router.push('/reminders')} />
      </View>

      {/* Add your Chatbot component here */}
      <View style={styles.chatbotContainer}>
        <Chatbot />
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
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
  chatbotContainer: {
    marginTop: 20,
    width: '100%',
    flex: 1, // Ensure the chatbot takes some space
  },
});
