import { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useProfile } from '@/contexts/profile-context';

export default function ProfileTab() {
  const router = useRouter();
  const { profile } = useProfile();
  const [foodAlerts, setFoodAlerts] = useState(true);
  const [drinkAlerts, setDrinkAlerts] = useState(true);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Text style={styles.topBarTitle}>Profile</Text>
          <View style={styles.topBarAction}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/edit-profile' as Href)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.profileCard}>
            <View pointerEvents="none" style={styles.topDecoration} />
            <View pointerEvents="none" style={styles.bottomDecoration} />
            <View style={styles.profileInfo}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarLabel}>
                    {getInitials(profile.fullName)}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Icon color="#4c0519" name="check" size={12} />
                </View>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{profile.fullName}</Text>
                <Text style={styles.memberPhone}>{profile.phone}</Text>
                <Text style={styles.memberEmail}>{profile.email}</Text>
                <View style={styles.rating}>
                  <Icon color="#fcd34d" name="star" size={14} />
                  <Text style={styles.ratingScore}>4.9</Text>
                  <Text style={styles.trustedMember}>· Trusted member</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.notificationSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.bellIcon}>
                <Icon color="#be185d" name="bell" size={17} />
              </View>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
            </View>
            <View style={styles.settingsCard}>
              <NotificationSetting
                description="Notifications for nearby food deals"
                enabled={foodAlerts}
                label="Food"
                onToggle={() => setFoodAlerts((value) => !value)}
              />
              <NotificationSetting
                description="Notifications for nearby drink deals"
                enabled={drinkAlerts}
                label="Drink"
                onToggle={() => setDrinkAlerts((value) => !value)}
                last
              />
            </View>
          </View>

          <Text style={styles.version}>÷ KAN VERSION 1.0</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowLogoutConfirmation(true)}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirmation(false)}
        transparent
        visible={showLogoutConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.logoutConfirmationIcon}>
              <Text style={styles.logoutConfirmationMark}>!</Text>
            </View>
            <Text style={styles.modalTitle}>Log Out?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to log out of your account?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowLogoutConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.confirmLogoutButton}
              >
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function NotificationSetting({
  description,
  enabled,
  label,
  onToggle,
  last = false,
}: {
  description: string;
  enabled: boolean;
  label: string;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingRow, !last && styles.settingRowBorder]}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Toggle ${label} notifications`}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        onPress={onToggle}
        style={[styles.toggle, enabled ? styles.toggleEnabled : styles.toggleDisabled]}
      >
        <View style={[styles.toggleThumb, enabled && styles.toggleThumbEnabled]} />
      </Pressable>
    </View>
  );
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name: 'bell' | 'check' | 'star';
  size: number;
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={name === 'star' ? 1.8 : 2}
      viewBox="0 0 24 24"
      width={size}
    >
      {name === 'bell' ? (
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <Path d="M10 21h4" />
        </>
      ) : null}
      {name === 'check' ? <Path d="m5 12 4 4L19 6" /> : null}
      {name === 'star' ? (
        <Path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
      ) : null}
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff7fb',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 112,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topBarSpacer: {
    minWidth: 40,
  },
  topBarTitle: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  topBarAction: {
    alignItems: 'flex-end',
    minWidth: 40,
  },
  editButton: {
    backgroundColor: '#fdf2f8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  profileCard: {
    backgroundColor: '#be185d',
    borderRadius: 32,
    elevation: 12,
    overflow: 'hidden',
    padding: 24,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  topDecoration: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    borderWidth: 24,
    height: 160,
    position: 'absolute',
    right: -40,
    top: -48,
    width: 160,
  },
  bottomDecoration: {
    backgroundColor: 'rgba(232, 121, 249, 0.1)',
    borderRadius: 999,
    bottom: -64,
    height: 128,
    left: 40,
    position: 'absolute',
    width: 128,
  },
  profileInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#fde68a',
    borderColor: '#fff',
    borderRadius: 40,
    borderWidth: 2,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarLabel: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
  },
  verifiedBadge: {
    alignItems: 'center',
    backgroundColor: '#34d399',
    borderColor: '#be185d',
    borderRadius: 12,
    borderWidth: 2,
    bottom: 0,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 24,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  memberPhone: {
    color: '#fbcfe8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  memberEmail: {
    color: '#fbcfe8',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  rating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  ratingScore: {
    color: '#fcd34d',
    fontSize: 12,
    fontWeight: '800',
  },
  trustedMember: {
    color: '#fbcfe8',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationSection: {
    marginVertical: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  bellIcon: {
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  sectionTitle: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  settingRowBorder: {
    borderBottomColor: '#f1f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingCopy: {
    flex: 1,
  },
  settingLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  settingDescription: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  toggle: {
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    padding: 4,
    width: 48,
  },
  toggleEnabled: {
    backgroundColor: '#be185d',
  },
  toggleDisabled: {
    backgroundColor: '#e2e8f0',
  },
  toggleThumb: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    width: 20,
  },
  toggleThumbEnabled: {
    alignSelf: 'flex-end',
  },
  version: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 32,
    textAlign: 'center',
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#fecaca',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    marginTop: 16,
    paddingVertical: 16,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.3)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 32,
    elevation: 16,
    padding: 24,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    width: '100%',
  },
  logoutConfirmationIcon: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  logoutConfirmationMark: {
    color: '#dc2626',
    fontSize: 28,
    fontWeight: '800',
  },
  modalTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 20,
    textAlign: 'center',
  },
  modalMessage: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmLogoutButton: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    elevation: 4,
    flex: 1,
    paddingVertical: 14,
    shadowColor: '#fee2e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 7,
  },
  confirmLogoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
