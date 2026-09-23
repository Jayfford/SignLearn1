from pathlib import Path

profile_progress = '''import React from 'react';
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
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const progressStats = [
  { label: 'Lessons', value: 12, icon: 'menu-book', color: '#4ECDC4' },
  { label: 'Streak', value: 7, icon: 'whatshot', color: '#FF6B6B' },
  { label: 'Level', value: 3, icon: 'emoji-events', color: '#FFD166' },
];

const progressItems = [
  {
    title: 'Alphabet Mastery',
    subtitle: '12 of 15 lessons completed',
    value: 0.8,
    label: '80%',
  },
  {
    title: 'Daily Quest Streak',
    subtitle: '7 days active',
    value: 1,
    label: '100%',
  },
  {
    title: 'Quiz Readiness',
    subtitle: '4 lessons left before next certificate',
    value: 0.6,
    label: '60%',
  },
];

export default function ProfileProgress() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Progress</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Track your progress</Text>
            <Text style={styles.heroSubtitle}>A clean dashboard for your learning journey.</Text>
            <View style={styles.statsRow}>
              {progressStats.map((stat) => (
                <View key={stat.label} style={[styles.statCard, { borderColor: stat.color + '33' }]}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '22' }]}>
                    <MaterialIcons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Milestones</Text>
          {progressItems.map((item) => (
            <View key={item.title} style={styles.progressCard}>
              <View style={styles.progressTitleRow}>
                <Text style={styles.progressTitle}>{item.title}</Text>
                <Text style={styles.progressBadge}>{item.label}</Text>
              </View>
              <Text style={styles.progressSubtitle}>{item.subtitle}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${item.value * 100}%` }]} />
              </View>
            </View>
          ))}

          <View style={styles.actionGroup}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={() => router.push('/learn')}>
              <Ionicons name="rocket" size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>Continue lesson</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.push('/daily-quest')}>
              <Ionicons name="flag" size={18} color="#333" />
              <Text style={styles.secondaryButtonText}>View quests</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Pro tip</Text>
            <Text style={styles.noteText}>Review your weakest lesson once this week to strengthen recall and stay on track.</Text>
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
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  progressCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  progressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  barBackground: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4ECDC4',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#4ECDC4',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
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
});'''

profile_activity = '''import React from 'react';
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
});'''

settings = '''import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>App preferences</Text>
            <Text style={styles.sectionSubtitle}>Customize how SignLearn works for you.</Text>
          </View>

          <View style={styles.optionCard}>
            <View>
              <Text style={styles.optionTitle}>Notifications</Text>
              <Text style={styles.optionSubtitle}>Receive reminders and updates.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? '#4ECDC4' : '#FFF'}
              trackColor={{ false: '#CCC', true: '#A5E8E1' }}
            />
          </View>

          <View style={styles.optionCard}>
            <View>
              <Text style={styles.optionTitle}>Auto Update</Text>
              <Text style={styles.optionSubtitle}>Keep lesson content fresh.</Text>
            </View>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
              thumbColor={autoUpdate ? '#4ECDC4' : '#FFF'}
              trackColor={{ false: '#CCC', true: '#A5E8E1' }}
            />
          </View>

          <View style={styles.optionCard}>
            <View>
              <Text style={styles.optionTitle}>Dark Mode</Text>
              <Text style={styles.optionSubtitle}>Switch to a low-light interface.</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? '#4ECDC4' : '#FFF'}
              trackColor={{ false: '#CCC', true: '#A5E8E1' }}
            />
          </View>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
            <View style={styles.actionIcon}>
              <Ionicons name="person-circle-outline" size={22} color="#4ECDC4" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Account settings</Text>
              <Text style={styles.actionSubtitle}>Update your profile and login details.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A49B8A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={() => router.push('/help-support')}>
            <View style={styles.actionIcon}>
              <Ionicons name="help-circle-outline" size={22} color="#FFD166" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Help & support</Text>
              <Text style={styles.actionSubtitle}>Get answers to your questions.</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#A49B8A" />
          </TouchableOpacity>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Privacy note</Text>
            <Text style={styles.noteText}>Your learning data is saved locally and used only to personalize your experience.</Text>
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
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
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
});'''

Path('app/profile-progress.jsx').write_text(profile_progress, encoding='utf-8')
Path('app/profile-activity.jsx').write_text(profile_activity, encoding='utf-8')
Path('app/settings.jsx').write_text(settings, encoding='utf-8')
print('done')
