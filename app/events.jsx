import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const EVENTS = [
  { id: 'e1', title: 'Signing Workshop', date: 'Jul 25', location: 'Online' },
  { id: 'e2', title: 'Community Meetup', date: 'Aug 2', location: 'City Hall' },
];

export default function Events() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.date} • {item.location}</Text>
      </View>
      <TouchableOpacity style={styles.rsvpBtn} activeOpacity={0.8} onPress={() => router.push('/events') }>
        <Text style={styles.rsvpText}>RSVP</Text>
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
          <Text style={styles.headerTitle}>Events</Text>
        </View>

        <FlatList data={EVENTS} keyExtractor={(i) => i.id} renderItem={renderItem} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={{ paddingBottom: 24 }} />
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
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#2F2C4B' },
  cardSubtitle: { fontSize: 13, color: '#958EAB', marginTop: 6 },
  rsvpBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  rsvpText: { color: '#FFF', fontWeight: '700' },
});
