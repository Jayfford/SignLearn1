import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { saveUserProfile } from './lib/database';

const ROLE_OPTIONS = ['student', 'teacher'];

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('Zanelyna');
  const [email, setEmail] = useState('zanelyna@example.com');
  const [bio, setBio] = useState('FSL Learner • Level 3');
  const [age, setAge] = useState('');
  const [birthday, setBirthday] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [accountType, setAccountType] = useState('student');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed?.name) setName(parsed.name);
          if (parsed?.email) setEmail(parsed.email);
          if (parsed?.bio) setBio(parsed.bio);
          if (parsed?.age) setAge(parsed.age);
          if (parsed?.birthday) setBirthday(parsed.birthday);
          if (parsed?.contactNumber) setContactNumber(parsed.contactNumber);
          if (parsed?.address) setAddress(parsed.address);
          if (parsed?.accountType) setAccountType(parsed.accountType);
        }
      } catch (error) {
        console.log('Error loading profile data:', error);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await saveUserProfile({
        name,
        email,
        bio,
        age,
        birthday,
        contactNumber,
        address,
        accountType,
      });
      router.back();
    } catch (error) {
      console.log('Error saving profile data:', error);
      Alert.alert('Save Failed', 'Unable to save your updates. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Enter your name" />

          <Text style={styles.sectionLabel}>Email Address</Text>
          <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.sectionLabel}>Age</Text>
          <TextInput value={age} onChangeText={setAge} style={styles.input} placeholder="Enter your age" keyboardType="numeric" />

          <Text style={styles.sectionLabel}>Birthday</Text>
          <TextInput value={birthday} onChangeText={setBirthday} style={styles.input} placeholder="MM/DD/YYYY" keyboardType="numeric" />

          <Text style={styles.sectionLabel}>Contact Number</Text>
          <TextInput value={contactNumber} onChangeText={setContactNumber} style={styles.input} placeholder="Enter your contact number" keyboardType="phone-pad" />

          <Text style={styles.sectionLabel}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} style={styles.input} placeholder="Enter your address" />

          <Text style={styles.sectionLabel}>I am signing up as</Text>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setAccountType(role)}
                style={[styles.roleButton, accountType === role && styles.roleButtonActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.roleText, accountType === role && styles.roleTextActive]}>
                  {role === 'student' ? 'Student' : 'Teacher'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.textArea]}
            placeholder="Add a short bio"
            multiline
          />

          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    paddingBottom: 40,
  },
  sectionLabel: {
    marginBottom: 10,
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#5C7FA4',
    borderColor: '#5C7FA4',
  },
  roleText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFF',
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#4ECDC4',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfile;
