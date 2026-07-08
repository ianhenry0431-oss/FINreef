import React, { useState } from 'react';
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
import { LEARN_TIPS, LEARN_CATEGORIES, LearnCategory } from '@/data/learnData';

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, completeLesson } = useApp();
  const [activeCategory, setActiveCategory] = useState<LearnCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const filtered = activeCategory === 'all'
    ? LEARN_TIPS
    : LEARN_TIPS.filter(t => t.category === activeCategory);

  const completedCount = LEARN_TIPS.filter(t => profile.completedLessons.includes(t.id)).length;

  const handleExpand = (id: string) => {
    const isExpanding = expandedId !== id;
    setExpandedId(isExpanding ? id : null);
    if (isExpanding) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMarkRead = (id: string) => {
    completeLesson(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.ocean1, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Learn</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {completedCount}/{LEARN_TIPS.length} lessons completed
            </Text>
          </View>
          <View style={[styles.xpBadge, { backgroundColor: colors.teal + '22', borderColor: colors.teal + '44' }]}>
            <Feather name="star" size={14} color={colors.teal} />
            <Text style={[styles.xpText, { color: colors.teal }]}>+20 XP / lesson</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${(completedCount / LEARN_TIPS.length) * 100}%` as any, backgroundColor: colors.teal },
            ]}
          />
        </View>
      </LinearGradient>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterScroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.filterContent}
      >
        <Pressable
          style={[
            styles.filterBtn,
            { borderColor: activeCategory === 'all' ? colors.teal : colors.border },
            activeCategory === 'all' && { backgroundColor: colors.teal + '22' },
          ]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[styles.filterLabel, { color: activeCategory === 'all' ? colors.teal : colors.mutedForeground }]}>
            All
          </Text>
        </Pressable>
        {LEARN_CATEGORIES.map(cat => {
          const active = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.filterBtn,
                { borderColor: active ? cat.color : colors.border },
                active && { backgroundColor: cat.color + '22' },
              ]}
              onPress={() => {
                setActiveCategory(cat.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.filterDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.filterLabel, { color: active ? cat.color : colors.mutedForeground }]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Feather name="book-open" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lessons in this category</Text>
          </View>
        )}

        {filtered.map(tip => {
          const isExpanded = expandedId === tip.id;
          const isCompleted = profile.completedLessons.includes(tip.id);
          const catColor = LEARN_CATEGORIES.find(c => c.id === tip.category)?.color ?? colors.teal;

          return (
            <Pressable
              key={tip.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: isExpanded ? catColor : colors.border },
              ]}
              onPress={() => handleExpand(tip.id)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: catColor + '22' }]}>
                  <Feather name={tip.icon as any} size={18} color={catColor} />
                </View>
                <View style={styles.cardMeta}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 1}>
                      {tip.title}
                    </Text>
                    {isCompleted && (
                      <View style={[styles.doneTag, { backgroundColor: colors.seafoam + '22' }]}>
                        <Feather name="check" size={11} color={colors.seafoam} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardSummary, { color: colors.mutedForeground }]} numberOfLines={isExpanded ? undefined : 2}>
                    {tip.summary}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={[styles.catTag, { backgroundColor: catColor + '22' }]}>
                      <Text style={[styles.catTagText, { color: catColor }]}>
                        {LEARN_CATEGORIES.find(c => c.id === tip.category)?.label}
                      </Text>
                    </View>
                    <Text style={[styles.readTime, { color: colors.mutedForeground }]}>
                      {tip.readMinutes} min read
                    </Text>
                  </View>
                </View>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>

              {isExpanded && (
                <View style={[styles.bodyContainer, { borderTopColor: colors.border }]}>
                  <Text style={[styles.bodyText, { color: colors.text }]}>{tip.body}</Text>
                  {!isCompleted && (
                    <Pressable
                      style={[styles.markReadBtn, { backgroundColor: catColor }]}
                      onPress={() => handleMarkRead(tip.id)}
                    >
                      <Feather name="check-circle" size={16} color="#fff" />
                      <Text style={styles.markReadText}>Mark as Read (+20 XP)</Text>
                    </Pressable>
                  )}
                  {isCompleted && (
                    <View style={[styles.completedRow, { backgroundColor: colors.seafoam + '22' }]}>
                      <Feather name="check-circle" size={16} color={colors.seafoam} />
                      <Text style={[styles.completedText, { color: colors.seafoam }]}>Completed</Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}

        {/* Completion celebration */}
        {completedCount === LEARN_TIPS.length && (
          <LinearGradient
            colors={[colors.seafoam + '33', colors.ocean1]}
            style={[styles.completionCard, { borderColor: colors.seafoam + '55' }]}
          >
            <Text style={styles.completionEmoji}>🐬</Text>
            <Text style={[styles.completionTitle, { color: colors.text }]}>Reef Master!</Text>
            <Text style={[styles.completionSub, { color: colors.mutedForeground }]}>
              You've completed all {LEARN_TIPS.length} lessons. Your reef is thriving!
            </Text>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  xpText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  filterDot: { width: 8, height: 8, borderRadius: 4 },
  filterLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  content: { padding: 20, gap: 12 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardMeta: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  doneTag: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardSummary: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, marginTop: 3 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  catTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catTagText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  readTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  bodyContainer: { borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 12 },
  bodyText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  markReadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  markReadText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12 },
  completedText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  completionCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', gap: 8 },
  completionEmoji: { fontSize: 44, marginBottom: 4 },
  completionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  completionSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
});
