import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomBelt from './BottomBelt';
import { finishLesson } from '../lib/studentProgress';

const COLORS = {
  background: '#F6EBDD',
  panel: '#FFFDFC',
  ink: '#2B2622',
  muted: '#7D7066',
  brown: '#A48769',
  coral: '#E36455',
};

export default function SignDictionaryPage({ title, subtitle, items, signKey, imageKey, category = 'Signs', lessonId }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [completing, setCompleting] = useState(false);
  const filteredItems = useMemo(() => items.filter((item) => {
    const value = String(item[signKey] || item.title || '').toLowerCase();
    return value.includes(query.trim().toLowerCase());
  }), [items, query, signKey]);

  const openCamera = () => {
    if (!selected) return;
    router.push({ pathname: '/ai-camera', params: { targetSign: selected[signKey] || selected.title } });
  };

  const handleCompleteLesson = async () => {
    if (!lessonId || completing) {
      router.back();
      return;
    }
    setCompleting(true);
    await finishLesson(lessonId, router, {
      title: `Completed ${title}`,
      detail: `You finished the ${category} lesson.`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={25} color={COLORS.ink} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.headerIcon}><MaterialIcons name="auto-awesome" size={21} color={COLORS.brown} /></View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search signs, words..." placeholderTextColor="#9A8D80" style={styles.searchInput} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {filteredItems.map((item) => (
              <Pressable key={item.id || item[signKey]} style={styles.signCard} onPress={() => setSelected(item)}>
                <View style={styles.signImageFrame}>
                  {item[imageKey] ? <Image source={item[imageKey]} style={styles.signImage} resizeMode="contain" /> : <Text style={styles.signFallback}>{item.illustration || item[signKey]}</Text>}
                </View>
                <Text style={styles.signName} numberOfLines={1}>{item[signKey] || item.title}</Text>
                <Text style={styles.signCategory} numberOfLines={1}>{item.category || category}</Text>
              </Pressable>
            ))}
          </View>
          {!filteredItems.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No signs found</Text><Text style={styles.emptyText}>Try a different search term.</Text></View> : null}
          {lessonId ? (
            <Pressable style={styles.completeButton} onPress={handleCompleteLesson} disabled={completing}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>{completing ? 'Saving...' : 'Complete Lesson'}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        <BottomBelt active="learn" />
      </View>

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}><Ionicons name="close" size={21} color={COLORS.ink} /></Pressable>
            {selected ? (
              <>
                <Text style={styles.modalCategory}>{selected.category || category}</Text>
                <Text style={styles.modalTitle}>{selected[signKey] || selected.title}</Text>
                <View style={styles.modalImageFrame}>
                  {selected[imageKey] ? <Image source={selected[imageKey]} style={styles.modalImage} resizeMode="contain" /> : <Text style={styles.modalFallback}>{selected.illustration || selected[signKey]}</Text>}
                </View>
                <View style={styles.detailBox}><Text style={styles.detailLabel}>Hand Shape:</Text><Text style={styles.detailValue}>{selected.handShape || 'Follow the illustrated hand position.'}</Text></View>
                <View style={styles.detailBox}><Text style={styles.detailLabel}>Description:</Text><Text style={styles.detailValue}>{selected.instruction || 'Practice the sign slowly and clearly.'}</Text></View>
                <Pressable style={styles.cameraButton} onPress={openCamera}><Ionicons name="camera" size={17} color="#FFFFFF" /><Text style={styles.cameraButtonText}>Test in AI Camera</Text></Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, paddingHorizontal: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13 },
  backButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: COLORS.panel, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { color: COLORS.ink, fontSize: 21, fontWeight: '900' },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  headerIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#EBD8C1', alignItems: 'center', justifyContent: 'center' },
  searchBox: { height: 44, borderRadius: 13, borderWidth: 1.5, borderColor: COLORS.ink, backgroundColor: COLORS.panel, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, color: COLORS.ink, fontSize: 13, marginLeft: 8 },
  content: { paddingBottom: 105 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  signCard: { width: '48.5%', minHeight: 132, borderRadius: 17, borderWidth: 1.5, borderColor: COLORS.ink, backgroundColor: COLORS.panel, alignItems: 'center', padding: 10, shadowColor: '#1E1711', shadowOffset: { width: 2, height: 3 }, shadowOpacity: 0.95, shadowRadius: 0, elevation: 3 },
  signImageFrame: { width: 57, height: 57, borderRadius: 14, borderWidth: 1, borderColor: COLORS.ink, backgroundColor: '#F7E8DD', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  signImage: { width: 48, height: 48 },
  signFallback: { color: COLORS.ink, fontSize: 29 },
  signName: { color: COLORS.ink, fontSize: 12, fontWeight: '900', textAlign: 'center' },
  signCategory: { color: COLORS.muted, fontSize: 9, marginTop: 3, textAlign: 'center' },
  empty: { alignItems: 'center', padding: 35 },
  emptyTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800' },
  emptyText: { color: COLORS.muted, marginTop: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(24,20,17,0.62)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.panel, borderRadius: 25, padding: 14, paddingTop: 19, marginHorizontal: 12, marginBottom: 12, borderWidth: 1.5, borderColor: COLORS.ink },
  closeButton: { position: 'absolute', right: 13, top: 13, width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  modalCategory: { alignSelf: 'center', color: COLORS.ink, backgroundColor: '#F3C7B7', borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3, fontSize: 9, fontWeight: '800' },
  modalTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 6, marginBottom: 10 },
  modalImageFrame: { height: 130, borderRadius: 15, borderWidth: 1, borderColor: COLORS.ink, backgroundColor: '#F4E9DC', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  modalImage: { width: 120, height: 120 },
  modalFallback: { color: COLORS.ink, fontSize: 60 },
  detailBox: { backgroundColor: '#FAFAFA', borderRadius: 10, borderWidth: 1, borderColor: '#E5E0DB', padding: 9, marginBottom: 7 },
  detailLabel: { color: COLORS.ink, fontSize: 11, fontWeight: '900' },
  detailValue: { color: COLORS.muted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  cameraButton: { minHeight: 45, borderRadius: 11, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: 3 },
  cameraButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  completeButton: { minHeight: 48, borderRadius: 14, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 16 },
  completeButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
