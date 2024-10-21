import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import Chatbot from './chatbox'; // Import your Chatbot component


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Welcome to CivicNow!</Text>
      <Text style={styles.subtitle}>Stay informed and engaged with local events</Text>



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
    backgroundColor: '#f8f4e3',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a2b2a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#222222',
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
    color: '#706c61',
  },
  chatbotContainer: {
    marginTop: 20,
    width: '100%',
    flex: 1, // Ensure the chatbot takes some space
  },
});
