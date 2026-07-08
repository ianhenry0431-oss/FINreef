import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { QUIZ_QUESTIONS, QuizQuestion } from '@/data/quizData';

type GameState = 'home' | 'playing' | 'answered' | 'finished';

const CATEGORY_COLORS: Record<string, string> = {
  budgeting: '#06B6D4',
  investing: '#10B981',
  credit: '#F97316',
  saving: '#F59E0B',
  basics: '#A78BFA',
};

const CATEGORY_LABELS: Record<string, string> = {
  budgeting: 'Budgeting',
  investing: 'Investing',
  credit: 'Credit',
  saving: 'Saving',
  basics: 'Basics',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, recordQuizScore, addXP } = useApp();
  const [gameState, setGameState] = useState<GameState>('home');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const startQuiz = useCallback(() => {
    const q = shuffle(QUIZ_QUESTIONS).slice(0, 10);
    setQuestions(q);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setGameState('playing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    if (gameState !== 'playing') return;
    setSelectedAnswer(idx);
    setGameState('answered');
    const q = questions[currentIdx];
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [gameState, questions, currentIdx]);

  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      recordQuizScore(score + (selectedAnswer === questions[currentIdx].correctIndex ? 0 : 0), questions.length);
      // XP already tracked, just finish
      setGameState('finished');
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setGameState('playing');
    }
  }, [currentIdx, questions, score, selectedAnswer, recordQuizScore]);

  if (gameState === 'home') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.ocean1, colors.background]}
          style={[styles.header, { paddingTop: topInset + 16 }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Challenge</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Test your financial knowledge</Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="award" size={20} color={colors.sand} />
              <Text style={[styles.statVal, { color: colors.text }]}>{profile.bestQuizScore}%</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Best Score</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="zap" size={20} color={colors.coral} />
              <Text style={[styles.statVal, { color: colors.text }]}>{profile.totalQuizzes}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Quizzes</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="star" size={20} color={colors.teal} />
              <Text style={[styles.statVal, { color: colors.text }]}>{profile.xp}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total XP</Text>
            </View>
          </View>

          {/* Main Quiz Card */}
          <LinearGradient
            colors={[colors.teal + '33', colors.ocean2]}
            style={[styles.quizCard, { borderColor: colors.teal + '55' }]}
          >
            <View style={styles.quizCardIcon}>
              <Feather name="anchor" size={36} color={colors.teal} />
            </View>
            <Text style={[styles.quizCardTitle, { color: colors.text }]}>Deep Dive Quiz</Text>
            <Text style={[styles.quizCardSub, { color: colors.mutedForeground }]}>
              10 questions across budgeting, investing, credit, and saving. Each correct answer earns 10 XP.
            </Text>
            <Pressable
              style={[styles.startBtn, { backgroundColor: colors.teal }]}
              onPress={startQuiz}
            >
              <Text style={styles.startBtnText}>Start Quiz</Text>
              <Feather name="chevron-right" size={18} color="#fff" />
            </Pressable>
          </LinearGradient>

          {/* Categories */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Topics Covered</Text>
          <View style={styles.categoryGrid}>
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <View
                key={cat}
                style={[styles.catBadge, { backgroundColor: color + '22', borderColor: color + '44' }]}
              >
                <View style={[styles.catDot, { backgroundColor: color }]} />
                <Text style={[styles.catLabel, { color }]}>{CATEGORY_LABELS[cat]}</Text>
              </View>
            ))}
          </View>

          {/* Tips */}
          <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>How to Score Well</Text>
            {[
              'Read each question carefully before answering',
              'Eliminate obviously wrong answers first',
              'Review the explanation after each answer',
              'Play daily to build your streak',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipNum, { backgroundColor: colors.teal + '22' }]}>
                  <Text style={[styles.tipNumText, { color: colors.teal }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (gameState === 'finished') {
    const pct = Math.round((score / questions.length) * 100);
    const xpEarned = score * 10;
    const grade = pct >= 80 ? '🐠' : pct >= 60 ? '🐡' : '🦀';
    const gradeLabel = pct >= 80 ? 'Expert Diver!' : pct >= 60 ? 'Reef Explorer!' : 'Coral Seedling';

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[colors.ocean1, colors.background]} style={[styles.finHeader, { paddingTop: topInset + 16 }]}>
          <Text style={styles.gradeEmoji}>{grade}</Text>
          <Text style={[styles.gradeLabel, { color: colors.text }]}>{gradeLabel}</Text>
          <Text style={[styles.gradeSub, { color: colors.mutedForeground }]}>Quiz Complete</Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultRow}>
            <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultVal, { color: colors.teal }]}>{score}/{questions.length}</Text>
              <Text style={[styles.resultLbl, { color: colors.mutedForeground }]}>Correct</Text>
            </View>
            <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultVal, { color: colors.seafoam }]}>{pct}%</Text>
              <Text style={[styles.resultLbl, { color: colors.mutedForeground }]}>Score</Text>
            </View>
            <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.resultVal, { color: colors.sand }]}>+{xpEarned}</Text>
              <Text style={[styles.resultLbl, { color: colors.mutedForeground }]}>XP Earned</Text>
            </View>
          </View>

          {pct < 100 && (
            <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.tipsTitle, { color: colors.text }]}>Keep Improving</Text>
              <Text style={[styles.improveTip, { color: colors.mutedForeground }]}>
                {pct < 60
                  ? 'Check out the Learn tab to strengthen your financial knowledge before your next quiz.'
                  : pct < 80
                  ? 'Great effort! Review the questions you missed in the Learn section to hit 80%+ next time.'
                  : 'You\'re almost perfect! Review the concepts in the Learn tab to get that 100%.'}
              </Text>
            </View>
          )}

          <Pressable
            style={[styles.startBtn, { backgroundColor: colors.teal, alignSelf: 'center', paddingHorizontal: 40 }]}
            onPress={startQuiz}
          >
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={styles.startBtnText}>Play Again</Text>
          </Pressable>

          <Pressable
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={() => setGameState('home')}
          >
            <Text style={[styles.backBtnText, { color: colors.mutedForeground }]}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // Playing / Answered — guard against out-of-bounds index
  const q = questions[currentIdx];
  if (!q) {
    // Recover gracefully if state desyncs
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Pressable style={[styles.startBtn, { backgroundColor: colors.teal }]} onPress={() => setGameState('home')}>
          <Text style={styles.startBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }
  const isCorrect = selectedAnswer === q.correctIndex;
  const catColor = CATEGORY_COLORS[q.category] ?? colors.teal;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.ocean1, colors.background]} style={[styles.header, { paddingTop: topInset + 16 }]}>
        <View style={styles.quizTopRow}>
          <Pressable onPress={() => setGameState('home')}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </Pressable>
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[styles.progressFill, { width: `${((currentIdx + 1) / questions.length) * 100}%` as any, backgroundColor: colors.teal }]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
              {currentIdx + 1}/{questions.length}
            </Text>
          </View>
          <View style={styles.scoreChip}>
            <Feather name="star" size={12} color={colors.sand} />
            <Text style={[styles.scoreChipText, { color: colors.sand }]}>{score}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.catTag, { backgroundColor: catColor + '22', borderColor: catColor + '44' }]}>
          <Text style={[styles.catTagText, { color: catColor }]}>{CATEGORY_LABELS[q.category]}</Text>
        </View>

        <Text style={[styles.question, { color: colors.text }]}>{q.question}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => {
            let bg = colors.card;
            let border = colors.border;
            let textColor = colors.text;

            if (gameState === 'answered') {
              if (i === q.correctIndex) { bg = colors.seafoam + '22'; border = colors.seafoam; textColor = colors.seafoam; }
              else if (i === selectedAnswer) { bg = colors.coral + '22'; border = colors.coral; textColor = colors.coral; }
            }

            return (
              <Pressable
                key={i}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: bg, borderColor: border, opacity: pressed && gameState === 'playing' ? 0.7 : 1 },
                ]}
                onPress={() => handleAnswer(i)}
                disabled={gameState === 'answered'}
              >
                <View style={[styles.optionLetter, { backgroundColor: border + '33' }]}>
                  <Text style={[styles.optionLetterText, { color: border }]}>
                    {['A', 'B', 'C', 'D'][i]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                {gameState === 'answered' && i === q.correctIndex && (
                  <Feather name="check-circle" size={18} color={colors.seafoam} />
                )}
                {gameState === 'answered' && i === selectedAnswer && i !== q.correctIndex && (
                  <Feather name="x-circle" size={18} color={colors.coral} />
                )}
              </Pressable>
            );
          })}
        </View>

        {gameState === 'answered' && (
          <View>
            <LinearGradient
              colors={[isCorrect ? colors.seafoam + '22' : colors.coral + '22', colors.ocean1]}
              style={[styles.explanationCard, { borderColor: isCorrect ? colors.seafoam + '55' : colors.coral + '55' }]}
            >
              <View style={styles.explanationHeader}>
                <Feather
                  name={isCorrect ? 'check-circle' : 'info'}
                  size={16}
                  color={isCorrect ? colors.seafoam : colors.coral}
                />
                <Text style={[styles.explanationTitle, { color: isCorrect ? colors.seafoam : colors.coral }]}>
                  {isCorrect ? 'Correct! +10 XP' : 'Not quite'}
                </Text>
              </View>
              <Text style={[styles.explanationText, { color: colors.text }]}>{q.explanation}</Text>
            </LinearGradient>

            <Pressable
              style={[styles.nextBtn, { backgroundColor: colors.teal }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {currentIdx + 1 >= questions.length ? 'See Results' : 'Next Question'}
              </Text>
              <Feather name="chevron-right" size={18} color="#fff" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  content: { padding: 20, gap: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 6 },
  statVal: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  quizCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', gap: 12 },
  quizCardIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#06B6D422', alignItems: 'center', justifyContent: 'center' },
  quizCardTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  quizCardSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  startBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 4 },
  startBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  tipsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  tipsTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipNumText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  // Quiz playing
  quizTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressContainer: { flex: 1, gap: 4 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  scoreChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreChipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  catTag: { flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  catTagText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  question: { fontSize: 20, fontFamily: 'Inter_600SemiBold', lineHeight: 30 },
  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  optionText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  explanationCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  explanationTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  explanationText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 4 },
  nextBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  // Finished
  finHeader: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  gradeEmoji: { fontSize: 52, marginBottom: 8 },
  gradeLabel: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  gradeSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  resultRow: { flexDirection: 'row', gap: 10 },
  resultBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 4 },
  resultVal: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  resultLbl: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  improveTip: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginTop: 4 },
  backBtn: { alignSelf: 'center', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  backBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
