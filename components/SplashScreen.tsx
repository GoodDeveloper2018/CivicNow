import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';

// Import the logo image
const logo = require('../assets/images/civicnowlogo.png');

export default function SplashScreen() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if the root navigation state is mounted
    if (!navigationState?.key) return;

    // Wait for 3 seconds before navigating
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigationState]);

  useEffect(() => {
    // Navigate to the main screen if ready
    if (isReady) {
      router.replace('/events'); // Replace with your main screen
    }
  }, [isReady, router]);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
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
