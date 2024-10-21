import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>About CivicNow</Text>
        <Text style={styles.description}>
          CivicNow is your gateway to discovering local events and activities in your community. 
          Our program utilizes your location to provide real-time information on nearby events, 
          from cultural festivals and community gatherings to educational workshops and local 
          government meetings. Whether you're looking for something fun to do this weekend or want 
          to stay informed about local happenings, CivicNow connects you with the events that matter. 
          Explore your community like never before and get involved with CivicNow!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f4e3',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f4e3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2a2b2a',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#706c61',
    lineHeight: 24,
    textAlign: 'center',
  },
});
