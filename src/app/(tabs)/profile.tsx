import { useRouter, type Href } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { getErrorMessage } from '@/api/errors';
import { useAuth } from '@/hooks/useAuth';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/hooks/useNotificationPreferences';
import { useProfile } from '@/hooks/useProfile';
import type { NotificationCategory } from '@/schemas/notification.schema';

export default function ProfileTab() {
  const router = useRouter();
  const { accessToken, isRestoring } = useAuth();
  const profileQuery = useProfile();
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const profile = profileQuery.data;
  const isLoadingProfile =
    isRestoring || Boolean(accessToken && profileQuery.isPending);
  const profileError = profileQuery.error
    ? getErrorMessage(profileQuery.error, 'Unable to load your profile.')
    : '';

  const notificationCategories = preferencesQuery.data?.categories ?? [];
  const isLoadingPreferences = preferencesQuery.isPending;
  const isSavingPreferences = updatePreferences.isPending;
  const preferencesRequestError =
    updatePreferences.error ?? preferencesQuery.error;
  const preferencesError = preferencesRequestError
    ? getErrorMessage(
        preferencesRequestError,
        'Unable to load notification settings. Please try again.',
      )
    : '';

  const toggleNotificationCategory = (category: NotificationCategory) => {
    if (!accessToken || isSavingPreferences) {
      return;
    }

    updatePreferences.mutate(
      notificationCategories.includes(category)
        ? notificationCategories.filter((item) => item !== category)
        : [...notificationCategories, category],
    );
  };

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
                    {profile?.name ? getInitials(profile.name) : '—'}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Icon color="#4c0519" name="check" size={12} />
                </View>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {isLoadingProfile ? 'Loading profile…' : profile?.name || '—'}
                </Text>
                <Text style={styles.memberPhone}>{profile?.phoneNumber || '—'}</Text>
              </View>
            </View>
          </View>
          {profileError ? (
            <Text accessibilityRole="alert" style={styles.preferencesError}>
              {profileError}
            </Text>
          ) : null}

          <View style={styles.notificationSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.bellIcon}>
                <Icon color="#be185d" name="bell" size={17} />
              </View>
              <Text style={styles.sectionTitle}>Notification Settings</Text>
            </View>
            <View style={styles.settingsCard}>
              {isRestoring || (accessToken && isLoadingPreferences) ? (
                <ActivityIndicator
                  accessibilityLabel="Loading notification settings"
                  color="#be185d"
                  style={styles.preferencesLoading}
                />
              ) : null}
              {!isRestoring && !accessToken ? (
                <Text accessibilityRole="alert" style={styles.preferencesError}>
                  Please log in to load notification settings.
                </Text>
              ) : null}
              {preferencesError ? (
                <Text accessibilityRole="alert" style={styles.preferencesError}>
                  {preferencesError}
                </Text>
              ) : null}
              <NotificationSetting
                description="Notifications for nearby food deals"
                disabled={
                  !accessToken ||
                  isLoadingPreferences ||
                  isRestoring ||
                  isSavingPreferences
                }
                enabled={notificationCategories.includes('FOOD')}
                label="Food"
                onToggle={() => toggleNotificationCategory('FOOD')}
              />
              <NotificationSetting
                description="Notifications for nearby drink deals"
                disabled={
                  !accessToken ||
                  isLoadingPreferences ||
                  isRestoring ||
                  isSavingPreferences
                }
                enabled={notificationCategories.includes('DRINK')}
                label="Drink"
                onToggle={() => toggleNotificationCategory('DRINK')}
                last
              />
            </View>
          </View>

          <Text style={styles.version}>÷ KAN VERSION 1.0</Text>
        </View>
      </ScrollView>
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
  disabled = false,
  last = false,
}: {
  description: string;
  enabled: boolean;
  label: string;
  onToggle: () => void;
  disabled?: boolean;
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
        disabled={disabled}
        onPress={onToggle}
        style={[
          styles.toggle,
          enabled ? styles.toggleEnabled : styles.toggleDisabled,
          disabled && styles.toggleDisabledInteraction,
        ]}
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
  name: 'bell' | 'check';
  size: number;
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
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
  preferencesLoading: {
    paddingVertical: 12,
  },
  preferencesError: {
    color: '#b42354',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  toggleDisabledInteraction: {
    opacity: 0.6,
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
