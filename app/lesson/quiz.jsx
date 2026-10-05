import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import BottomBelt from '../components/BottomBelt';
import { finishLesson } from '../lib/studentProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Module1Quiz() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const module = params.module ? String(params.module) : '1';
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  const quizData = [
    {
      id: 0,
      question: 'What does FSL stand for?',
      type: 'text',
      instruction: 'Type your answer below',
      acceptedAnswers: ['filipino sign language', 'fsl'],
    },
    {
      id: 1,
      question:
        'Which handshape represents the letter F in Filipino Sign Language?',
      type: 'multiple-choice',
      options: [
        'Thumb and index finger touch, other fingers extended',
        'Palm open with fingers spread apart',
        'Fist with thumb tucked in',
      ],
      correctAnswer: 'Thumb and index finger touch, other fingers extended',
    },
    {
      id: 2,
      question: 'When asking a question in FSL, your facial expression should be:',
      type: 'multiple-choice',
      options: ['Engaged and expectant', 'Neutral', 'Relaxed'],
      correctAnswer: 'Engaged and expectant',
    },
    {
      id: 3,
      question: 'Which phrase is best described by a warm greeting with both hands open?',
      type: 'multiple-choice',
      options: ['Hello', 'Sorry', 'Thank you'],
      correctAnswer: 'Hello',
    },
    {
      id: 4,
      question: 'How does SignLearn help you improve your signing?',
      type: 'text',
      instruction: 'Type your answer here',
      acceptedAnswers: ['practice', 'feedback', 'confidence', 'fluency'],
    },
    {
      id: 5,
      question: 'Which sign communicates the word "hello" in FSL?',
      type: 'multiple-choice',
      options: [
        'Hand waves outward from the cheek',
        'Hands clap together once',
        'Fingers point down toward the chest',
      ],
      correctAnswer: 'Hand waves outward from the cheek',
    },
    {
      id: 6,
      question: 'What should you do when you want to show respect while signing?',
      type: 'multiple-choice-grid',
      options: ['Maintain eye contact', 'Look away', 'Lower your hand', 'Cover your mouth'],
      correctAnswer: 'Maintain eye contact',
      gridLayout: true,
    },
  ];

  const current = quizData[currentStep];
  const progress = `${currentStep + 1}/${quizData.length}`;
  const progressPercentage = ((currentStep + 1) / quizData.length) * 100;
  const answered = Object.prototype.hasOwnProperty.call(answers, current.id);
  const score = Object.values(answers).filter(Boolean).length;
  const isContinueDisabled = !answered;

  const handleContinue = () => {
    if (currentStep < quizData.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSelectedOption(null);
      setTextAnswer('');
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const handleExit = () => {
    router.push('/learn');
  };

  const handleRetry = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setTextAnswer('');
    setAnswers({});
    setShowResult(false);
    setIsCorrect(false);
    setQuizComplete(false);
  };

  const handleFinish = async () => {
    const lessonId = module === '2' ? '8' : module === '3' ? '12' : '4';
    await finishLesson(lessonId, router, {
      isQuiz: true,
      title: `Completed Module ${module} Quiz`,
      detail: `You scored ${score} / ${quizData.length} on the quiz.`,
    });
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowResult(true);
    const correct = option === current.correctAnswer;
    setIsCorrect(correct);
    setAnswers((prev) => ({
      ...prev,
      [current.id]: correct,
    }));
  };

  const handleTextSubmit = () => {
    if (textAnswer.trim()) {
      setShowResult(true);
      const acceptedAnswers = current.acceptedAnswers || [];
      const normalized = textAnswer.trim().toLowerCase();
      const isAnswerCorrect = acceptedAnswers.some((answer) =>
        normalized.includes(answer.toLowerCase())
      );
      setIsCorrect(isAnswerCorrect);
      setAnswers((prev) => ({
        ...prev,
        [current.id]: isAnswerCorrect,
      }));
    }
  };

  const renderQuestion = () => {
    switch (current.type) {
      case 'text':
        return (
          <View style={styles.textQuestionContainer}>
            <Text style={styles.questionText}>{current.question}</Text>
            {current.instruction && (
              <Text style={styles.instructionText}>{current.instruction}</Text>
            )}
            <TextInput
              style={styles.textInput}
              placeholder="Type your answer here"
              placeholderTextColor="#999"
              value={textAnswer}
              onChangeText={setTextAnswer}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {textAnswer.length > 0 && !showResult && (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleTextSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            )}
            {showResult && (
              <View
                style={[
                  styles.resultContainer,
                  isCorrect ? styles.correctResult : styles.incorrectResult,
                ]}
              >
                <MaterialIcons
                  name={isCorrect ? 'check-circle' : 'cancel'}
                  size={24}
                  color={isCorrect ? '#4ECDC4' : '#FF6B6B'}
                />
                <Text style={styles.resultText}>
                  {isCorrect ? 'Correct answer!' : 'Not quite — try the next question.'}
                </Text>
              </View>
            )}
          </View>
        );

      case 'multiple-choice':
        return (
          <View style={styles.multipleChoiceContainer}>
            <Text style={styles.questionText}>{current.question}</Text>
            <View style={styles.optionsContainer}>
              {current.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === option && styles.selectedOption,
                    showResult && option === current.correctAnswer && styles.correctOption,
                    showResult && selectedOption === option && !isCorrect && styles.incorrectOption,
                  ]}
                  onPress={() => handleOptionSelect(option)}
                  disabled={showResult}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === option && styles.selectedOptionText,
                      showResult && option === current.correctAnswer && styles.correctOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {showResult && option === current.correctAnswer && (
                    <MaterialIcons name="check-circle" size={20} color="#4ECDC4" />
                  )}
                  {showResult && selectedOption === option && !isCorrect && (
                    <MaterialIcons name="cancel" size={20} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'multiple-choice-grid':
        return (
          <View style={styles.multipleChoiceContainer}>
            <Text style={styles.questionText}>{current.question}</Text>
            <View style={styles.gridContainer}>
              {current.options.reduce((rows, option, index) => {
                const rowIndex = Math.floor(index / 2);
                if (!rows[rowIndex]) rows[rowIndex] = [];
                rows[rowIndex].push(option);
                return rows;
              }, []).map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.gridOption,
                        selectedOption === option && styles.selectedOption,
                        showResult && option === current.correctAnswer && styles.correctOption,
                        showResult && selectedOption === option && !isCorrect && styles.incorrectOption,
                      ]}
                      onPress={() => handleOptionSelect(option)}
                      disabled={showResult}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.gridOptionText,
                          selectedOption === option && styles.selectedOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (quizComplete) {
    const scorePercent = Math.round((score / quizData.length) * 100);
    const resultMessage =
      scorePercent >= 80
        ? 'Excellent work! Your FSL foundation is strong.'
        : scorePercent >= 50
        ? 'Nice effort! Keep practicing to build more confidence.'
        : 'Good start. Try again to improve your sign recognition and flow.';

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#D4C4B0" />
        <View style={styles.mainContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={handleFinish}
                style={styles.exitButton}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Quiz Complete</Text>
                <Text style={styles.headerSubtitle}>Review your score and continue learning.</Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.resultCard}>
              <Text style={styles.resultHeadline}>You finished the sign quiz</Text>
              <Text style={styles.scoreText}>{score} / {quizData.length} correct</Text>
              <Text style={styles.scorePercent}>{scorePercent}%</Text>
              <Text style={styles.resultMessage}>{resultMessage}</Text>

              <TouchableOpacity style={styles.primaryAction} onPress={handleFinish} activeOpacity={0.8}>
                <Text style={styles.primaryActionText}>Back to Learn</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryAction} onPress={handleRetry} activeOpacity={0.8}>
                <Text style={styles.secondaryActionText}>Retry Quiz</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4C4B0" />

      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={handleExit}
              style={styles.exitButton}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>SignLearn Quiz</Text>
              <Text style={styles.headerSubtitle}>
                Complete this quiz to reinforce your FSL fundamentals and progress with confidence.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Quiz Progress</Text>
              <Text style={styles.progressText}>{progress}</Text>
            </View>

            <Text style={styles.progressIntro}>
              Answer each question to strengthen your FSL fluency, improve gesture recall, and track your growth.
            </Text>

            <View style={styles.progressBar}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <View style={styles.questionNumber}>
                <Text style={styles.questionNumberText}>Q{current.id + 1}</Text>
              </View>
              <View style={styles.questionTitleContainer}>
                <Text style={styles.questionTitle}>Module {module} Quiz</Text>
                <Text style={styles.questionSubtitle}>
                  Question {current.id + 1} of {quizData.length}
                </Text>
              </View>
            </View>

            <View style={styles.contentArea}>{renderQuestion()}</View>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton, currentStep === 0 && styles.disabledButton]}
                onPress={handlePrevious}
                disabled={currentStep === 0}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={currentStep === 0 ? '#999' : '#333'}
                />
                <Text
                  style={[
                    styles.navButtonText,
                    styles.prevButtonText,
                    currentStep === 0 && styles.disabledButtonText,
                  ]}
                >
                  Previous
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  styles.continueButton,
                  isContinueDisabled && styles.disabledButton,
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
                disabled={isContinueDisabled}
              >
                <Text style={[styles.navButtonText, styles.continueButtonText]}>
                  {currentStep === quizData.length - 1 ? 'Complete Quiz' : 'Continue'}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
        <BottomBelt active="learn" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#D4C4B0',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#E8D7C6',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
    backgroundColor: '#E8D7C6',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4B0',
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
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    maxWidth: SCREEN_WIDTH - 140,
    lineHeight: 18,
  },
  menuButton: {
    padding: 8,
  },
  
  // Progress Section
  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  progressBar: {
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E8E2D5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  progressIntro: {
    fontSize: 13,
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },

  resultCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  resultHeadline: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scorePercent: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4ECDC4',
    marginVertical: 16,
  },
  resultMessage: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryAction: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    borderColor: '#4ECDC4',
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  
  // Quiz Card
  quizCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Quiz Header
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    marginTop: 10,
  },
  questionNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD166',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 15,
  },
  questionNumberText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
  },
  questionTitleContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 18,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // Content Area
  contentArea: {
    marginBottom: 30,
    minHeight: 200,
  },
  
  // Question Styles
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    lineHeight: 26,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  
  // Text Input Styles
  textQuestionContainer: {
    width: '100%',
  },
  textInput: {
    backgroundColor: '#F8F4F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // Multiple Choice Styles
  multipleChoiceContainer: {
    width: '100%',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F8F4F0',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedOption: {
    backgroundColor: '#E8F3F1',
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  correctOption: {
    backgroundColor: '#E8F8F0',
    borderColor: '#4ECDC4',
  },
  incorrectOption: {
    backgroundColor: '#FFE8E8',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#4ECDC4',
  },
  correctOptionText: {
    color: '#4ECDC4',
  },
  
  // Grid Styles
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridOption: {
    flex: 1,
    backgroundColor: '#F8F4F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  gridOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  
  // Result Styles
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  correctResult: {
    backgroundColor: '#E8F8F0',
  },
  incorrectResult: {
    backgroundColor: '#FFE8E8',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  
  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#E8E2D5',
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
  },
  prevButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  prevButtonText: {
    color: '#333',
  },
  continueButtonText: {
    color: '#333',
  },
  disabledButtonText: {
    color: '#999',
  },
  
  // Bottom Padding
  bottomPadding: {
    height: 40,
  },
});