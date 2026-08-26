import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { useUser } from '../../../UserContext';
import api_call from '../../../api';
import { sendTestNotification } from '../../services/notificationService';

// ─── Config — update before launch ────────────────────────────────────────────
const PRIVACY_POLICY_URL = 'https://myfitfly.app/privacy';
const TERMS_URL           = 'https://myfitfly.app/terms';
const SUPPORT_EMAIL       = 'support@myfitfly.app';
const APP_VERSION         = '1.0.0';

// ─── Sub-components ────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const Divider = () => <View style={styles.divider} />;

const SettingRow = ({
  icon,
  iconColor = '#555',
  iconBg,
  label,
  sublabel,
  onPress,
  rightElement,
  danger,
}) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress && !rightElement}
  >
    <View style={[styles.iconCircle, { backgroundColor: iconBg ?? (danger ? '#FFF0F0' : '#F1F5FB') }]}>
      <Icon name={icon} size={20} color={danger ? '#E53E3E' : iconColor} />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowLabel, danger && { color: '#E53E3E' }]}>{label}</Text>
      {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
    </View>
    {rightElement !== undefined
      ? rightElement
      : onPress
        ? <Icon name="chevron-right" size={20} color={danger ? '#E53E3E' : '#BBBBBB'} />
        : null}
  </TouchableOpacity>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const AccountSettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { userData, setUserData } = useUser();

  // Notification preferences (wire to backend/AsyncStorage as needed)
  const [workoutReminders, setWorkoutReminders]   = useState(true);
  const [mealReminders,    setMealReminders]       = useState(true);
  const [progressUpdates,  setProgressUpdates]    = useState(false);

  const [deleting, setDeleting] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const openUrl = (url) =>
    Linking.canOpenURL(url)
      .then((ok) => (ok ? Linking.openURL(url) : Alert.alert('Error', 'Cannot open this URL.')))
      .catch(() => Alert.alert('Error', 'Cannot open this URL.'));

  const contactSupport = () => {
    const subject = encodeURIComponent('MyFitFly Support Request');
    const body = encodeURIComponent(
      `User: ${userData?.name || 'Unknown'}\nUID: ${auth().currentUser?.uid || 'N/A'}\nDevice: ${Platform.OS} ${Platform.Version}\n\n--- Describe your issue ---\n`
    );
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`).catch(() =>
      Alert.alert('Email not available', `Please email us at:\n${SUPPORT_EMAIL}`)
    );
  };

  // ── Account deletion ─────────────────────────────────────────────────────────
  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account, all workout history, meal logs, and personal data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Delete', style: 'destructive', onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Final Confirmation',
      'All your data will be erased immediately and cannot be recovered.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Forever', style: 'destructive', onPress: executeDelete },
      ]
    );
  };

  const executeDelete = async () => {
    setDeleting(true);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error('Not authenticated');

      // 1. Delete backend data
      const res = await fetch(`${api_call}/user/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'firebase-uid': user.uid },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Server error ${res.status}`);
      }

      // 2. Delete Firebase Auth account
      await user.delete();

      // 3. Clear local context — auth listener auto-redirects to Login
      setUserData(null);
    } catch (err) {
      setDeleting(false);
      if (err?.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Re-authentication Required',
          'For security, please log out and log back in before deleting your account.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out Now', onPress: () => auth().signOut() },
          ]
        );
      } else {
        Alert.alert('Error', err?.message || 'Failed to delete account. Please try again.');
      }
    }
  };

  const handleLogout = () =>
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => auth().signOut() },
    ]);

  // ── Deletion loading screen ──────────────────────────────────────────────────
  if (deleting) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#E53E3E" />
        <Text style={styles.deletingTitle}>Deleting your account…</Text>
        <Text style={styles.deletingSubtitle}>Please do not close the app.</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Account Info ── */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.card}>
          <SettingRow
            icon="account-circle-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label={userData?.name || 'Your Name'}
            sublabel={
              userData?.goal||
              'No contact info on file'
            }
          />
          <Divider />
          <SettingRow
            icon="pencil-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Edit Profile"
            sublabel="Update name, age, weight, height"
            onPress={() =>
              Alert.alert('Coming Soon', 'Profile editing will be available in the next update.')
            }
          />
          
            <Divider />
          <SettingRow
            icon="trophy-outline"
             iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Streaks & Achievements"
            sublabel="Check Your Streaks"
            onPress={() =>(navigation.navigate('UserStreak'))}
          />
        </View>

         {/* Progress and insights*/}
          <SectionHeader title="PROGRESS & INSIGHTS" />
        <View style={styles.card}>
          <SettingRow
            icon="scale-balance"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Weight History and Graphs"
            sublabel="Check Your Progress"
            onPress={() =>(navigation.navigate('ProgressHistory'))}
          />
          <Divider />
          <SettingRow
            icon="fire"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Calorie Burn Logs"
            sublabel="Log Your Calorie Burn"
            onPress={() => (navigation.navigate('CalorieLog'))}
          />
        </View>

        {/* ── Notifications ── */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.card}>
          <SettingRow
            icon="dumbbell"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Workout Reminders"
            sublabel="Daily nudges to stay active"
            rightElement={
              <Switch
                value={workoutReminders}
                onValueChange={val => {
                  setWorkoutReminders(val);
                  if (val) {
                    sendTestNotification();
                  }
                }}
                trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                thumbColor={workoutReminders ? '#0066EE' : '#94A3B8'}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="food-apple-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Meal Reminders"
            sublabel="Log breakfast, lunch & dinner"
            rightElement={
              <Switch
                value={mealReminders}
                onValueChange={val => {
                  setMealReminders(val);
                  if (val) {
                    sendTestNotification();
                  }
                }}
                trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                thumbColor={mealReminders ? '#0066EE' : '#94A3B8'}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="chart-line"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Weekly Progress Updates"
            sublabel="Summary of your fitness journey"
            rightElement={
              <Switch
                value={progressUpdates}
                onValueChange={setProgressUpdates}
                trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                thumbColor={progressUpdates ? '#0066EE' : '#94A3B8'}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="bell-ring-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Send Test Notification"
            sublabel="Test push alerts on your device"
            onPress={async () => {
              await sendTestNotification();
              Alert.alert('Test Notification Sent!', 'Check your status bar / notification drawer for the alert.');
            }}
          />
        </View>

        {/* ── Privacy & Data ── */}
        <SectionHeader title="PRIVACY & DATA" />
        <View style={styles.card}>
          <SettingRow
            icon="shield-check-outline"
            iconColor="#2563EB"
            iconBg="#EFF6FF"
            label="Privacy Policy"
            sublabel="How we handle your personal data"
            onPress={() => openUrl(PRIVACY_POLICY_URL)}
          />
          <Divider />
          <SettingRow
            icon="file-document-outline"
            iconColor="#2563EB"
            iconBg="#EFF6FF"
            label="Terms of Service"
            sublabel="Rules for using MyFitFly"
            onPress={() => openUrl(TERMS_URL)}
          />
          <Divider />
          <SettingRow
            icon="database-export-outline"
             iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Export My Data"
            sublabel="Download a copy of all your data"
            onPress={() =>
              Alert.alert(
                'Export Data',
                'Your data export will be ready within 24 hours and sent to your registered contact.\n\nFull export feature coming soon.'
              )
            }
          />
        </View>

        {/* ── Support ── */}
        <SectionHeader title="SUPPORT" />
        <View style={styles.card}>
          <SettingRow
            icon="help-circle-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Help & FAQ"
            sublabel="Browse answers to common questions"
            onPress={() => openUrl('https://myfitfly.app/help')}
          />
          <Divider />
          <SettingRow
            icon="email-outline"
            iconColor="#0066EE"
            iconBg="#EBF1FF"
            label="Contact Support"
            sublabel={SUPPORT_EMAIL}
            onPress={contactSupport}
          />
          <Divider />
          <SettingRow
            icon="star-outline"
            iconColor="#F59E0B"
            iconBg="#FEF9C3"
            label="Rate MyFitFly ⭐"
            sublabel="Help others discover the app"
            onPress={() => openUrl('market://details?id=com.fittrackapp')}
          />
        </View>

        {/* ── App ── */}
        <SectionHeader title="APP" />
        <View style={styles.card}>
          <SettingRow
            icon="information-outline"
            iconColor="#64748B"
            label="App Version"
            rightElement={<Text style={styles.versionText}>v{APP_VERSION}</Text>}
          />
          <Divider />
          <SettingRow
            icon="logout"
            iconColor="#FF3B30"
            iconBg="#FFF0F0"
            label="Log Out"
            danger
            onPress={handleLogout}
          />
        </View>

        {/* ── Danger Zone ── */}
        <SectionHeader title="DANGER ZONE" />
        <View style={[styles.card, styles.dangerCard]}>
          <View style={styles.dangerBanner}>
            <Icon name="alert-circle" size={22} color="#E53E3E" style={{ marginRight: 10, flexShrink: 0 }} />
            <Text style={styles.dangerBannerText}>
              Deleting your account permanently removes all personal data, workout history,
              meal logs, and achievements from our servers.{'\n\n'}
              <Text style={{ fontWeight: '700' }}>This action cannot be undone.</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
            activeOpacity={0.85}
          >
            <Icon name="trash-can-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.deleteBtnText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8FAFC' },
  loadingWrap:  { flex: 1, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', padding: 40 },
  deletingTitle:   { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#E53E3E' },
  deletingSubtitle:{ marginTop: 8, fontSize: 14, color: '#64748B', textAlign: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  scroll: { flex: 1 },

  sectionHeader: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 0.8, marginTop: 24, marginBottom: 6, marginHorizontal: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 1 },
    }),
  },
  dangerCard: { borderColor: '#FCA5A5', backgroundColor: '#FFFAFA' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  iconCircle: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  rowContent: { flex: 1, marginRight: 8 },
  rowLabel:   { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  rowSublabel:{ fontSize: 12, color: '#94A3B8', marginTop: 2, lineHeight: 16 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },
  versionText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  dangerBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    margin: 16, padding: 14,
    backgroundColor: '#FEF2F2', borderRadius: 12,
    borderWidth: 1, borderColor: '#FECACA',
  },
  dangerBannerText: { flex: 1, fontSize: 13, color: '#7F1D1D', lineHeight: 20 },

  deleteBtn: {
    flexDirection: 'row', backgroundColor: '#E53E3E',
    borderRadius: 12, marginHorizontal: 16, marginBottom: 16,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#E53E3E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  deleteBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default AccountSettingsScreen;
