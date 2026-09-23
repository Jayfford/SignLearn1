import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const FEED_POSTS = [
  {
    id: '1',
    author: 'SignLearn Team',
    avatar: '📣',
    title: 'New Module Released',
    content:
      'Module 2 is now live! Learn how to sign weather phrases, ask for the time, and share daily conversations in Filipino Sign Language.',
    timestamp: 'Just now',
    likes: 128,
    comments: 21,
    shares: 12,
    tags: ['#NewLesson', '#FSL', '#DailyPractice'],
  },
  {
    id: '2',
    author: 'Mika',
    avatar: '🤟',
    title: 'Daily Practice Win',
    content:
      'I completed the Alphabet lesson and feel more confident with each sign. Quick review sessions help me remember the handshapes better.',
    timestamp: '3 hours ago',
    likes: 94,
    comments: 16,
    shares: 7,
    tags: ['#Progress', '#Practice', '#SignLearn'],
  },
  {
    id: '3',
    author: 'Teacher Ana',
    avatar: '👩‍🏫',
    title: 'Signing Tip',
    content:
      'When you ask a question in FSL, keep your eyebrow raised and hold the final sign slightly longer to show it’s a question.',
    timestamp: 'Yesterday',
    likes: 174,
    comments: 26,
    shares: 18,
    tags: ['#Teaching', '#Question', '#NMS'],
  },
  {
    id: '4',
    author: 'Community Spotlight',
    avatar: '🌟',
    title: 'Weekly Challenge',
    content:
      'Share your favorite sign using #SignLearnGoal and get featured in the community highlight. Keep your post short, clear, and expressive.',
    timestamp: '2 days ago',
    likes: 63,
    comments: 12,
    shares: 9,
    tags: ['#Challenge', '#Community', '#ShareYourSign'],
  },
];

