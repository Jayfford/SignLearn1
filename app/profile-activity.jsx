import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNotifications } from './notification-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const activityItems = [
  {
    title: 'Completed Alphabet Lesson',
    detail: 'You finished 3 new alphabet cards today.',
    timestamp: 'Just now',
  },
  {
    title: 'Daily Quest Started',
    detail: 'You accepted a 3-lesson streak challenge.',
    timestamp: '1 hour ago',
  },
  {
    title: 'New Achievement Unlocked',
    detail: 'Level 3 badge earned for active learning.',
    timestamp: 'Yesterday',
  },
];

const statusHighlights = [
  { label: 'Focus mode', value: 'On', color: '#4ECDC4' },
  { label: 'Streak', value: '7 days', color: '#FFD166' },
  { label: 'Next goal', value: 'Quiz review', color: '#FF6B6B' },
];

export default function ProfileActivity() {
  const router = useRouter();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroSubtitle}>Recent learning actions and achievements in one place.</Text>
            <View style={styles.statusRow}>
              {statusHighlights.map((item) => (
                <View key={item.label} style={[styles.statusCard, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.statusValue}>{item.value}</Text>
                  <Text style={styles.statusLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activityItems.map((item) => (
            <View key={item.title} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.timestamp}</Text>
              </View>
              <Text style={styles.activityDetail}>{item.detail}</Text>
            </View>
          ))}

          <View style={styles.quickActions}>
            <Text style={styles.quickTitle}>Quick actions</Text>
            <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/learn')} activeOpacity={0.8}>
              <Ionicons name="play-circle" size={18} color="#FFF" />
              <Text style={styles.quickButtonText}>Continue learning</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickButtonLight} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
              <Ionicons name="notifications" size={18} color="#333" />
              <Text style={styles.quickButtonLightText}>View notifications</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Keep momentum</Text>
            <Text style={styles.noteText}>Consistency is the fastest path to fluency—try a short review session every day.</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  backButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityDetail: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 20,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  quickButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  quickButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  quickButtonLight: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickButtonLightText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  noteBox: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});