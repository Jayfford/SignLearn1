import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBelt from './components/BottomBelt';
import { getCurrentUserProfile } from './lib/database';
import { getStudentProgress, lessonProgressPercent, TOTAL_LESSONS } from './lib/studentProgress';

const handImages = [
  require('../assets/images/1.png'),
  require('../assets/images/2.png'),
  require('../assets/images/3.png'),
];

const categories = [
  { label: 'Alphabet', icon: 'text-fields', route: '/lesson/alphabet' },
  { label: 'Numbers', icon: 'grid-view', route: '/lesson/numbers' },
  { label: 'Greetings', icon: 'waving-hand', route: '/lesson/greetings' },
  { label: 'Common Words', icon: 'chat-bubble-outline', route: '/learn' },
  { label: 'Phrases', icon: 'groups', route: '/learn' },
  { label: 'Conversations', icon: 'forum', route: '/community' },
];

const teachers = [
  { name: 'Teacher Camille', detail: 'Basic Signs • Alphabet', image: handImages[0] },
  { name: 'Teacher Jay', detail: 'Numbers • Daily Words', image: handImages[1] },
  { name: 'Teacher Mika', detail: 'Greetings • Phrases', image: handImages[2] },
  { name: 'Teacher Paolo', detail: 'Conversations • Advanced', image: handImages[0] },
  { name: 'Teacher Ana', detail: 'Everyday Signs • Practice', image: handImages[1] },
  { name: 'Teacher Luis', detail: 'Weather • Expressions', image: handImages[2] },
  { name: 'Teacher Bea', detail: 'Storytelling • Emotion', image: handImages[0] },
  { name: 'Teacher Nico', detail: 'FSL Basics • Review', image: handImages[1] },
];

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('Learner');
  const [showMenu, setShowMenu] = useState(false);
  const [lessonCount, setLessonCount] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const pageAnim = useRef(new Animated.Value(0)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        try {
          const user = await getCurrentUserProfile();
          if (user?.name) {
            setUserName(user.name);
          } else {
            const stored = await AsyncStorage.getItem('userData');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed?.name) setUserName(parsed.name);
            }
          }

          const progress = await getStudentProgress(user);
          setLessonCount(progress.completedLessons.length);
          setProgressPercent(lessonProgressPercent(progress));
        } catch {
          // Keep the friendly fallback when stored data is unavailable.
        }
      };

      loadProgress();
    }, [])
  );

  useEffect(() => {
    Animated.timing(pageAnim, {
      toValue: 1,
      duration: 760,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const floatLoop = Animated.loop(Animated.sequence([
      Animated.timing(heroFloat, { toValue: -7, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(heroFloat, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    floatLoop.start();
    return () => floatLoop.stop();
  }, [heroFloat, pageAnim]);

  const pageEnterStyle = {
    opacity: pageAnim,
    transform: [{ translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };

  const logout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['userData', 'userToken']);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.header, pageEnterStyle]}>
            <View style={styles.brandBlock}>
              <View style={styles.brandHand}><Text style={styles.brandHandText}>✋</Text></View>
              <View>
                <Text style={styles.brandName}>SignLearn</Text>
                <Text style={styles.brandTagline}>Learn. Sign. Connect.</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <Pressable style={styles.notificationButton} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={26} color={COLORS.ink} />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable style={styles.avatarButton} onPress={() => router.push('/profile')}>
                <Image source={require('../assets/images/avatar.png')} style={styles.headerAvatar} />
              </Pressable>
              <Pressable style={styles.menuButton} onPress={() => setShowMenu((value) => !value)}>
                <Ionicons name="ellipsis-vertical" size={22} color={COLORS.ink} />
              </Pressable>
            </View>
          </Animated.View>

          {showMenu && (
            <View style={styles.menu}>
              <Pressable onPress={() => router.push('/settings')}><Text style={styles.menuText}>Settings</Text></Pressable>
              <Pressable onPress={() => router.push('/help-support')}><Text style={styles.menuText}>Help & Support</Text></Pressable>
              <Pressable onPress={logout}><Text style={[styles.menuText, styles.logoutText]}>Log out</Text></Pressable>
            </View>
          )}

          <Animated.View style={[styles.heroCard, pageEnterStyle]}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Learn from{`\n`}Expert Teachers</Text>
              <Text style={styles.heroBody}>Real people. Real signs.{`\n`}Your journey, with the best.</Text>
              <Pressable style={styles.heroButton} onPress={() => router.push('/community')}>
                <Text style={styles.heroButtonText}>Explore Teachers</Text>
                <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
              </Pressable>
            </View>
            <Animated.View style={[styles.heroArt, { transform: [{ translateY: heroFloat }] }]}>
              <View style={styles.heroCircleLarge}><Image source={handImages[2]} style={styles.heroHand} /></View>
              <View style={styles.heroCircleSmall}><Image source={handImages[0]} style={styles.smallHand} /></View>
              <View style={styles.heroCircleTiny}><Image source={handImages[1]} style={styles.smallHand} /></View>
              <Text style={styles.heroNote}>Different{`\n`}Teachers{`\n`}Same Goal{`\n`}— Inclusion ♡</Text>
            </Animated.View>
            <View style={styles.heroDots}><View style={[styles.heroDot, styles.heroDotActive]} /><View style={styles.heroDot} /><View style={styles.heroDot} /></View>
          </Animated.View>

          <Animated.View style={pageEnterStyle}>
          <Pressable style={styles.progressCard} onPress={() => router.push('/profile-progress')}>
            <View style={styles.progressRing}><Text style={styles.progressPercent}>{progressPercent}%</Text></View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>Your Learning Progress</Text>
              <Text style={styles.progressSubtitle}>You’ve completed {lessonCount} of {TOTAL_LESSONS} lessons</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progressPercent}%` }]} /></View>
            </View>
            <Ionicons name="chevron-forward" size={25} color={COLORS.muted} />
          </Pressable>

          <View style={styles.quickGrid}>
            <QuickAction icon="play-arrow" label={['Continue', 'Learning']} onPress={() => router.push('/learn')} />
            <QuickAction icon="menu-book" label={['Browse', 'Lessons']} onPress={() => router.push('/learn')} />
            <QuickAction icon="search" label={['Sign', 'Dictionary']} onPress={() => router.push('/learn')} />
            <QuickAction icon="bar-chart" label={['View', 'Progress']} onPress={() => router.push('/profile-progress')} />
          </View>
          </Animated.View>

          <SectionHeading title="Featured Teachers" action="Meet Our Team" onPress={() => router.push('/community')} />
          <ScrollView
            horizontal
            scrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.teacherRow}
            directionalLockEnabled
            nestedScrollEnabled
          >
            {teachers.map((teacher, index) => (
              <Animated.View key={teacher.name} style={{ opacity: pageAnim, transform: [{ translateY: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [12 + index * 3, 0] }) }] }}>
              <Pressable style={styles.teacherCard} onPress={() => router.push('/community')}>
                <View style={styles.teacherImageWrap}><Image source={teacher.image} style={styles.teacherImage} /><View style={styles.onlineDot} /></View>
                <Text style={styles.teacherName} numberOfLines={1}>{teacher.name}</Text>
                <Text style={styles.teacherDetail} numberOfLines={1}>{teacher.detail}</Text>
              </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          <SectionHeading title="Continue Learning" action="See All" onPress={() => router.push('/learn')} />
          <Pressable style={styles.lessonCard} onPress={() => router.push('/lesson/alphabet')}>
            <View style={styles.lessonBadge}><Text style={styles.lessonBadgeText}>Aa</Text></View>
            <View style={styles.lessonCopy}><Text style={styles.lessonCategory}>Alphabet</Text><Text style={styles.lessonTitle}>Letter A</Text><Text style={styles.lessonMeta}>Lesson 1 • 5 min</Text></View>
            <Image source={handImages[0]} style={styles.lessonImage} />
            <Ionicons name="play-circle" size={33} color={COLORS.brown} style={styles.lessonPlay} />
            <Ionicons name="chevron-forward" size={24} color={COLORS.muted} />
          </Pressable>

          <SectionHeading title="Learning Categories" />
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <Pressable key={category.label} style={styles.categoryCard} onPress={() => router.push(category.route)}>
                <View style={styles.categoryIcon}><MaterialIcons name={category.icon} size={24} color={COLORS.brown} /></View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <BottomBelt active="home" />
      </View>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const animatePress = (toValue) => Animated.spring(pressScale, { toValue, friction: 7, tension: 120, useNativeDriver: true }).start();
  return (
    <Pressable style={styles.quickPressable} onPress={onPress} onPressIn={() => animatePress(0.96)} onPressOut={() => animatePress(1)}>
      <Animated.View style={[styles.quickCard, { transform: [{ scale: pressScale }] }]}>
        <View style={styles.quickIcon}><MaterialIcons name={icon} size={27} color={COLORS.white} /></View>
        <Text style={styles.quickLabel}>{label[0]}{`\n`}{label[1]}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SectionHeading({ title, action, onPress }) {
  return <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}  →</Text></Pressable> : null}</View>;
}

const COLORS = {
  background: '#F6EBDD',
  panel: '#FFFDFC',
  soft: '#F1E3D2',
  brown: '#A48769',
  ink: '#2B2622',
  muted: '#7D7066',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 118 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandHand: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.brown, alignItems: 'center', justifyContent: 'center' },
  brandHandText: { fontSize: 29, color: COLORS.white },
  brandName: { color: COLORS.ink, fontSize: 29, fontWeight: '800', letterSpacing: -1 },
  brandTagline: { color: COLORS.brown, fontSize: 16, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationButton: { padding: 7, position: 'relative' },
  notificationDot: { position: 'absolute', right: 5, top: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: '#DD685D' },
  avatarButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.panel, borderWidth: 4, borderColor: '#E8D9C8', overflow: 'hidden' },
  headerAvatar: { width: '100%', height: '100%' },
  menuButton: { padding: 5 },
  menu: { position: 'absolute', top: 70, right: 22, zIndex: 10, backgroundColor: COLORS.panel, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 14, shadowColor: '#6B5848', shadowOpacity: 0.18, shadowRadius: 10, elevation: 5 },
  menuText: { paddingVertical: 9, color: COLORS.ink, fontSize: 14 },
  logoutText: { color: '#B74D43' },
  heroCard: { minHeight: 290, borderRadius: 24, backgroundColor: '#EAD8C4', overflow: 'hidden', flexDirection: 'row', padding: 28, position: 'relative', marginBottom: 28 },
  heroCopy: { width: '47%', zIndex: 2 },
  heroTitle: { color: COLORS.ink, fontSize: 27, lineHeight: 34, fontWeight: '800' },
  heroBody: { color: '#5D5148', fontSize: 16, lineHeight: 24, marginTop: 13 },
  heroButton: { marginTop: 20, alignSelf: 'flex-start', backgroundColor: COLORS.brown, borderRadius: 24, paddingHorizontal: 17, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  heroArt: { flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  heroCircleLarge: { width: 170, height: 170, borderRadius: 85, backgroundColor: '#F3E9DB', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
  heroHand: { width: 125, height: 125, resizeMode: 'contain', borderRadius: 64 },
  heroCircleSmall: { position: 'absolute', left: -4, bottom: 18, width: 76, height: 76, borderRadius: 38, backgroundColor: '#F8EFE4', alignItems: 'center', justifyContent: 'center' },
  heroCircleTiny: { position: 'absolute', right: -2, bottom: 12, width: 70, height: 70, borderRadius: 35, backgroundColor: '#F8EFE4', alignItems: 'center', justifyContent: 'center' },
  smallHand: { width: 55, height: 55, resizeMode: 'contain', borderRadius: 30 },
  heroNote: { position: 'absolute', right: -1, top: 4, color: '#7E6A58', fontSize: 11, lineHeight: 14, fontWeight: '600', transform: [{ rotate: '7deg' }] },
  heroDots: { position: 'absolute', bottom: 13, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  heroDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#D9C5AE' },
  heroDotActive: { backgroundColor: COLORS.brown },
  progressCard: { backgroundColor: COLORS.panel, borderRadius: 21, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 22, shadowColor: '#8E7660', shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  progressRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 10, borderColor: '#D6C0A6', borderRightColor: COLORS.brown, transform: [{ rotate: '35deg' }], alignItems: 'center', justifyContent: 'center' },
  progressPercent: { color: COLORS.ink, fontSize: 20, fontWeight: '800', transform: [{ rotate: '-35deg' }] },
  progressCopy: { flex: 1, marginLeft: 18 },
  progressTitle: { color: COLORS.ink, fontSize: 18, fontWeight: '800' },
  progressSubtitle: { color: COLORS.muted, fontSize: 14, marginTop: 5 },
  progressTrack: { height: 11, borderRadius: 6, backgroundColor: '#E9DCCB', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', width: '0%', borderRadius: 6, backgroundColor: COLORS.brown },
  quickGrid: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  quickPressable: { flex: 1, minWidth: 0 },
  quickCard: { flex: 1, minHeight: 128, borderRadius: 20, backgroundColor: COLORS.panel, alignItems: 'center', justifyContent: 'center', shadowColor: '#8E7660', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  quickIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.brown, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  quickLabel: { color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '600', textAlign: 'center' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, paddingHorizontal: 10 },
  sectionTitle: { color: COLORS.ink, fontSize: 21, fontWeight: '800' },
  sectionAction: { color: COLORS.brown, fontSize: 14, fontWeight: '600' },
  teacherRow: { paddingHorizontal: 10, gap: 18, marginBottom: 30 },
  teacherCard: { width: 142, alignItems: 'center' },
  teacherImageWrap: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#E1C9AD', borderWidth: 5, borderColor: '#F8EFE4', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' },
  teacherImage: { width: 90, height: 90, borderRadius: 45, resizeMode: 'cover' },
  onlineDot: { position: 'absolute', right: 1, bottom: 4, width: 14, height: 14, borderRadius: 7, backgroundColor: '#7BBE73', borderWidth: 2, borderColor: COLORS.panel },
  teacherName: { color: COLORS.ink, fontSize: 13, fontWeight: '800', marginTop: 10, maxWidth: 142, textAlign: 'center' },
  teacherDetail: { color: COLORS.muted, fontSize: 11, marginTop: 4, maxWidth: 142, textAlign: 'center' },
  lessonCard: { backgroundColor: COLORS.panel, borderRadius: 20, minHeight: 111, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 30, shadowColor: '#8E7660', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  lessonBadge: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#EBD6BD', alignItems: 'center', justifyContent: 'center' },
  lessonBadgeText: { color: '#795D42', fontSize: 24, fontWeight: '900' },
  lessonCopy: { flex: 1, marginLeft: 14 },
  lessonCategory: { color: COLORS.brown, fontSize: 12 },
  lessonTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginTop: 4 },
  lessonMeta: { color: COLORS.muted, fontSize: 12, marginTop: 4 },
  lessonImage: { width: 88, height: 70, borderRadius: 12, resizeMode: 'cover' },
  lessonPlay: { position: 'absolute', right: 42 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  categoryCard: { width: '31.8%', minHeight: 94, borderRadius: 17, backgroundColor: COLORS.panel, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, shadowColor: '#8E7660', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  categoryIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: '#EBD8C1', alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  categoryLabel: { color: COLORS.ink, fontSize: 11, textAlign: 'center', fontWeight: '600' },
});
