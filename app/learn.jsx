import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  Dimensions,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import BottomBelt from './components/BottomBelt';
import { useNotifications } from './notification-context';
import { getStudentProgress, TOTAL_LESSONS } from './lib/studentProgress';

const SIGN_LANGUAGE_STORAGE_KEY = 'selectedSignLanguage';

const SIGN_LANGUAGES = [
  {
    id: 'FSL',
    flag: '🇵🇭',
    title: 'Filipino Sign Language (FSL)',
    description: 'Learn signs used by the Filipino Deaf community.',
  },
  {
    id: 'ASL',
    flag: '🇺🇸',
    title: 'American Sign Language (ASL)',
    description: 'Learn signs commonly used in the United States.',
  },
];

export default function Learn() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const query = String(params.query ?? '').trim().toLowerCase();
  const [activeTab, setActiveTab] = useState('challenge');
  const [expandedCategories, setExpandedCategories] = useState(['Novice Sign']);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [likedVideos, setLikedVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [selectedLanguageId, setSelectedLanguageId] = useState(null);
  const [languageReady, setLanguageReady] = useState(false);
  const [studioPosts, setStudioPosts] = useState([]);
  const [studioDraft, setStudioDraft] = useState({
    title: '',
    text: '',
    photoUri: '',
    videoUrl: '',
    videoUri: '',
  });
  const sharedTeacherPostStorageKey = 'teacherContentPosts_shared';
  const sharedDeafPostStorageKey = 'deafContentPosts_shared';
  const [editingStudioId, setEditingStudioId] = useState(null);
  const { notifications } = useNotifications();
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoPosition, setVideoPosition] = useState(0);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const videoRef = useRef(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load user data and completed lessons
  useEffect(() => {
    loadUserData();
    loadLikedVideos();
    loadWatchHistory();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCompletedLessons();
    }, [])
  );

  useEffect(() => {
    if (userEmail && (accountType === 'teacher' || accountType === 'deaf')) {
      loadStudioPosts(accountType);
    }
  }, [userEmail, accountType]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.name) {
          setUserName(parsedData.name);
        }
        if (parsedData.email) {
          setUserEmail(parsedData.email);
        }
            if (parsedData.accountType) {
          setAccountType(parsedData.accountType);
          if (parsedData.accountType === 'teacher' || parsedData.accountType === 'deaf') {
            setActiveTab('studio');
          }
        }
      }

      const storedLanguage = await AsyncStorage.getItem(SIGN_LANGUAGE_STORAGE_KEY);
      if (storedLanguage === 'FSL' || storedLanguage === 'ASL') {
        setSelectedLanguageId(storedLanguage);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLanguageReady(true);
    }
  };

  const loadStudioPosts = async (type) => {
    try {
      const storageKey = type === 'teacher'
        ? userEmail ? `teacherContentPosts_${userEmail}` : sharedTeacherPostStorageKey
        : userEmail ? `deafContentPosts_${userEmail}` : sharedDeafPostStorageKey;
      const savedPosts = await AsyncStorage.getItem(storageKey);

      if (savedPosts) {
        setStudioPosts(JSON.parse(savedPosts));
        return;
      }

      const sharedKey = type === 'teacher' ? sharedTeacherPostStorageKey : sharedDeafPostStorageKey;
      const sharedSavedPosts = await AsyncStorage.getItem(sharedKey);
      if (sharedSavedPosts) {
        const parsedSharedPosts = JSON.parse(sharedSavedPosts);
        setStudioPosts(parsedSharedPosts);
        if (userEmail) {
          await AsyncStorage.setItem(storageKey, JSON.stringify(parsedSharedPosts));
        }
        return;
      }

      if (userEmail && type === 'teacher') {
        const starterPosts = [
          {
            id: 'teacher-post-1',
            title: 'Basic Alphabet Lesson Plan',
            text: 'Introduce finger-spelling with visual cues and paced repetition to help beginner learners build confidence.',
            photoUri: '',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            videoUri: '',
          },
          {
            id: 'teacher-post-2',
            title: 'FSL Classroom Prompt',
            text: 'Share a daily classroom focus for vocabulary practice: greetings, numbers, and community phrases.',
            photoUri: '',
            videoUrl: '',
            videoUri: '',
          },
        ];
        setStudioPosts(starterPosts);
        await AsyncStorage.setItem(storageKey, JSON.stringify(starterPosts));
        await AsyncStorage.setItem(sharedTeacherPostStorageKey, JSON.stringify(starterPosts));
      }

      if (userEmail && type === 'deaf') {
        const starterPosts = [
          {
            id: 'deaf-post-1',
            title: 'Community Story Share',
            text: 'Share your favorite FSL phrase and how it connects to your daily life.',
            photoUri: '',
            videoUrl: '',
            videoUri: '',
          },
          {
            id: 'deaf-post-2',
            title: 'Deaf Culture Highlight',
            text: 'Talk about the importance of Deaf community spaces and visibility in education.',
            photoUri: '',
            videoUrl: '',
            videoUri: '',
          },
        ];
        setStudioPosts(starterPosts);
        await AsyncStorage.setItem(storageKey, JSON.stringify(starterPosts));
        await AsyncStorage.setItem(sharedDeafPostStorageKey, JSON.stringify(starterPosts));
      }
    } catch (error) {
      console.error('Error loading studio posts:', error);
    }
  };

  const saveStudioPosts = async (posts) => {
    try {
      const storageKey = accountType === 'teacher'
        ? userEmail ? `teacherContentPosts_${userEmail}` : sharedTeacherPostStorageKey
        : userEmail ? `deafContentPosts_${userEmail}` : sharedDeafPostStorageKey;
      await AsyncStorage.setItem(storageKey, JSON.stringify(posts));
      const sharedKey = accountType === 'teacher' ? sharedTeacherPostStorageKey : sharedDeafPostStorageKey;
      await AsyncStorage.setItem(sharedKey, JSON.stringify(posts));
      setStudioPosts(posts);
    } catch (error) {
      console.error('Error saving studio posts:', error);
    }
  };

  const loadCompletedLessons = async () => {
    try {
      const progress = await getStudentProgress();
      const lessons = progress.completedLessons || [];
      setCompletedLessons(lessons);
      const progressPercent = (lessons.length / TOTAL_LESSONS) * 100;
      setProgress(Math.min(progressPercent, 100));
    } catch (error) {
      console.error('Error loading completed lessons:', error);
    }
  };

  const loadLikedVideos = async () => {
    try {
      const savedLikes = await AsyncStorage.getItem('likedVideos');
      if (savedLikes) {
        setLikedVideos(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error('Error loading liked videos:', error);
    }
  };

  const loadWatchHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('watchHistory');
      if (savedHistory) {
        setWatchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading watch history:', error);
    }
  };

  const saveLikedVideos = async (videos) => {
    try {
      await AsyncStorage.setItem('likedVideos', JSON.stringify(videos));
    } catch (error) {
      console.error('Error saving liked videos:', error);
    }
  };

  const saveWatchHistory = async (history) => {
    try {
      await AsyncStorage.setItem('watchHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  };

  const requestMediaLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.granted;
  };

  const pickStudioPhoto = async () => {
    const granted = await requestMediaLibraryPermission();
    if (!granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setStudioDraft((prev) => ({ ...prev, photoUri: result.assets[0].uri }));
    }
  };

  const pickStudioVideo = async () => {
    const granted = await requestMediaLibraryPermission();
    if (!granted) {
      Alert.alert('Permission needed', 'Please allow access to your video library to upload a video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const pickedUri = result.assets[0].uri;
        let thumbnailUri = '';
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(pickedUri, { time: 1000 });
          thumbnailUri = uri;
        } catch (thumbErr) {
          console.log('Thumbnail generation failed:', thumbErr);
        }

        setStudioDraft((prev) => ({
          ...prev,
          videoUri: pickedUri,
          videoUrl: pickedUri,
          photoUri: prev.photoUri || thumbnailUri || '',
        }));
      }
  };

  const resetStudioDraft = () => {
    setStudioDraft({ title: '', text: '', photoUri: '', videoUrl: '', videoUri: '' });
    setEditingStudioId(null);
  };

  const handleStudioSubmit = async () => {
    if (!studioDraft.title.trim()) {
      Alert.alert('Missing title', `Please add a title for your ${accountType === 'deaf' ? 'community post' : 'content'}.`);
      return;
    }

    const payload = {
      id: editingStudioId || `${accountType}-post-${Date.now()}`,
      title: studioDraft.title.trim(),
      text: studioDraft.text.trim(),
      content: studioDraft.text.trim(),
      photoUri: studioDraft.photoUri,
      image: studioDraft.photoUri || '',
      videoUrl: studioDraft.videoUrl.trim(),
      videoUri: studioDraft.videoUri,
      author: userName || (accountType === 'deaf' ? 'Deaf Community' : 'Teacher'),
      avatar: accountType === 'deaf' ? '🤟' : '🧑‍🏫',
      timestamp: new Date().toLocaleString(),
      likes: 0,
      comments: 0,
      shares: 0,
      tags: accountType === 'deaf' ? ['#DeafCommunity', '#Share'] : ['#Teacher', '#Lesson'],
    };

    const nextPosts = editingStudioId
      ? studioPosts.map((post) => (post.id === editingStudioId ? { ...post, ...payload } : post))
      : [payload, ...studioPosts];

    await saveStudioPosts(nextPosts);
    resetStudioDraft();
  };

  const handleEditStudioPost = (post) => {
    setEditingStudioId(post.id);
    setStudioDraft({
      title: post.title,
      text: post.text,
      photoUri: post.photoUri || '',
      videoUrl: post.videoUrl || '',
      videoUri: post.videoUri || '',
    });
  };

  const handleDeleteStudioPost = async (postId) => {
    const filtered = studioPosts.filter((post) => post.id !== postId);
    await saveStudioPosts(filtered);
    if (editingStudioId === postId) resetStudioDraft();
  };

  const initializeNotifications = () => {
    setNotifications([
      {
        id: '1',
        title: 'New Video Lesson Available',
        message: 'Check out the latest International Sign tutorial',
        timestamp: 'Just now',
        icon: 'ondemand-video',
        read: false,
      },
      {
        id: '2',
        title: 'Welcome! Continue Learning',
        message: 'You\'ve completed 2 lessons. Keep going!',
        timestamp: '2 hours ago',
        icon: 'trending-up',
        read: false,
      },
      {
        id: '3',
        title: 'Friend Started Learning',
        message: 'Sarah just started the Alphabet lesson',
        timestamp: '5 hours ago',
        icon: 'people',
        read: true,
      },
    ]);
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const isCategoryUnlocked = (category) => {
    if (category === 'Novice Sign') return true;
    if (category === 'Intermediate Sign') return completedLessons.length >= 4; // Complete Novice category
    if (category === 'Advance Sign') return completedLessons.length >= 7; // Complete Intermediate category
    return false;
  };

  const selectedLanguage = SIGN_LANGUAGES.find((language) => language.id === selectedLanguageId);
  const languageName = selectedLanguage?.id || 'FSL';
  const needsLanguageChoice = accountType === 'student' && languageReady && !selectedLanguageId;
  const showLessonModules = accountType !== 'student' || Boolean(selectedLanguageId);

  const handleSelectLanguage = async (languageId) => {
    try {
      await AsyncStorage.setItem(SIGN_LANGUAGE_STORAGE_KEY, languageId);
    } catch (error) {
      console.error('Error saving sign language preference:', error);
    }
    setSelectedLanguageId(languageId);
  };

  const handleChangeLanguage = async () => {
    try {
      await AsyncStorage.removeItem(SIGN_LANGUAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing sign language preference:', error);
    }
    setSelectedLanguageId(null);
  };

  const challengeData = [
    {
      id: '1',
      category: 'Novice Sign',
      description: `Learn the basics of ${languageName}`,
      lessons: [
        { id: '1', name: 'Alphabet', icon: 'font-download', locked: false },
        { id: '2', name: 'Numbers', icon: 'format-list-numbered', locked: false },
        { id: '3', name: 'Greetings & Manners', icon: 'handshake', locked: false },
        { id: '4', name: 'Module 1 Quiz', icon: 'quiz', locked: false },
      ],
    },
    {
      id: '2',
      category: 'Intermediate Sign',
      description: 'Expand your signing vocabulary',
      lessons: [
        { id: '5', name: 'Weather', icon: 'wb-sunny', locked: true },
        { id: '6', name: 'Narrative & Emotional Depth', icon: 'people', locked: true },
        { id: '7', name: 'Classifiers & Physics', icon: 'directions-car', locked: true },
      ],
    },
    {
      id: '3',
      category: 'Advance Sign',
      description: `Master advanced ${languageName} concepts`,
      lessons: [
        { id: '8', name: 'Module 2 Quiz', icon: 'quiz', locked: true },
        { id: '9', name: 'Classifiers (CL)', icon: 'flight', locked: true },
        { id: '10', name: 'Non-Manual Signals (NMS)', icon: 'face', locked: true },
        { id: '11', name: 'Deaf Slang/Idioms', icon: 'chat', locked: true },
        { id: '12', name: 'Module 3 Quiz', icon: 'quiz', locked: true },
      ],
    },
  ];

  const videoLessonsData = [
    {
      id: '1',
      title: 'International Sign',
      category: 'Global Signing',
      instructor: 'International Sign',
      date: 'Jan 24',
      likes: 23,
      comments: 57,
      shares: 5,
      avatar: '🌍',
      backgroundColor: '#4ECDC4',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      duration: '12:34',
    },
    {
      id: '2',
      title: 'Learn How To Sign',
      category: 'Beginner Guide',
      instructor: 'Learn How To Sign',
      date: 'Jan 24',
      likes: 45,
      comments: 32,
      shares: 8,
      avatar: '🤟',
      backgroundColor: '#FFD166',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
      duration: '8:45',
    },
    {
      id: '3',
      title: 'Top 20 Basic Phrases',
      category: 'Essential Signs',
      instructor: 'Sign Master Pro',
      date: 'Jan 24',
      likes: 67,
      comments: 89,
      shares: 15,
      avatar: '✋',
      backgroundColor: '#FF6B6B',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
      duration: '15:20',
    },
  ];

  const deafVideoLessonsData = [
    {
      id: 'd1',
      title: 'Deaf Community Spotlight',
      category: 'Culture & Resources',
      instructor: 'Deaf Voices',
      date: 'Jul 24',
      likes: 48,
      comments: 12,
      shares: 7,
      avatar: '🤟',
      backgroundColor: '#6F42C1',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
      duration: '10:12',
    },
    {
      id: 'd2',
      title: 'FSL Storytelling',
      category: 'Narrative Practice',
      instructor: 'Community Teacher',
      date: 'Jul 24',
      likes: 35,
      comments: 9,
      shares: 3,
      avatar: '🎥',
      backgroundColor: '#0A9396',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
      duration: '9:45',
    },
    {
      id: 'd3',
      title: 'Everyday Signing Tips',
      category: 'Everyday FSL',
      instructor: 'Community Mentor',
      date: 'Jul 24',
      likes: 52,
      comments: 18,
      shares: 10,
      avatar: '✋',
      backgroundColor: '#FFB703',
      videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
      duration: '11:20',
    },
  ];

  const handleLessonPress = (lesson) => {
    if (lesson.locked) return;
    
    const lessonRoutes = {
      'Alphabet': '/lesson/alphabet',
      'Numbers': '/lesson/numbers',
      'Greetings & Manners': '/lesson/greetings',
      'Module 1 Quiz': '/lesson/quiz?module=1',
      'Weather': '/lesson/weather',
      'Narrative & Emotional Depth': '/lesson/narrative',
      'Classifiers & Physics': '/lesson/classifiers',
      'Classifiers (CL)': '/lesson/classifiers-cl',
      'Non-Manual Signals (NMS)': '/lesson/nms',
      'Deaf Slang/Idioms': '/lesson/deaf-slang',
      'Module 2 Quiz': '/lesson/quiz?module=2',
      'Module 3 Quiz': '/lesson/quiz?module=3',
    };
    
    if (lessonRoutes[lesson.name]) {
      router.push(lessonRoutes[lesson.name]);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Learning Progress</Text>
        <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {completedLessons.length} of {TOTAL_LESSONS} lessons completed
      </Text>
    </View>
  );

  const searchMatches = (text) => text.toLowerCase().includes(query);

  const filterLessons = (lessons) =>
    lessons.filter((lesson) =>
      searchMatches(lesson.name) || searchMatches(lesson.icon) || searchMatches(lesson.category || '')
    );

  const uploadedStudioVideoLessons = accountType === 'deaf'
    ? []
    : studioPosts
        .filter((post) => post.videoUri || post.videoUrl)
        .map((post, index) => ({
          id: `${accountType}-upload-${post.id || index}`,
          title: post.title || `${accountType === 'deaf' ? 'Community' : 'Teacher'} Upload ${index + 1}`,
          category: accountType === 'deaf' ? 'Community Share' : 'Teacher Upload',
          instructor: userName || (accountType === 'deaf' ? 'Deaf Community' : 'Teacher'),
          date: 'Recently added',
          likes: 18 + index,
          comments: 4 + index,
          shares: 2 + index,
          avatar: accountType === 'deaf' ? '🤟' : '🧑‍🏫',
          backgroundColor: accountType === 'deaf' ? '#7C3AED' : '#A49B8A',
          videoUrl: post.videoUri || post.videoUrl,
          duration: 'Uploaded lesson',
          isUploaded: true,
        }));

  const allVideoLessons = accountType === 'deaf'
    ? deafVideoLessonsData
    : [...videoLessonsData, ...uploadedStudioVideoLessons];

  const filteredChallengeData = query
    ? challengeData
        .map((category) => ({
          ...category,
          lessons: filterLessons(category.lessons),
        }))
        .filter((category) => category.lessons.length > 0)
    : challengeData;

  const filteredVideoLessons = query
    ? allVideoLessons.filter((video) =>
        searchMatches(video.title) ||
        searchMatches(video.category) ||
        searchMatches(video.instructor) ||
        searchMatches(video.avatar)
      )
    : allVideoLessons;

  const renderLessonItem = ({ item, category }) => {
    const isCompleted = completedLessons.includes(item.id);
    const isUnlocked = isCategoryUnlocked(category) && !item.locked;
    
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={[
            styles.lessonItem,
            !isUnlocked && styles.lessonItemLocked,
            isCompleted && styles.lessonItemCompleted,
          ]}
          onPress={() => isUnlocked && handleLessonPress(item)}
          disabled={!isUnlocked}
          activeOpacity={0.7}
        >
          <View style={styles.lessonLeft}>
            <View style={[
              styles.lessonIconContainer,
              isCompleted && styles.lessonIconCompleted
            ]}>
              <MaterialIcons 
                name={item.icon} 
                size={22} 
                color={isCompleted ? '#FFF' : '#666'} 
              />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonName}>{item.name}</Text>
              <Text style={styles.lessonType}>Lesson • {category}</Text>
            </View>
          </View>
          <View style={styles.lessonRight}>
            {!isUnlocked ? (
              <MaterialIcons name="lock" size={20} color="#999" />
            ) : isCompleted ? (
              <MaterialIcons name="check-circle" size={24} color="#4ECDC4" />
            ) : (
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderCategorySection = ({ item }) => {
    const isUnlocked = isCategoryUnlocked(item.category);
    const isExpanded = expandedCategories.includes(item.category);
    
    return (
      <Animated.View 
        key={item.id} 
        style={[styles.categoryContainer, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          style={[
            styles.categoryHeader,
            !isUnlocked && styles.categoryHeaderLocked
          ]}
          onPress={() => isUnlocked && toggleCategory(item.category)}
          disabled={!isUnlocked}
          activeOpacity={0.8}
        >
          <View style={styles.categoryTitleContainer}>
            {!isUnlocked ? (
              <MaterialIcons name="lock" size={18} color="#999" />
            ) : (
              <MaterialIcons 
                name={isExpanded ? "expand-less" : "expand-more"} 
                size={20} 
                color="#666" 
              />
            )}
            <View style={styles.categoryTextContainer}>
              <Text style={[
                styles.categoryTitle,
                !isUnlocked && styles.categoryTitleLocked
              ]}>
                {item.category}
              </Text>
              <Text style={styles.categoryDescription}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.categoryProgress}>
            <Text style={styles.categoryProgressText}>
              {item.lessons.filter(l => completedLessons.includes(l.id)).length}/{item.lessons.length}
            </Text>
          </View>
        </TouchableOpacity>

        {isUnlocked && isExpanded && (
          <View style={styles.lessonsContainer}>
            {item.lessons.map((lesson) => (
              <View key={lesson.id}>
                {renderLessonItem({ item: lesson, category: item.category })}
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  const toggleLikeVideo = async (videoId) => {
    let newLikedVideos = [...likedVideos];
    if (newLikedVideos.includes(videoId)) {
      newLikedVideos = newLikedVideos.filter((id) => id !== videoId);
    } else {
      newLikedVideos = [...newLikedVideos, videoId];
    }
    setLikedVideos(newLikedVideos);
    await saveLikedVideos(newLikedVideos);
  };

  const addToWatchHistory = async (videoId, videoTitle) => {
    const newHistoryItem = {
      videoId,
      title: videoTitle,
      watchedAt: new Date().toISOString(),
    };
    const newHistory = [newHistoryItem, ...watchHistory.filter((item) => item.videoId !== videoId)];
    setWatchHistory(newHistory);
    await saveWatchHistory(newHistory);
  };

  const handleVideoPress = async (video) => {
    setSelectedVideo(video);
    setShowVideoPlayer(true);
    setVideoError(null);
    setVideoLoading(true);
    await addToWatchHistory(video.id, video.title);
  };

  const getThumbnailIcon = (videoTitle) => {
    if (videoTitle.includes('International')) return '🌍';
    if (videoTitle.includes('Learn')) return '🤟';
    return '✋';
  };

  const renderStudio = () => (
    <View style={styles.teacherStudioContainer}>
      <View style={styles.teacherStudioHeader}>
        <Text style={styles.teacherStudioTitle}>{accountType === 'deaf' ? 'Deaf Community Studio' : 'Teaching Content Studio'}</Text>
        <Text style={styles.teacherStudioSubtitle}>
          {accountType === 'deaf'
            ? 'Share community posts, stories, text, and photos with the Deaf community.'
            : 'Create, update, and manage classroom materials for your learners.'}
        </Text>
      </View>

      <View style={styles.teacherFormCard}>
        <Text style={styles.teacherSectionTitle}>{editingStudioId ? 'Edit your post' : 'Create new post'}</Text>

        <TextInput
          style={styles.teacherInput}
          value={studioDraft.title}
          onChangeText={(value) => setStudioDraft((prev) => ({ ...prev, title: value }))}
          placeholder={accountType === 'deaf' ? 'Post title or community topic' : 'Content title'}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.teacherInput, styles.teacherTextArea]}
          value={studioDraft.text}
          onChangeText={(value) => setStudioDraft((prev) => ({ ...prev, text: value }))}
          placeholder={accountType === 'deaf' ? 'Share a community story, insight, or resource' : 'Write your teaching text, lesson note, or announcement'}
          placeholderTextColor="#999"
          multiline
        />

        {accountType !== 'deaf' && (
          <TextInput
            style={styles.teacherInput}
            value={studioDraft.videoUrl}
            onChangeText={(value) => setStudioDraft((prev) => ({ ...prev, videoUrl: value, videoUri: value }))}
            placeholder="Video URL or uploaded video reference"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
        )}

        <View style={styles.teacherUploadRow}>
          <TouchableOpacity style={styles.teacherUploadButton} onPress={pickStudioPhoto} activeOpacity={0.8}>
            <MaterialIcons name="photo-library" size={20} color="#FFF" />
            <Text style={styles.teacherUploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.teacherUploadButtonSecondary} onPress={pickStudioVideo} activeOpacity={0.8}>
            <MaterialIcons name="videocam" size={20} color="#FFF" />
            <Text style={styles.teacherUploadButtonText}>Upload Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.teacherSecondaryButton} onPress={resetStudioDraft} activeOpacity={0.8}>
            <Text style={styles.teacherSecondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {studioDraft.photoUri ? (
          <Image source={{ uri: studioDraft.photoUri }} style={styles.teacherPreviewImage} />
        ) : null}

        {studioDraft.videoUri ? (
          <Video
            source={{ uri: studioDraft.videoUri }}
            style={styles.teacherPreviewVideo}
            useNativeControls
            resizeMode="cover"
            shouldPlay={false}
          />
        ) : null}

        <TouchableOpacity style={styles.teacherSaveButton} onPress={handleStudioSubmit} activeOpacity={0.8}>
          <Text style={styles.teacherSaveButtonText}>{editingStudioId ? 'Update Post' : 'Publish Post'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.teacherListSection}>
        <Text style={styles.teacherSectionTitle}>{accountType === 'deaf' ? 'Community posts' : 'Published content'}</Text>
        {studioPosts.map((post) => (
          <View key={post.id} style={styles.teacherPostCard}>
            <View style={styles.teacherPostHeader}>
              <Text style={styles.teacherPostTitle}>{post.title}</Text>
              <View style={styles.teacherPostActions}>
                <TouchableOpacity onPress={() => handleEditStudioPost(post)} activeOpacity={0.8}>
                  <MaterialIcons name="edit" size={18} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteStudioPost(post.id)} activeOpacity={0.8}>
                  <MaterialIcons name="delete" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            {post.text ? <Text style={styles.teacherPostText}>{post.text}</Text> : null}
            {post.photoUri ? <Image source={{ uri: post.photoUri }} style={styles.teacherPostImage} /> : null}
            {(post.videoUri || post.videoUrl) ? (
              post.videoUri ? (
                <Video
                  source={{ uri: post.videoUri }}
                  style={styles.teacherPostVideo}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay={false}
                />
              ) : (
                <Text style={styles.teacherPostVideoLink} numberOfLines={1}>
                  Video: {post.videoUrl}
                </Text>
              )
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );

  const renderVideoPlayerModal = () => (
    <Modal
      visible={showVideoPlayer && selectedVideo}
      transparent={false}
      animationType="slide"
    >
      <SafeAreaView style={styles.videoPlayerContainer}>
        <TouchableOpacity
          style={styles.videoCloseButton}
          onPress={() => {
            setShowVideoPlayer(false);
            setIsPlaying(false);
            setVideoPosition(0);
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.videoPlayArea}>
          {selectedVideo?.videoUrl ? (
            <>
              <Video
                ref={videoRef}
                style={styles.videoPlayer}
                source={{
                  uri: selectedVideo.videoUrl,
                }}
                useNativeControls
                resizeMode="contain"
                isLooping
                shouldPlay={false}
                onLoad={() => {
                  setVideoLoading(false);
                  setVideoError(null);
                }}
                onError={(error) => {
                  console.log('Video error:', error);
                  setVideoLoading(false);
                  setVideoError('Failed to load video. Please check your connection.');
                }}
                onPlayStatusUpdate={(status) => {
                  setIsPlaying(status.isPlaying);
                  setVideoPosition(status.positionMillis || 0);
                  setVideoDuration(status.durationMillis || 0);
                }}
              />
              {videoLoading && (
                <View style={styles.videoLoadingOverlay}>
                  <View style={styles.loadingSpinner}>
                    <Text style={styles.loadingText}>Loading video...</Text>
                  </View>
                </View>
              )}
              {videoError && (
                <View style={styles.videoErrorOverlay}>
                  <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
                  <Text style={styles.errorText}>{videoError}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={[styles.videoDisplayBox, { backgroundColor: selectedVideo?.backgroundColor }]}>
              <View style={styles.videoPlayContent}>
                <MaterialIcons name="play-circle-filled" size={80} color="#FFF" />
                <Text style={styles.videoPlaceholderText}>{selectedVideo?.avatar}</Text>
              </View>
            </View>
          )}
        </View>

        <ScrollView style={styles.videoInfoContainer}>
          <Text style={styles.videoPlayerTitle}>{selectedVideo?.title}</Text>
          <Text style={styles.videoPlayerInstructor}>{selectedVideo?.instructor}</Text>
          <Text style={styles.videoPlayerCategory}>{selectedVideo?.category}</Text>
          
          {selectedVideo?.duration && (
            <Text style={styles.videoDurationText}>Duration: {selectedVideo.duration}</Text>
          )}

          <Text style={styles.videoDescriptionTitle}>About this video</Text>
          <Text style={styles.videoDescription}>
            Learn and master sign language fundamentals with our expert instructors. This {selectedVideo?.category?.toLowerCase()} video covers essential concepts and practical techniques.
          </Text>

          <View style={styles.videoStatsContainer}>
            <View style={styles.statBox}>
              <MaterialIcons name="favorite" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>{selectedVideo?.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="chat-bubble" size={24} color="#4ECDC4" />
              <Text style={styles.statNumber}>{selectedVideo?.comments}</Text>
              <Text style={styles.statLabel}>Comments</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="share" size={24} color="#FFD166" />
              <Text style={styles.statNumber}>{selectedVideo?.shares}</Text>
              <Text style={styles.statLabel}>Shares</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderVideoLessonCard = ({ item }) => {
    const isLiked = likedVideos.includes(item.id);
    const currentLikes = isLiked ? item.likes + 1 : item.likes;
    const thumbnailIcon = getThumbnailIcon(item.title);

    const handleLikePress = () => {
      toggleLikeVideo(item.id);
    };

    return (
      <Animated.View 
        key={item.id} 
        style={[styles.videoCardContainer, { opacity: fadeAnim }]}
      >
        <TouchableOpacity 
          style={styles.videoCard}
          onPress={() => handleVideoPress(item)}
          activeOpacity={0.95}
        >
          {/* Video Thumbnail - Large Area with Gradient Background */}
          <View style={styles.videoThumbnailContainer}>
            <View style={[styles.videoThumbnail, { backgroundColor: item.backgroundColor }]}>
              <View style={styles.thumbnailContent}>
                <Text style={styles.videoThumbnailText}>{thumbnailIcon}</Text>
                <Text style={styles.thumbnailLabel}>{item.category || 'Video Lesson'}</Text>
              </View>
            </View>
            <View style={styles.playButtonOverlay}>
              <View style={styles.playButton}>
                <MaterialIcons name="play-arrow" size={32} color="#FFF" />
              </View>
            </View>
          </View>

          {/* Instructor Info Section */}
          <View style={styles.videoInfoSection}>
            <View style={styles.instructorRow}>
              <View style={[styles.avatarSmall, { backgroundColor: item.backgroundColor }]}>
                <Text style={styles.avatarTextSmall}>{item.avatar}</Text>
              </View>
              <View style={styles.instructorDetails}>
                <Text style={styles.instructorName}>{item.instructor}</Text>
                <Text style={styles.videoDate}>{item.date}</Text>
              </View>
              <TouchableOpacity style={styles.menuButtonSmall}>
                <MaterialIcons name="more-vert" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {item.isUploaded && (
              <View style={styles.uploadBadge}>
                <Text style={styles.uploadBadgeText}>
                  {accountType === 'deaf' ? 'Community Upload' : 'Teacher Upload'}
                </Text>
              </View>
            )}

            {/* Video Title */}
            <Text style={styles.videoTitleBelowInfo} numberOfLines={2}>{item.title}</Text>
          </View>

          {/* Engagement Stats */}
          <View style={styles.engagementRow}>
            <TouchableOpacity 
              style={[styles.engagementButton, isLiked && styles.engagementButtonActive]}
              onPress={handleLikePress}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={isLiked ? "favorite" : "favorite-border"} 
                size={18} 
                color={isLiked ? "#FF6B6B" : "#333"} 
              />
              <Text style={[styles.engagementText, isLiked && styles.engagementTextActive]}>{currentLikes}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => console.log('Comments for:', item.title)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="chat-bubble-outline" size={18} color="#333" />
              <Text style={styles.engagementText}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.engagementButton}
              onPress={() => console.log('Share:', item.title)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="send" size={18} color="#333" />
              <Text style={styles.engagementText}>{item.shares}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLanguagePicker = () => (
    <View style={styles.languagePickerWrap}>
      <View style={styles.languageIntroCard}>
        <Text style={styles.languageIntroTitle}>Choose Your Sign Language</Text>
        <Text style={styles.languageIntroText}>
          Sign languages have different variations. Select the one you want to learn.
        </Text>
      </View>

      {SIGN_LANGUAGES.map((language) => (
        <TouchableOpacity
          key={language.id}
          style={styles.languageOptionCard}
          onPress={() => handleSelectLanguage(language.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.languageFlag}>{language.flag}</Text>
          <View style={styles.languageOptionCopy}>
            <Text style={styles.languageOptionTitle}>{language.title}</Text>
            <Text style={styles.languageOptionText}>{language.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#A48769" />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6EBDD" />
      
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Feather name="chevron-left" size={28} color="#333" />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>{accountType === 'teacher' ? 'Teaching Studio' : accountType === 'deaf' ? 'Community Studio' : 'Learn'}</Text>
                {userName && (
                  <Text style={styles.headerSubtitle}>
                    {accountType === 'teacher'
                      ? 'Create, manage, and publish classroom content for your learners.'
                      : accountType === 'deaf'
                      ? 'Share community posts, photos, and videos with the Deaf community.'
                      : `Welcome back, ${userName}!`}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/notifications')}>
                <MaterialIcons name="notifications" size={24} color="#333" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{notifications.filter((n) => !n.read).length}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton}>
                <MaterialIcons name="info-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {needsLanguageChoice ? renderLanguagePicker() : null}

          {accountType === 'student' && selectedLanguage ? (
            <View style={styles.languageBanner}>
              <View style={styles.languageBannerCopy}>
                <Text style={styles.languageBannerLabel}>Learning</Text>
                <Text style={styles.languageBannerTitle}>
                  {selectedLanguage.flag} {selectedLanguage.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.languageChangeButton}
                onPress={handleChangeLanguage}
                activeOpacity={0.8}
              >
                <Text style={styles.languageChangeText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Progress Bar */}
          {accountType === 'student' && showLessonModules ? renderProgressBar() : null}

          {showLessonModules ? (
            <View>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(accountType === 'teacher' || accountType === 'deaf') ? (
              <>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'studio' && styles.activeTab]}
                  onPress={() => setActiveTab('studio')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="school" size={20} color={activeTab === 'studio' ? '#A48769' : '#999'} />
                  <Text style={[styles.tabText, activeTab === 'studio' && styles.activeTabText]}>
                    {accountType === 'deaf' ? 'Professional' : 'Content Studio'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                  onPress={() => setActiveTab('video')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="ondemand-video" size={20} color={activeTab === 'video' ? '#A48769' : '#999'} />
                  <Text style={[styles.tabText, activeTab === 'video' && styles.activeTabText]}>
                    {accountType === 'deaf' ? 'Community Videos' : 'Video Lessons'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'challenge' && styles.activeTab]}
                  onPress={() => setActiveTab('challenge')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons 
                    name="school" 
                    size={20} 
                    color={activeTab === 'challenge' ? '#A48769' : '#999'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'challenge' && styles.activeTabText,
                  ]}>
                    Challenge
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'video' && styles.activeTab]}
                  onPress={() => setActiveTab('video')}
                  activeOpacity={0.8}
                >
                  <MaterialIcons 
                    name="ondemand-video" 
                    size={20} 
                    color={activeTab === 'video' ? '#A48769' : '#999'}
                  />
                  <Text style={[
                    styles.tabText,
                    activeTab === 'video' && styles.activeTabText,
                  ]}>
                    Video Lessons
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {query ? (
              <View style={styles.searchInfoContainer}>
                <Text style={styles.searchInfoText}>
                  Showing results for "{query}"
                </Text>
              </View>
            ) : null}

            {(accountType === 'teacher' || accountType === 'deaf') ? (
              activeTab === 'studio' ? (
                renderStudio()
              ) : filteredVideoLessons.length > 0 ? (
                filteredVideoLessons.map((video) => renderVideoLessonCard({ item: video }))
              ) : (
                <View style={styles.noResultsCard}>
                  <Text style={styles.noResultsTitle}>No matching videos found</Text>
                  <Text style={styles.noResultsText}>Try another search term or switch to the content studio.</Text>
                </View>
              )
            ) : activeTab === 'challenge' ? (
              filteredChallengeData.length > 0 ? (
                filteredChallengeData.map((category) => renderCategorySection({ item: category }))
              ) : (
                <View style={styles.noResultsCard}>
                  <Text style={styles.noResultsTitle}>No matching lessons found</Text>
                  <Text style={styles.noResultsText}>Try a different keyword or browse the challenge tab.</Text>
                </View>
              )
            ) : filteredVideoLessons.length > 0 ? (
              filteredVideoLessons.map((video) => renderVideoLessonCard({ item: video }))
            ) : (
              <View style={styles.noResultsCard}>
                <Text style={styles.noResultsTitle}>No matching videos found</Text>
                <Text style={styles.noResultsText}>Try another search term or switch to challenge mode.</Text>
              </View>
            )}

            {/* Certificate Section */}
            {accountType === 'student' ? (
              progress >= 100 ? (
                <View style={styles.certificateComplete}>
                  <MaterialIcons name="verified" size={60} color="#4ECDC4" />
                  <Text style={styles.certificateTitle}>Certificate Unlocked! 🎉</Text>
                  <Text style={styles.certificateText}>
                    Congratulations! You’ve completed all lessons. Download your certificate.
                  </Text>
                  <TouchableOpacity style={styles.downloadButton}>
                    <MaterialIcons name="download" size={20} color="#FFF" />
                    <Text style={styles.downloadButtonText}>Download Certificate</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.certificateSection}>
                  <MaterialIcons name="emoji-events" size={50} color="#FFD166" />
                  <Text style={styles.certificateTitle}>Your Certificate is close!</Text>
                  <Text style={styles.certificateText}>
                    Complete {TOTAL_LESSONS - completedLessons.length} more lessons to unlock your certificate!
                  </Text>
                  <View style={styles.certificateProgress}>
                    <Text style={styles.certificateProgressText}>
                      {completedLessons.length}/{TOTAL_LESSONS} lessons completed
                    </Text>
                    <View style={styles.certificateProgressBar}>
                      <View style={[
                        styles.certificateProgressFill, 
                        { width: `${progress}%` }
                      ]} />
                    </View>
                  </View>
                </View>
              )
            ) : null}
          </View>
            </View>
          ) : null}
        </ScrollView>

        <BottomBelt active="learn" />
      </View>
    </SafeAreaView>

    {renderVideoPlayerModal()}
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6EBDD',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6EBDD',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 25, // Increased from 10 to 25 to move header down more
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2622',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7D7066',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#FFFDFC',
  },
  languagePickerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  languageIntroCard: {
    backgroundColor: '#FFFDFC',
    borderRadius: 18,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9DCCB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  languageIntroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2622',
    marginBottom: 8,
  },
  languageIntroText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#7D7066',
  },
  languageOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDFC',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9DCCB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 14,
  },
  languageOptionCopy: {
    flex: 1,
  },
  languageOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2622',
    marginBottom: 4,
  },
  languageOptionText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7D7066',
  },
  languageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDFC',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9DCCB',
  },
  languageBannerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  languageBannerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A48769',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  languageBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2B2622',
  },
  languageChangeButton: {
    backgroundColor: '#EBD8C1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  languageChangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2622',
  },
  progressContainer: {
    backgroundColor: '#FFFDFC',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E9DCCB',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2B2622',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A48769',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E9DCCB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A48769',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#7D7066',
  },
  searchInfoContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F6F1EA',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  searchInfoText: {
    fontSize: 14,
    color: '#5F5B50',
    lineHeight: 20,
  },
  noResultsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 5,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#EBD8C1',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FFFDFC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7D7066',
  },
  activeTabText: {
    color: '#2B2622',
  },
  content: {
    paddingBottom: 100, // Added padding at bottom to ensure content doesn't get cut
  },
  categoryContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDFC',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DCCB',
  },
  categoryHeaderLocked: {
    backgroundColor: '#F1E3D2',
    opacity: 0.7,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2B2622',
  },
  categoryTitleLocked: {
    color: '#999',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryProgress: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  lessonsContainer: {
    marginTop: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  lessonItemLocked: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  lessonItemCompleted: {
    borderColor: '#4ECDC4',
    borderWidth: 1,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  lessonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonIconCompleted: {
    backgroundColor: '#4ECDC4',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  lessonType: {
    fontSize: 12,
    color: '#999',
  },
  lessonRight: {
    marginLeft: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CCC',
    borderRadius: 6,
  },
  certificateSection: {
    backgroundColor: '#E8E2D5',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  certificateComplete: {
    backgroundColor: '#4ECDC4',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  certificateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  certificateProgress: {
    width: '100%',
  },
  certificateProgressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  certificateProgressBar: {
    height: 6,
    backgroundColor: '#D4C4B0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  certificateProgressFill: {
    height: '100%',
    backgroundColor: '#FFD166',
    borderRadius: 3,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  teacherStudioContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  teacherStudioHeader: {
    backgroundColor: '#E8E2D5',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  teacherStudioTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  teacherStudioSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  teacherFormCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 12,
  },
  teacherSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  teacherInput: {
    borderWidth: 1,
    borderColor: '#E2D9CA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FBF8F3',
    fontSize: 14,
    color: '#333',
  },
  teacherTextArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  teacherUploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  teacherUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  teacherUploadButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  teacherUploadButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  teacherSecondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F1EA',
    borderWidth: 1,
    borderColor: '#D7CDBB',
  },
  teacherSecondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  teacherPreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#F5F1EA',
  },
  teacherPreviewVideo: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#000',
  },
  teacherSaveButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  teacherSaveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  teacherListSection: {
    gap: 12,
  },
  teacherPostCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  teacherPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  teacherPostTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  teacherPostActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teacherPostText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  teacherPostImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#F4EFE7',
  },
  teacherPostVideo: {
    width: '100%',
    height: 210,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  teacherPostVideoLink: {
    fontSize: 13,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  // Video Lesson Styles
  videoCardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  videoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  videoThumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#F0E8E0',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoThumbnailText: {
    fontSize: 60,
  },
  thumbnailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.9,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoInfoSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  avatarTextSmall: {
    fontSize: 20,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 11,
    color: '#999',
  },
  menuButtonSmall: {
    padding: 6,
  },
  uploadBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E85D5D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  uploadBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoTitleBelowInfo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  engagementButton: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  engagementButtonActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  engagementText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  engagementTextActive: {
    color: '#FF6B6B',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  videoCloseButton: {
    padding: 16,
    alignItems: 'flex-start',
  },
  videoPlayArea: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingSpinner: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  videoErrorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    textAlign: 'center',
  },
  videoDisplayBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayContent: {
    alignItems: 'center',
    gap: 16,
  },
  videoPlaceholderText: {
    fontSize: 48,
  },
  videoInfoContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  videoPlayerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  videoPlayerInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  videoPlayerCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  videoDurationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  videoDescriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  videoDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  videoStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
});