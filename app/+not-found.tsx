import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚫 Page Not Found</Text>
      <Text style={styles.message}>Looks like this page doesn’t exist.</Text>
      <Link href="/" style={styles.link}>Return to Home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#d9534f',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    fontSize: 16,
    color: '#007aff',
    textDecorationLine: 'underline',
  },
});

