import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const Info: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Info</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>SignLearn</Text>
            <Text style={styles.cardSubtitle}>Version 1.0.0</Text>
            <Text style={styles.cardText}>
              SignLearn helps you learn Filipino Sign Language through lessons, games, and community resources built for learners.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeading}>Contact</Text>
            <Text style={styles.cardText}>support@signlearn.app</Text>
            <Text style={styles.cardText}>+63 912 345 6789</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default Info;
