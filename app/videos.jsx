import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { MaterialIcons } from '@expo/vector-icons';

const VIDEOS = [
  { id: 'v1', title: 'Greetings Practice', duration: '2:14', thumb: require('../assets/images/A.png') },
  { id: 'v2', title: 'Numbers Quick Tips', duration: '3:02', thumb: require('../assets/images/B.png') },
];

export default function Videos() {
  const router = useRouter();
  const [videoList, setVideoList] = useState(VIDEOS);

  useEffect(() => {
    const loadSharedVideos = async () => {
      try {
        const teacherSaved = await AsyncStorage.getItem('teacherContentPosts_shared');
        const deafSaved = await AsyncStorage.getItem('deafContentPosts_shared');

        const combined = [];

        // helper to map posts to list items
        const mapPosts = (posts, defaultThumb, prefix) =>
          posts
            .filter((post) => post.videoUri || post.videoUrl)
            .map((post, index) => ({
              id: `${prefix}-upload-${post.id || index}`,
              title: post.title || `${prefix === 'teacher' ? 'Teacher' : 'Community'} Upload ${index + 1}`,
              duration: prefix === 'teacher' ? 'Uploaded lesson' : 'Community upload',
              thumb: post.photoUri ? { uri: post.photoUri } : defaultThumb,
              videoUri: post.videoUri || post.videoUrl,
            }));

        if (teacherSaved) {
          const parsed = JSON.parse(teacherSaved);
          combined.push(...mapPosts(parsed, require('../assets/images/A.png'), 'teacher'));
        }

        if (deafSaved) {
          const parsedD = JSON.parse(deafSaved);
          combined.push(...mapPosts(parsedD, require('../assets/images/B.png'), 'deaf'));
        }

        // Generate thumbnails for shared posts that have video but no photoUri
        try {
          if (teacherSaved) {
            const parsed = JSON.parse(teacherSaved);
            let updated = false;
            for (let i = 0; i < parsed.length; i++) {
              const p = parsed[i];
              const src = p.videoUri || p.videoUrl;
              if ((src) && !p.photoUri) {
                try {
                  const { uri } = await VideoThumbnails.getThumbnailAsync(src, { time: 1000 });
                  if (uri) {
                    parsed[i].photoUri = uri;
                    updated = true;
                  }
                } catch (e) {
                  console.log('Thumb gen failed for teacher post', p.id, e);
                }
              }
            }
            if (updated) {
              await AsyncStorage.setItem('teacherContentPosts_shared', JSON.stringify(parsed));
            }
          }

          if (deafSaved) {
            const parsedD = JSON.parse(deafSaved);
            let updatedD = false;
            for (let i = 0; i < parsedD.length; i++) {
              const p = parsedD[i];
              const src = p.videoUri || p.videoUrl;
              if ((src) && !p.photoUri) {
                try {
                  const { uri } = await VideoThumbnails.getThumbnailAsync(src, { time: 1000 });
                  if (uri) {
                    parsedD[i].photoUri = uri;
                    updatedD = true;
                  }
                } catch (e) {
                  console.log('Thumb gen failed for deaf post', p.id, e);
                }
              }
            }
            if (updatedD) {
              await AsyncStorage.setItem('deafContentPosts_shared', JSON.stringify(parsedD));
            }
          }
        } catch (persistErr) {
          console.log('Error persisting thumbnails:', persistErr);
        }

        if (combined.length > 0) {
          setVideoList((prev) => [...combined, ...prev]);
        }
      } catch (error) {
        console.log('Error loading shared videos:', error);
      }
    };

    loadSharedVideos();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={item.thumb} style={styles.thumb} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.playBtn} onPress={() => router.push(`/video-player?videoUri=${encodeURIComponent(item.videoUri)}`)} activeOpacity={0.8}>
        <Text style={styles.playText}>Play</Text>
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
          <Text style={styles.headerTitle}>Videos</Text>
        </View>

        <FlatList data={videoList} keyExtractor={(i) => i.id} renderItem={renderItem} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={{ paddingBottom: 24 }} />
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
  playBtn: { backgroundColor: '#4ECDC4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  playText: { color: '#FFF', fontWeight: '700' },
});
