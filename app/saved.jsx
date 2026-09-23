import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const SAVED = [
  { id: 's1', title: 'Alphabet Lesson', type: 'Lesson', thumb: require('../assets/images/A.png') },
  { id: 's2', title: 'Shared Video: Greetings', type: 'Video', thumb: require('../assets/images/B.png') },
];

export default function Saved() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.thumb} style={styles.thumb} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.type}</Text>
      </View>
      <TouchableOpacity style={styles.openBtn} onPress={() => router.push('/learn')} activeOpacity={0.8}>
        <Text style={styles.openText}>Open</Text>
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
          <Text style={styles.headerTitle}>Saved</Text>
        </View>

        <FlatList data={SAVED} keyExtractor={(i) => i.id} renderItem={renderItem} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={{ paddingBottom: 24 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8D7C6' },
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  backButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#D4C4B0' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#333' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  thumb: { width: 64, height: 64, borderRadius: 10, marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#2F2C4B' },
  cardSubtitle: { fontSize: 13, color: '#958EAB', marginTop: 6 },
  openBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  openText: { color: '#FFF', fontWeight: '700' },
});
