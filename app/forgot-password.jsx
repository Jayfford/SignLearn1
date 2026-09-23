import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value) => {
    if (!value) {
      return 'Email address is required';
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSendResetLink = async () => {
    const validationError = validateEmail(email.trim());
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      Alert.alert(
        'Check your inbox',
        'A password reset link has been sent to your email address. Follow the instructions to set a new password.',
        [
          {
            text: 'Back to Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Something went wrong', 'Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.curvedTextContainer}>
              <Text style={[styles.logoText, styles.logoSignCurve]}>Sign</Text>
              <Text style={[styles.logoText, styles.logoLearnCurve]}>Learn</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Enter the email address linked to your account and we’ll send a secure reset link.
            </Text>

            <Text style={styles.formTitle}>Forgot Password</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrapper, error && styles.inputError]}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (error) setError('');
                  }}
                  editable={!isLoading}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
              onPress={handleSendResetLink}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <Text style={styles.sendBtnText}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Remembered your password?</Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.signInLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  logoContainer: {
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curvedTextContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 220,
    height: 100,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    position: 'absolute',
  },
  logoSignCurve: {
    color: '#9B9BA3',
    transform: [{ rotate: '-5deg' }, { translateY: -10 }],
    left: 20,
  },
  logoLearnCurve: {
    color: '#E85D5D',
    transform: [{ rotate: '5deg' }, { translateY: 10 }],
    right: 20,
  },
  formContainer: {
    backgroundColor: '#E8E2D5',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 25,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F1ED',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0D6C8',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 6,
    marginLeft: 4,
  },
  sendBtn: {
    backgroundColor: '#D4C4B0',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C5B39E',
  },
  sendBtnDisabled: {
    backgroundColor: '#E0D6C8',
    opacity: 0.8,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  signInText: {
    fontSize: 14,
    color: '#666',
  },
  signInLink: {
    fontSize: 14,
    color: '#E85D5D',
    fontWeight: '700',
    marginLeft: 6,
  },
});
