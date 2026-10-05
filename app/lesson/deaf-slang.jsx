import React, { useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { finishLesson } from '../lib/studentProgress';

const lessonData = [
  {
    id: 0,
    title: 'Deaf Slang & Idioms',
    subtitle: 'Everyday phrases in sign language',
    instruction:
      'These signs are used by Deaf communities to express culture, humor, and everyday feelings.',
    isIntro: true,
  },
  {
    id: 1,
    title: 'Cool',
    instruction:
      'Use a flat hand with fingers together near your cheek and move outward with a relaxed expression.',
    icon: '😎',
  },
  {
    id: 2,
    title: 'Hang Out',
    instruction:
      'Make a loose “Y” handshape and rock it slightly back and forth to show casual hanging out.',
    icon: '🤙',
  },
  {
    id: 3,
    title: 'Ready',
    instruction:
      'Clap both hands lightly together once to show that you are ready.',
    icon: '👍',
  },
  {
    id: 4,
    title: 'Chill',
    instruction:
      'Relax your hand and move it in a slow floating motion to show calm or chill energy.',
    icon: '🧊',
  },
];

export default function DeafSlangLesson() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const current = lessonData[currentStep];
  const progressText = `${currentStep + 1}/${lessonData.length}`;
  const progressPercent = ((currentStep + 1) / lessonData.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4C4B0" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/learn')} style={styles.backButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deaf Slang</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Lesson Progress</Text>
            <Text style={styles.progressValue}>{progressText}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.card}>
            <View style={styles.lessonHero}>
              <Text style={styles.lessonIcon}>{current.icon || '🗣️'}</Text>
              <Text style={styles.lessonTitle}>{current.title}</Text>
            </View>
            <Text style={styles.lessonSubtitle}>{current.subtitle}</Text>
            <Text style={styles.lessonInstruction}>{current.instruction}</Text>
          </View>

          {!current.isIntro && (
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Use it naturally</Text>
              <Text style={styles.tipText}>
                These signs feel more natural with casual body language and a relaxed facial expression.
              </Text>
            </View>
          )}

          <View style={styles.navigationRow}>
            <TouchableOpacity
              onPress={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              disabled={currentStep === 0}
            >
              <MaterialIcons name="arrow-back" size={20} color={currentStep === 0 ? '#AAA' : '#333'} />
              <Text style={[styles.navButtonText, currentStep === 0 && styles.disabledText]}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => currentStep < lessonData.length - 1 ? setCurrentStep(currentStep + 1) : finishLesson('11', router, { title: 'Completed Deaf Slang Lesson', detail: 'You finished Deaf Slang/Idioms.' })}
              style={styles.navButtonPrimary}
            >
              <Text style={styles.navButtonTextPrimary}>
                {currentStep === lessonData.length - 1 ? 'Complete Lesson' : 'Continue'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.quickNav}>
            <Text style={styles.quickNavTitle}>Lesson Topics</Text>
            <View style={styles.quickNavList}>
              {lessonData.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.quickNavItem,
                    currentStep === item.id && styles.quickNavItemActive,
                  ]}
                  onPress={() => setCurrentStep(item.id)}
                >
                  <Text style={[
                    styles.quickNavItemText,
                    currentStep === item.id && styles.quickNavItemTextActive,
                  ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#D4C4B0' },
  container: { flex: 1, backgroundColor: '#E8E2D5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333' },
  headerSpacer: { width: 32 },
  content: { padding: 20, paddingBottom: 40 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { color: '#666', fontSize: 13, fontWeight: '600' },
  progressValue: { color: '#333', fontSize: 13, fontWeight: '700' },
  progressBar: { height: 8, backgroundColor: '#F4EEE5', borderRadius: 8, marginBottom: 20 },
  progressFill: { height: '100%', backgroundColor: '#4ECDC4', borderRadius: 8 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 20,
  },
  lessonHero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  lessonIcon: {
    fontSize: 44,
    width: 60,
    height: 60,
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 18,
    backgroundColor: '#F5F1ED',
  },
  lessonTitle: { fontSize: 24, fontWeight: '800', color: '#222' },
  lessonSubtitle: { color: '#777', marginBottom: 18, lineHeight: 20 },
  lessonInstruction: { fontSize: 15, color: '#444', lineHeight: 22 },
  tipCard: { backgroundColor: '#FFFBF4', borderRadius: 20, padding: 18, marginBottom: 20 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 10 },
  tipText: { fontSize: 14, color: '#5F5A54', lineHeight: 20 },
  navigationRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 24 },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0D6C8',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: 'center',
  },
  navButtonDisabled: { opacity: 0.65 },
  navButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flex: 1,
  },
  navButtonText: { fontSize: 14, color: '#333', fontWeight: '700' },
  navButtonTextPrimary: { fontSize: 14, color: '#FFF', fontWeight: '700' },
  disabledText: { color: '#999' },
  quickNav: { padding: 18, backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E0D6C8' },
  quickNavTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  quickNavList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickNavItem: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, backgroundColor: '#F5F1ED' },
  quickNavItemActive: { backgroundColor: '#4ECDC4' },
  quickNavItemText: { color: '#555', fontWeight: '600', fontSize: 12 },
  quickNavItemTextActive: { color: '#FFF' },
});
