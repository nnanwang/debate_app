import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { OPENAI_API_KEY } from '../components/openai_api_key';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function EvaluateScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'You are an argument evaluation coach for students. When a user inputs an argument, give polite, clear, bullet-pointed feedback on clarity, logic, persuasiveness, and tone.',
            },
            ...messages,
            userMessage,
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      const assistantMessage: Message = { role: 'assistant', content: reply || 'Error.' };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <ScrollView
            ref={scrollRef}
            style={styles.chat}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !loading && (
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeIcon}>💬</Text>
                <Text style={styles.welcomeTitle}>Start a Conversation</Text>
                <Text style={styles.welcomeSubtitle}>
                  Type an argument below and get AI-powered feedback with bullet points.
                </Text>
              </View>
            )}

            {messages.map((msg, index) => (
              <View
                key={index}
                style={[styles.bubble, msg.role === 'user' ? styles.user : styles.assistant]}
              >
                <Text style={styles.bubbleText}>{msg.content}</Text>
              </View>
            ))}

            {loading && (
              <View style={[styles.bubble, styles.assistant]}>
                <Text style={styles.bubbleText}>✍️ Thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type your argument here..."
              value={input}
              onChangeText={setInput}
              style={styles.input}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffefc',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chat: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chatContent: {
    paddingBottom: 16,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  user: {
    backgroundColor: '#ffd33d',
    alignSelf: 'flex-end',
  },
  assistant: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 15,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 40,
    maxHeight: 100,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#ffd33d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendText: {
    fontWeight: 'bold',
  },
  welcomeCard: {
    marginTop: 80,
    padding: 24,
    backgroundColor: 'rgba(253, 238, 141, 0.2)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(253, 238, 141, 0.5)',
    marginHorizontal: 20,
  },
  welcomeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
});
