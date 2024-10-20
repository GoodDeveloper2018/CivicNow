import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Latest News</Text>
      <Text style={styles.subtitle}>
        Stay updated with the latest news and developments in your community.
      </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#004d40',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});
