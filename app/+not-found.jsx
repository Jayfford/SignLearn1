import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.title}>Page not found</Text>
      <Text style={styles.subtitle}>This screen is unavailable or moved.</Text>
      <Pressable onPress={() => router.replace('/home')} style={styles.button}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EEE7',
    padding: 24,
  },
  emoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F1B1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6D6C69',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E45A59',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
