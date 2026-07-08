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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

type CalcTab = 'compound' | 'loan' | 'savings' | 'retirement';

const CALC_TABS: { id: CalcTab; label: string; icon: string }[] = [
  { id: 'compound', label: 'Compound', icon: 'trending-up' },
  { id: 'loan', label: 'Loan', icon: 'credit-card' },
  { id: 'savings', label: 'Savings Goal', icon: 'target' },
  { id: 'retirement', label: 'Retirement', icon: 'sun' },
];

function fmt(n: number): string {
  if (isNaN(n) || !isFinite(n)) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtYrs(months: number): string {
  if (!isFinite(months) || months <= 0) return '—';
  const yrs = Math.floor(months / 12);
  const mos = Math.round(months % 12);
  if (yrs === 0) return `${mos} months`;
  if (mos === 0) return `${yrs} years`;
  return `${yrs}y ${mos}m`;
}

function InputField({ label, value, onChange, prefix, suffix, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  const colors = useColors();
  return (
    <View style={iStyles.field}>
      <Text style={[iStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[iStyles.row, { borderColor: colors.border, backgroundColor: colors.input }]}>
        {prefix && <Text style={[iStyles.affix, { color: colors.teal }]}>{prefix}</Text>}
        <TextInput
          style={[iStyles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          returnKeyType="done"
          placeholderTextColor={colors.mutedForeground}
          placeholder="0"
        />
        {suffix && <Text style={[iStyles.affix, { color: colors.mutedForeground }]}>{suffix}</Text>}
      </View>
      {hint && <Text style={[iStyles.hint, { color: colors.mutedForeground }]}>{hint}</Text>}
    </View>
  );
}

const iStyles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 48 },
  affix: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginRight: 4 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
});

function ResultCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  const colors = useColors();
  return (
    <LinearGradient
      colors={[color + '22', colors.ocean1]}
      style={[rStyles.card, { borderColor: color + '44' }]}
    >
      <Text style={[rStyles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[rStyles.value, { color }]}>{value}</Text>
      {sub && <Text style={[rStyles.sub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </LinearGradient>
  );
}

const rStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  label: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  value: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
});

function CompoundCalc() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [monthly, setMonthly] = useState('');
  const colors = useColors();

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = (parseFloat(years) || 0) * 12;
  const m = parseFloat(monthly) || 0;

  let total = 0;
  if (r > 0 && n > 0) {
    total = p * Math.pow(1 + r, n) + m * ((Math.pow(1 + r, n) - 1) / r);
  } else if (n > 0) {
    total = p + m * n;
  }
  const gain = total - p - m * n;

  return (
    <View>
      <InputField label="Initial Amount" value={principal} onChange={setPrincipal} prefix="$" />
      <InputField label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" hint="Historical S&P 500 avg ~10%" />
      <InputField label="Time Period" value={years} onChange={setYears} suffix="years" />
      <InputField label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="$" />
      <ResultCard label="Future Value" value={fmt(total)} sub={`Interest earned: ${fmt(gain)}`} color={colors.teal} />
      <ResultCard label="Total Contributed" value={fmt(p + m * n)} color={colors.seafoam} />
    </View>
  );
}

function LoanCalc() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const colors = useColors();

  const p = parseFloat(principal) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = (parseFloat(term) || 0) * 12;

  const monthly = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / (n || 1);
  const total = monthly * n;
  const interest = total - p;

  return (
    <View>
      <InputField label="Loan Amount" value={principal} onChange={setPrincipal} prefix="$" />
      <InputField label="Annual Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" />
      <InputField label="Loan Term" value={term} onChange={setTerm} suffix="years" />
      <ResultCard label="Monthly Payment" value={fmt(monthly)} color={colors.coral} />
      <ResultCard label="Total Interest Paid" value={fmt(interest)} sub={`Total repaid: ${fmt(total)}`} color={colors.sand} />
    </View>
  );
}

function SavingsGoalCalc() {
  const [goal, setGoal] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('');
  const colors = useColors();

  const g = parseFloat(goal) || 0;
  const m = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;

  let months = Infinity;
  if (m > 0) {
    if (r > 0) {
      months = Math.log(1 + (g * r) / m) / Math.log(1 + r);
    } else {
      months = g / m;
    }
  }

  const totalContrib = m * months;
  const interest = g - totalContrib;

  return (
    <View>
      <InputField label="Savings Goal" value={goal} onChange={setGoal} prefix="$" />
      <InputField label="Monthly Savings" value={monthly} onChange={setMonthly} prefix="$" />
      <InputField label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" hint="Optional — use 0 for simple savings" />
      <ResultCard label="Time to Reach Goal" value={fmtYrs(months)} color={colors.seafoam} />
      <ResultCard label="Interest Earned" value={isFinite(interest) && interest > 0 ? fmt(interest) : '$0'} color={colors.teal} />
    </View>
  );
}

function RetirementCalc() {
  const [currentAge, setCurrentAge] = useState('');
  const [savings, setSavings] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('7');
  const colors = useColors();

  const age = parseFloat(currentAge) || 25;
  const p = parseFloat(savings) || 0;
  const m = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 7) / 100 / 12;
  const yearsToRetire = Math.max(0, 65 - age);
  const n = yearsToRetire * 12;

  const total = r > 0
    ? p * Math.pow(1 + r, n) + m * ((Math.pow(1 + r, n) - 1) / r)
    : p + m * n;
  const contributed = p + m * n;
  const gain = total - contributed;

  // 4% withdrawal rule
  const annualIncome = total * 0.04;

  return (
    <View>
      <InputField label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" hint="Retiring at 65" />
      <InputField label="Current Retirement Savings" value={savings} onChange={setSavings} prefix="$" />
      <InputField label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="$" />
      <InputField label="Expected Annual Return" value={rate} onChange={setRate} suffix="%" hint="7% is a conservative estimate" />
      <ResultCard label={`Balance at 65 (${yearsToRetire}y away)`} value={fmt(total)} sub={`Gain: ${fmt(gain)}`} color={colors.teal} />
      <ResultCard label="Annual Income (4% Rule)" value={fmt(annualIncome)} sub={`~${fmt(annualIncome / 12)}/month`} color={colors.seafoam} />
    </View>
  );
}

export default function CalculatorsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<CalcTab>('compound');
  const topInset = Platform.OS === 'web' ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.ocean1, colors.background]}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Calculators</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Plan your financial future</Text>
      </LinearGradient>

      {/* Tab selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabScroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.tabContent}
      >
        {CALC_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tab,
                { borderColor: active ? colors.teal : colors.border },
                active && { backgroundColor: colors.teal + '22' },
              ]}
              onPress={() => {
                setActiveTab(tab.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Feather name={tab.icon as any} size={14} color={active ? colors.teal : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: active ? colors.teal : colors.mutedForeground }]}>
                {tab.label}
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
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'compound' && <CompoundCalc />}
        {activeTab === 'loan' && <LoanCalc />}
        {activeTab === 'savings' && <SavingsGoalCalc />}
        {activeTab === 'retirement' && <RetirementCalc />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular', marginTop: 4 },
  tabScroll: { flexGrow: 0 },
  tabContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5,
  },
  tabLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  content: { padding: 20 },
});
