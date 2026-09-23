import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

export default function VideoPlayer() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const videoUri = String(params.videoUri ?? '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Play Video</Text>
      </View>

      <View style={styles.playerWrap}>
        {videoUri ? (
          <Video
            source={{ uri: videoUri }}
            style={styles.player}
            useNativeControls
            resizeMode="contain"
            shouldPlay
          />
        ) : (
          <Text style={styles.emptyText}>No video to play.</Text>
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
  playerWrap: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  player: { width: '100%', height: 320, backgroundColor: '#000' },
  emptyText: { color: '#666' },
});
