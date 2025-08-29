// import audio module 
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Clipboard,
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
import Icon from 'react-native-vector-icons/Ionicons';
import { OPENAI_API_KEY } from '../components/openai_api_key';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function EvaluateScreen() {
  const [input, setInput] = useState(''); // For typed text input
  const [messages, setMessages] = useState<Message[]>([]); // Chat history
  const [loading, setLoading] = useState(false); // Show loading bubble
  const [recording, setRecording] = useState<Audio.Recording | null>(null); // Active recording object
  const [isRecording, setIsRecording] = useState(false); // Show recording status
  const scrollRef = useRef<ScrollView>(null); // For auto-scroll to bottom

  const startRecording = async () => {
    try {
      // add mic permission
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission required', 'Microphone permission is needed to record.');
        return;
      }

         // Enable recording settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Initialize recording
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true); // 🔴 show animation
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync(); // stop recording
      const uri = recording.getURI(); // get file path
      setRecording(null);
      setIsRecording(false); // 🔴 hide animation

      if (uri) {
        await handleTranscription(uri); // send to whisper API
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const handleTranscription = async (uri: string) => {
    try {
      setLoading(true);

      // prepare file for whisper API transcription
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);
      formData.append('model', 'whisper-1');

      // whisper API
      const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const transcriptionData = await transcriptionResponse.json();
      const transcribedText = transcriptionData.text;

      // Step 2: Show summary: "I heard..."
      const summary = `I heard: "${transcribedText}"`;

      // step 1: add user transcribed voices as user message 
      setMessages((prev) => [...prev, { role: 'assistant', content: summary }]);

      // Step 3: Evaluate transcript
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            { role: 'user', content: transcribedText },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      setMessages((prev) => [...prev, { role: 'assistant', content: reply || 'Error.' }]);
    } catch (error) {
      console.error('Transcription or evaluation failed:', error);
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert('Error', 'Failed to get a response.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  const handleRefresh = async (msg: Message) => {
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
            msg,
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
                <Text style={styles.welcomeTitle}>Start a Conversation</Text>
                <Text style={styles.welcomeSubtitle}>
                  Type or speak an argument and get AI-powered feedback.
                </Text>
              </View>
            )}

            {messages.map((msg, index) => (
              <View
                key={index}
                style={[styles.bubble, msg.role === 'user' ? styles.user : styles.assistant]}
              >
                <Text style={styles.bubbleText}>{msg.content}</Text>
                {msg.role === 'assistant' && (
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleCopy(msg.content)}>
                      <Icon name="copy-outline" size={15} color="#555" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRefresh(messages[index - 1])}>
                      <Icon name="refresh-outline" size={15} color="#555" style={{ marginLeft: 10 }} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}

            {loading && (
              <View style={[styles.bubble, styles.assistant]}>
                <Text style={styles.bubbleText}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* 🔴 Recording Indicator */}
          {isRecording && (
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'red', fontWeight: 'bold' }}>🎙️ Recording...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type your argument..."
              value={input}
              onChangeText={setInput}
              style={styles.input}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>

            {/* mic button */}
            <TouchableOpacity
              style={styles.micButton}
              onPressIn={startRecording} // start recording on press
              onPressOut={stopRecording} // stop on release button
            >
              <Icon name="mic-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffefc' },
  inner: { flex: 1, justifyContent: 'space-between' },
  chat: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  chatContent: { paddingBottom: 16 },
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
    backgroundColor: '#fff',
    alignItems: 'center',
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
  micButton: {
    marginLeft: 10,
    padding: 10,
  },
  welcomeCard: {
    marginTop: 80,
    padding: 24,
    backgroundColor: '#fff8c6',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1e491',
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
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
});