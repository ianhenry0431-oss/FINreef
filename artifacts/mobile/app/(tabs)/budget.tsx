import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

type BudgetRulePreset = { needs: number; wants: number; savings: number; label: string };

const PRESETS: BudgetRulePreset[] = [
  { needs: 50, wants: 30, savings: 20, label: '50/30/20' },
  { needs: 60, wants: 20, savings: 20, label: '60/20/20' },
  { needs: 50, wants: 20, savings: 30, label: '50/20/30' },
  { needs: 70, wants: 10, savings: 20, label: '70/10/20' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BudgetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { budget, updateIncome, updateBudgetPct, addSpending } = useApp();
  const [incomeText, setIncomeText] = useState(budget.income > 0 ? String(budget.income) : '');
  const [expandedType, setExpandedType] = useState<'needs' | 'wants' | 'savings' | null>(null);
  const [spendInput, setSpendInput] = useState<Record<string, string>>({});

  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  const handleIncomeSubmit = () => {
    const val = parseFloat(incomeText.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      updateIncome(val);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const applyPreset = (p: BudgetRulePreset) => {
    updateBudgetPct(p.needs, p.wants, p.savings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddSpend = (catId: string) => {
    const val = parseFloat(spendInput[catId] || '0');
    if (!isNaN(val) && val > 0) {
      addSpending(catId, val);
      setSpendInput(prev => ({ ...prev, [catId]: '' }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const budgetTypeInfo = [
    { type: 'needs' as const, pct: budget.needsPct, color: colors.teal, label: 'Needs', icon: 'home' },
    { type: 'wants' as const, pct: budget.wantsPct, color: colors.coral, label: 'Wants', icon: 'heart' },
    { type: 'savings' as const, pct: budget.savingsPct, color: colors.seafoam, label: 'Savings', icon: 'trending-up' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.ocean1, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Budget Builder</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Track your 50/30/20 plan</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 80) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Income Input */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Monthly Income</Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.input }]}>
            <Text style={[styles.currencySymbol, { color: colors.teal }]}>$</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={incomeText}
              onChangeText={setIncomeText}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={handleIncomeSubmit}
            />
            <Pressable
              style={[styles.setBtn, { backgroundColor: colors.teal }]}
              onPress={handleIncomeSubmit}
            >
              <Text style={styles.setBtnText}>Set</Text>
            </Pressable>
          </View>
          {budget.income > 0 && (
            <Text style={[styles.incomeNote, { color: colors.mutedForeground }]}>
              Net monthly: {fmt(budget.income)}
            </Text>
          )}
        </View>

        {/* Rule Presets */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Budget Rule</Text>
          <View style={styles.presetRow}>
            {PRESETS.map(p => {
              const active = budget.needsPct === p.needs && budget.wantsPct === p.wants && budget.savingsPct === p.savings;
              return (
                <Pressable
                  key={p.label}
                  style={[
                    styles.presetBtn,
                    { borderColor: active ? colors.teal : colors.border },
                    active && { backgroundColor: colors.teal + '22' },
                  ]}
                  onPress={() => applyPreset(p)}
                >
                  <Text style={[styles.presetLabel, { color: active ? colors.teal : colors.text }]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Allocation Breakdown */}
        {budgetTypeInfo.map(({ type, pct, color, label, icon }) => {
          const amount = (budget.income * pct) / 100;
          const cats = budget.categories.filter(c => c.type === type);
          const spent = cats.reduce((s, c) => s + c.spent, 0);
          const spentPct = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
          const isExpanded = expandedType === type;

          return (
            <View
              key={type}
              style={[styles.card, { backgroundColor: colors.card, borderColor: isExpanded ? color : colors.border }]}
            >
              <Pressable
                style={styles.typeHeader}
                onPress={() => {
                  setExpandedType(isExpanded ? null : type);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[styles.typeIconBox, { backgroundColor: color + '22' }]}>
                  <Feather name={icon as any} size={18} color={color} />
                </View>
                <View style={styles.typeMeta}>
                  <Text style={[styles.typeLabel, { color: colors.text }]}>{label} ({pct}%)</Text>
                  <Text style={[styles.typeAmount, { color: colors.mutedForeground }]}>
                    {budget.income > 0 ? `${fmt(spent)} / ${fmt(amount)}` : '—'}
                  </Text>
                </View>
                <View style={styles.typeRight}>
                  <Text style={[styles.typePct, { color }]}>{spentPct}%</Text>
                  <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
                </View>
              </Pressable>

              {budget.income > 0 && (
                <View style={styles.barWrap}>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.barFill, { width: `${spentPct}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              )}

              {isExpanded && (
                <View style={styles.catList}>
                  {cats.map(cat => {
                    const catPct = cat.budget > 0 ? Math.min(100, Math.round((cat.spent / cat.budget) * 100)) : 0;
                    return (
                      <View key={cat.id} style={[styles.catItem, { borderTopColor: colors.border }]}>
                        <View style={styles.catInfo}>
                          <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                          <View>
                            <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                            <Text style={[styles.catAmt, { color: colors.mutedForeground }]}>
                              {fmt(cat.spent)} / {budget.income > 0 ? fmt(cat.budget) : '—'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.catSpend}>
                          <View style={[styles.spendRow, { borderColor: colors.border, backgroundColor: colors.input }]}>
                            <Text style={[styles.currencySymbol, { color: color, fontSize: 12 }]}>$</Text>
                            <TextInput
                              style={[styles.spendInput, { color: colors.text }]}
                              value={spendInput[cat.id] || ''}
                              onChangeText={v => setSpendInput(p => ({ ...p, [cat.id]: v }))}
                              placeholder="0"
                              placeholderTextColor={colors.mutedForeground}
                              keyboardType="numeric"
                              returnKeyType="done"
                              onSubmitEditing={() => handleAddSpend(cat.id)}
                            />
                          </View>
                          <Pressable
                            style={[styles.addBtn, { backgroundColor: color }]}
                            onPress={() => handleAddSpend(cat.id)}
                          >
                            <Feather name="plus" size={14} color="#fff" />
                          </Pressable>
                        </View>
                        {cat.budget > 0 && (
                          <View style={[styles.catBar, { backgroundColor: colors.border }]}>
                            <View style={[styles.barFill, { width: `${catPct}%` as any, backgroundColor: cat.color }]} />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Summary */}
        {budget.income > 0 && (
          <LinearGradient
            colors={[colors.teal + '22', colors.ocean1]}
            style={[styles.summaryCard, { borderColor: colors.teal + '44' }]}
          >
            <Text style={[styles.summaryTitle, { color: colors.teal }]}>Monthly Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.text }]}>{fmt(budget.income)}</Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Income</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.coral }]}>
                  {fmt(budget.categories.reduce((s, c) => s + c.spent, 0))}
                </Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Spent</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryVal, { color: colors.seafoam }]}>
                  {fmt(budget.income - budget.categories.reduce((s, c) => s + c.spent, 0))}
                </Text>
                <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]}>Remaining</Text>
              </View>
            </View>
          </LinearGradient>
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
  content: { padding: 20, gap: 16 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 48,
  },
  currencySymbol: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginRight: 4 },
  input: { flex: 1, fontSize: 16, fontFamily: 'Inter_400Regular' },
  setBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  setBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  incomeNote: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  presetLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  typeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeMeta: { flex: 1 },
  typeLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  typeAmount: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  typeRight: { alignItems: 'flex-end', gap: 2 },
  typePct: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  barWrap: { marginTop: 12 },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  catList: { marginTop: 12, gap: 0 },
  catItem: { paddingTop: 12, borderTopWidth: 1 },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  catAmt: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  catSpend: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  spendRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, height: 36,
  },
  spendInput: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  addBtn: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  summaryTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  summaryGrid: { flexDirection: 'row' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  summaryLbl: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
