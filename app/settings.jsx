import React, { useState } from 'react';
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
import { useTheme } from './theme-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();
  const { darkMode, setDarkMode, theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#2F2A28" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>App preferences</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Customize how SignLearn works for you.</Text>
          </View>

          <View style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Receive reminders and updates.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              thumbColor={notificationsEnabled ? theme.colors.accent : '#FFF'}
              trackColor={{ false: '#555', true: '#4ECDC4' }}
            />
          </View>

          <View style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>Auto Update</Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Keep lesson content fresh.</Text>
            </View>
            <Switch
              value={autoUpdate}
              onValueChange={setAutoUpdate}
              thumbColor={autoUpdate ? theme.colors.accent : '#FFF'}
              trackColor={{ false: '#555', true: '#4ECDC4' }}
            />
          </View>

          <View style={[styles.optionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Switch to a low-light interface.</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              thumbColor={darkMode ? theme.colors.accent : '#FFF'}
              trackColor={{ false: '#555', true: '#4ECDC4' }}
            />
          </View>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} activeOpacity={0.8} onPress={() => router.push('/edit-profile')}>
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
    backgroundColor: '#E9DDCB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#E9DDCB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  backButton: {
    backgroundColor: '#F9F4EE',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7D9C7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2F2A28',
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
    color: '#2F2A28',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#655F58',
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: '#F7F2EC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2A28',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#655F58',
    lineHeight: 20,
  },
  actionCard: {
    backgroundColor: '#F7F2EC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
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
    backgroundColor: '#F3EAE1',
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
    color: '#2F2A28',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#655F58',
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: '#F7F2EC',
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
});