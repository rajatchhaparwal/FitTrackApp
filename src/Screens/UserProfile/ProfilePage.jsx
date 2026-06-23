import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { useUser } from "../../../UserContext";

const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  muscle_gain: 'Muscle Gain',
  weight_gain: 'Weight Gain',
  Plan_meals: 'Plan Meals',
  maintenance: 'Stay Fit',
  Modify_my_diet: 'Modify Diet',
  endurance: 'Build Endurance',
};

const ProfilePage = () => {
  const { userData, loading } = useUser();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: () => auth().signOut() }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066EE" />
      </View>
    );
  }

  const currentWeight = userData?.weight ? `${userData.weight} kg` : '--';
  const fitnessGoal = GOAL_LABELS[userData?.goal] || 'Stay Fit';
  const streak = userData?.stats?.current_streak_days || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── USER BANNER TOP SECTION ─── */}
      <View style={styles.userBanner}>
        <Image
          source={{ uri: userData?.profileImage || "" }}
          style={styles.profileImage}
        />
        <View style={styles.userMeta}>
          <Text style={styles.username}>{userData?.name || "Rajat"}</Text>
          <Text style={styles.subText}>
            Age: {userData?.age || '--'} · Height: {userData?.height || '--'} cm
          </Text>
        </View>
        <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
          <Text style={styles.editBadgeText}>EDIT</Text>
        </TouchableOpacity>
      </View>

      {/* ─── STATS METRICS SUMMARY GRID ─── */}
      <View style={styles.statsSummaryGrid}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{currentWeight}</Text>
          <Text style={styles.summaryLabel}>WEIGHT</Text>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>{fitnessGoal}</Text>
          <Text style={styles.summaryLabel}>FITNESS GOAL</Text>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.summaryColumn}>
          <Text style={[styles.summaryValue, { color: '#0066EE' }]}>{streak}</Text>
          <Text style={styles.summaryLabel}>STREAK DAYS</Text>
        </View>
      </View>

      {/* ─── ROW UTILITY ITEM LIST GROUPS ─── */}
      <Text style={styles.sectionHeaderTitle}>PROGRESS & INSIGHTS</Text>
      <View style={styles.rowBlockGroup}>
        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="trending-up" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Weight History & Graphs</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        <View style={styles.rowItemSeparator} />

        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="fire" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Calorie Burn Logs</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        <View style={styles.rowItemSeparator} />

        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="trophy-outline" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Badges & Achievements</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeaderTitle}>GOALS & SETTINGS</Text>
      <View style={styles.rowBlockGroup}>
        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="target" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Weekly Goals & Objectives</Text>
          </View>
          <Text style={styles.rowRightValue}>{fitnessGoal}</Text>
        </TouchableOpacity>

        <View style={styles.rowItemSeparator} />

        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="bell-outline" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Reminders & Notifications</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        <View style={styles.rowItemSeparator} />

        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7}>
          <View style={styles.rowItemLeft}>
            <Icon name="cog-outline" size={22} color="#555555" style={styles.rowIconSpacer} />
            <Text style={styles.rowItemLabel}>Account Settings</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#BBBBBB" />
        </TouchableOpacity>

        <View style={styles.rowItemSeparator} />

        <TouchableOpacity style={styles.listRowItem} activeOpacity={0.7} onPress={handleLogout}>
          <View style={styles.rowItemLeft}>
            <Icon name="logout" size={22} color="#FF3B30" style={styles.rowIconSpacer} />
            <Text style={[styles.rowItemLabel, { color: '#FF3B30', fontWeight: '600' }]}>Log Out</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* PREMIUM PROMOTION BANNER BAR */}
      <TouchableOpacity style={styles.mfpPremiumBox} activeOpacity={0.9}>
        <View style={styles.premiumTextTrack}>
          <Text style={styles.premiumTitle}>Get Premium Features</Text>
          <Text style={styles.premiumDesc}>Unlock Custom Macros, Ad-Free logging, and analytical workout reporting graphs.</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#FFFFFF" />
      </TouchableOpacity>

    </ScrollView>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userBanner: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 20,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D5DB",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
  },
  userMeta: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  subText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  editBadge: {
    borderWidth: 1,
    borderColor: "#0066EE",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0066EE",
    letterSpacing: 0.5,
  },
  statsSummaryGrid: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "space-around",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D1D5DB",
    marginBottom: 12,
  },
  summaryColumn: {
    alignItems: "center",
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  dividerLine: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginLeft: 16,
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  rowBlockGroup: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
  },
  rowItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIconSpacer: {
    marginRight: 14,
  },
  rowItemLabel: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "500",
  },
  rowRightValue: {
    fontSize: 14,
    color: "#0066EE",
    fontWeight: "600",
  },
  rowItemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E2E8F0",
    marginLeft: 54,
  },
  mfpPremiumBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2E67",
    marginHorizontal: 16,
    marginTop: 28,
    padding: 16,
    borderRadius: 8,
  },
  premiumTextTrack: {
    flex: 1,
    marginRight: 8,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  premiumDesc: {
    fontSize: 12,
    color: "#C9D3EE",
    marginTop: 4,
    lineHeight: 16,
  },
});

export default ProfilePage;