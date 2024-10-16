import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function EventScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkLocationPermission();  // Correct function call
    }, [])
  );

  const checkLocationPermission = async () => {
    const savedPermission = await AsyncStorage.getItem('locationPermission');
    if (savedPermission === 'granted') {
      setPermissionGranted(true);
      getLocation();  // Fetch user's location
    } else if (savedPermission === 'denied') {
      // If previously denied, show a single prompt
      Alert.alert(
        'Permission Denied',
        'You have previously denied location permissions. Please enable it in settings if you wish to use this feature.',
        [{ text: 'Close' }]
      );
    } else {
      askForLocationPermission();
    }
  };

  const askForLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      await AsyncStorage.setItem('locationPermission', 'granted');
      setPermissionGranted(true);
      getLocation();  // Fetch user's location
    } else {
      await AsyncStorage.setItem('locationPermission', 'denied');
      Alert.alert(
        'Permission Denied',
        'Location access is needed. You can enable it in the settings.',
        [
          {
            text: 'Close',
            style: 'cancel',
          },
        ]
      );
      setPermissionGranted(false);
    }
  };

  const getLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch your location. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      {location ? (
        <Text style={styles.subtitle}>
          Events near your location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      ) : (
        <Text style={styles.subtitle}>
          {permissionGranted
            ? 'Fetching your location...'
            : 'Location permission is required to show nearby events.'}
        </Text>
      )}
      {!permissionGranted && (
        <Button title="Grant Permission" onPress={checkLocationPermission} />
      )}
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
});
