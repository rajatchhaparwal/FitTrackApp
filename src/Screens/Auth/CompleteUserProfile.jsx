import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';
import { ftInToCm, getHeightInCm } from '../../utils/heightUtils';
import OnboardingInsightScreen from '../../components/onboarding/OnboardingInsightScreen';
import OnboardingFormShell from '../../components/onboarding/OnboardingFormShell';
import {
  parseOnboardingCompleteFromApi,
  setLocalOnboardingComplete,
} from '../../services/onboardingStatus';
import api_call from '../../../api';


const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

const GOALS = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'maintenance', label: 'Stay Fit' },
  { id: 'endurance', label: 'Build Endurance' },
  { id: 'weight_gain', label: 'Weight Gain' },
  { id: 'Plan_meals', label: 'Plan Meals' },
  { id: 'Modify_my_diet', label: 'Modify My Diet' },
  { id: 'maintenance', label: 'Manage Stress' },

];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', hint: 'Little or no exercise' },
  { id: 'lightly_active', label: 'Lightly active', hint: '1–2 days / week' },
  { id: 'moderately_active', label: 'Moderately active', hint: '3–4 days / week' },
  { id: 'very_active', label: 'Very active', hint: '5+ days / week' },
];

const HABITS = ['Morning workout', 'Gym', 'Running', 'Yoga', 'Cycling', 'Swimming'];

const FITNESS_LEVELS = [
  { id: 'Beginner', label: 'Beginner', hint: 'New to training or returning after a break' },
  { id: 'Intermediate', label: 'Intermediate', hint: 'Train regularly, comfortable with basics' },
  { id: 'Advanced', label: 'Advanced', hint: 'Experienced, high training volume' },
];

const EQUIPMENT_OPTIONS = [
  'No Equipment',
  'Dumbbells',
  'Barbell',
  'Resistance Band',
  'Pull-up Bar',
  'Bench',
  'Kettlebell',
  'Treadmill',
  'Jump Rope',
];

const CATEGORY_OPTIONS = [
  'Strength',
  'Cardio',
  'Flexibility',
  'Core',
  'HIIT',
  'Balance',
];

const HEIGHT_UNITS = [
  { id: 'cm', label: 'cm' },
  { id: 'ft-in', label: 'ft / in' },
];

const STEP_FLOW = [
  { type: 'form', formId: 'name' },
  { type: 'insight', phase: 'name' },
  { type: 'form', formId: 'body' },
  { type: 'insight', phase: 'body' },
  { type: 'form', formId: 'goal' },
  { type: 'insight', phase: 'goal' },
  { type: 'form', formId: 'lifestyle' },
  { type: 'insight', phase: 'lifestyle' },
  { type: 'form', formId: 'health' },
  { type: 'insight', phase: 'finish' },
];

const TOTAL_STEPS = STEP_FLOW.length;

