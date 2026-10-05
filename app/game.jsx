import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  BackHandler,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import BottomBelt from './components/BottomBelt';
import { addStudentGamePoints, getProgressOwnerKey } from './lib/studentProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const signMatchStages = [
  { stage: 1, difficulty: 'Easy', letters: ['A', 'B', 'C', 'D'] },
  { stage: 2, difficulty: 'Medium', letters: ['E', 'F', 'G', 'H', 'I', 'J'] },
  { stage: 3, difficulty: 'Hard', letters: ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
  { stage: 4, difficulty: 'Extreme', letters: ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] },
];

const generateSignMatchCards = (stage = 1) => {
  const selectedStage = signMatchStages[Math.min(Math.max(stage, 1), signMatchStages.length) - 1];
  return selectedStage.letters.flatMap((letter, index) => [
    { id: stage * 100 + index * 2, letter, matched: false },
    { id: stage * 100 + index * 2 + 1, letter, matched: false },
  ]);
};

// Sign Language Image Map
const signImageMap = {
  A: require('../assets/images/A.png'),
  B: require('../assets/images/B.png'),
  C: require('../assets/images/C.png'),
  D: require('../assets/images/D.png'),
  E: require('../assets/images/E.png'),
  F: require('../assets/images/F.png'),
  G: require('../assets/images/G.png'),
  H: require('../assets/images/H.png'),
  I: require('../assets/images/I.png'),
  J: require('../assets/images/J.png'),
  K: require('../assets/images/K.png'),
  L: require('../assets/images/L.png'),
  M: require('../assets/images/M.png'),
  N: require('../assets/images/N.png'),
  O: require('../assets/images/O.png'),
  P: require('../assets/images/P.png'),
  Q: require('../assets/images/Q.png'),
  R: require('../assets/images/R.png'),
  S: require('../assets/images/S.png'),
  T: require('../assets/images/T.png'),
  U: require('../assets/images/U.png'),
  V: require('../assets/images/V.png'),
  W: require('../assets/images/W.png'),
  X: require('../assets/images/X.png'),
  Y: require('../assets/images/Y.png'),
  Z: require('../assets/images/Z.png'),
};

