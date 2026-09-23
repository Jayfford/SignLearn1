import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ImageViewer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const imageUri = String(params.imageUri ?? '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Image</Text>
      </View>

      <View style={styles.viewerWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.emptyText}>No image to display.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E8D7C6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  backButton: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#D4C4B0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#333' },
  viewerWrap: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '80%', backgroundColor: '#FFF' },
  emptyText: { color: '#666' },
});
