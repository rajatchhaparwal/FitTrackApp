import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfilePage = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* ─── MYFITNESSPAL USER BANNER TOP SECTION ─── */}
      <View style={styles.userBanner}>
        <Image
          source={{ uri:"" }}
          style={styles.profileImage}
        />
        <View style={styles.userMeta}>
          <Text style={styles.username}>Rajat</Text>
          <Text style={styles.subText}></Text>
        </View>
        <TouchableOpacity style={styles.editBadge} activeOpacity={0.7}>
          <Text style={styles.editBadgeText}>EDIT</Text>
        </TouchableOpacity>
      </View>

      {/* ─── FLAT STATS METRICS SUMMARY HEADER ─── */}
      <View style={styles.statsSummaryGrid}>
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>72.0</Text>
          <Text style={styles.summaryLabel}>CURRENT (KG)</Text>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.summaryColumn}>
          <Text style={styles.summaryValue}>78.0</Text>
          <Text style={styles.summaryLabel}>GOAL (KG)</Text>
        </View>
        <View style={styles.dividerLine} />
        <View style={styles.summaryColumn}>
          <Text style={[styles.summaryValue, { color: '#0066EE' }]}>124</Text>
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
          <Text style={styles.rowRightValue}>Gain Muscle</Text>
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
      </View>

      {/* PREMIUM PROMOTION BANNER BAR MATCHING MFP PRO STYLE */}
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
    backgroundColor: "#F2F4F7", // MFP light silver-gray canvas backdrop
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  summaryLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 3,
    letterSpacing: 0.3,
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
    borderVerticalWidth: StyleSheet.hairlineWidth,
    borderColor: "#D1D5DB",
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
    marginLeft: 54, // Perfectly aligns directly past the row icons boundary line
  },
  mfpPremiumBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2E67", // Signature MFP dark primary option banner color overlay
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