import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const BIRTHDAYS = [
  { id: 'b1', name: 'Aileen', date: 'Jul 20', avatar: require('../assets/images/avatar.png') },
  { id: 'b2', name: 'Craig', date: 'Aug 3', avatar: require('../assets/images/avatar.png') },
  { id: 'b3', name: 'Miles', date: 'Sep 10', avatar: require('../assets/images/avatar.png') },
];

export default function Birthdays() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Image source={item.avatar} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <TouchableOpacity style={styles.wishBtn} activeOpacity={0.8} onPress={() => router.push('/messages') }>
        <Text style={styles.wishText}>Send wish</Text>
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
          <Text style={styles.headerTitle}>Birthdays</Text>
        </View>

        <FlatList data={BIRTHDAYS} keyExtractor={(i) => i.id} renderItem={renderItem} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={{ paddingBottom: 24 }} />
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
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  avatar: { width: 56, height: 56, borderRadius: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#2F2C4B' },
  date: { fontSize: 13, color: '#958EAB', marginTop: 4 },
  wishBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  wishText: { color: '#333', fontWeight: '700' },
});
