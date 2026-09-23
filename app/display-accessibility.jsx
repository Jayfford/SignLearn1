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

const DisplayAccessibility: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Display & Accessibility</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Text Size</Text>
            <Text style={styles.optionSubtitle}>Increase font size for easier reading.</Text>
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>High Contrast Mode</Text>
            <Text style={styles.optionSubtitle}>Improve visibility and reduce eye strain.</Text>
          </View>

          <View style={styles.optionCard}>
            <Text style={styles.optionTitle}>Voice Guidance</Text>
            <Text style={styles.optionSubtitle}>Enable spoken instructions for menus and lessons.</Text>
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
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default DisplayAccessibility;