export default function Community() {
  const router = useRouter();
  const [posts, setPosts] = useState(FEED_POSTS);
  const [debugPosts, setDebugPosts] = useState(null);
  const [debugVisible, setDebugVisible] = useState(false);

  useEffect(() => {
    const loadCommunityPosts = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed?.accountType === 'deaf') {
            const email = parsed?.email;
            const storageKey = email ? `deafContentPosts_${email}` : 'deafContentPosts_shared';
            const stored = await AsyncStorage.getItem(storageKey);
            if (stored) {
              const parsedPosts = JSON.parse(stored);
              setDebugPosts(parsedPosts);
              if (Array.isArray(parsedPosts) && parsedPosts.length > 0) {
                setPosts(parsedPosts.map((post) => ({
                  id: post.id || `deaf-post-${Date.now()}`,
                  author: post.author || 'Deaf Community',
                  avatar: post.avatar || '🤟',
                  title: post.title || 'Community Post',
                    content: post.content ?? post.text ?? '',
                    image: post.image ?? post.photoUri ?? '',
                    photoUri: post.photoUri ?? '',
                  timestamp: post.timestamp || 'Just now',
                  likes: post.likes ?? 0,
                  comments: post.comments ?? 0,
                  shares: post.shares ?? 0,
                  tags: Array.isArray(post.tags) && post.tags.length > 0
                    ? post.tags
                    : ['#DeafCommunity', '#Share'],
                  liked: post.liked ?? false,
                })));
                return;
              }
            }
          }
        }
      } catch (error) {
        console.log('Error loading Deaf community posts:', error);
      }
      setDebugPosts(null);
      setPosts(FEED_POSTS);
    };

    loadCommunityPosts();
  }, []);

  const debugShowStoredPosts = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      let email = null;
      if (userData) {
        const parsed = JSON.parse(userData);
        email = parsed?.email ?? null;
      }
      const storageKey = email ? `deafContentPosts_${email}` : 'deafContentPosts_shared';
      const stored = await AsyncStorage.getItem(storageKey);
      if (!stored) {
        Alert.alert('Debug', `No posts found under ${storageKey}`);
        return;
      }
      const parsedPosts = JSON.parse(stored);
      const first = parsedPosts && parsedPosts.length ? parsedPosts[0] : null;
      const sample = first ? (first.photoUri || first.image || JSON.stringify(first)) : 'no items';
      Alert.alert('Debug', `Found ${parsedPosts.length} posts. Sample photoUri/image: ${String(sample)}`);
      console.log('Stored deaf posts:', parsedPosts);
    } catch (e) {
      console.log('Debug read failed', e);
      Alert.alert('Debug error', String(e));
    }
  };

  const handleToggleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;
        const liked = !post.liked;
        return {
          ...post,
          liked,
          likes: liked ? (post.likes ?? 0) + 1 : (post.likes ?? 0) - 1,
        };
      })
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthorInfo}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View>
            <Text style={styles.postAuthor}>{item.author}</Text>
            <Text style={styles.postTime}>{item.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Feather name="more-horizontal" size={20} color="#999" />
        </TouchableOpacity>
      </View>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      {(item.photoUri || item.image) ? (
        <View style={styles.postImageContainer}>
          {item.photoUri ? (
            <TouchableOpacity onPress={() => router.push(`/image-viewer?imageUri=${encodeURIComponent(item.photoUri)}`)} activeOpacity={0.9}>
              <Image source={{ uri: item.photoUri }} style={styles.postImageImg} />
            </TouchableOpacity>
          ) : typeof item.image === 'string' && (item.image.startsWith('http') || item.image.startsWith('file') || item.image.startsWith('data:') || item.image.startsWith('blob:')) ? (
            <TouchableOpacity onPress={() => router.push(`/image-viewer?imageUri=${encodeURIComponent(item.image)}`)} activeOpacity={0.9}>
              <Image source={{ uri: item.image }} style={styles.postImageImg} />
            </TouchableOpacity>
          ) : (item.image && item.image.uri) ? (
            <TouchableOpacity onPress={() => router.push(`/image-viewer?imageUri=${encodeURIComponent(item.image.uri)}`)} activeOpacity={0.9}>
              <Image source={item.image} style={styles.postImageImg} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      {item.tags?.length > 0 && (
        <View style={styles.tagRow}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tagBubble}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.socialMetrics}>
        <Text style={styles.metricText}>{item.likes} likes</Text>
        <Text style={styles.metricText}>{item.comments} comments</Text>
        <Text style={styles.metricText}>{item.shares} shares</Text>
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionButton}
          onPress={() => handleToggleLike(item.id)}
          activeOpacity={0.8}
        >
          <Feather name={item.liked ? 'heart' : 'heart'} size={18} color={item.liked ? '#E85D5D' : '#666'} />
          <Text style={[styles.postActionText, item.liked && styles.postActionTextActive]}>
            {item.liked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={() => router.push('/community')} activeOpacity={0.8}>
          <Feather name="message-circle" size={18} color="#666" />
          <Text style={styles.postActionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={() => router.push('/community')} activeOpacity={0.8}>
          <Feather name="share-2" size={18} color="#666" />
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E9DDCB" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={24} color="#2F2A28" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Community Feed</Text>
            <Text style={styles.headerSubtitle}>Stay updated with SignLearn news, tips, and student highlights.</Text>
          </View>
          <TouchableOpacity onPress={debugShowStoredPosts} style={{ marginLeft: 8 }} activeOpacity={0.8}>
            <MaterialIcons name="bug-report" size={22} color="#655F58" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDebugVisible((v) => !v)} style={{ marginLeft: 8 }} activeOpacity={0.8}>
            <MaterialIcons name={debugVisible ? 'visibility-off' : 'visibility'} size={22} color="#655F58" />
          </TouchableOpacity>
        </View>

        {debugVisible && debugPosts ? (
          <View style={{ padding: 12, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#333', fontWeight: '700', marginBottom: 6 }}>Stored Deaf Posts (raw)</Text>
            <ScrollView style={{ maxHeight: 220 }}>
              <Text style={{ fontSize: 12, color: '#444' }}>{JSON.stringify(debugPosts, null, 2)}</Text>
            </ScrollView>
          </View>
        ) : null}

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E9DDCB' },
  container: { flex: 1, padding: 20, backgroundColor: '#E9DDCB' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 26, marginBottom: 16 },
  backButton: { backgroundColor: '#F9F4EE', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#E7D9C7' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#2F2A28', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#655F58', lineHeight: 20 },
  list: { paddingBottom: 24 },
  postCard: {
    backgroundColor: '#F7F2EC',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    fontSize: 30,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2F2A28',
  },
  postTime: {
    fontSize: 12,
    color: '#8A8179',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F2A28',
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#544F4B',
    lineHeight: 22,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagBubble: {
    backgroundColor: '#F3E7DD',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#E96A67',
    fontWeight: '700',
  },
  socialMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricText: {
    fontSize: 12,
    color: '#8A8179',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  postActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F3EAE1',
  },
  postActionText: {
    fontSize: 13,
    color: '#544F4B',
    fontWeight: '600',
  },
  postActionTextActive: {
    color: '#E96A67',
  },
  postImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  postImageImg: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F5F1EA',
  },
});
