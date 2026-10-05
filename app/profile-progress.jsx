import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getStudentProgress, lessonProgressPercent, TOTAL_LESSONS } from './lib/studentProgress';

export default function ProfileProgress() {
  const router = useRouter();
  const [stats, setStats] = useState({
    lessons: 0,
    streak: 0,
    level: 0,
    quizzesPassed: 0,
    percent: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        const progress = await getStudentProgress();
        setStats({
          lessons: progress.completedLessons.length,
          streak: progress.streak,
          level: progress.level,
          quizzesPassed: progress.quizzesPassed,
          percent: lessonProgressPercent(progress),
        });
      };
      loadProgress();
    }, [])
  );

  const progressStats = [
    { label: 'Lessons', value: stats.lessons, icon: 'menu-book', color: '#4ECDC4' },
    { label: 'Streak', value: stats.streak, icon: 'whatshot', color: '#FF6B6B' },
    { label: 'Level', value: stats.level, icon: 'emoji-events', color: '#FFD166' },
  ];

  const progressItems = [
    {
      title: 'Lesson Completion',
      subtitle: `${stats.lessons} of ${TOTAL_LESSONS} lessons completed`,
      value: stats.percent / 100,
      label: `${stats.percent}%`,
    },
    {
      title: 'Daily Quest Streak',
      subtitle: stats.streak ? `${stats.streak} day${stats.streak === 1 ? '' : 's'} active` : 'Complete a lesson to start your streak',
      value: Math.min(1, stats.streak / 7),
      label: stats.streak ? `${Math.min(100, Math.round((stats.streak / 7) * 100))}%` : '0%',
    },
    {
      title: 'Quiz Readiness',
      subtitle: stats.quizzesPassed
        ? `${stats.quizzesPassed} quiz${stats.quizzesPassed === 1 ? '' : 'zes'} completed`
        : 'Take a module quiz to build this milestone',
      value: Math.min(1, stats.quizzesPassed / 3),
      label: `${Math.min(100, Math.round((stats.quizzesPassed / 3) * 100))}%`,
    },
  ];

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
});