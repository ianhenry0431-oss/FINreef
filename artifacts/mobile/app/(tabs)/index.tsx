import React, { useEffect } from 'react';
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
import { router } from 'expo-router';

const TIPS = [
  'The best time to start investing was yesterday. The second best time is today.',
  'Automate your savings — what you don\'t see, you don\'t spend.',
  'Pay yourself first: transfer to savings before spending on anything.',
  'A $5 daily coffee = $1,825/year. Small habits compound just like interest.',
  'Check your credit score monthly — it\'s free and catching errors early matters.',
  'Increase your 401(k) contribution by just 1% today. Future you will be grateful.',
  'The 24-hour rule: wait a day before any non-essential purchase over $50.',
  'An emergency fund isn\'t an expense — it\'s your financial immune system.',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDailyTip() {
  const day = new Date().getDate();
  return TIPS[day % TIPS.length];
}

function ReefHealthScore({ score }: { score: number }) {
  const colors = useColors();
  const getColor = () => {
    if (score >= 80) return colors.seafoam;
    if (score >= 60) return colors.teal;
    if (score >= 40) return colors.sand;
    return colors.coral;
  };
  const getLabel = () => {
    if (score >= 80) return 'Thriving';
    if (score >= 60) return 'Growing';
    if (score >= 40) return 'Budding';
    return 'Seedling';
  };

  return (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: getColor() }]}>
        <Text style={[styles.scoreNumber, { color: getColor() }]}>{score}</Text>
        <Text style={[styles.scoreMax, { color: colors.mutedForeground }]}>/100</Text>
      </View>
      <Text style={[styles.scoreLabel, { color: getColor() }]}>{getLabel()}</Text>
      <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>Reef Health</Text>
    </View>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <View>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, budget, updateStreak } = useApp();

  useEffect(() => {
    updateStreak();
  }, []);

  const totalSpent = budget.categories.reduce((s, c) => s + c.spent, 0);
  const totalBudget = budget.categories.reduce((s, c) => s + c.budget, 0);
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const savingsActual = budget.categories
    .filter(c => c.type === 'savings')
    .reduce((s, c) => s + c.spent, 0);
  const savingsTarget = (budget.income * budget.savingsPct) / 100;
  const savingsRate = budget.income > 0 && savingsTarget > 0
    ? Math.round((savingsActual / savingsTarget) * 100)
    : 0;

  // Reef health = weighted score
  const healthScore = budget.income === 0
    ? 42
    : Math.min(100, Math.round(
        (profile.completedLessons.length * 5) +
        (profile.totalQuizzes * 8) +
        Math.max(0, 30 - spentPct / 3) +
        Math.min(40, savingsRate * 0.4)
      ));

  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.ocean1, colors.background]}
        style={[styles.headerGradient, { paddingTop: topInset + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
            <Text style={[styles.appName, { color: colors.text }]}>
              FIN<Text style={{ color: colors.teal }}>reef</Text>
            </Text>
          </View>
          <View style={styles.streakBadge}>
            <Feather name="zap" size={14} color={colors.sand} />
            <Text style={[styles.streakText, { color: colors.sand }]}>{profile.streak}d</Text>
          </View>
        </View>

        <View style={styles.headerContent}>
          <ReefHealthScore score={healthScore} />
          <View style={styles.statsCol}>
            <StatChip
              label="XP Points"
              value={`${profile.xp} XP`}
              color={colors.teal}
            />
            <StatChip
              label="Level"
              value={`Level ${profile.level}`}
              color={colors.seafoam}
            />
            <StatChip
              label="Budget Used"
              value={budget.income > 0 ? `${spentPct}%` : '—'}
              color={colors.coral}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget bar */}
        {budget.income > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Budget</Text>
            <View style={styles.budgetBars}>
              {(['needs', 'wants', 'savings'] as const).map((type, i) => {
                const cats = budget.categories.filter(c => c.type === type);
                const spent = cats.reduce((s, c) => s + c.spent, 0);
                const target = (budget.income * [budget.needsPct, budget.wantsPct, budget.savingsPct][i]) / 100;
                const pct = target > 0 ? Math.min(100, Math.round((spent / target) * 100)) : 0;
                const color = [colors.teal, colors.coral, colors.seafoam][i];
                const label = ['Needs', 'Wants', 'Savings'][i];
                return (
                  <View key={type} style={styles.budgetBarRow}>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{label}</Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.barPct, { color: colors.text }]}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick actions */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Explore</Text>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="pie-chart"
            label="Budget"
            color={colors.teal}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/budget'); }}
          />
          <QuickAction
            icon="sliders"
            label="Calculate"
            color={colors.seafoam}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/calculators'); }}
          />
          <QuickAction
            icon="zap"
            label="Challenge"
            color={colors.coral}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/games'); }}
          />
          <QuickAction
            icon="book-open"
            label="Learn"
            color={colors.sand}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/learn'); }}
          />
        </View>

        {/* Tip of the day */}
        <LinearGradient
          colors={[colors.teal + '33', colors.ocean1]}
          style={[styles.tipCard, { borderColor: colors.teal + '44' }]}
        >
          <View style={styles.tipHeader}>
            <Feather name="anchor" size={16} color={colors.teal} />
            <Text style={[styles.tipTitle, { color: colors.teal }]}>Coral Wisdom</Text>
          </View>
          <Text style={[styles.tipBody, { color: colors.text }]}>{getDailyTip()}</Text>
        </LinearGradient>

        {/* Progress */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Journey</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.teal }]}>{profile.totalQuizzes}</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Quizzes</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.seafoam }]}>{profile.completedLessons.length}</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Lessons</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.progressItem}>
              <Text style={[styles.progressValue, { color: colors.sand }]}>{profile.bestQuizScore}%</Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Best Score</Text>
            </View>
          </View>
          {/* XP bar */}
          <View style={styles.xpRow}>
            <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>Level {profile.level}</Text>
            <View style={[styles.barTrack, { flex: 1, marginHorizontal: 8 }]}>
              <View
                style={[styles.barFill, { backgroundColor: colors.teal, width: `${(profile.xp % 100)}%` as any }]}
              />
            </View>
            <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>Level {profile.level + 1}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  appName: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F59E0B22',
  },
  streakText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  scoreContainer: { alignItems: 'center' },
  scoreRing: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', alignContent: 'center',
    flexWrap: 'wrap',
  },
  scoreNumber: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  scoreMax: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  scoreLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginTop: 6 },
  scoreDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statsCol: { flex: 1, gap: 8 },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1,
  },
  statDot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 16 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  sectionHeader: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  budgetBars: { gap: 10 },
  budgetBarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', width: 46 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barPct: { fontSize: 12, fontFamily: 'Inter_500Medium', width: 30, textAlign: 'right' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAction: {
    width: '47%', borderRadius: 16, borderWidth: 1,
    padding: 16, alignItems: 'center', gap: 10,
  },
  quickActionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  tipCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tipTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  tipBody: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  progressItem: { flex: 1, alignItems: 'center' },
  progressValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  progressLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { width: 1, height: 36 },
  xpRow: { flexDirection: 'row', alignItems: 'center' },
});