function Field({ label, icon, children }) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      {icon ? (
        <View style={styles.inputWrap}>
          <Icon name={icon} size={20} color="#AAB" style={styles.inputIcon} />
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
}

export default function CompleteUserProfile({ onOnboardingComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    heightUnit: 'cm',
    height: '',
    heightFt: '',
    heightIn: '',
    gender: '',
    fitnessLevel: '',
    goal: '',
    baselineActivityLevel: '',
    selectedHabits: [],
    preferredEquipment: [],
    preferredCategories: [],
    dailyWaterGoalMl: '2000',
    injuryNotes: '',
    country: '',
  });

  const step = STEP_FLOW[currentStep];
  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const isInsightStep = step.type === 'insight';
  const isLastStep = currentStep === TOTAL_STEPS - 1;

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (key, value) => {
    setFormData((prev) => {
      const list = prev[key];
      const exists = list.includes(value);
      return {
        ...prev,
        [key]: exists ? list.filter((item) => item !== value) : [...list, value],
      };
    });
  };

  const validateFormStep = (formId) => {
    const { name, age, weight, gender, goal, baselineActivityLevel } = formData;

    switch (formId) {
      case 'name':
        if (name.trim().length < 2) {
          Alert.alert('Name required', 'Please enter at least 2 characters.');
          return false;
        }
        return true;
      case 'body': {
        const ageNum = Number(age);
        const weightNum = Number(weight);
        if (!age || ageNum < 13 || ageNum > 120) {
          Alert.alert('Invalid age', 'Please enter an age between 13 and 120.');
          return false;
        }
        if (!weight || weightNum < 20 || weightNum > 500) {
          Alert.alert('Invalid weight', 'Please enter weight in kg (20–500).');
          return false;
        }
        if (formData.heightUnit === 'cm') {
          const heightNum = Number(formData.height);
          if (!formData.height || heightNum < 50 || heightNum > 300) {
            Alert.alert('Invalid height', 'Please enter height in cm (50–300).');
            return false;
          }
        } else {
          const ft = formData.heightFt === '' ? NaN : Number(formData.heightFt);
          const inch = formData.heightIn === '' ? NaN : Number(formData.heightIn);
          if (
            formData.heightFt === '' ||
            formData.heightIn === '' ||
            Number.isNaN(ft) ||
            Number.isNaN(inch) ||
            ft < 1 ||
            ft > 8 ||
            inch < 0 ||
            inch > 11
          ) {
            Alert.alert('Invalid height', 'Enter feet (1–8) and inches (0–11).');
            return false;
          }
          const heightCm = ftInToCm(ft, inch);
          if (heightCm < 50 || heightCm > 300) {
            Alert.alert('Invalid height', 'That height is outside the allowed range.');
            return false;
          }
        }
        if (!gender) {
          Alert.alert('Gender required', 'Please select an option.');
          return false;
        }
        if (!formData.fitnessLevel) {
          Alert.alert('Fitness level required', 'Please select your current fitness level.');
          return false;
        }
        return true;
      }
      case 'goal':
        if (!goal) {
          Alert.alert('Goal required', 'Please select your primary goal.');
          return false;
        }
        return true;
      case 'lifestyle':
        if (!baselineActivityLevel) {
          Alert.alert('Activity level required', 'Please select how active you are.');
          return false;
        }
        return true;
      case 'health':
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step.type === 'form' && !validateFormStep(step.formId)) return;
    if (isLastStep) handleSubmit();
    else setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      Alert.alert('Session expired', 'Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${api_call}/login`, {
        firebaseUid: user.uid,
        phoneNumber: user.phoneNumber,
        name: formData.name.trim(),
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: getHeightInCm(formData),
        gender: formData.gender,
        fitnessLevel: formData.fitnessLevel,
        fitness_level: formData.fitnessLevel,
        goal: formData.goal,
        baselineActivityLevel: formData.baselineActivityLevel,
        selectedHabits: formData.selectedHabits,
        daily_water_goal_ml: Number(formData.dailyWaterGoalMl) || 2000,
        preferences: {
          preferred_equipment: formData.preferredEquipment,
          preferred_categories: formData.preferredCategories,
          units: formData.heightUnit === 'cm' ? 'metric' : 'imperial',
        },
        injuryNotes: formData.injuryNotes.trim(),
        country: formData.country.trim(),
        onboardingCompleted: true,
      });

      const saved =
        parseOnboardingCompleteFromApi(response.data) || true;
      if (saved) {
        await setLocalOnboardingComplete(user.uid, true);
      }
      onOnboardingComplete?.();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error.response?.data?.message || error.message || 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputProps = {
    placeholderTextColor: '#B0B0B0',
    style: styles.input,
  };

  const renderChips = (options, selected, onSelect, multi = false) => (
    <View style={styles.chipRow}>
      {options.map((option, index) => {
        const label = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.id;
        const isSelected = multi ? selected.includes(value) : selected === value;
        return (
          <TouchableOpacity
            key={`${value}-${index}`}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderFormContent = (formId) => {
    switch (formId) {
      case 'name':
        return (
          <OnboardingFormShell formId="name">
            <Field icon="account-outline">
              <TextInput
                {...inputProps}
                placeholder="Your first name"
                value={formData.name}
                onChangeText={(t) => updateField('name', t)}
                autoCapitalize="words"
                autoFocus
              />
            </Field>
          </OnboardingFormShell>
        );

      case 'body':
        return (
          <OnboardingFormShell formId="body">
            <View style={styles.row2}>
              <View style={styles.half}>
                <Field label="Age" icon="calendar-outline">
                  <TextInput
                    {...inputProps}
                    placeholder="25"
                    value={formData.age}
                    onChangeText={(t) => updateField('age', t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Weight (kg)" icon="scale-bathroom">
                  <TextInput
                    {...inputProps}
                    placeholder="70"
                    value={formData.weight}
                    onChangeText={(t) => updateField('weight', t.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                  />
                </Field>
              </View>
            </View>

            <Field label="Height">
              <View style={styles.unitToggleRow}>
                {HEIGHT_UNITS.map((unit) => {
                  const sel = formData.heightUnit === unit.id;
                  return (
                    <TouchableOpacity
                      key={unit.id}
                      style={[styles.unitBtn, sel && styles.unitBtnSel]}
                      onPress={() => updateField('heightUnit', unit.id)}
                    >
                      <Text style={[styles.unitBtnText, sel && styles.unitBtnTextSel]}>
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {formData.heightUnit === 'cm' ? (
                <View style={styles.inputWrap}>
                  <Icon name="human-male-height" size={20} color="#AAB" style={styles.inputIcon} />
                  <TextInput
                    {...inputProps}
                    placeholder="175"
                    value={formData.height}
                    onChangeText={(t) => updateField('height', t.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                  />
                </View>
              ) : (
                <View style={styles.row2}>
                  <View style={styles.half}>
                    <Text style={styles.miniLabel}>Feet</Text>
                    <TextInput
                      {...inputProps}
                      placeholder="5"
                      value={formData.heightFt}
                      onChangeText={(t) => updateField('heightFt', t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.miniLabel}>Inches</Text>
                    <TextInput
                      {...inputProps}
                      placeholder="10"
                      value={formData.heightIn}
                      onChangeText={(t) => updateField('heightIn', t.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>
              )}
            </Field>

            <Field label="Gender">
              {renderChips(GENDERS, formData.gender, (g) => updateField('gender', g))}
            </Field>

            <Field label="Fitness level">
              {FITNESS_LEVELS.map((level) => {
                const sel = formData.fitnessLevel === level.id;
                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[styles.optionRow, sel && styles.optionRowSel]}
                    onPress={() => updateField('fitnessLevel', level.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radio, sel && styles.radioSel]}>
                      {sel ? <View style={styles.radioDot} /> : null}
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionTitle, sel && styles.optionTitleSel]}>
                        {level.label}
                      </Text>
                      <Text style={styles.optionHint}>{level.hint}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Field>
          </OnboardingFormShell>
        );

      case 'goal':
        return (
          <OnboardingFormShell formId="goal">
            {renderChips(GOALS, formData.goal, (id) => updateField('goal', id))}
          </OnboardingFormShell>
        );

      case 'lifestyle':
        return (
          <OnboardingFormShell formId="lifestyle">
            {ACTIVITY_LEVELS.map((level) => {
              const sel = formData.baselineActivityLevel === level.id;
              return (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.optionRow, sel && styles.optionRowSel]}
                  onPress={() => updateField('baselineActivityLevel', level.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.radio, sel && styles.radioSel]}>
                    {sel ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionTitle, sel && styles.optionTitleSel]}>
                      {level.label}
                    </Text>
                    <Text style={styles.optionHint}>{level.hint}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <Text style={[styles.fieldLabel, styles.habitsHead]}>Habits you enjoy (optional)</Text>
            {renderChips(HABITS, formData.selectedHabits, (h) => toggleMultiSelect('selectedHabits', h), true)}

            <Text style={[styles.fieldLabel, styles.habitsHead]}>Equipment you have access to</Text>
            {renderChips(
              EQUIPMENT_OPTIONS,
              formData.preferredEquipment,
              (item) => toggleMultiSelect('preferredEquipment', item),
              true,
            )}

            <Text style={[styles.fieldLabel, styles.habitsHead]}>Workout types you prefer</Text>
            {renderChips(
              CATEGORY_OPTIONS,
              formData.preferredCategories,
              (item) => toggleMultiSelect('preferredCategories', item),
              true,
            )}
          </OnboardingFormShell>
        );

      case 'health':
        return (
          <OnboardingFormShell formId="health">
            <Field label="Injuries or limitations" icon="bandage">
              <TextInput
                {...inputProps}
                style={[styles.input, styles.textArea]}
                placeholder="Leave blank if none"
                value={formData.injuryNotes}
                onChangeText={(t) => updateField('injuryNotes', t)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Field>
            <Field label="Country (optional)" icon="earth">
              <TextInput
                {...inputProps}
                placeholder="India"
                value={formData.country}
                onChangeText={(t) => updateField('country', t)}
                autoCapitalize="words"
              />
            </Field>
            <Field label="Daily water goal (ml, optional)" icon="cup-water">
              <TextInput
                {...inputProps}
                placeholder="2000"
                value={formData.dailyWaterGoalMl}
                onChangeText={(t) => updateField('dailyWaterGoalMl', t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={5}
              />
            </Field>
          </OnboardingFormShell>
        );

      default:
        return null;
    }
  };

  const buttonLabel = () => {
    if (isSubmitting) return '';
    if (isLastStep) return 'Start My Journey';
    if (isInsightStep) return 'Continue';
    return 'Continue';
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <View style={styles.topBar}>
            <Text style={styles.brand}>FitTrack</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isInsightStep ? (
              <OnboardingInsightScreen formData={formData} phase={step.phase} />
            ) : (
              renderFormContent(step.formId)
            )}
          </ScrollView>

          <View style={styles.footer}>
            {currentStep > 0 ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                disabled={isSubmitting}
              >
                <Icon name="chevron-left" size={22} color="#666" />
              </TouchableOpacity>
            ) : (
              <View style={styles.backSpacer} />
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting && styles.primaryBtnOff]}
              onPress={handleNext}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.primaryBtnText}>{buttonLabel()}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12 },
  brand: { fontSize: 18, fontWeight: '800', color: '#5A8BFF', marginBottom: 12 },
  progressTrack: {
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#5A8BFF', borderRadius: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 20 },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  miniLabel: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ECECEC',
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    paddingVertical: 14,
  },
  textArea: { minHeight: 88, textAlignVertical: 'top' },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  unitToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#ECECEC',
    alignItems: 'center',
  },
  unitBtnSel: { backgroundColor: '#EEF3FF', borderColor: '#5A8BFF' },
  unitBtnText: { fontSize: 14, fontWeight: '700', color: '#888' },
  unitBtnTextSel: { color: '#5A8BFF' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#ECECEC',
  },
  chipSelected: { backgroundColor: '#5A8BFF', borderColor: '#5A8BFF' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#555' },
  chipTextSelected: { color: '#FFF' },
  habitsHead: { marginTop: 16, marginBottom: 10 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#ECECEC',
    marginBottom: 8,
  },
  optionRowSel: { backgroundColor: '#EEF3FF', borderColor: '#5A8BFF' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSel: { borderColor: '#5A8BFF' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#5A8BFF' },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  optionTitleSel: { color: '#5A8BFF' },
  optionHint: { fontSize: 12, color: '#999', marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  backSpacer: { width: 48 },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#5A8BFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnOff: { backgroundColor: '#B0C4FF' },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
