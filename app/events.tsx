import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';

// Define a type for Event
type Event = {
  id: string;
  title: string;
  start: string;
  end: string;
  category?: string;
  geo?: {
    address?: {
      formatted_address?: string;
    };
  };
};

export default function EventScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkLocationPermission();
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
      fetchEvents(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch your location. Please try again.');
    }
  };

  const fetchEvents = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const attendedCategories = ['community', 'concerts', 'conferences', 'expos', 'festivals', 'performing-arts', 'sports'];
      const url = `https://api.predicthq.com/v1/events?location_around.origin=${longitude},${latitude}&limit=1000&category=${attendedCategories.join(',')}`;
      console.log('Fetching events from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer PQdVunmIc4L7vf6Wz5K3stkpIffoKTWd7PMnjOCh', // Replace with a valid token
          Accept: 'application/json',
        },
      });

      // Log the response status
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorDetails = await response.json();
        console.log('Error Details:', errorDetails);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      const now = new Date();
      const upcomingEvents = data.results.filter((event: Event) => {
        const eventStart = new Date(event.start);
        return eventStart > now;
      });

      setEvents(upcomingEvents || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Unable to fetch events. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleDateString(undefined, options);
  };

  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          Location permission is required to show nearby events.
        </Text>
        <Button title="Grant Permission" onPress={checkLocationPermission} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Attended Events</Text>
      {location && (
        <Text style={styles.subtitle}>
          Events near your location: {location.coords.latitude}, {location.coords.longitude}
        </Text>
      )}
      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item: Event) => item.id}
          renderItem={({ item }: { item: Event }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>
                {`Date: ${formatDate(item.start)} - ${formatDate(item.end)}`}
              </Text>
              <Text style={styles.eventCategory}>
                {`Category: ${item.category || 'N/A'}`}
              </Text>
              <Text style={styles.eventLocation}>
                {`Location: ${item.geo?.address?.formatted_address || 'Not specified'}`}
              </Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.subtitle}>No upcoming attended events found near your location.</Text>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  eventItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  eventDescription: {
    fontSize: 14,
    color: '#004d40',
  },
  eventCategory: {
    fontSize: 14,
    color: '#004d40',
    fontStyle: 'italic',
  },
  eventLocation: {
    fontSize: 14,
    color: '#004d40',
  },
});