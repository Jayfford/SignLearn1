import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const handLogo = require('../assets/images/welcome-hand.png');

const slides = [
  {
    eyebrow: 'WELCOME TO SIGNLEARN',
    title: 'Unlock the Language of Hands',
    description: 'A friendly place to learn, practice, and connect through sign language.',
    artwork: 'logo',
    background: '#F7EBDD',
  },
 
];

function Artwork({ type, floatStyle }) {
  if (type === 'logo') {
    return <Animated.View style={[styles.logoArtwork, floatStyle]}><Image source={handLogo} resizeMode="contain" style={logoStyles.handImage} /><View style={logoStyles.wordmark}><Text style={logoStyles.wordmarkBlue}>Sign</Text><Text style={logoStyles.wordmarkRed}>Learn</Text></View></Animated.View>;
  }

  if (type === 'learn') {
    return <Animated.View style={[styles.characterArtwork, floatStyle]}><View style={[styles.leaf, styles.leafLeft]} /><View style={[styles.leaf, styles.leafRight]} /><View style={styles.personHair} /><View style={styles.personFace}><View style={styles.eyeLeft} /><View style={styles.eyeRight} /><View style={styles.smile} /></View><View style={styles.personBody}><View style={styles.armLeft} /><View style={styles.armRight} /><View style={styles.handLeft}>🤲</View></View></Animated.View>;
  }

  return <Animated.View style={[styles.characterArtwork, floatStyle]}><View style={[styles.leaf, styles.leafLeft]} /><View style={[styles.leaf, styles.leafRight]} /><View style={styles.personHairMale} /><View style={styles.personFace}><View style={styles.eyeLeft} /><View style={styles.eyeRight} /><View style={styles.smile} /></View><View style={[styles.personBody, styles.blueBody]}><View style={styles.armLeft} /><View style={styles.armRight} /><Text style={styles.signEmoji}>🤟</Text></View></Animated.View>;
}

