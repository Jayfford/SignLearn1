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
import { createUserAccount } from './lib/database';

const handLogo = require('../assets/images/welcome-hand.png');
const COLORS = {
  bg: '#E9E0D5',
  text: '#1F1B1A',
  muted: '#6D6C69',
  blue: '#5C7FA4',
  red: '#E45A59',
  line: '#DAD0C7',
  white: '#FFFFFF',
};
const ROLE_OPTIONS = ['Student', 'Teacher'];

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

export default function SignUp() {
  const router = useRouter();
  const brandAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [accountType, setAccountType] = useState('Student');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
  }, [brandAnim, formAnim]);

  const brandEnterStyle = { opacity: brandAnim, transform: [{ translateY: brandAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }] };
  const formEnterStyle = { opacity: formAnim, transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }] };

  const submit = async () => {
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert('Check your details', 'Enter your full name and a valid email.');
      return;
    }

    if (!age.trim() || !birthday.trim() || !contactNumber.trim() || !address.trim()) {
      Alert.alert('Personal information required', 'Enter your age, birthday, contact number, and address to continue.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please check both password fields.');
      return;
    }

    if (!accepted) {
      Alert.alert('Terms required', 'Please accept the Terms of Service to continue.');
      return;
    }

    setLoading(true);
    try {
      await createUserAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: age.trim(),
        birthday: birthday.trim(),
        contactNumber: contactNumber.trim(),
        address: address.trim(),
        accountType: accountType.toLowerCase(),
      });
      Alert.alert('Account created', 'Your account is ready. Please sign in.');
      router.replace('/login');
    } catch (error) {
      Alert.alert('Sign up failed', error.message || 'Please try again.');
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
            <Text style={styles.title}>Create Account</Text>

            <Field icon="person-outline" placeholder="Full Name" value={name} onChangeText={setName} />
            <Field icon="mail-outline" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field icon="calendar-outline" placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
            <Field icon="gift-outline" placeholder="Birthday (MM/DD/YYYY)" value={birthday} onChangeText={setBirthday} keyboardType="numeric" />
            <Field icon="call-outline" placeholder="Contact Number" value={contactNumber} onChangeText={setContactNumber} keyboardType="phone-pad" />
            <Field icon="location-outline" placeholder="Address" value={address} onChangeText={setAddress} />

            <Field
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secure={!showPassword}
              onToggle={() => setShowPassword((value) => !value)}
            />
            <Field
              icon="lock-closed-outline"
              placeholder="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              secure={!showConfirm}
              onToggle={() => setShowConfirm((value) => !value)}
            />

            <Text style={styles.roleLabel}>I am signing up as</Text>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setAccountType(role)}
                  style={[styles.roleButton, accountType === role && styles.roleButtonActive]}
                >
                  <Text style={[styles.roleText, accountType === role && styles.roleTextActive]}>{role}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable onPress={() => setAccepted((value) => !value)} style={styles.termsRow}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted ? <Ionicons name="checkmark" size={14} color={COLORS.white} /> : null}
              </View>
              <Text style={styles.termsText}>I agree to the Terms of Service</Text>
            </Pressable>

            <Pressable onPress={submit} disabled={loading} style={[styles.primaryButton, loading && styles.disabledButton]}>
              <Text style={styles.primaryText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
            </Pressable>

            <Text style={styles.bottomText}>
              Already have an account?{' '}
              <Text style={styles.inlineLink} onPress={() => router.push('/login')}>
                Log In
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
    marginBottom: 18,
  },
  brandCompact: {
    alignItems: 'center',
    marginBottom: 12,
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
  roleLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: '#FBF9F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  roleText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  roleTextActive: {
    color: COLORS.white,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    backgroundColor: '#F4F1EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  termsText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.red,
    borderRadius: 18,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
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
