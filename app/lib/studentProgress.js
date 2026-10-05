import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserProfile } from './database';

export const TOTAL_LESSONS = 12;

const emptyProgress = () => ({
  points: 0,
  streak: 0,
  level: 0,
  completedLessons: [],
  quizzesPassed: 0,
  lastLessonDate: null,
  activity: [],
});

const dateStamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const yesterdayStamp = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dateStamp(date);
};

export const getProgressOwnerKey = async (user) => {
  const profile = user || await getCurrentUserProfile();
  return String(profile?.email || '').trim().toLowerCase();
};

const progressStorageKey = (ownerKey) => `studentProgress_${ownerKey}`;

export const computeLessonLevel = (completedCount = 0) => {
  if (completedCount <= 0) return 0;
  return Math.floor((completedCount - 1) / 3) + 1;
};

export const lessonProgressPercent = (progress) => {
  const count = Array.isArray(progress?.completedLessons) ? progress.completedLessons.length : 0;
  return Math.min(100, Math.round((count / TOTAL_LESSONS) * 100));
};

const normalizeProgress = (progress = {}) => {
  const completedLessons = Array.isArray(progress.completedLessons)
    ? progress.completedLessons.map((id) => String(id))
    : [];

  return {
    ...emptyProgress(),
    ...progress,
    points: Math.max(0, Number(progress.points) || 0),
    streak: Math.max(0, Number(progress.streak) || 0),
    completedLessons,
    quizzesPassed: Math.max(0, Number(progress.quizzesPassed) || 0),
    activity: Array.isArray(progress.activity) ? progress.activity : [],
    level: computeLessonLevel(completedLessons.length),
  };
};

export const getStudentProgress = async (user) => {
  const ownerKey = await getProgressOwnerKey(user);
  if (!ownerKey) return emptyProgress();

  try {
    const stored = await AsyncStorage.getItem(progressStorageKey(ownerKey));
    if (!stored) return emptyProgress();
    return normalizeProgress(JSON.parse(stored));
  } catch (error) {
    console.log('Error loading student progress:', error);
    return emptyProgress();
  }
};

export const saveStudentProgress = async (progress, user) => {
  const ownerKey = await getProgressOwnerKey(user);
  const next = normalizeProgress(progress);
  if (!ownerKey) return next;

  try {
    await AsyncStorage.setItem(progressStorageKey(ownerKey), JSON.stringify(next));
  } catch (error) {
    console.log('Error saving student progress:', error);
  }

  return next;
};

export const completeStudentLesson = async (lessonId, { isQuiz = false, title, detail } = {}) => {
  const user = await getCurrentUserProfile();
  const progress = await getStudentProgress(user);
  const id = String(lessonId);
  const alreadyCompleted = progress.completedLessons.includes(id);
  const today = dateStamp();

  let streak = progress.streak;
  if (!alreadyCompleted) {
    if (progress.lastLessonDate === today) {
      streak = Math.max(1, progress.streak);
    } else if (progress.lastLessonDate === yesterdayStamp()) {
      streak = (progress.streak || 0) + 1;
    } else {
      streak = 1;
    }
  }

  const completedLessons = alreadyCompleted
    ? progress.completedLessons
    : [...progress.completedLessons, id];

  const activityItem = {
    title: title || (isQuiz ? 'Passed Quiz' : 'Completed Lesson'),
    detail: detail || (isQuiz ? 'You finished a module quiz.' : `You completed lesson ${id}.`),
    timestamp: new Date().toISOString(),
  };

  return saveStudentProgress({
    ...progress,
    completedLessons,
    lastLessonDate: alreadyCompleted ? progress.lastLessonDate : today,
    streak,
    quizzesPassed: alreadyCompleted ? progress.quizzesPassed : progress.quizzesPassed + (isQuiz ? 1 : 0),
    activity: [activityItem, ...progress.activity].slice(0, 20),
  }, user);
};

export const finishLesson = async (lessonId, router, options) => {
  await completeStudentLesson(lessonId, options);
  if (router) {
    router.push('/learn');
  }
};

export const addStudentGamePoints = async (amount) => {
  const earned = Number(amount) || 0;
  if (earned <= 0) return getStudentProgress();

  const user = await getCurrentUserProfile();
  const progress = await getStudentProgress(user);
  return saveStudentProgress({
    ...progress,
    points: progress.points + earned,
  }, user);
};