export default function Welcome() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const introAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const slide = slides[activeIndex];

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -7, duration: 1700, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: 0, duration: 1700, useNativeDriver: true }),
    ])).start();
  }, [floatAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introAnim, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 620,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [footerAnim, introAnim]);

  const goTo = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 130, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
    setActiveIndex(nextIndex);
  };

  const next = () => activeIndex === slides.length - 1 ? router.push('/login') : goTo(activeIndex + 1);
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -45) goTo(activeIndex + 1);
      if (gesture.dx > 45) goTo(activeIndex - 1);
    },
  })).current;

  const animatedCard = { opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }), transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) }] };
  const introContent = { opacity: introAnim, transform: [{ translateY: introAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] };
  const introFooter = { opacity: footerAnim, transform: [{ translateY: footerAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] };

  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><View style={styles.page} {...panResponder.panHandlers}>
    <Animated.View style={[styles.slideCard, { backgroundColor: slide.background }, animatedCard]}>
      <View style={[styles.blob, styles.blobTopLeft]} /><View style={[styles.blob, styles.blobTopRight]} /><View style={[styles.blob, styles.blobBottomLeft]} /><View style={[styles.blob, styles.blobBottomRight]} /><View style={styles.accentCurve} />
      <Animated.View style={[styles.topActions, introContent]}><Pressable onPress={() => router.push('/login')} hitSlop={10}><Text style={[styles.loginText, { fontSize: 12 }]}>Log in</Text></Pressable><Pressable onPress={() => activeIndex < slides.length - 1 && goTo(slides.length - 1)}><Text style={[styles.skipText, { fontSize: 12 }]}>Skip</Text></Pressable></Animated.View>
      <Animated.View style={[styles.cardBody, introContent]}><Text style={[styles.eyebrow, { fontSize: 11 }]}>{slide.eyebrow}</Text><View style={styles.artWrap}><Artwork type={slide.artwork} floatStyle={{ transform: [{ translateY: floatAnim }] }} /></View><Text style={[styles.title, { fontSize: 28, lineHeight: 34 }]}>{slide.title}</Text><Text style={[styles.description, { fontSize: 14, lineHeight: 20 }]}>{slide.description}</Text></Animated.View>
      <Animated.View style={[styles.cardFooter, introFooter]}><View style={styles.dots}>{slides.map((item, index) => <Pressable key={item.title} onPress={() => goTo(index)} style={[styles.dot, index === activeIndex && styles.dotActive]} />)}</View><Pressable onPress={next} style={styles.nextButton}><Text style={styles.nextText}>{activeIndex === slides.length - 1 ? 'Get started' : 'Next'}</Text><Ionicons name="arrow-forward" size={15} color="#FFFFFF" /></Pressable></Animated.View>
    </Animated.View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7EBDD' }, page: { flex: 1, alignItems: 'center' }, slideCard: { flex: 1, width: '100%', overflow: 'hidden', position: 'relative' }, statusBar: { paddingHorizontal: 15, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 3 }, time: { color: '#1A1A1A', fontSize: 11, fontWeight: '800' }, statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 5 }, topActions: { position: 'absolute', top: 30, right: 15, zIndex: 4, flexDirection: 'row', alignItems: 'center', gap: 17 }, loginText: { color: '#687687', fontSize: 10, fontWeight: '800' }, skipText: { color: '#687687', fontSize: 10, fontWeight: '700' }, blob: { position: 'absolute', opacity: 0.78 }, blobTopLeft: { width: 122, height: 122, borderRadius: 61, backgroundColor: '#B8C8C9', top: 36, left: -72 }, blobTopRight: { width: 94, height: 94, borderRadius: 47, backgroundColor: '#F9D8C0', top: 37, right: -43 }, blobBottomLeft: { width: 145, height: 145, borderRadius: 70, backgroundColor: '#F4B1A5', bottom: -50, left: -66 }, blobBottomRight: { width: 125, height: 125, borderRadius: 62, backgroundColor: '#B8C8C9', bottom: -43, right: -48 }, accentCurve: { position: 'absolute', width: 120, height: 230, borderRightWidth: 2, borderColor: '#F4B1A5', borderRadius: 75, right: -80, top: 250, transform: [{ rotate: '8deg' }] }, cardBody: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 30, zIndex: 1 }, eyebrow: { color: '#D95743', fontSize: 9, fontWeight: '900', letterSpacing: 1, textAlign: 'center' }, artWrap: { flex: 1, width: '100%', minHeight: 230, maxHeight: 420, alignItems: 'center', justifyContent: 'center' }, logoArtwork: { width: '100%', height: 285, alignItems: 'center', justifyContent: 'center' }, logoImage: { width: '100%', height: '100%' }, characterArtwork: { width: 205, height: 250, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }, leaf: { position: 'absolute', width: 22, height: 55, borderRadius: 20, backgroundColor: '#B9C8C1', transform: [{ rotate: '-28deg' }], opacity: 0.75 }, leafLeft: { left: 19, top: 55 }, leafRight: { right: 12, top: 25, transform: [{ rotate: '28deg' }] }, personHair: { position: 'absolute', top: 42, width: 88, height: 85, borderRadius: 44, backgroundColor: '#17191A' }, personHairMale: { position: 'absolute', top: 46, width: 91, height: 78, borderRadius: 39, backgroundColor: '#17191A' }, personFace: { width: 68, height: 78, borderRadius: 32, backgroundColor: '#F4B493', zIndex: 1, marginBottom: 105, alignItems: 'center', paddingTop: 29, flexDirection: 'row', justifyContent: 'center', gap: 18 }, eyeLeft: { width: 5, height: 7, borderRadius: 4, backgroundColor: '#1A1A1A' }, eyeRight: { width: 5, height: 7, borderRadius: 4, backgroundColor: '#1A1A1A' }, smile: { position: 'absolute', bottom: 20, width: 15, height: 6, borderBottomWidth: 2, borderColor: '#7D3D36', borderRadius: 10 }, personBody: { position: 'absolute', bottom: 0, width: 145, height: 145, borderRadius: 70, backgroundColor: '#202125' }, blueBody: { backgroundColor: '#38608A' }, armLeft: { position: 'absolute', width: 28, height: 103, borderRadius: 18, backgroundColor: '#F4B493', top: 22, left: 9, transform: [{ rotate: '34deg' }] }, armRight: { position: 'absolute', width: 28, height: 103, borderRadius: 18, backgroundColor: '#F4B493', top: 22, right: 9, transform: [{ rotate: '-34deg' }] }, handLeft: { position: 'absolute', top: 39, left: 37, fontSize: 31 }, signEmoji: { position: 'absolute', top: 24, right: 39, fontSize: 35 }, title: { color: '#1A1A1A', fontSize: 24, lineHeight: 28, fontWeight: '900', textAlign: 'center', maxWidth: 300 }, description: { color: '#687687', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 9, maxWidth: 275 }, cardFooter: { paddingHorizontal: 18, paddingBottom: 18, paddingTop: 16, alignItems: 'center', gap: 15, zIndex: 2 }, dots: { flexDirection: 'row', gap: 7 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D7C8B9' }, dotActive: { width: 19, backgroundColor: '#E05A47' }, nextButton: { width: '100%', height: 45, borderRadius: 23, backgroundColor: '#E65A59', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, shadowColor: '#B7433D', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.24, shadowRadius: 5, elevation: 3 }, nextText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
});

const logoStyles = StyleSheet.create({
  handImage: { width: '78%', height: 145 },
  wordmark: { flexDirection: 'row', alignItems: 'baseline', marginTop: -5 },
  wordmarkBlue: { color: '#4E82A8', fontSize: 33, fontWeight: '800', letterSpacing: -2 },
  wordmarkRed: { color: '#E44442', fontSize: 33, fontWeight: '800', letterSpacing: -2 },
  logoTagline: { color: '#1A1A1A', fontSize: 10, fontWeight: '700', marginTop: 2 },
});