export default function Game() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  
  // Game State - Common
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [lives, setLives] = useState(10);
  const [level, setLevel] = useState(0);
  const [difficulty, setDifficulty] = useState('Easy');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Guess the Word State
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Conversation Builder State
  const [conversationSequence, setConversationSequence] = useState([]);
  const [userConversation, setUserConversation] = useState([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  
  // Speed Sign State
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [speedGameStarted, setSpeedGameStarted] = useState(false);
  const [speedAnswer, setSpeedAnswer] = useState('');
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState(0);
  
  // Sign Match Shuffled State
  const [shuffledCards, setShuffledCards] = useState([]);
  const [signMatchTimeRemaining, setSignMatchTimeRemaining] = useState(180);
  const [signMatchTimerActive, setSignMatchTimerActive] = useState(false);
  
  const [progressOwner, setProgressOwner] = useState('');
  const flipAnimations = useRef({});
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerInterval = useRef(null);
  const signMatchTimerInterval = useRef(null);

  // ===== GAME DATA =====
  
  const [currentSignMatchStage, setCurrentSignMatchStage] = useState(1);
  const [signMatchDifficulty, setSignMatchDifficulty] = useState(signMatchStages[0].difficulty);
  const [signMatchCards, setSignMatchCards] = useState(generateSignMatchCards(1));

  // Guess the Word Game Data
  const guessWordData = [
    {
      id: 1,
      letter: 'G',
      correctAnswer: 'Go',
      options: ['Hi', 'Yes', 'No', 'Go'],
      hint: 'Hand pointing forward',
      imageSign: '👉'
    },
    {
      id: 2,
      letter: 'H',
      correctAnswer: 'Hi',
      options: ['Good', 'Hi', 'Yes', 'Thanks'],
      hint: 'Hand wave',
      imageSign: '👋'
    },
    {
      id: 3,
      letter: 'Y',
      correctAnswer: 'Yes',
      options: ['No', 'Good', 'Yes', 'Maybe'],
      hint: 'Y-shaped hand',
      imageSign: '🤘'
    },
    {
      id: 4,
      letter: 'N',
      correctAnswer: 'No',
      options: ['No', 'Hi', 'Go', 'Yes'],
      hint: 'Crossed hands',
      imageSign: '🙅'
    },
    {
      id: 5,
      letter: 'T',
      correctAnswer: 'Thanks',
      options: ['Go', 'Thanks', 'Good', 'Help'],
      hint: 'Touch chest and move out',
      imageSign: '🙏'
    }
  ];

  // Conversation Builder Data
  const conversationBuilderData = [
    {
      id: 1,
      title: 'Greeting Exchange',
      sequence: ['J', 'H', 'G'],  // J-Hi, H-Hi/Hello, G-Go
      sequenceWords: ['Hi', 'Hello', 'Goodbye'],
      difficulty: 'Easy',
      avatarColor: '#FF6B6B'
    },
    {
      id: 2,
      title: 'Asking About Feelings',
      sequence: ['H', 'Y', 'G'],  // How, Yes/No, Go
      sequenceWords: ['How', 'Yes', 'Go'],
      difficulty: 'Medium',
      avatarColor: '#4ECDC4'
    },
    {
      id: 3,
      title: 'Thanks & Goodbye',
      sequence: ['T', 'G', 'H'],  // Thanks, Go, Hello back
      sequenceWords: ['Thanks', 'Goodbye', 'See You'],
      difficulty: 'Easy',
      avatarColor: '#FFD166'
    }
  ];

  // Speed Sign Game Data
  const speedSignGameData = [
    {
      id: 1,
      letter: 'A',
      sign: '👌',
      hint: 'Thumb and index together'
    },
    {
      id: 2,
      letter: 'B',
      sign: '✋',
      hint: 'Open hand'
    },
    {
      id: 3,
      letter: 'C',
      sign: '🤙',
      hint: 'Hand C shape'
    },
    {
      id: 4,
      letter: 'D',
      sign: '☝️',
      hint: 'Point upward'
    },
    {
      id: 5,
      letter: 'E',
      sign: '✊',
      hint: 'Closed fist'
    },
  ];

  useEffect(() => {
    loadGameProgress();
    initializeAnimations();
    
    // Handle Android back button to exit app
    const backAction = () => {
      handleExit();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => {
      backHandler.remove();
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // Speed Sign Timer Effect
  useEffect(() => {
    if (!speedGameStarted) {
      return;
    }

    if (timeRemaining <= 0) {
      handleSpeedGameEnd();
      return;
    }

    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [speedGameStarted, timeRemaining]);

  useEffect(() => {
    if (currentScreen !== 'signMatch') {
      if (signMatchTimerInterval.current) clearInterval(signMatchTimerInterval.current);
      setSignMatchTimerActive(false);
      return;
    }

    if (!signMatchTimerActive) {
      return;
    }

    if (signMatchTimeRemaining <= 0) {
      handleSignMatchTimeout();
      return;
    }

    signMatchTimerInterval.current = setInterval(() => {
      setSignMatchTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => {
      if (signMatchTimerInterval.current) clearInterval(signMatchTimerInterval.current);
    };
  }, [currentScreen, signMatchTimerActive, signMatchTimeRemaining]);

  // Sign Match flip pair check
  useEffect(() => {
    if (flippedCards.length === 2) {
      checkForMatch();
    }
  }, [flippedCards]);

  // Sign Match level completion check
  useEffect(() => {
    if (matchedPairs.length > 0 && matchedPairs.length === signMatchCards.length / 2) {
      handleLevelComplete();
    }
  }, [matchedPairs, signMatchCards.length]);

  // Shuffle cards function
  const shuffleCards = (cards) => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize shuffled cards on mount
  useEffect(() => {
    const shuffledInitial = shuffleCards(signMatchCards);
    setShuffledCards(shuffledInitial);
    // Initialize flip animations for all cards
    shuffledInitial.forEach(card => {
      if (!flipAnimations.current[card.id]) {
        flipAnimations.current[card.id] = new Animated.Value(0);
      }
    });
  }, []);

  const loadGameProgress = async () => {
    try {
      const ownerKey = await getProgressOwnerKey();
      setProgressOwner(ownerKey);
      if (!ownerKey) {
        setLevel(0);
        setScore(0);
        setUserStreak(0);
        return;
      }

      const savedProgress = await AsyncStorage.getItem(`gameProgress_${ownerKey}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setLevel(progress.level || 0);
        setScore(progress.score || 0);
        setUserStreak(progress.streak || 0);
        return;
      }

      setLevel(0);
      setScore(0);
      setUserStreak(0);
    } catch (error) {
      console.error('Error loading game progress:', error);
    }
  };

  const saveGameProgress = async (nextScore = score, nextLevel = level, nextStreak = userStreak) => {
    try {
      const ownerKey = progressOwner || await getProgressOwnerKey();
      if (!ownerKey) return;
      const progress = {
        level: nextLevel,
        score: nextScore,
        streak: nextStreak,
        lastPlayed: new Date().toISOString()
      };
      await AsyncStorage.setItem(`gameProgress_${ownerKey}`, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const earnPoints = (amount) => {
    if (amount <= 0) return;
    setScore((prev) => {
      const next = prev + amount;
      saveGameProgress(next, Math.max(level, 1), userStreak);
      return next;
    });
    addStudentGamePoints(amount);
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: Math.min(score, 100),
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const initializeAnimations = () => {
    signMatchCards.forEach(card => {
      flipAnimations.current[card.id] = new Animated.Value(0);
    });
  };

  const handleCardFlip = async (cardId) => {
    if (flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    // Start game if not started
    if (!gameStarted) {
      setGameStarted(true);
    }

    // Animate card flip
    Animated.spring(flipAnimations.current[cardId], {
      toValue: 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
  };

  const formatTimer = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const clearSignMatchTimer = () => {
    if (signMatchTimerInterval.current) {
      clearInterval(signMatchTimerInterval.current);
      signMatchTimerInterval.current = null;
    }
  };

  const resetFlippedSignMatchCards = () => {
    flippedCards.forEach((cardId) => {
      if (flipAnimations.current[cardId]) {
        Animated.spring(flipAnimations.current[cardId], {
          toValue: 0,
          friction: 8,
          tension: 10,
          useNativeDriver: true,
        }).start();
      }
    });

    setFlippedCards([]);
  };

  const handleSignMatchTimeout = () => {
    clearSignMatchTimer();
    setSignMatchTimerActive(false);
    resetFlippedSignMatchCards();

    const nextLives = lives - 1;
    if (nextLives <= 0) {
      setLives(0);
      handleGameOver();
      return;
    }

    setLives(nextLives);
    Alert.alert(
      'Time is up!',
      'You lost one heart. Keep matching all cards before moving to the next stage.',
      [
        {
          text: 'Continue',
          onPress: () => {
            setSignMatchTimeRemaining(180);
            setSignMatchTimerActive(true);
          }
        }
      ]
    );
  };

  const checkForMatch = () => {
    const [firstId, secondId] = flippedCards;
    const firstCard = signMatchCards.find(card => card.id === firstId);
    const secondCard = signMatchCards.find(card => card.id === secondId);

    if (firstCard.letter === secondCard.letter) {
      // Match found
      setMatchedPairs([...matchedPairs, firstId, secondId]);
      earnPoints(100);
      setUserStreak(prev => prev + 1);
      
      setTimeout(() => {
        setFlippedCards([]);
      }, 1000);
    } else {
      // No match
      setTimeout(() => {
        // Flip cards back
        Animated.parallel([
          Animated.spring(flipAnimations.current[firstId], {
            toValue: 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
          }),
          Animated.spring(flipAnimations.current[secondId], {
            toValue: 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
          })
        ]).start();

        setLives(prev => prev - 1);
        setUserStreak(0);
        setFlippedCards([]);
        
        if (lives - 1 <= 0) {
          handleGameOver();
        }
      }, 1000);
    }
  };

  const handleLevelComplete = () => {
    setGameCompleted(true);
    clearSignMatchTimer();
    setSignMatchTimerActive(false);
    setShowConfetti(true);
    earnPoints(500);
    setLevel((prev) => Math.max(prev, currentSignMatchStage));

    const isFinalStage = currentSignMatchStage === signMatchStages.length;
    const nextStage = Math.min(currentSignMatchStage + 1, signMatchStages.length);
    const nextDifficulty = signMatchStages[nextStage - 1].difficulty;

    setTimeout(() => {
      setShowConfetti(false);

      if (!isFinalStage) {
        setCurrentSignMatchStage(nextStage);
        setSignMatchDifficulty(nextDifficulty);
        resetGame(nextStage, false);
        Alert.alert(
          'Stage Complete! 🎉',
          `You completed ${signMatchStages[currentSignMatchStage - 1].difficulty} mode. Next: ${nextDifficulty}.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                setCurrentScreen('signMatch');
              }
            }
          ]
        );
        return;
      }

      Alert.alert(
        'All Stages Complete! 🎉',
        'You finished every sign match stage. Great work!',
        [
          {
            text: 'Back to Games',
            onPress: () => {
              setCurrentScreen('dashboard');
              resetAllGames();
            }
          }
        ]
      );
    }, 2000);
  };

  const handleGameOver = () => {
    setGameStarted(false);
    clearSignMatchTimer();
    setSignMatchTimerActive(false);
    Alert.alert(
      'Game Over!',
      `Final Score: ${score}\nLevel Reached: ${level}`,
      [
        {
          text: 'Back to Games',
          onPress: () => {
            setCurrentScreen('dashboard');
            resetAllGames();
          }
        }
      ]
    );
  };

  const resetGame = (stage = currentSignMatchStage, resetLives = true) => {
    const normalizedStage = Math.min(Math.max(stage, 1), signMatchStages.length);
    clearSignMatchTimer();
    setFlippedCards([]);
    setMatchedPairs([]);
    if (resetLives) {
      setLives(10);
    }
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setCurrentSignMatchStage(normalizedStage);
    setSignMatchDifficulty(signMatchStages[normalizedStage - 1].difficulty);
    setSignMatchTimeRemaining(180);
    setSignMatchTimerActive(true);

    const stageCards = generateSignMatchCards(normalizedStage);
    setSignMatchCards(stageCards);
    const shuffledInitial = shuffleCards(stageCards);
    setShuffledCards(shuffledInitial);
    shuffledInitial.forEach(card => {
      flipAnimations.current[card.id] = new Animated.Value(0);
    });
  };

  const resetAllGames = () => {
    setFlippedCards([]);
    setMatchedPairs([]);
    setLives(10);
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setCurrentWordIndex(0);
    setUserConversation([]);
    setCurrentConversationIndex(0);
    setSpeedGameStarted(false);
    setTimeRemaining(15);
    setSpeedAnswer('');
    setCurrentSpeedIndex(0);
    setSignMatchTimeRemaining(180);
    setSignMatchTimerActive(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    if (signMatchTimerInterval.current) clearInterval(signMatchTimerInterval.current);
  };

  const handleAnswerSelect = (answer) => {
    if (selectedAnswer) return;

    const correct = answer === guessWordData[currentWordIndex].correctAnswer;
    setSelectedAnswer(answer);

    if (correct) {
      earnPoints(50);
      setUserStreak(prev => prev + 1);
      setShowConfetti(true);
      
      setTimeout(() => {
        if (currentWordIndex < guessWordData.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowConfetti(false);
        } else {
          handleGameOver();
        }
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      setUserStreak(0);
      
      if (lives - 1 <= 0) {
        setTimeout(() => handleGameOver(), 1000);
      }
    }
  };


  const handleConversationPress = (letter) => {
    const conversation = conversationBuilderData[currentConversationIndex];
    const expectedLetter = conversation.sequence[userConversation.length];
    
    if (letter === expectedLetter) {
      setUserConversation([...userConversation, letter]);
      earnPoints(50);
      
      if (userConversation.length + 1 === conversation.sequence.length) {
        setShowConfetti(true);
        earnPoints(200);
        setTimeout(() => {
          handleGameOver();
        }, 1500);
      }
    } else {
      setLives(prev => prev - 1);
      if (lives - 1 <= 0) {
        setTimeout(() => handleGameOver(), 1000);
      }
    }
  };

  const handleSpeedGameStart = () => {
    setCurrentSpeedIndex(0);
    setTimeRemaining(15);
    setSpeedAnswer('');
    setSpeedGameStarted(true);
  };

  const handleSpeedAnswer = (letter) => {
    if (!speedGameStarted || speedAnswer) {
      return;
    }

    setSpeedAnswer(letter);
    const correct = letter === speedSignGameData[currentSpeedIndex].letter;
    const nextIndex = currentSpeedIndex + 1;
    const nextLives = correct ? lives : lives - 1;

    if (correct) {
      earnPoints(100 + (timeRemaining * 2));
      setUserStreak(prev => prev + 1);
    } else {
      setLives(prev => prev - 1);
      setUserStreak(0);
    }

    setTimeout(() => {
      if (!correct && nextLives <= 0) {
        clearInterval(timerInterval.current);
        setSpeedGameStarted(false);
        handleGameOver();
        return;
      }

      if (nextIndex < speedSignGameData.length) {
        setCurrentSpeedIndex(nextIndex);
        setSpeedAnswer('');
      } else {
        clearInterval(timerInterval.current);
        setSpeedGameStarted(false);
        Alert.alert(
          'Challenge Complete!',
          `You completed all ${speedSignGameData.length} signs. Great work!`,
          [
            {
              text: 'Back to Games',
              onPress: () => {
                setCurrentScreen('dashboard');
                setCurrentSpeedIndex(0);
                setSpeedAnswer('');
              }
            }
          ]
        );
      }
    }, 800);
  };

  const handleSpeedGameEnd = () => {
    setSpeedGameStarted(false);
    Alert.alert('Time\'s Up!', `You completed ${currentSpeedIndex} out of ${speedSignGameData.length} signs!`, [
      {
        text: 'Back to Games',
        onPress: () => {
          setCurrentScreen('dashboard');
          setCurrentSpeedIndex(0);
          setSpeedAnswer('');
        }
      }
    ]);
  };

  // Add this function for exit functionality
  const handleExit = () => {
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
          onPress: () => BackHandler.exitApp(),
        },
      ]
    );
  };

  const renderDashboard = () => (
    <ScrollView 
      style={styles.dashboardContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialIcons name="stars" size={24} color="#FFD166" />
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="emoji-events" size={24} color="#4ECDC4" />
          <Text style={styles.statValue}>Lvl {level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialIcons name="whatshot" size={24} color="#FF6B6B" />
          <Text style={styles.statValue}>{userStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Game Grid */}
      <Text style={styles.sectionTitle}>Choose Your Game</Text>
      <View style={styles.gameGrid}>
        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => {
            resetGame(1, true);
            setCurrentScreen('signMatch');
          }}
          activeOpacity={0.9}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#FF6B6B' }]}>
            <MaterialIcons name="compare-arrows" size={32} color="#FFF" />
          </View>
          <Text style={styles.gameTitle}>Sign Match</Text>
          <Text style={styles.gameDescription}>Match pairs of signs</Text>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>Memory</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => {
            resetAllGames();
            setCurrentScreen('guessWord');
          }}
          activeOpacity={0.9}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#4ECDC4' }]}>
            <MaterialIcons name="help-outline" size={32} color="#FFF" />
          </View>
          <Text style={styles.gameTitle}>Guess the Word</Text>
          <Text style={styles.gameDescription}>Identify the sign</Text>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>Quiz</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameCard}
          onPress={() => {
            resetAllGames();
            setCurrentScreen('conversationBuilder');
          }}
          activeOpacity={0.9}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#FFD166' }]}>
            <MaterialIcons name="chat" size={32} color="#FFF" />
          </View>
          <Text style={styles.gameTitle}>Conversation Builder</Text>
          <Text style={styles.gameDescription}>Build sentences</Text>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>Interactive</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.gameCard}
          onPress={() => {
            resetAllGames();
            setCurrentScreen('speedSign');
          }}
          activeOpacity={0.9}
        >
          <View style={[styles.gameIconContainer, { backgroundColor: '#9B5DE5' }]}>
            <MaterialIcons name="flash-on" size={32} color="#FFF" />
          </View>
          <Text style={styles.gameTitle}>Speed Sign</Text>
          <Text style={styles.gameDescription}>Quick recognition</Text>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeText}>Timed</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Leaderboard Preview */}
      <View style={styles.leaderboardPreview}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              })}
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Complete more games to level up!
        </Text>
      </View>

      {/* Bottom Padding for Scroll */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  const renderSignMatch = () => (
    <View style={styles.gameContainer}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setCurrentScreen('dashboard');
            resetGame(1, true);
          }}
        >
          <Feather name="chevron-left" size={24} color="#333" />
          <Text style={styles.backButtonText}>Games</Text>
        </TouchableOpacity>
        
        <View style={styles.gameStats}>
          <View style={styles.statBadge}>
            <MaterialIcons name="star" size={16} color="#FFD166" />
            <Text style={styles.statBadgeText}>{score}</Text>
          </View>
          <View style={styles.statBadge}>
            <MaterialIcons name="whatshot" size={16} color="#FF6B6B" />
            <Text style={styles.statBadgeText}>{userStreak}</Text>
          </View>
          <View style={styles.statBadge}>
            <MaterialIcons name="timer" size={16} color="#333" />
            <Text style={styles.statBadgeText}>{formatTimer(signMatchTimeRemaining)}</Text>
          </View>
        </View>
      </View>

      {/* Game Info */}
      <View style={styles.gameInfoContainer}>
        <View>
          <Text style={styles.difficultyBadge}>{signMatchDifficulty}</Text>
          <Text style={styles.levelText}>Stage {currentSignMatchStage} of {signMatchStages.length}</Text>
        </View>
        <View style={styles.livesContainer}>
          {[...Array(3)].map((_, i) => (
            <MaterialIcons 
              key={i}
              name="favorite" 
              size={24} 
              color={i < lives ? "#FF6B6B" : "#E0D6C8"} 
            />
          ))}
        </View>
      </View>

      <Text style={styles.stageSubtitle}>
        Match {signMatchCards.length / 2} portrait signs to move up to the next difficulty.
      </Text>

      {/* Game Grid */}
      <View style={styles.cardGrid}>
        {(shuffledCards.length > 0 ? shuffledCards : signMatchCards).map((card) => {
          const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);

          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.flipCard,
                isFlipped ? styles.flipCardFront : styles.flipCardBack,
              ]}
              onPress={() => handleCardFlip(card.id)}
              activeOpacity={0.9}
              disabled={isFlipped}
            >
              {!isFlipped ? (
                <Text style={styles.cardBackText}>?</Text>
              ) : (
                <>
                  <Image
                    source={signImageMap[card.letter]}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardLetter}>{card.letter}</Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Instructions */}
      <Text style={styles.instructionsText}>
        Match pairs of identical signs. Try to remember their positions!
      </Text>

      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
          fadeOut={true}
        />
      )}
    </View>
  );

  const renderGuessWord = () => {
    const currentWord = guessWordData[currentWordIndex];
    
    return (
      <View style={styles.gameContainer}>
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setCurrentScreen('dashboard');
              resetAllGames();
            }}
          >
            <Feather name="chevron-left" size={24} color="#333" />
            <Text style={styles.backButtonText}>Games</Text>
          </TouchableOpacity>
          
          <View style={styles.gameStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeText}>Q {currentWordIndex + 1}/{guessWordData.length}</Text>
            </View>
          </View>
        </View>

        {/* Level & Lives */}
        <View style={styles.gameInfoContainer}>
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyBadge}>{signMatchDifficulty}</Text>
            <Text style={styles.levelText}>Stage {currentSignMatchStage} / {signMatchStages.length}</Text>
          </View>
          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, i) => (
              <MaterialIcons 
                key={i}
                name="favorite" 
                size={24} 
                color={i < lives ? "#FF6B6B" : "#E0D6C8"} 
              />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.gameContentContainer}>
          {/* Sign Display */}
          <View style={styles.signDisplayContainer}>
            <View style={styles.signDisplay}>
              <Image 
                source={signImageMap[currentWord.letter]}
                style={styles.largeSignImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.signHint}>Hint: {currentWord.hint}</Text>
          </View>

          {/* Question */}
          <Text style={styles.questionText}>What does this sign mean?</Text>

          {/* Answer Options */}
          <View style={styles.answerContainer}>
            {currentWord.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentWord.correctAnswer;
              const showResult = selectedAnswer !== null;
              
              let buttonStyle = styles.answerButton;
              let textStyle = styles.answerText;
              
              if (showResult) {
                if (isSelected && isCorrect) {
                  buttonStyle = styles.answerButtonCorrect;
                  textStyle = styles.answerTextCorrect;
                } else if (isSelected && !isCorrect) {
                  buttonStyle = styles.answerButtonWrong;
                  textStyle = styles.answerTextWrong;
                } else if (isCorrect) {
                  buttonStyle = styles.answerButtonCorrect;
                  textStyle = styles.answerTextCorrect;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[buttonStyle, isSelected && styles.answerButtonSelected]}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null}
                  activeOpacity={0.8}
                >
                  <Text style={textStyle}>{option}</Text>
                  {showResult && isCorrect && (
                    <MaterialIcons name="check-circle" size={20} color="#4ECDC4" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <MaterialIcons name="cancel" size={20} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {showConfetti && (
          <ConfettiCannon
            count={100}
            origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
            fadeOut={true}
          />
        )}
      </View>
    );
  };

  const renderConversationBuilder = () => {
    const currentConversation = conversationBuilderData[currentConversationIndex];
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    return (
      <View style={styles.gameContainer}>
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setCurrentScreen('dashboard');
              resetAllGames();
            }}
          >
            <Feather name="chevron-left" size={24} color="#333" />
            <Text style={styles.backButtonText}>Games</Text>
          </TouchableOpacity>
          
          <View style={styles.gameStats}>
            <View style={styles.statBadge}>
              <MaterialIcons name="stars" size={16} color="#FFD166" />
              <Text style={styles.statBadgeText}>{score}</Text>
            </View>
          </View>
        </View>

        {/* Level & Lives */}
        <View style={styles.gameInfoContainer}>
          <View>
            <Text style={styles.conversationTitle}>{currentConversation.title}</Text>
            <Text style={styles.conversationSubtitle}>Complete the conversation</Text>
          </View>
          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, i) => (
              <MaterialIcons 
                key={i}
                name="favorite" 
                size={20} 
                color={i < lives ? "#FF6B6B" : "#E0D6C8"} 
              />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.conversationContent}>
          {/* Conversation Display */}
          <View style={styles.conversationDisplay}>
            {/* Bot Message */}
            <View style={styles.messageGroup}>
              <View style={[styles.avatar, { backgroundColor: currentConversation.avatarColor }]}>
                <Text style={styles.avatarText}>FSL</Text>
              </View>
              <View style={[styles.messageBubble, styles.botMessage]}>
                <View style={styles.signSequenceContainer}>
                  {currentConversation.sequence.slice(0, currentConversation.sequence.length).map((letter, idx) => (
                    <View key={idx} style={styles.messageSignItem}>
                      <Image 
                        source={signImageMap[letter]}
                        style={styles.messageSignImage}
                        resizeMode="contain"
                      />
                      {idx < currentConversation.sequence.length - 1 && (
                        <Text style={styles.messageSeparator}>→</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* User Response */}
            {userConversation.length > 0 && (
              <View style={[styles.messageGroup, styles.userMessageGroup]}>
                <View style={[styles.messageBubble, styles.userMessage]}>
                  <View style={styles.signSequenceContainer}>
                    {userConversation.map((letter, idx) => (
                      <View key={idx} style={styles.messageSignItem}>
                        <Image 
                          source={signImageMap[letter]}
                          style={styles.messageSignImage}
                          resizeMode="contain"
                        />
                        {idx < userConversation.length - 1 && (
                          <Text style={styles.messageSeparator}>→</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
                <View style={[styles.avatar, { backgroundColor: '#4ECDC4' }]}>
                  <Text style={styles.avatarText}>You</Text>
                </View>
              </View>
            )}
          </View>

          {/* Expected Next Item */}
          <View style={styles.expectedItemContainer}>
            <Text style={styles.expectedLabel}>Next Letter:</Text>
            <Text style={styles.expectedLetter}>
              {currentConversation.sequence[userConversation.length]}
            </Text>
          </View>

          {/* Alphabet Keyboard */}
          <Text style={styles.keyboardLabel}>Tap the correct letter</Text>
          <View style={styles.alphabetKeyboard}>
            {alphabet.map((letter, idx) => {
              const isExpected = letter === currentConversation.sequence[userConversation.length];
              const isSelected = userConversation.includes(letter);
              
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.letterButton,
                    isExpected && styles.letterButtonExpected,
                    isSelected && styles.letterButtonSelected
                  ]}
                  onPress={() => handleConversationPress(letter)}
                  disabled={userConversation.length === currentConversation.sequence.length}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.letterButtonText,
                    isExpected && styles.letterButtonTextExpected,
                    isSelected && styles.letterButtonTextSelected
                  ]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: SCREEN_WIDTH / 2, y: 0 }}
            fadeOut={true}
          />
        )}
      </View>
    );
  };

  const renderSpeedSign = () => {
    const currentSign = speedSignGameData[currentSpeedIndex];
    const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    return (
      <View style={styles.gameContainer}>
        {/* Game Header */}
        <View style={styles.gameHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setCurrentScreen('dashboard');
              resetAllGames();
              if (timerInterval.current) clearInterval(timerInterval.current);
            }}
          >
            <Feather name="chevron-left" size={24} color="#333" />
            <Text style={styles.backButtonText}>Games</Text>
          </TouchableOpacity>
          
          <View style={styles.gameStats}>
            <View style={[styles.statBadge, { backgroundColor: '#FFD166' }]}>
              <MaterialIcons name="schedule" size={16} color="#333" />
              <Text style={[styles.statBadgeText, { color: '#333' }]}>{timeRemaining}s</Text>
            </View>
          </View>
        </View>

        {/* Level & Lives */}
        <View style={styles.gameInfoContainer}>
          <View>
            <Text style={styles.levelText}>Level {level}</Text>
            <Text style={styles.subtitleText}>Sign {currentSpeedIndex + 1}/{speedSignGameData.length}</Text>
          </View>
          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, i) => (
              <MaterialIcons 
                key={i}
                name="favorite" 
                size={20} 
                color={i < lives ? "#FF6B6B" : "#E0D6C8"} 
              />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.speedContent}>
          {!speedGameStarted ? (
            <>
              <Text style={styles.speedTitle}>Speed Sign Challenge</Text>
              <Text style={styles.speedDescription}>
                You have 15 seconds to correctly identify as many signs as possible!
              </Text>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={handleSpeedGameStart}
                activeOpacity={0.8}
              >
                <MaterialIcons name="play-arrow" size={28} color="#FFF" />
                <Text style={styles.startButtonText}>Start Challenge</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Sign Display */}
              <View style={styles.speedSignDisplay}>
                <Image 
                  source={signImageMap[currentSign.letter]}
                  style={styles.speedSignImage}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.speedQuestionText}>What letter is this?</Text>
              <Text style={styles.hintText}>Hint: {currentSign.hint}</Text>

              {/* Alphabet Grid */}
              <View style={styles.speedAlphabetGrid}>
                {alphabet.map((letter, idx) => {
                  const isCorrect = letter === currentSign.letter;
                  const isSelected = speedAnswer === letter;
                  
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.speedLetterButton,
                        isSelected && isCorrect && styles.speedLetterButtonCorrect,
                        isSelected && !isCorrect && styles.speedLetterButtonWrong
                      ]}
                      onPress={() => handleSpeedAnswer(letter)}
                      disabled={speedAnswer !== ''}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.speedLetterButtonText,
                        isSelected && isCorrect && styles.speedLetterButtonTextCorrect,
                        isSelected && !isCorrect && styles.speedLetterButtonTextWrong
                      ]}>
                        {letter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Score Info */}
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreText}>Score: {score}</Text>
                <Text style={styles.completedText}>Completed: {currentSpeedIndex}/{speedSignGameData.length}</Text>
              </View>
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D7C6" />
      
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Sticky Header */}
          <View style={styles.stickyHeader}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <TouchableOpacity 
                  onPress={handleExit} 
                  style={styles.exitButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.headerTitle}>Let’s Play Games</Text>
                  {currentScreen === 'dashboard' && (
                    <Text style={styles.headerSubtitle}>Learn FSL through fun challenges</Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Content */}
          {currentScreen === 'dashboard' && renderDashboard()}
          {currentScreen === 'signMatch' && renderSignMatch()}
          {currentScreen === 'guessWord' && renderGuessWord()}
          {currentScreen === 'conversationBuilder' && renderConversationBuilder()}
          {currentScreen === 'speedSign' && renderSpeedSign()}
        </ScrollView>

        <BottomBelt active="game" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 25, // Increased padding at top
  },
  
  // Sticky Header
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 16,
    backgroundColor: '#E8D7C6',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4B0',
  },
  headerContent: {
    gap: 8,
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
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Dashboard Scroll Content
  dashboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8E2D5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#D4C4B0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gameCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  gameIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  gameDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  gameBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
  },
  leaderboardPreview: {
    backgroundColor: '#E8E2D5',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#D4C4B0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 100,
  },
  
  // Game Container (for Sign Match and Guess Word)
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  gameStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gameInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyBadge: {
    backgroundColor: '#D4C4B0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  stageSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    lineHeight: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  flipCard: {
    width: '22%',
    aspectRatio: 0.75,
    marginBottom: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  flipCardBack: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D4C4B0',
  },
  flipCardFront: {
    backgroundColor: '#F5EAEA',
    borderWidth: 2,
    borderColor: '#C4B5A0',
    padding: 8,
  },
  cardBackText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#999',
  },
  cardLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  cardImage: {
    width: 72,
    height: 110,
    marginBottom: 10,
  },
  cardLetter: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 6,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  signDisplayContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  signDisplay: {
    width: 150,
    height: 150,
    backgroundColor: '#FFF',
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#D4C4B0',
  },
  signEmoji: {
    fontSize: 64,
  },
  largeSignImage: {
    width: 120,
    height: 120,
  },
  signHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  answerContainer: {
    gap: 12,
    marginBottom: 24,
  },
  answerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: '#D4C4B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  answerButtonSelected: {
    borderColor: '#4ECDC4',
  },
  answerButtonCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4ECDC4',
  },
  answerButtonWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF6B6B',
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  answerTextCorrect: {
    color: '#2E7D32',
  },
  answerTextWrong: {
    color: '#C62828',
  },
  livesContainerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  livesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // Conversation Builder Styles
  conversationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  conversationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  conversationContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationDisplay: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 200,
  },
  messageGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  userMessageGroup: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  messageBubble: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
  },
  botMessage: {
    backgroundColor: '#E8E2D5',
  },
  userMessage: {
    backgroundColor: '#4ECDC4',
  },
  messageSequence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  signSequenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  messageSignItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSignImage: {
    width: 40,
    height: 40,
  },
  messageSeparator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 4,
  },
  expectedItemContainer: {
    backgroundColor: '#FFF9E6',
    borderLeftColor: '#FFD166',
    borderLeftWidth: 4,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  expectedLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  expectedLetter: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFD166',
  },
  keyboardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  alphabetKeyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  letterButton: {
    width: '20%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4C4B0',
    marginBottom: 6,
  },
  letterButtonExpected: {
    borderColor: '#FFD166',
    borderWidth: 3,
    backgroundColor: '#FFFAF0',
  },
  letterButtonSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  letterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  letterButtonTextExpected: {
    color: '#FFD166',
  },
  letterButtonTextSelected: {
    color: '#FFF',
  },

  // Speed Sign Styles
  speedContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  speedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  speedDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  startButton: {
    backgroundColor: '#9B5DE5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  speedSignDisplay: {
    width: 160,
    height: 160,
    backgroundColor: '#FFF',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#9B5DE5',
  },
  speedSignEmoji: {
    fontSize: 80,
  },
  speedSignImage: {
    width: 100,
    height: 100,
  },
  speedQuestionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  speedAlphabetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  speedLetterButton: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D4C4B0',
    marginBottom: 6,
  },
  speedLetterButtonCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4ECDC4',
  },
  speedLetterButtonWrong: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF6B6B',
  },
  speedLetterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  speedLetterButtonTextCorrect: {
    color: '#2E7D32',
  },
  speedLetterButtonTextWrong: {
    color: '#C62828',
  },
  scoreInfo: {
    backgroundColor: '#E8E2D5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    fontSize: 13,
    color: '#666',
  },
  subtitleText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  gameContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});