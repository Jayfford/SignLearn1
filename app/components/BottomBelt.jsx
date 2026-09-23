import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'learn', label: 'Learn', icon: 'school' },
  { key: 'ai-camera', label: 'AI Cam', icon: 'camera-alt' },
  { key: 'game', label: 'Game', icon: 'sports-esports' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

export default function BottomBelt({ active }) {
  const router = useRouter();
  const [accountType, setAccountType] = useState('student');

  useEffect(() => {
    const loadAccountType = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed?.accountType) {
            setAccountType(parsed.accountType);
          }
        }
      } catch (error) {
        console.log('Error loading account type for nav:', error);
      }
    };

    loadAccountType();
  }, []);

  const filteredNavItems = (accountType === 'teacher' || accountType === 'deaf')
    ? navItems.filter((item) => item.key !== 'game')
    : navItems;

  return (
    <View style={styles.belt}>
      {filteredNavItems.map((item) => {
        const isActive = item.key === active;
        const displayLabel = item.key === 'learn' && accountType === 'deaf'
          ? 'Community'
          : item.label;
        const displayIcon = item.key === 'learn' && accountType === 'deaf'
          ? 'accessibility'
          : item.icon;

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.item, isActive && styles.itemActive]}
            activeOpacity={0.8}
            onPress={() => router.push(`/${item.key}`)}
          >
            <MaterialIcons
              name={displayIcon}
              size={24}
              color={isActive ? '#333' : '#666'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {displayLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  belt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EBD8C1',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 28,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DEC8AE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  itemActive: {
    backgroundColor: '#FFFDFC',
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    color: '#7D7066',
    fontWeight: '600',
  },
  labelActive: {
    color: '#2B2622',
  },
});
