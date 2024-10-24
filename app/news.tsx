import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Button, Modal } from 'react-native';
import axios from 'axios';

// News API key
const NEWS_API_KEY = '';
// OpenAI API key
const API_KEY = '';

// Define types for News
type News = {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
};

let requestCount = 0;

// Function to fetch political news
const fetchPoliticalNews = async (): Promise<News[]> => {
  const url = `https://newsapi.org/v2/everything?q=politics&apiKey=${NEWS_API_KEY}&language=en`;
  try {
    const response = await axios.get(url);
    const articles = response.data.articles;
    const politicalNews: News[] = articles.map((article: any) => ({
      id: article.url,
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source,
    }));
    return politicalNews;
  } catch (error) {
    console.error('Error fetching political news:', error);
    return [];
  }
};

// Function to fetch summary
export const fetchSummary = async (text: string): Promise<string> => {
  requestCount++;
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return response.data.choices[0].message.content;
      }
    } catch (error: any) {
      console.error('Error fetching summary:', error);
    }
    attempt++;
  }
  throw new Error('Max retries reached for fetching summary');
};

export default function NewsScreen() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const getNews = async () => {
    setLoading(true);
    try {
      const politicalNews = await fetchPoliticalNews();
      setNews(politicalNews);
      if (politicalNews.length === 0) {
        setError('No news available at the moment.');
      }
    } catch (error) {
      setError('Failed to fetch news.');
      Alert.alert('Error', 'Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, []);

  const handleFetchSummary = async (text: string) => {
    try {
      const summary = await fetchSummary(text);
      setSelectedSummary(summary);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch summary.');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSummary(null);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00796b" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Refresh News" onPress={getNews} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Latest News</Text>
      <Text style={styles.subtitle}>
        Stay updated with the latest news and developments in your community.
      </Text>

      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.newsItem}>
            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.newsDescription}>{item.description}</Text>
            <Text style={styles.newsSource}>Source: {item.source.name}</Text>
            <Text style={styles.newsDate}>Published on: {new Date(item.publishedAt).toLocaleString()}</Text>
            <Button
              title="More Info"
              onPress={() => handleFetchSummary(item.description || item.title)}
            />
          </View>
        )}
      />

      {/* Modal for displaying summary */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Summary</Text>
            <Text style={styles.modalText}>{selectedSummary}</Text>
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f8f4e3',
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
    marginBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '90%',
    alignItems: 'center', // Center the text horizontally
    marginLeft: 60, // Shift items to the right
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center', // Center title text
  },
  newsDescription: {
    fontSize: 14,
    color: '#004d40',
    textAlign: 'center', // Center description text
  },
  newsSource: {
    fontSize: 12,
    color: '#004d40',
    fontStyle: 'italic',
    textAlign: 'center', // Center source text
  },
  newsDate: {
    fontSize: 12,
    color: '#004d40',
    textAlign: 'center', // Center date text
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
});
