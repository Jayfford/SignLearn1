import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function DailyQuest() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Quest</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Today's Quest</Text>
          <Text style={styles.subtitle}>Complete 3 lessons and maintain your streak.</Text>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={() => router.push('/learn')}>
            <Text style={styles.primaryBtnText}>Start Quest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8D7C6' },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  backButton: { backgroundColor: '#FFF', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#D4C4B0' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
