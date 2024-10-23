import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Chatbot from './chatbot'; // Import your Chatbot component

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to CivicNow!</Text>
      <Text style={styles.subtitle}>Stay informed and engaged with local events</Text>

      {/* Move the logo below the text */}
      <Image
        source={require('../components/logo.png')} // Change this to the path of your logo
        style={styles.logo}
      />

      <View style={styles.buttonContainer}>
        {/* You can add buttons or other components here */}
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
    justifyContent: 'flex-start', // Shift content to the top
    alignItems: 'center',
    backgroundColor: '#f8f4e3',
    padding: 20,
  },
  logo: {
    width: 400, // Set width of the logo
    height: 400, // Set height of the logo
    marginTop: 20, // Custom shifting: adjust as needed
    marginBottom: 40, // Space below the logo
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2a2b2a',
    marginBottom: 20, // Increase bottom margin to shift it down
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#222222',
    textAlign: 'center',
    marginBottom: 40, // Increase bottom margin for more space
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '80%',
    justifyContent: 'space-between',
    marginBottom: 20, // Add margin to shift buttons down
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
    marginBottom: 30, // Add margin to shift chatbot down
  },
});
