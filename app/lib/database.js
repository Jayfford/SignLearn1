import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';

const USERS_KEY = 'signlearn_users';
let db = null;

if (Platform.OS !== 'web') {
  const SQLite = require('expo-sqlite');
  db = SQLite.openDatabaseSync('signlearn.db');
}

const ensureSchema = () => {
  if (!db) return;

  db.runSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      age TEXT,
      birthday TEXT,
      contactNumber TEXT,
      address TEXT,
      accountType TEXT,
      bio TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      lastLogin TEXT
    );
  `);
};

ensureSchema();

const normalizeUser = (user = {}) => {
  const email = String(user.email || '').trim().toLowerCase();
  return {
    name: user.name || '',
    email,
    password: user.password || '',
    age: user.age || '',
    birthday: user.birthday || '',
    contactNumber: user.contactNumber || '',
    address: user.address || '',
    accountType: (user.accountType || 'student').toLowerCase(),
    bio: user.bio || '',
  };
};

const sanitizeUser = (row = {}) => ({
  id: row.id,
  name: row.name || '',
  email: row.email || '',
  password: row.password || '',
  age: row.age || '',
  birthday: row.birthday || '',
  contactNumber: row.contactNumber || '',
  address: row.address || '',
  accountType: row.accountType || 'student',
  bio: row.bio || '',
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  lastLogin: row.lastLogin,
});

const profileRowToAppUser = (row = {}) => ({
  id: row.id,
  name: row.name || '',
  email: row.email || '',
  password: row.password || '',
  age: row.age || '',
  birthday: row.birthday || '',
  contactNumber: row.contact_number || row.contactNumber || '',
  address: row.address || '',
  accountType: row.account_type || row.accountType || 'student',
  bio: row.bio || '',
  createdAt: row.created_at || row.createdAt || null,
  updatedAt: row.updated_at || row.updatedAt || null,
  lastLogin: row.last_login || row.lastLogin || null,
});

const readWebUsers = async () => {
  try {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeWebUsers = async (users) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const storeSessionUser = async (user) => {
  if (!user) return null;

  const safeUser = {
    ...user,
    email: String(user.email || '').trim().toLowerCase(),
  };

  await AsyncStorage.setItem('userData', JSON.stringify(safeUser));
  await AsyncStorage.setItem('userToken', safeUser.id ? `supabase:${safeUser.id}` : 'demo-token');
  return safeUser;
};

const getWebUserByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = String(email).trim().toLowerCase();
  const users = await readWebUsers();
  return users.find((user) => String(user.email || '').trim().toLowerCase() === normalizedEmail) || null;
};

const localGetUserByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!db) {
    return getWebUserByEmail(normalizedEmail);
  }

  const result = db.getFirstSync(`SELECT * FROM users WHERE email = ?`, [normalizedEmail]);
  return result ? sanitizeUser(result) : null;
};

const localGetCurrentUserProfile = async () => {
  try {
    const stored = await AsyncStorage.getItem('userData');
    if (stored) {
      return JSON.parse(stored);
    }

    if (!db) {
      const users = await readWebUsers();
      const latest = users[users.length - 1] || null;
      if (latest) {
        await AsyncStorage.setItem('userData', JSON.stringify(latest));
      }
      return latest;
    }

    const latestUser = db.getFirstSync(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);
    if (latestUser) {
      const user = sanitizeUser(latestUser);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return user;
    }

    return null;
  } catch (error) {
    console.log('Error loading current user profile:', error);
    return null;
  }
};

const localSaveUserProfile = async (user) => {
  const normalized = normalizeUser(user);

  if (!normalized.email) {
    throw new Error('Email is required');
  }

  if (!db) {
    const users = await readWebUsers();
    const index = users.findIndex((entry) => String(entry.email || '').trim().toLowerCase() === normalized.email);

    if (index >= 0) {
      users[index] = { ...users[index], ...normalized };
    } else {
      users.push(normalized);
    }

    await writeWebUsers(users);
    const savedUser = users[index >= 0 ? index : users.length - 1];
    await AsyncStorage.setItem('userData', JSON.stringify(savedUser));
    return savedUser;
  }

  const existing = await localGetUserByEmail(normalized.email);

  if (existing) {
    db.runSync(
      `UPDATE users
       SET name = ?,
           password = ?,
           age = ?,
           birthday = ?,
           contactNumber = ?,
           address = ?,
           accountType = ?,
           bio = ?,
           updatedAt = CURRENT_TIMESTAMP
       WHERE email = ?`,
      [
        normalized.name,
        normalized.password,
        normalized.age,
        normalized.birthday,
        normalized.contactNumber,
        normalized.address,
        normalized.accountType,
        normalized.bio,
        normalized.email,
      ]
    );
  } else {
    db.runSync(
      `INSERT INTO users (name, email, password, age, birthday, contactNumber, address, accountType, bio, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        normalized.name,
        normalized.email,
        normalized.password,
        normalized.age,
        normalized.birthday,
        normalized.contactNumber,
        normalized.address,
        normalized.accountType,
        normalized.bio,
      ]
    );
  }

  const savedUser = await localGetUserByEmail(normalized.email);
  await AsyncStorage.setItem('userData', JSON.stringify(savedUser));
  return savedUser;
};

