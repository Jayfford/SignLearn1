import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const POSTS = [
  { id: 'p1', title: 'New lesson added', excerpt: 'Check out the updated greetings lesson.' },
  { id: 'p2', title: 'Community challenge', excerpt: 'Join the 7-day storytelling challenge.' },
  { id: 'p3', title: 'Video share', excerpt: 'Watch Zanelyna’s latest practice clip.' },
];

export default function Feeds() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postExcerpt}>{item.excerpt}</Text>
      </View>
      <TouchableOpacity onPress={() => router.push('/feeds')} style={styles.viewBtn} activeOpacity={0.8}>
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Feeds</Text>
            <Text style={styles.headerSubtitle}>Latest SignLearn updates and community highlights.</Text>
          </View>
        </View>

        <FlatList
          data={POSTS}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8D7C6' },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 20, marginBottom: 18 },
  backButton: { backgroundColor: '#FFF', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#D4C4B0' },
  headerTextGroup: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#666', lineHeight: 20 },
  list: { paddingTop: 8, paddingBottom: 24 },
  postCard: {
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  postContent: { flex: 1 },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#2F2C4B', marginBottom: 6 },
  postExcerpt: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  viewBtn: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  viewText: { color: '#FFF', fontWeight: '700' },
});
