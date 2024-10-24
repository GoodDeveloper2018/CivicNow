import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image } from 'react-native';
import axios from 'axios';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage }]);
    setUserInput('');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        },
        {
          headers: {
            'Authorization': 'Bearer ',
            'Content-Type': 'application/json',
          },
        }
      );

      const botReply = response.data.choices[0].message.content;
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('Error communicating with OpenAI API:', error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response
          ? error.response.data.error.message
          : 'An unexpected error occurred.';
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: `Error: ${errorMessage}` },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'An unexpected error occurred.' },
        ]);
      }
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Title and Image */}
      <Text style={styles.title}>Chatbot</Text>
      <Text style={styles.text}>Welcome to your personal guide to our app! Feel free to ask questions to learn more about your community or anything else on your mind!</Text>
      <Image
        source={{ uri: '../components/chatbot.png' }} // Replace with your image URL
        style={styles.image}
      />
      
      <ScrollView style={styles.chatContainer} ref={scrollViewRef}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>
      
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={userInput}
        onChangeText={setUserInput}
      />
      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e3',
    padding: 10,
  },
  image: {
    width: '50%', // Adjust width as needed
    height: 350,  // Adjust height as needed
    marginBottom: 10,
    marginTop: 10, // Adjust this value to move the image down
    alignSelf: 'center', // Center the image
    borderRadius: 10, // Optional: for rounded corners
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#00796b',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555', // Optional: adjust color
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default Chatbot;
