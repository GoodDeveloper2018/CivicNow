import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Button, ActivityIndicator, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import axios from 'axios'; 
import RNPickerSelect from 'react-native-picker-select';

const API_KEY = '';
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
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Start with an empty string

  // Update the placeholder to not use null
  const categoryOptions = [
    { label: 'All Categories', value: '' }, // Use an empty string instead of null
    { label: 'Community', value: 'community' },
    { label: 'Concerts', value: 'concerts' },
    { label: 'Conferences', value: 'conferences' },
    { label: 'Expos', value: 'expos' },
    { label: 'Festivals', value: 'festivals' },
    { label: 'Performing Arts', value: 'performing-arts' },
    { label: 'Sports', value: 'sports' },
    { label : 'Academic',value: 'academic'},
    { label : 'School-Holidays',value: 'school-holidays'},
    { label : 'Observances',value: 'observances'},
    { label : 'Politics',value: 'politics'},
    { label : 'Daylight-Savings',value: 'daylight-savings'},
    { label : 'Airport-Delays',value: 'airport-delays'},
    { label : 'Severe-Weather',value: 'severe-weather'},
    { label : 'Disasters',value: 'disasters'},
    { label : 'Terror',value: 'terror'},
    { label : 'Health-Warnings',value: 'health-warnings'},
  ];

  // Use useEffect to fetch events when selectedCategory or location changes
  useEffect(() => {
    if (location) {
      fetchEvents(location.coords.latitude, location.coords.longitude);
    }
  }, [selectedCategory, location]); // Add selectedCategory as a dependency

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
      const attendedCategories = selectedCategory ? [selectedCategory] : ['community', 'concerts', 'conferences', 'expos', 'festivals', 'performing-arts', 'sports'];
      const url = `https://api.predicthq.com/v1/events?within=4.05mi@${latitude},${longitude}&limit=1000&sort=start&start.gte=2024-10-23&category=${attendedCategories.join(',')}`;
      console.log('Fetching events from:', url);
      console.log(attendedCategories);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ',
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
      await delay(RATE_LIMIT_DELAY);
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
      <RNPickerSelect
        onValueChange={(value) => {
          setSelectedCategory(value);
        }}
        items={categoryOptions}
        placeholder={{ label: 'Select a category...', value: '' }} // Use empty string
        value={selectedCategory} // Set the value prop here
        style={{
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
        }}
      />
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
    backgroundColor: '#f8f4e3',
    padding: 20,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10,
    color: '#004d40',
    textAlign: 'center',
  },
  eventItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
  },
  picker: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#00796b',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
  },
});
