import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Switch,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBelt from './components/BottomBelt';
import { getCurrentUserProfile } from './lib/database';
import { useNotifications } from './notification-context';
import { useTheme } from './theme-context';
import { 
  MaterialIcons, 
  Ionicons, 
  Feather,
} from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Profile() {
  const router = useRouter();

  const [profileImage, setProfileImage] = useState(
    require('../assets/images/avatar.png')
  );
  const [coverImage, setCoverImage] = useState(
    require('../assets/images/cover.jpg')
  );
  const [showMenu, setShowMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [username, setUsername] = useState('Zanelyna');
  const [draftName, setDraftName] = useState('Zanelyna');
  const [editingName, setEditingName] = useState(false);
  const [accountType, setAccountType] = useState('student');
  const [personalInfo, setPersonalInfo] = useState({ age: '', birthday: '', contactNumber: '', address: '' });
  const [teacherContentCount, setTeacherContentCount] = useState(0);
  const [communityContentCount, setCommunityContentCount] = useState(0);
  const [userStats] = useState({
    points: 1250,
    streak: 7,
    level: 3,
    completedLessons: 12,
  });

  // Local content for tabs to render inside profile page
  const progressItems = [
    { title: 'Alphabet Mastery', subtitle: '12 of 15 lessons completed', progress: '80%' },
    { title: 'Daily Quest Streak', subtitle: '7 days active', progress: '100%' },
    { title: 'Quiz Readiness', subtitle: '4 lessons left before next certificate', progress: '60%' },
  ];

  const activityItems = [
    { title: 'Completed Alphabet Lesson', detail: 'You finished 3 new alphabet cards today.', timestamp: 'Just now' },
    { title: 'Daily Quest Started', detail: 'You accepted a 3-lesson streak challenge.', timestamp: '1 hour ago' },
    { title: 'New Achievement Unlocked', detail: 'Level 3 badge earned for active learning.', timestamp: 'Yesterday' },
  ];

  const teacherActivityItems = [
    { title: 'Classroom Post Published', detail: 'You added a new lesson resource for your learners.', timestamp: 'Just now' },
    { title: 'Learner Feedback Reviewed', detail: 'You responded to 5 recent questions from your students.', timestamp: '1 hour ago' },
    { title: 'Weekly Teaching Goal Reached', detail: 'You completed 3 classroom content updates this week.', timestamp: 'Yesterday' },
  ];

  const deafActivityItems = [
    { title: 'Community Story Shared', detail: 'You posted a new Deaf community update.', timestamp: 'Just now' },
    { title: 'Photo Story Published', detail: 'Your community photo received positive reactions.', timestamp: '2 hours ago' },
    { title: 'Video Story Added', detail: 'A new video share is now available for your community.', timestamp: 'Yesterday' },
  ];

  const teacherProgressItems = [
    { title: 'Content Studio Usage', subtitle: '3 teaching materials published this week', progress: '85%' },
    { title: 'Learner Engagement', subtitle: 'Your classes are trending well this week', progress: '92%' },
    { title: 'Teaching Completion', subtitle: 'Your weekly instructional plan is on track', progress: '78%' },
  ];

  const deafProgressItems = [
    { title: 'Community Reach', subtitle: 'Your posts reached more members this week', progress: '80%' },
    { title: 'Story Engagement', subtitle: 'Community discussions are active and meaningful', progress: '74%' },
    { title: 'Connection Growth', subtitle: 'More people are joining your shared Deaf community space', progress: '68%' },
  ];

  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((item) => !item.read).length;
  const { darkMode, theme } = useTheme();
  const isTeacher = accountType === 'teacher';
  const isDeaf = accountType === 'deaf';
  const activeActivityItems = isTeacher ? teacherActivityItems : isDeaf ? deafActivityItems : activityItems;
  const activeProgressItems = isTeacher ? teacherProgressItems : isDeaf ? deafProgressItems : progressItems;
  const communityCount = isTeacher ? teacherContentCount : isDeaf ? communityContentCount : userStats.points;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(false);

  const contentOpacity = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(contentOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  }, [activeSection]);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const parsed = await getCurrentUserProfile();
        if (!parsed) {
          const storedData = await AsyncStorage.getItem('userData');
          if (storedData) {
            const fallback = JSON.parse(storedData);
            if (fallback?.name) {
              setUsername(fallback.name);
              setDraftName(fallback.name);
            }
            if (fallback?.accountType) setAccountType(fallback.accountType);
            setPersonalInfo({
              age: fallback?.age || '',
              birthday: fallback?.birthday || '',
              contactNumber: fallback?.contactNumber || '',
              address: fallback?.address || '',
            });
          }
          return;
        }

        if (parsed?.name) {
          setUsername(parsed.name);
          setDraftName(parsed.name);
        }
        if (parsed?.accountType) {
          setAccountType(parsed.accountType);
        }
        setPersonalInfo({
          age: parsed?.age || '',
          birthday: parsed?.birthday || '',
          contactNumber: parsed?.contactNumber || '',
          address: parsed?.address || '',
        });

        if (parsed?.accountType === 'teacher') {
          const teacherKey = parsed?.email ? `teacherContentPosts_${parsed.email}` : 'teacherContentPosts';
          const savedTeacherPosts = await AsyncStorage.getItem(teacherKey);
          if (savedTeacherPosts) {
            const parsedPosts = JSON.parse(savedTeacherPosts);
            setTeacherContentCount(Array.isArray(parsedPosts) ? parsedPosts.length : 0);
          }
        }

        if (parsed?.accountType === 'deaf') {
          const communityKey = parsed?.email ? `deafContentPosts_${parsed.email}` : 'deafContentPosts_shared';
          const savedCommunityPosts = await AsyncStorage.getItem(communityKey);
          if (savedCommunityPosts) {
            const parsedPosts = JSON.parse(savedCommunityPosts);
            setCommunityContentCount(Array.isArray(parsedPosts) ? parsedPosts.length : 0);
          } else {
            const sharedPosts = await AsyncStorage.getItem('deafContentPosts_shared');
            if (sharedPosts) {
              const parsedShared = JSON.parse(sharedPosts);
              setCommunityContentCount(Array.isArray(parsedShared) ? parsedShared.length : 0);
            }
          }
        }
      } catch (error) {
        console.log('Error loading profile name:', error);
      }
    };

    loadUser();
  }, []);

  /* ================= IMAGE PICKER ================= */
  const requestPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.granted;
  };

  const pickProfileImage = async () => {
    if (!(await requestPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const pickCoverImage = async () => {
    if (!(await requestPermission())) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      setCoverImage({ uri: result.assets[0].uri });
    }
  };

  /* ================= HANDLERS ================= */
  const handleLogout = useCallback(() => {
    setShowMenu(false);
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => router.replace('/'),
        },
      ]
    );
  }, [router]);

  const handleExit = useCallback(() => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit the application?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
        },
      ]
    );
  }, []);

  const handleEditProfile = useCallback(() => {
    router.push('/edit-profile');
  }, [router]);

  const handleDailyQuest = useCallback(() => {
    router.push('/daily-quest');
  }, [router]);

  // Navigation helpers for overview menu and cards
  const handleNavigate = useCallback((route, label) => {
    if (!route) {
      Alert.alert(label, 'This section is not available yet.');
      return;
    }
    router.push(route);
  }, [router]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>  
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      
      <View style={[styles.mainContainer, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header */}
          <View style={[styles.headerContainer, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background }] }>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                onPress={handleExit} 
                style={styles.exitButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>Profile</Text>
            </View>

            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push('/info')}
                activeOpacity={0.7}
              >
                <MaterialIcons name="info-outline" size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowMenu(!showMenu)}
                activeOpacity={0.7}
              >
                <Feather name="settings" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Dropdown */}
          {showMenu && (
            <View style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/settings');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="settings" size={18} color={theme.colors.textPrimary} style={styles.dropdownIcon} />
                <Text style={[styles.dropdownItem, { color: theme.colors.textPrimary }]}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/admin');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="admin-panel-settings" size={18} color={theme.colors.textPrimary} style={styles.dropdownIcon} />
                <Text style={[styles.dropdownItem, { color: theme.colors.textPrimary }]}>Admin Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/help-support');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="help-outline" size={18} color={theme.colors.textPrimary} style={styles.dropdownIcon} />
                <Text style={[styles.dropdownItem, { color: theme.colors.textPrimary }]}>Help & Support</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dropdownBtn}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/display-accessibility');
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="accessibility-new" size={18} color={theme.colors.textPrimary} style={styles.dropdownIcon} />
                <Text style={[styles.dropdownItem, { color: theme.colors.textPrimary }]}>Display & Accessibility</Text>
              </TouchableOpacity>

              <View style={[styles.dropdownDivider, { backgroundColor: theme.colors.border }]} />

              <TouchableOpacity
                style={[styles.dropdownBtn, styles.logoutBtn]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <MaterialIcons name="logout" size={18} color="#FF6B6B" style={styles.dropdownIcon} />
                <Text style={[styles.dropdownItem, styles.logoutText]}>
                  Log out
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ===== COVER + AVATAR ===== */}
          <View style={styles.coverContainer}>
            <Image source={coverImage} style={styles.coverImage} />
            <View style={styles.coverOverlay} />

            <TouchableOpacity
              style={styles.coverEditButton}
              onPress={pickCoverImage}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-camera" size={16} color="#1F1B1A" />
              <Text style={styles.coverEditText}>Edit Cover</Text>
            </TouchableOpacity>

            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Image source={profileImage} style={styles.avatarImage} />
                <TouchableOpacity
                  style={styles.avatarEditButton}
                  onPress={pickProfileImage}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="edit" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfo}>
                {!editingName ? (
                  <View style={styles.usernameRow}>
                    <Text style={styles.username}>{username}</Text>
                    <TouchableOpacity onPress={() => { setDraftName(username); setEditingName(true); }} style={styles.usernameEdit} activeOpacity={0.8}>
                      <Feather name="edit" size={14} color="#7A685B" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.editNameRow}>
                    <TextInput value={draftName} onChangeText={setDraftName} style={styles.nameInput} placeholder="Your name" placeholderTextColor="#9D9085" />
                    <TouchableOpacity
                      onPress={async () => {
                        const finalName = draftName.trim() || username;
                        setUsername(finalName);
                        setEditingName(false);
                        try {
                          const storedData = await AsyncStorage.getItem('userData');
                          const parsed = storedData ? JSON.parse(storedData) : {};
                          await AsyncStorage.setItem('userData', JSON.stringify({
                            ...parsed,
                            name: finalName,
                          }));
                        } catch (error) {
                          console.log('Error saving profile name:', error);
                        }
                      }}
                      style={styles.saveNameBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.saveNameText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setDraftName(username); setEditingName(false); }} style={styles.cancelNameBtn} activeOpacity={0.8}>
                      <Text style={styles.cancelNameText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.userHandle}>@{username.toLowerCase().replace(/\s+/g, '')}</Text>
                <Text style={styles.userBio}>Better signs. Brighter tomorrow.</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F2C96D' }]}>
                <MaterialIcons name="stars" size={22} color="#2E231F" />
              </View>
              <Text style={styles.statValue}>{userStats.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EE9B8E' }]}>
                <MaterialIcons name="local-fire-department" size={22} color="#2E231F" />
              </View>
              <Text style={styles.statValue}>{userStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#8BC5BA' }]}>
                <MaterialIcons name="emoji-events" size={22} color="#2E231F" />
              </View>
              <Text style={styles.statValue}>{userStats.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          <View style={styles.navigationTabs}>
            {['Overview', 'Progress', 'Activity', 'Settings'].map((tab) => {
              const lowerTab = tab.toLowerCase();
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.navTab,
                    activeSection === lowerTab && styles.activeNavTab,
                  ]}
                  onPress={() => setActiveSection(lowerTab)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.navTabText,
                    activeSection === lowerTab && styles.activeNavTabText,
                    { color: activeSection === lowerTab ? theme.colors.textPrimary : theme.colors.textSecondary },
                  ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ===== ACTION BUTTONS (MOVED UP) ===== */}
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={18} color={theme.colors.textPrimary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.textPrimary }]}> Edit your profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleDailyQuest}
              activeOpacity={0.8}
            >
              <MaterialIcons name="flag" size={18} color={theme.colors.textPrimary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.textPrimary }]}> Your Daily Quest</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.personalInfoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}> 
            <View style={styles.personalInfoHeader}>
              <Text style={[styles.subSectionTitle, { color: theme.colors.textPrimary }]}>Personal Information</Text>
              <MaterialIcons name="badge" size={20} color={theme.colors.accent} />
            </View>
            <View style={styles.personalInfoGrid}>
              <View style={styles.personalInfoItem}>
                <Text style={[styles.personalInfoLabel, { color: theme.colors.textSecondary }]}>Role</Text>
                <Text style={[styles.personalInfoValue, { color: theme.colors.textPrimary }]}>{accountType === 'teacher' ? 'Teacher' : 'Student'}</Text>
              </View>
              <View style={styles.personalInfoItem}>
                <Text style={[styles.personalInfoLabel, { color: theme.colors.textSecondary }]}>Age</Text>
                <Text style={[styles.personalInfoValue, { color: theme.colors.textPrimary }]}>{personalInfo.age || 'Not provided'}</Text>
              </View>
              <View style={styles.personalInfoItem}>
                <Text style={[styles.personalInfoLabel, { color: theme.colors.textSecondary }]}>Birthday</Text>
                <Text style={[styles.personalInfoValue, { color: theme.colors.textPrimary }]}>{personalInfo.birthday || 'Not provided'}</Text>
              </View>
              <View style={styles.personalInfoItem}>
                <Text style={[styles.personalInfoLabel, { color: theme.colors.textSecondary }]}>Contact</Text>
                <Text style={[styles.personalInfoValue, { color: theme.colors.textPrimary }]}>{personalInfo.contactNumber || 'Not provided'}</Text>
              </View>
              <View style={styles.personalInfoItemWide}>
                <Text style={[styles.personalInfoLabel, { color: theme.colors.textSecondary }]}>Address</Text>
                <Text style={[styles.personalInfoValue, { color: theme.colors.textPrimary }]}>{personalInfo.address || 'Not provided'}</Text>
              </View>
            </View>
          </View>

          {/* ===== PROFILE OVERVIEW CONTENT ===== */}
          <View style={styles.contentRow}>
            {activeSection === 'overview' && (
              <Animated.View style={[styles.sectionFullWidth, { opacity: contentOpacity }]}>
                <View style={styles.overviewJourneyCard}>
                  <View style={styles.journeyHeader}>
                    <Text style={styles.journeyTitle}>Your Learning Journey</Text>
                    <Text style={styles.journeyLink}>View Details</Text>
                  </View>

                  <View style={styles.journeyRow}>
                    <View style={styles.progressRingWrap}>
                      <View style={styles.progressRingOuter}>
                        <View style={styles.progressRingInner}>
                          <Text style={styles.progressPercent}>40%</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.journeyMeta}>
                      <Text style={styles.metaLabel}>Lessons Completed</Text>
                      <Text style={styles.metaValue}>5 of 12 lessons</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricGrid}>
                  <View style={styles.metricTile}>
                    <View style={[styles.metricIcon, { backgroundColor: '#E9DCCB' }]}>
                      <MaterialIcons name="menu-book" size={18} color="#36312E" />
                    </View>
                    <Text style={styles.metricValueSmall}>5</Text>
                    <Text style={styles.metricLabelSmall}>Lessons Completed</Text>
                  </View>
                  <View style={styles.metricTile}>
                    <View style={[styles.metricIcon, { backgroundColor: '#F5D9C5' }]}>
                      <MaterialIcons name="quiz" size={18} color="#36312E" />
                    </View>
                    <Text style={styles.metricValueSmall}>4</Text>
                    <Text style={styles.metricLabelSmall}>Quizzes Passed</Text>
                  </View>
                  <View style={styles.metricTile}>
                    <View style={[styles.metricIcon, { backgroundColor: '#DDE8DB' }]}>
                      <MaterialIcons name="calendar-today" size={18} color="#36312E" />
                    </View>
                    <Text style={styles.metricValueSmall}>7 days</Text>
                    <Text style={styles.metricLabelSmall}>Learning Streak</Text>
                  </View>
                  <View style={styles.metricTile}>
                    <View style={[styles.metricIcon, { backgroundColor: '#E7D9F0' }]}>
                      <MaterialIcons name="workspace-premium" size={18} color="#36312E" />
                    </View>
                    <Text style={styles.metricValueSmall}>3</Text>
                    <Text style={styles.metricLabelSmall}>Achievements</Text>
                  </View>
                </View>

                <View style={styles.badgesSection}>
                  <View style={styles.badgesHeader}>
                    <Text style={styles.secTitle}>Badges</Text>
                    <Text style={styles.secLink}>See All</Text>
                  </View>

                  <View style={styles.badgesGrid}>
                    <View style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: '#F4D8B4' }]}>
                        <MaterialIcons name="emoji-hands" size={28} color="#7C4B27" />
                      </View>
                      <Text style={styles.badgeName}>First Lesson</Text>
                      <Text style={styles.badgeState}>Unlocked</Text>
                    </View>
                    <View style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: '#CFE7D9' }]}>
                        <MaterialIcons name="local-fire-department" size={28} color="#27614A" />
                      </View>
                      <Text style={styles.badgeName}>Week Streak</Text>
                      <Text style={styles.badgeState}>Unlocked</Text>
                    </View>
                    <View style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: '#E7D4AE' }]}>
                        <MaterialIcons name="book" size={28} color="#7C5A1A" />
                      </View>
                      <Text style={styles.badgeName}>Quiz Master</Text>
                      <Text style={styles.badgeState}>Unlocked</Text>
                    </View>
                    <View style={styles.badgeItem}>
                      <View style={[styles.badgeCircle, { backgroundColor: '#D9E4EC' }]}>
                        <MaterialIcons name="lock" size={28} color="#5A6876" />
                      </View>
                      <Text style={styles.badgeName}>Word Warrior</Text>
                      <Text style={styles.badgeState}>Locked</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.activitySection}>
                  <View style={styles.badgesHeader}>
                    <Text style={styles.secTitle}>Recent Activity</Text>
                    <Text style={styles.secLink}>See All</Text>
                  </View>

                  <View style={styles.activityList}>
                    <View style={styles.activityRow}>
                      <View style={[styles.activityIcon, { backgroundColor: '#E9DCCB' }]}>
                        <MaterialIcons name="menu-book" size={18} color="#36312E" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitle}>Completed Lesson 5</Text>
                        <Text style={styles.activitySubtitle}>Numbers • Novice Sign</Text>
                      </View>
                      <Text style={styles.activityTime}>2 hours ago</Text>
                    </View>

                    <View style={styles.activityRow}>
                      <View style={[styles.activityIcon, { backgroundColor: '#F5D9C5' }]}>
                        <MaterialIcons name="quiz" size={18} color="#36312E" />
                      </View>
                      <View style={styles.activityMeta}>
                        <Text style={styles.activityTitle}>Passed Quiz</Text>
                        <Text style={styles.activitySubtitle}>Greetings & Manners • 100%</Text>
                      </View>
                      <Text style={styles.activityTime}>5 hours ago</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {activeSection === 'progress' && (
              <View style={styles.sectionFullWidth}>
                <View style={[styles.heroCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <View style={styles.heroHeader}>
                    <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>Your Journey</Text>
                    <Text style={[styles.heroSubtitle, { color: theme.colors.textSecondary }]}>Keep the momentum going with weekly milestones.</Text>
                  </View>
                  <View style={styles.progressSummary}>
                    <View style={[styles.metricCard, { backgroundColor: darkMode ? '#1F2937' : '#F7F4FF' }]}>
                      <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>{userStats.completedLessons}</Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Lessons</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: darkMode ? '#1F2937' : '#F7F4FF' }]}>
                      <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>{userStats.streak}</Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Days</Text>
                    </View>
                    <View style={[styles.metricCard, { backgroundColor: darkMode ? '#1F2937' : '#F7F4FF' }]}>
                      <Text style={[styles.metricValue, { color: theme.colors.textPrimary }]}>{userStats.level}</Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Level</Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{isTeacher ? 'Classroom Milestones' : 'Recent Milestones'}</Text>
                {activeProgressItems.map((item) => (
                  <View key={item.title} style={[styles.progressCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.progressInfo}>
                      <Text style={[styles.progressTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                      <Text style={[styles.progressSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                    </View>
                    <View style={[styles.progressTag, { backgroundColor: darkMode ? '#1F2937' : '#F3F3FF' }]}>
                      <Text style={[styles.progressTagText, { color: theme.colors.accent }]}>{item.progress}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeSection === 'activity' && (
              <View style={styles.sectionFullWidth}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{isTeacher ? 'Teaching Activity' : 'Recent Activity'}</Text>
                {activeActivityItems.map((item) => (
                  <View key={item.title} style={[styles.activityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                    <View style={styles.activityHeader}>
                      <Text style={[styles.activityTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                      <Text style={[styles.activityTime, { color: theme.colors.placeholder }]}>{item.timestamp}</Text>
                    </View>
                    <Text style={[styles.activityDetail, { color: theme.colors.textSecondary }]}>{item.detail}</Text>
                  </View>
                ))}
                <View style={styles.quickActions}>
                  <Text style={[styles.quickTitle, { color: theme.colors.textPrimary }]}>{isTeacher ? 'Teacher quick actions' : isDeaf ? 'Community quick actions' : 'Quick actions'}</Text>
                  <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/learn')} activeOpacity={0.8}>
                    <Text style={styles.quickButtonText}>{isTeacher ? 'Open Content Studio' : isDeaf ? 'Open Community Studio' : 'Continue learning'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickButton} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
                    <Text style={styles.quickButtonText}>{isTeacher ? 'Review classroom updates' : isDeaf ? 'View community updates' : 'View notifications'}</Text>
                    {unreadCount > 0 && (
                      <View style={styles.quickBadge}>
                        <Text style={styles.quickBadgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeSection === 'settings' && (
              <View style={styles.sectionFullWidth}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Settings</Text>
                <View style={[styles.optionRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <View>
                    <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>Notifications</Text>
                    <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Receive app alerts and updates</Text>
                  </View>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    thumbColor={notificationsEnabled ? '#4ECDC4' : '#FFF'}
                    trackColor={{ false: '#CCC', true: '#A5E8E1' }}
                  />
                </View>

                <View style={[styles.optionRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <View>
                    <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>Auto Update</Text>
                    <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>Keep lessons and content refreshed</Text>
                  </View>
                  <Switch
                    value={autoUpdate}
                    onValueChange={setAutoUpdate}
                    thumbColor={autoUpdate ? '#4ECDC4' : '#FFF'}
                    trackColor={{ false: '#CCC', true: '#A5E8E1' }}
                  />
                </View>

                <View style={[styles.noteBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.noteTitle, { color: theme.colors.textPrimary }]}>Privacy</Text>
                  <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>Your learning activity stays private unless you choose to share it.</Text>
                </View>
              </View>
            )}
          </View>

          {/* Bottom Padding for Scroll */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <BottomBelt active="profile" />
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
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
    paddingTop: 25, // Added padding to move content down
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#E8D7C6',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4B0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  exitButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  quickBadge: {
    marginTop: 6,
    marginLeft: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quickBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Dropdown
  dropdown: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownItem: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  logoutBtn: {
    marginTop: 4,
  },
  logoutText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  
  // Cover & Avatar
  coverContainer: {
    position: 'relative',
    height: 250,
    marginTop: 0,
    marginBottom: 28,
    marginHorizontal: 0,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#E7D8C8',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.78,
  },
  coverOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  coverEditButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.84)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  coverEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F1B1A',
  },
  avatarSection: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#F2E8DE',
    backgroundColor: '#E7D8C8',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 8,
    right: 0,
    backgroundColor: '#6B5C4A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F2E8DE',
  },
  userInfo: {
    flex: 1,
    paddingBottom: 18,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  usernameEdit: {
    padding: 4,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    minWidth: 140,
    color: '#1F1B1A',
  },
  saveNameBtn: {
    backgroundColor: '#A48769',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveNameText: {
    color: '#FFF',
    fontWeight: '700',
  },
  cancelNameBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cancelNameText: {
    color: '#666',
    fontWeight: '700',
  },
  username: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1F1B1A',
    letterSpacing: -0.5,
  },
  userHandle: {
    fontSize: 15,
    color: '#4E433C',
    marginBottom: 6,
    marginTop: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#5C5046',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F3ED',
    borderRadius: 18,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D9C7B2',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F1B1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#61564F',
    marginTop: 4,
  },

  // Journey overview card
  overviewJourneyCard: {
    backgroundColor: '#F6F0EA',
    borderRadius: 22,
    padding: 14,
    marginBottom: 18,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1B1A',
  },
  journeyLink: {
    fontSize: 13,
    color: '#5F524B',
    fontWeight: '600',
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  progressRingWrap: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingOuter: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 8,
    borderColor: '#D9C7B2',
    borderTopColor: '#E7A56B',
    borderRightColor: '#E7A56B',
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F6F0EA',
    transform: [{ rotate: '-45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1B1A',
  },
  journeyMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#6E5D52',
    marginBottom: 6,
  },
  metaValue: {
    fontSize: 15,
    color: '#1F1B1A',
    fontWeight: '700',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  metricTile: {
    width: '48%',
    backgroundColor: '#F5EFE9',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValueSmall: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1B1A',
    marginBottom: 6,
  },
  metricLabelSmall: {
    fontSize: 12,
    color: '#5F524B',
    textAlign: 'center',
  },
  badgesSection: {
    marginBottom: 18,
  },
  badgesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  secTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1B1A',
  },
  secLink: {
    fontSize: 12,
    color: '#5F524B',
    fontWeight: '600',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  badgeItem: {
    width: '48%',
    backgroundColor: '#F5EFE9',
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F1B1A',
    textAlign: 'center',
  },
  badgeState: {
    fontSize: 12,
    color: '#6E5D52',
    marginTop: 4,
  },
  activitySection: {
    marginBottom: 8,
  },
  activityList: {
    gap: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EFE9',
    borderRadius: 16,
    padding: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityMeta: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: '#1F1B1A',
    fontWeight: '700',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6E5D52',
  },
  activityTime: {
    fontSize: 11,
    color: '#6E5D52',
    marginLeft: 12,
  },

  // Navigation Tabs
  navigationTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeNavTab: {
    borderBottomColor: '#A48769',
  },
  navTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeNavTabText: {
    color: '#333',
  },

  // Action Buttons (MOVED UP)
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  personalInfoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  personalInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  personalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  personalInfoItem: {
    width: '46%',
  },
  personalInfoItemWide: {
    width: '100%',
  },
  personalInfoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  personalInfoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtn: {
    backgroundColor: '#FFFDFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },

  // Main Content
  contentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 20,
  },
  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 20,
  },
  statCardMini: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statBadgeMini: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValueMini: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  statLabelMini: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statDescMini: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 10,
  },
  overviewGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    minHeight: 110,
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  menuIcon: {
    marginBottom: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },

  overviewHighlights: {
    width: '100%',
    gap: 12,
  },
  rightCards: {
    width: '100%',
    gap: 12,
  },
  overviewSidebar: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 7,
    gap: 18,
  },
  overviewMain: {
    flex: 1.7,
    minWidth: 320,
    gap: 18,
  },
  profileSummaryCard: {
    backgroundColor: '#4C3CDA',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  summaryHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  summaryDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 20,
    marginBottom: 18,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  summaryStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  quickSummaryCard: {
    backgroundColor: '#F9F8FF',
    borderRadius: 24,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(76, 60, 218, 0.12)',
  },
  quickSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgePillSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  badgeLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeLabelSecondary: {
    color: '#333',
    fontSize: 12,
    fontWeight: '700',
  },
  quickSummaryText: {
    fontSize: 12,
    color: '#5C5A77',
    lineHeight: 18,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2F2C4B',
  },
  leaderboardSubtitle: {
    fontSize: 12,
    color: '#958EAB',
    marginTop: 4,
  },
  switchButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  podiumCard: {
    backgroundColor: '#F7F4FF',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 60, 218, 0.08)',
  },
  podiumTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  podiumSpot: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    minHeight: 140,
  },
  spotFirst: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4C4B0',
    shadowColor: '#4C3CDA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  spotSecond: {
    backgroundColor: '#E7E3FF',
  },
  spotThird: {
    backgroundColor: '#FFF5E6',
  },
  spotRank: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333',
  },
  spotName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  spotPoints: {
    fontSize: 11,
    color: '#7A7498',
  },
  leaderboardList: {
    gap: 10,
  },
  leaderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 60, 218, 0.08)',
    justifyContent: 'space-between',
  },
  leaderIndex: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderIndexText: {
    fontWeight: '700',
    color: '#5C5A77',
  },
  leaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F2C4B',
  },
  leaderMetric: {
    fontSize: 12,
    color: '#958EAB',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11,
    color: '#666',
  },

  // Section Content
  sectionContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },

  leftMenu: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
  },
  leftMenuColumn: {
    flex: 1,
    minWidth: 240,
  },
  menuCardLarge: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 6,
  },
  menuListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3EEE9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuArrow: {
    marginLeft: 8,
  },

  overviewMainRight: {
    flex: 1.7,
    minWidth: 320,
    gap: 12,
  },
  sectionFullWidth: {
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  rightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  rightCardLeft: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rightCardContent: {
    flex: 1,
  },
  rightCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2C4B',
    marginBottom: 4,
  },
  rightCardSubtitle: {
    fontSize: 12,
    color: '#7A7498',
  },
  overviewSectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionBadge: {
    color: '#4ECDC4',
    backgroundColor: '#E6FBF8',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  cardBodyText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 14,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#F2ECE5',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4ECDC4',
  },
  heroCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  heroHeader: {
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F7F4FF',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7A7498',
  },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
    paddingRight: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#7A7498',
    lineHeight: 18,
  },
  progressTag: {
    backgroundColor: '#F3F3FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  progressTagText: {
    color: '#4E3CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityDetail: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  quickActions: {
    marginTop: 20,
    gap: 12,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  quickButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  quickButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  secondaryButtonText: {
    color: '#4ECDC4',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#7A7498',
    marginTop: 4,
  },
  settingCard: {
    backgroundColor: '#F6F2EE',
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  noteBox: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#2F2C4B',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Bottom Padding
  bottomPadding: {
    height: 100,
  },
});