const localCreateUserAccount = async (user) => {
  const normalized = normalizeUser(user);

  if (!normalized.email) {
    throw new Error('Email is required');
  }

  const existing = await localGetUserByEmail(normalized.email);
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const createdUser = await localSaveUserProfile(normalized);
  await AsyncStorage.setItem('userToken', 'demo-token');
  return createdUser;
};

const localLoginUser = async ({ email, password }) => {
  const normalized = normalizeUser({ email, password });
  const matchingUser = await localGetUserByEmail(normalized.email);

  if (!matchingUser) {
    return null;
  }

  if (matchingUser.password !== normalized.password) {
    return null;
  }

  if (db) {
    db.runSync(`UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE email = ?`, [normalized.email]);
  }

  await AsyncStorage.setItem('userData', JSON.stringify(matchingUser));
  await AsyncStorage.setItem('userToken', 'demo-token');
  return matchingUser;
};

const getSupabaseProfile = async (authUser = null) => {
  if (!isSupabaseConfigured) {
    return null;
  }

  const currentUser = authUser || (await supabase.auth.getUser()).data.user;
  if (!currentUser?.email) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', currentUser.email)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return null;
  }

  return profileRowToAppUser(data);
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = String(email).trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? profileRowToAppUser(data) : null;
    } catch (error) {
      console.log('Supabase lookup failed, falling back to local storage:', error);
      return localGetUserByEmail(normalizedEmail);
    }
  }

  return localGetUserByEmail(normalizedEmail);
};

export const getCurrentUserProfile = async () => {
  try {
    const cached = await AsyncStorage.getItem('userData');
    if (cached) {
      return JSON.parse(cached);
    }

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getSupabaseProfile(user);
        if (profile) {
          await storeSessionUser(profile);
          return profile;
        }
      }
      return null;
    }

    return localGetCurrentUserProfile();
  } catch (error) {
    console.log('Error loading current user profile:', error);
    if (isSupabaseConfigured) {
      return localGetCurrentUserProfile();
    }
    return null;
  }
};

export const saveUserProfile = async (user) => {
  const normalized = normalizeUser(user);

  if (!normalized.email) {
    throw new Error('Email is required');
  }

  if (isSupabaseConfigured) {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const authUser = authData?.user || null;

      if (!authUser && normalized.password) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalized.email,
          password: normalized.password,
        });

        if (signInError) {
          throw signInError;
        }

        if (signInData?.user) {
          authUser = signInData.user;
        }
      }

      const existing = authUser
        ? await supabase.from('profiles').select('id').eq('email', normalized.email).maybeSingle()
        : { data: null, error: null };

      if (existing.error && existing.error.code !== 'PGRST116') {
        throw existing.error;
      }

      const profilePayload = {
        id: authUser?.id || existing.data?.id || undefined,
        email: normalized.email,
        name: normalized.name,
        age: normalized.age,
        birthday: normalized.birthday,
        contact_number: normalized.contactNumber,
        address: normalized.address,
        account_type: normalized.accountType,
        bio: normalized.bio,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      const savedUser = profileRowToAppUser(data);
      await storeSessionUser(savedUser);
      return savedUser;
    } catch (error) {
      console.log('Supabase profile save failed, falling back to local storage:', error);
      return localSaveUserProfile(normalized);
    }
  }

  return localSaveUserProfile(normalized);
};

export const createUserAccount = async (user) => {
  const normalized = normalizeUser(user);

  if (!normalized.email) {
    throw new Error('Email is required');
  }

  if (isSupabaseConfigured) {
    try {
      const existing = await getUserByEmail(normalized.email);
      if (existing) {
        throw new Error('An account with this email already exists');
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalized.email,
        password: normalized.password,
        options: {
          data: {
            name: normalized.name,
            age: normalized.age,
            birthday: normalized.birthday,
            contact_number: normalized.contactNumber,
            address: normalized.address,
            account_type: normalized.accountType,
            bio: normalized.bio,
          },
        },
      });

      if (error) {
        throw error;
      }

      const authUser = data?.user;
      const profile = authUser
        ? await getSupabaseProfile(authUser)
        : {
            id: authUser?.id || `local-${Date.now()}`,
            name: normalized.name,
            email: normalized.email,
            password: '',
            age: normalized.age,
            birthday: normalized.birthday,
            contactNumber: normalized.contactNumber,
            address: normalized.address,
            accountType: normalized.accountType,
            bio: normalized.bio,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
          };

      await storeSessionUser(profile);
      return profile;
    } catch (error) {
      console.log('Supabase sign-up failed, falling back to local storage:', error);
      return localCreateUserAccount(normalized);
    }
  }

  return localCreateUserAccount(normalized);
};

export const loginUser = async ({ email, password }) => {
  const normalized = normalizeUser({ email, password });

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized.email,
        password: normalized.password,
      });

      if (error || !data?.user) {
        return null;
      }

      const profile = await getSupabaseProfile(data.user);
      if (!profile) {
        return null;
      }

      await storeSessionUser(profile);
      return profile;
    } catch (error) {
      console.log('Supabase sign-in failed, falling back to local storage:', error);
      return localLoginUser(normalized);
    }
  }

  return localLoginUser(normalized);
};

export const logoutUser = async () => {
  try {
    await AsyncStorage.multiRemove(['userData', 'userToken']);
  } catch (error) {
    console.log('Error clearing local session:', error);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Supabase sign-out failed:', error);
    }
  }
};
