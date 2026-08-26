import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  Modal,
  Platform,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../../UserContext';
import { useNavigation } from '@react-navigation/native';

const BADGES = [
  { id: 'streak_3', title: 'Streak Starter', days: 3, icon: 'fire', color: '#FF9800', description: 'Maintain a streak for 3 days' },
  { id: 'streak_7', title: 'Consistency Builder', days: 7, icon: 'medal-outline', color: '#4CAF50', description: 'Maintain a streak for 7 days' },
  { id: 'streak_15', title: 'Habit Former', days: 15, icon: 'trophy-outline', color: '#00BCD4', description: 'Maintain a streak for 15 days' },
  { id: 'streak_30', title: 'Fitness Devotee', days: 30, icon: 'star-outline', color: '#9C27B0', description: 'Maintain a streak for 30 days' },
  { id: 'streak_50', title: 'Elite Performer', days: 50, icon: 'crown-outline', color: '#E91E63', description: 'Maintain a streak for 50 days' },
  { id: 'streak_100', title: 'God Mode', days: 100, icon: 'lightning-bolt-outline', color: '#FFC107', description: 'Maintain a streak for 100 days' }
];

const UserStreak = () => {
  const navigation = useNavigation();
  const { userData } = useUser();
  const currentStreak = userData?.stats?.current_streak_days || 0;
  
  const [unlockedBadgeToShow, setUnlockedBadgeToShow] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedShareBadge, setSelectedShareBadge] = useState(null);

  // Find next milestone
  const nextBadge = BADGES.find(b => currentStreak < b.days) || BADGES[BADGES.length - 1];
  const isAllUnlocked = currentStreak >= BADGES[BADGES.length - 1].days;
  const nextMilestone = nextBadge.days;
  const progressPercent = isAllUnlocked ? 100 : Math.min((currentStreak / nextMilestone) * 100, 100);

  // Check for badge unlocks on load
  useEffect(() => {
    const checkBadgeUnlocks = async () => {
      try {
        const acknowledgedStr = await AsyncStorage.getItem('acknowledged_streak_badges');
        const acknowledged = acknowledgedStr ? JSON.parse(acknowledgedStr) : [];
        
        // Find badges user qualifies for but hasn't acknowledged yet
        const newlyUnlocked = BADGES.find(
          badge => currentStreak >= badge.days && !acknowledged.includes(badge.id)
        );

        if (newlyUnlocked) {
          setUnlockedBadgeToShow(newlyUnlocked);
          // Auto acknowledge it
          const updated = [...acknowledged, newlyUnlocked.id];
          await AsyncStorage.setItem('acknowledged_streak_badges', JSON.stringify(updated));
        }
      } catch (err) {
        console.log("Error checking badge unlocks:", err);
      }
    };
    checkBadgeUnlocks();
  }, [currentStreak]);

  const handleShare = async (badge, platform = 'system') => {
    const shareText = `🔥 MyFitFly Streak! I have maintained a ${currentStreak}-Day Workout Streak and unlocked the "${badge.title}" badge! Join me on my fitness journey! 💪🏋️‍♀️`;
    
    try {
      if (platform === 'whatsapp') {
        const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // Fallback to Web WhatsApp or System Share
          const webUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
          await Linking.openURL(webUrl);
        }
      } else if (platform === 'instagram') {
        // System share is recommended for Instagram stories
        await Share.share({
          message: shareText,
          title: 'MyFitFly Streak Achievement',
        });
      } else {
        // System Share
        await Share.share({
          message: shareText,
          title: 'MyFitFly Streak Achievement',
        });
      }
    } catch (error) {
      console.log('Share error:', error.message);
    }
  };

  const openShareSheet = (badge) => {
    setSelectedShareBadge(badge);
    setShowShareModal(true);
  };

  const getWeekDays = () => {
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sun-Sat to Mon-Sun (0-6)
    
    return labels.map((label, idx) => {
      let status = 'upcoming';
      if (idx < todayIndex) {
        status = 'completed'; // Assuming completed for demonstration of consistency
      } else if (idx === todayIndex) {
        status = 'today';
      }
      return { day: label, status };
    });
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Streak & Achievements</Text>
        </View>

        {/* Hero Streak Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <MaterialCommunityIcons name="fire" size={100} color="#FF5722" />
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>DAYS STREAK</Text>
          <Text style={styles.motivationalText}>
            {currentStreak === 0 
              ? "Start workout today to begin your streak! 🚀" 
              : `🔥 Awesome! Keep the momentum going!`}
          </Text>
        </View>

        {/* Weekly Consistency Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>This Week's Activity</Text>
          <View style={styles.weekContainer}>
            {weekDays.map((item, index) => (
              <View key={index} style={styles.dayCol}>
                <Text style={styles.dayText}>{item.day}</Text>
                <View style={[
                  styles.circle,
                  item.status === 'completed' && styles.circleCompleted,
                  item.status === 'today' && styles.circleToday,
                ]}>
                  {item.status === 'completed' && <Ionicons name="checkmark" size={18} color="#FFF" />}
                  {item.status === 'today' && <MaterialCommunityIcons name="fire" size={20} color="#FF5722" />}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Milestone Progress */}
        {!isAllUnlocked && (
          <View style={styles.sectionCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.milestoneGoalTitle}>Next Milestone: {nextBadge.title}</Text>
                <Text style={styles.milestoneGoalSub}>{nextBadge.days} days needed</Text>
              </View>
              <Text style={styles.progressText}>{currentStreak}/{nextBadge.days}</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>
        )}

        {/* Badges Section */}
        <Text style={styles.categoryHeaderTitle}>Badges & Milestones</Text>
        
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => {
            const isUnlocked = currentStreak >= badge.days;
            return (
              <View key={badge.id} style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}>
                <View style={[styles.badgeIconCircle, { backgroundColor: isUnlocked ? `${badge.color}15` : '#F1F5F9' }]}>
                  <MaterialCommunityIcons 
                    name={isUnlocked ? badge.icon.replace('-outline', '') : badge.icon} 
                    size={38} 
                    color={isUnlocked ? badge.color : '#94A3B8'} 
                  />
                </View>
                <Text style={[styles.badgeTitle, !isUnlocked && styles.badgeTitleLocked]}>
                  {badge.title}
                </Text>
                <Text style={styles.badgeDays}>
                  {badge.days} Days
                </Text>
                
                {isUnlocked ? (
                  <TouchableOpacity 
                    style={styles.shareButton} 
                    onPress={() => openShareSheet(badge)}
                  >
                    <Ionicons name="share-social-outline" size={14} color="#0066EE" />
                    <Text style={styles.shareBtnText}>Share</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
                    <Text style={styles.lockBadgeText}>Locked</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Workout Button */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => navigation.navigate('WorkoutTracker')}
        >
          <Text style={styles.ctaText}>Log Workout to Save Streak</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Share Badge Options Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowShareModal(false)}
        >
          <View style={styles.shareSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.shareSheetTitle}>Share Achievement</Text>
            <Text style={styles.shareSheetSub}>Show off your "{selectedShareBadge?.title}" badge with friends!</Text>

            <View style={styles.shareOptionsRow}>
              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  if (selectedShareBadge) handleShare(selectedShareBadge, 'whatsapp');
                  setShowShareModal(false);
                }}
              >
                <View style={[styles.shareIconBg, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={30} color="#25D366" />
                </View>
                <Text style={styles.shareOptionLabel}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  if (selectedShareBadge) handleShare(selectedShareBadge, 'instagram');
                  setShowShareModal(false);
                }}
              >
                <View style={[styles.shareIconBg, { backgroundColor: '#FDF2F8' }]}>
                  <MaterialCommunityIcons name="instagram" size={30} color="#E1306C" />
                </View>
                <Text style={styles.shareOptionLabel}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOptionItem}
                onPress={() => {
                  if (selectedShareBadge) handleShare(selectedShareBadge, 'system');
                  setShowShareModal(false);
                }}
              >
                <View style={[styles.shareIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="share-social" size={28} color="#0284C7" />
                </View>
                <Text style={styles.shareOptionLabel}>System Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.closeSheetButton}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.closeSheetText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confetti / Congratulatory Badge Unlock Modal Popup */}
      <Modal
        visible={unlockedBadgeToShow !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUnlockedBadgeToShow(null)}
      >
        <View style={styles.unlockOverlay}>
          <View style={styles.unlockCard}>
            <Text style={styles.unlockSparkle}>🎉 CONGRATULATIONS! 🎉</Text>
            <Text style={styles.unlockHeader}>Badge Unlocked!</Text>
            
            <View style={[styles.largeBadgeCircle, { backgroundColor: `${unlockedBadgeToShow?.color}15` }]}>
              <MaterialCommunityIcons 
                name={unlockedBadgeToShow?.icon.replace('-outline', '') || 'fire'} 
                size={70} 
                color={unlockedBadgeToShow?.color || '#FF5722'} 
              />
            </View>

            <Text style={styles.unlockBadgeTitle}>{unlockedBadgeToShow?.title}</Text>
            <Text style={styles.unlockBadgeDesc}>{unlockedBadgeToShow?.description}</Text>

            <View style={styles.unlockShareBtnRow}>
              <TouchableOpacity 
                style={styles.unlockShareButton}
                onPress={() => {
                  const badge = unlockedBadgeToShow;
                  setUnlockedBadgeToShow(null);
                  openShareSheet(badge);
                }}
              >
                <Text style={styles.unlockShareBtnText}>Share Achievement</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.unlockCloseButton}
                onPress={() => setUnlockedBadgeToShow(null)}
              >
                <Text style={styles.unlockCloseText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: Platform.OS === 'ios' ? 10 : 0
  },
  backButton: {
    padding: 6,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    color: '#0F172A',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    padding: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden'
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF572210',
    zIndex: -1
  },
  streakNumber: {
    color: '#0F172A',
    fontSize: 60,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '900',
    marginTop: 4
  },
  streakLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: -4
  },
  motivationalText: {
    color: '#FF5722',
    fontSize: 14,
    marginTop: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium'
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    marginBottom: 14
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  dayCol: {
    alignItems: 'center'
  },
  dayText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  circleCompleted: {
    backgroundColor: '#4CAF50'
  },
  circleToday: {
    borderWidth: 2,
    borderColor: '#FF5722',
    backgroundColor: '#FFFFFF'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  milestoneGoalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A'
  },
  milestoneGoalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1
  },
  progressText: {
    color: '#0066EE',
    fontWeight: '800',
    fontSize: 15
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0066EE',
    borderRadius: 4
  },
  categoryHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 12
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.75
  },
  badgeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center'
  },
  badgeTitleLocked: {
    color: '#64748B'
  },
  badgeDays: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF1FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#0066EE',
    fontSize: 12,
    fontWeight: '700'
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  ctaButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  shareSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: 16,
  },
  shareSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  shareSheetSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  shareOptionItem: {
    alignItems: 'center',
  },
  shareIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  closeSheetButton: {
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  closeSheetText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  unlockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  unlockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unlockSparkle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF9800',
    letterSpacing: 2,
  },
  unlockHeader: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
    marginBottom: 20,
  },
  largeBadgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  unlockBadgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  unlockBadgeDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  unlockShareBtnRow: {
    width: '100%',
    gap: 10,
  },
  unlockShareButton: {
    backgroundColor: '#0066EE',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  unlockShareBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  unlockCloseButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  unlockCloseText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default UserStreak;