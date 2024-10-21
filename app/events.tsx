
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import axios from 'axios'; 

const API_KEY ='';

const openaiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

const RATE_LIMIT_DELAY = 1000; // 1 second delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let requestCount = 0; // Initialize request count

export const fetchSummary = async (text: string): Promise<string> => {
  requestCount++;
  console.log(`Total requests made: ${requestCount}`);

  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await openaiApi.post('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
      });

      if (response.status === 200) {
        return response.data.choices[0].message.content;
      } else {
        console.error(`Error: ${response.status} ${response.statusText}`);
        if (response.status === 429) {
          attempt++;
          const retryAfter = response.headers['retry-after'] || Math.pow(2, attempt); // Exponential backoff
          console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
          await delay(retryAfter * 1000); // wait for specified time
        } else {
          throw new Error(`Unexpected error: ${response.status}`);
        }
      }
    } catch (error: any) {
      console.error('Error fetching summary:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 429) {
        attempt++;
        const retryAfter = error.response.headers['retry-after'] || Math.pow(2, attempt); // Exponential backoff
        console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
        await delay(retryAfter * 1000); // wait for specified time
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached for fetching summary');
};

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
  const [location, setLocation] = useState<Location.LocationObject | null>(null); // Correct
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false); // Specify type
  const [events, setEvents] = useState<Event[]>([]); // Correct
  const [loading, setLoading] = useState<boolean>(false); // Specify type
  const [summary, setSummary] = useState<string>(''); // Specify type
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null); // Correct
  

  useFocusEffect(
    React.useCallback(() => {
      checkLocationPermission();
    }, [])
  );

  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

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
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      fetchEvents(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch your location. Please try again.');
    }
  };

  const fetchEvents = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const startDate = '2024-11-01';
      const endDate = '2024-11-30';
      const attendedCategories = ['community', 'concerts', 'conferences', 'expos', 'festivals', 'performing-arts', 'sports'];
      const url = `https://api.predicthq.com/v1/events?within=4.05mi@${latitude},${longitude}&limit=1000&sort=start&start.gte=2024-10-23&category=${attendedCategories.join(',')}`;
      console.log('Fetching events from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ', // Replace with a valid token
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.log('Error Details:', errorDetails);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
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

  const summarizeEvent = async (event: Event) => {
    setSelectedEvent(event);
    const textToSummarize = `${event.title}: ${event.geo?.address?.formatted_address || 'No location specified'}`;

    try {
      await delay(RATE_LIMIT_DELAY); // Wait before making the API call
      const result = await fetchSummary(textToSummarize);
      setSummary(result);
    } catch (error) {
      console.error('Error fetching summary:', error);
      Alert.alert('Error', 'Unable to summarize the event. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
              <Button title="Summarize" onPress={() => summarizeEvent(item)} />
            </View>
          )}
        />
      ) : (
        <Text style={styles.subtitle}>
          No upcoming attended events found near your location.
        </Text>
      )}
      {summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Summary:</Text>
          <Text>{summary}</Text>
        </View>
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
  summaryContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
});
