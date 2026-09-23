import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { loginUser } from './lib/database';

const handLogo = require('../assets/images/welcome-hand.png');
const COLORS = {
  bg: '#E9E0D5',
  panel: '#F2EFEA',
  text: '#1F1B1A',
  muted: '#6D6C69',
  blue: '#5C7FA4',
  red: '#E45A59',
  line: '#DAD0C7',
  white: '#FFFFFF',
};

function BrandMark({ compact = false }) {
  return (
    <View style={compact ? styles.brandCompact : styles.brandWrap}>
      <Image source={handLogo} resizeMode="contain" style={compact ? styles.handLogoSmall : styles.handLogo} />
      <View style={styles.wordmarkRow}>
        <Text style={styles.wordBlue}>Sign</Text>
        <Text style={styles.wordRed}>Learn</Text>
      </View>
      <Text style={compact ? styles.taglineSmall : styles.tagline}>Unlock the Language of Hands</Text>
    </View>
  );
}

function Field({ icon, placeholder, value, onChangeText, secure, onToggle, keyboardType }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={COLORS.muted} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9B938D"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {onToggle ? (
        <Pressable onPress={onToggle} hitSlop={8}>
          <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Login() {
  const router = useRouter();
  const brandAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userData = await AsyncStorage.getItem('userData');

        if (token && userData) {
          router.replace('/home');
        }
      } catch {
        // Ignore session-check errors and allow the user to sign in manually.
      }
    };

    checkExistingSession();

    Animated.parallel([
      Animated.timing(brandAnim, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 560,
        delay: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [brandAnim, formAnim, router]);

  const brandEnterStyle = { opacity: brandAnim, transform: [{ translateY: brandAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] };
  const formEnterStyle = { opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] };

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const matchedUser = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!matchedUser) {
        Alert.alert('Login failed', 'No matching account was found. Please sign up first.');
        return;
      }

      router.replace('/home');
    } catch {
      Alert.alert('Login failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </Pressable>

          <Animated.View style={brandEnterStyle}>
            <BrandMark compact />
          </Animated.View>

          <Animated.View style={[styles.formCard, formEnterStyle]}>
            <Text style={styles.title}>Login</Text>

            <Field
              icon="mail-outline"
              placeholder="Email or Username"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secure={!showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />

            <Pressable onPress={submit} disabled={loading} style={[styles.primaryButton, loading && styles.disabledButton]}>
              <Text style={styles.primaryText}>{loading ? 'Logging in...' : 'Log In'}</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/forgot-password')}>
              <Text style={styles.linkText}>Forgot Password?</Text>
            </Pressable>

            <Text style={styles.bottomText}>
              Don’t have an account?{' '}
              <Text style={styles.inlineLink} onPress={() => router.push('/signup')}>
                Sign Up
              </Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  brandCompact: {
    alignItems: 'center',
    marginBottom: 18,
  },
  handLogo: {
    width: 220,
    height: 110,
  },
  handLogoSmall: {
    width: 185,
    height: 95,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: -4,
  },
  wordBlue: {
    color: COLORS.blue,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -2,
  },
  wordRed: {
    color: COLORS.red,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -2,
  },
  tagline: {
    marginTop: 7,
    fontSize: 17,
    color: COLORS.text,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  taglineSmall: {
    marginTop: 5,
    fontSize: 15,
    color: COLORS.text,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.54)',
    padding: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  field: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#FBF9F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: COLORS.red,
    borderRadius: 18,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  linkText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
  },
  bottomText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  inlineLink: {
    color: COLORS.red,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.75,
  },
});