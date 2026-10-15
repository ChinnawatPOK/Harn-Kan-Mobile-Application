import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useProfile } from '@/contexts/profile-context';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const goBack = () => router.back();
  const saveChanges = () => {
    updateProfile({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim() });
    setShowSaveConfirmation(false);
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              accessibilityLabel="Go back to profile"
              accessibilityRole="button"
              hitSlop={8}
              onPress={goBack}
              style={styles.backButton}
            >
              <Svg
                fill="none"
                height={20}
                stroke="#0f172a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                width={20}
              >
                <Path d="m15 18-6-6 6-6" />
              </Svg>
            </Pressable>
            <Text style={styles.topBarTitle}>Edit Profile</Text>
            <View style={styles.topBarSpacer} />
          </View>

          <View style={styles.formContent}>
            <View style={styles.avatarSection}>
              <Pressable
                accessibilityLabel="Change profile photo"
                accessibilityRole="button"
                style={styles.avatarButton}
              >
                <View style={styles.avatar}>
                    <Text style={styles.avatarLabel}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.cameraBadge}>
                  <Svg
                    fill="none"
                    height={16}
                    stroke="#fff"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    viewBox="0 0 24 24"
                    width={16}
                  >
                    <Path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
                    <Circle cx="12" cy="14" r="3.5" />
                  </Svg>
                </View>
              </Pressable>
            </View>

            <View style={styles.form}>
              <ProfileField
                autoComplete="name"
                label="FULL NAME"
                onChangeText={setFullName}
                returnKeyType="next"
                value={fullName}
              />
              <ProfileField
                autoComplete="tel"
                keyboardType="phone-pad"
                label="PHONE NUMBER"
                onChangeText={setPhone}
                returnKeyType="next"
                value={phone}
              />
              <ProfileField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                label="EMAIL ADDRESS"
                onChangeText={setEmail}
                returnKeyType="done"
                value={email}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowSaveConfirmation(true)}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowDeleteModal(true)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowSaveConfirmation(false)}
        transparent
        visible={showSaveConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <Text style={styles.saveModalTitle}>Save Changes?</Text>
            <Text style={styles.modalMessage}>
              Save the updated name, phone number, and email address to your profile?
            </Text>
            <View style={styles.saveSummary}>
              <ProfileSummaryRow label="Name" value={fullName.trim() || '—'} />
              <ProfileSummaryRow label="Phone" value={phone.trim() || '—'} />
              <ProfileSummaryRow label="Email" value={email.trim() || '—'} />
            </View>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowSaveConfirmation(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={saveChanges}
                style={styles.confirmSaveButton}
              >
                <Text style={styles.confirmSaveText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
        transparent
        visible={showDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View
            accessibilityViewIsModal
            style={styles.modalCard}
          >
            <View style={styles.warningIcon}>
              <Svg
                fill="none"
                height={26}
                stroke="#dc2626"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                width={26}
              >
                <Path d="M10.3 4.4 2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 4.4a2 2 0 0 0-3.4 0Z" />
                <Path d="M12 9v4M12 17h.01" />
              </Svg>
            </View>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowDeleteModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.confirmDeleteButton}
              >
                <Text style={styles.confirmDeleteText}>Yes, Delete</Text>
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

function ProfileSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.saveSummaryRow}>
      <Text style={styles.saveSummaryLabel}>{label}</Text>
      <Text selectable style={styles.saveSummaryValue}>
        {value}
      </Text>
    </View>
  );
}

type ProfileFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete: 'name' | 'tel' | 'email';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  label: string;
  onChangeText: (value: string) => void;
  returnKeyType: 'next' | 'done';
  value: string;
};

function ProfileField({
  autoCapitalize,
  autoComplete,
  keyboardType = 'default',
  label,
  onChangeText,
  returnKeyType,
  value,
}: ProfileFieldProps) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        autoCorrect={false}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        returnKeyType={returnKeyType}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 999,
    elevation: 2,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: 40,
  },
  topBarTitle: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  topBarSpacer: {
    minWidth: 40,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarButton: {
    borderRadius: 56,
    position: 'relative',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#fbcfe8',
    borderColor: '#fff',
    borderRadius: 56,
    borderWidth: 2,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  avatarLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
  },
  cameraBadge: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 4,
    bottom: 4,
    elevation: 4,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    width: 36,
  },
  form: {
    gap: 20,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 16,
    elevation: 8,
    paddingVertical: 16,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  deleteButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 12,
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
  warningIcon: {
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  modalTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 20,
    textAlign: 'center',
  },
  saveModalTitle: {
    color: '#020617',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 4,
    textAlign: 'center',
  },
  saveSummary: {
    alignSelf: 'stretch',
    backgroundColor: '#fff7fb',
    borderRadius: 16,
    gap: 10,
    marginTop: 18,
    padding: 14,
  },
  saveSummaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  saveSummaryLabel: {
    color: '#64748b',
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  saveSummaryValue: {
    color: '#0f172a',
    flex: 1.5,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
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
  confirmDeleteButton: {
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
  confirmSaveButton: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 16,
    elevation: 4,
    flex: 1,
    paddingVertical: 14,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 7,
  },
  confirmSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
