import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import * as Location from 'expo-location';
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
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      setPermissionGranted(true);
      getLocation();
    } else {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to find events near you. You can enable it in settings or retry.',
        [{ text: 'Retry', onPress: () => checkLocationPermission() }]
      );
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
