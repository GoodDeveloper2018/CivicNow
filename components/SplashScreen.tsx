import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

// Import the logo image
const logo = require('../assets/images/civicnowlogo.png'); // Updated to match the file name

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    // Navigate to the main screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('EventScreen'); // Replace 'EventScreen' with your main screen
    }, 3000);

    return () => clearTimeout(timer); // Clear timer on component unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Text style={styles.title}>CivicNow</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
});