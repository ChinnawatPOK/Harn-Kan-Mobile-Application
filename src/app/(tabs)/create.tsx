import { useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

const categories = ['Food', 'Drink'] as const;
const expirationOptions = ['30 minutes', '1 hour', '2 hours'] as const;

export default function CreateTab() {
  const router = useRouter();
  const [people, setPeople] = useState(4);
  const [name, setName] = useState('Family-sized pizza bundle');
  const [price, setPrice] = useState('760');
  const [category, setCategory] = useState<(typeof categories)[number]>('Food');
  const [pickupLocation, setPickupLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [details, setDetails] = useState('');
  const [expiresIn, setExpiresIn] =
    useState<(typeof expirationOptions)[number]>('30 minutes');
  const [showExpirationOptions, setShowExpirationOptions] = useState(false);
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const numericPrice = Number(price);
  const perPerson =
    price && people && Number.isFinite(numericPrice)
      ? Math.ceil(numericPrice / people)
      : 0;
  const canCreateDeal = Boolean(name.trim() && numericPrice > 0);

  const confirmCreateDeal = () => {
    if (!canCreateDeal) return;
    const params = new URLSearchParams({
      name: name.trim(),
      category,
      price,
      people: String(people),
      expiresIn,
      pickupLocation: pickupLocation.trim(),
      details: details.trim(),
    });
    setShowCreateConfirmation(false);
    router.push(`/deal/1?${params.toString()}` as Href);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <Text style={styles.topBarTitle}>Create a deal</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.content}>
          <View style={styles.intro}>
            <Text style={styles.subtitle}>Start a group purchase</Text>
            <Text style={styles.title}>What are we sharing?</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DEAL NAME</Text>
            <View
              style={[
                styles.inputShell,
                focusedField === 'name' && styles.inputShellFocused,
              ]}
            >
              <Icon color="#db2777" name="bag" size={20} />
              <TextInput
                accessibilityLabel="Deal name"
                autoCapitalize="sentences"
                onBlur={() => setFocusedField(null)}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                placeholder="e.g. Pizza bundle"
                placeholderTextColor="#cbd5e1"
                returnKeyType="next"
                style={styles.textInput}
                value={name}
              />
              {name.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear deal name"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setName('')}
                  style={styles.clearButton}
                >
                  <Icon color="#cbd5e1" name="close" size={17} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <ScrollView
              contentContainerStyle={styles.categoryList}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item}
                    onPress={() => setCategory(item)}
                    style={[
                      styles.categoryChip,
                      selected
                        ? styles.categoryChipSelected
                        : styles.categoryChipUnselected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PICKUP LOCATION</Text>
            <View
              style={[
                styles.inputShell,
                focusedField === 'location' && styles.inputShellFocused,
              ]}
            >
              <TextInput
                accessibilityLabel="Pickup location"
                onBlur={() => setFocusedField(null)}
                onChangeText={(value) => {
                  setPickupLocation(value);
                  setLocationError('');
                }}
                onFocus={() => setFocusedField('location')}
                placeholder="Enter pickup location"
                placeholderTextColor="#cbd5e1"
                returnKeyType="next"
                style={styles.locationInput}
                value={pickupLocation}
              />
              <Pressable
                accessibilityLabel="Use current location"
                accessibilityRole="button"
                onPress={() =>
                  setLocationError(
                    'Current location is not available. Please enter it manually.',
                  )
                }
                style={styles.locationAction}
              >
                <Icon color="#db2777" name="location" size={15} />
                <Text style={styles.locationActionText}>Use current location</Text>
              </Pressable>
            </View>
            {locationError ? (
              <Text accessibilityRole="alert" style={styles.locationError}>
                {locationError}
              </Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DEAL DETAILS (OPTIONAL)</Text>
            <TextInput
              accessibilityLabel="Deal details"
              multiline
              numberOfLines={3}
              onBlur={() => setFocusedField(null)}
              onChangeText={setDetails}
              onFocus={() => setFocusedField('details')}
              placeholder="Add pickup location or specific menu notes"
              placeholderTextColor="#cbd5e1"
              style={[
                styles.detailsInput,
                focusedField === 'details' && styles.inputFocused,
              ]}
              textAlignVertical="top"
              value={details}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>TOTAL PRICE (฿)</Text>
            <View
              style={[
                styles.inputShell,
                focusedField === 'price' && styles.inputShellFocused,
              ]}
            >
              <Text style={styles.currencySymbol}>฿</Text>
              <TextInput
                accessibilityLabel="Total price in Thai baht"
                keyboardType="number-pad"
                onBlur={() => setFocusedField(null)}
                onChangeText={(value) => setPrice(value.replace(/\D/g, ''))}
                onFocus={() => setFocusedField('price')}
                returnKeyType="done"
                style={styles.priceInput}
                value={price}
              />
              <Text style={styles.currencyCode}>THB</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>NUMBER OF PARTICIPANTS</Text>
            <View style={styles.participantsCard}>
              <Pressable
                accessibilityLabel="Remove participant"
                accessibilityRole="button"
                accessibilityState={{ disabled: people <= 2 }}
                disabled={people <= 2}
                onPress={() => setPeople((value) => Math.max(2, value - 1))}
                style={[
                  styles.participantButton,
                  styles.removeParticipantButton,
                  people <= 2 && styles.disabledButton,
                ]}
              >
                <Icon color="#334155" name="minus" size={18} />
              </Pressable>
              <View style={styles.participantCount}>
                <Text style={styles.participantNumber}>{people}</Text>
                <Text style={styles.participantCaption}>PEOPLE</Text>
              </View>
              <Pressable
                accessibilityLabel="Add participant"
                accessibilityRole="button"
                accessibilityState={{ disabled: people >= 4 }}
                disabled={people >= 4}
                onPress={() => setPeople((value) => Math.min(4, value + 1))}
                style={[
                  styles.participantButton,
                  styles.addParticipantButton,
                  people >= 4 && styles.disabledButton,
                ]}
              >
                <Icon color="#be185d" name="plus" size={18} />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>DEAL EXPIRES IN</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Deal expires in ${expiresIn}. Change expiration`}
              onPress={() => setShowExpirationOptions(true)}
              style={styles.expirationButton}
            >
              <Text style={styles.expirationText}>{expiresIn}</Text>
              <View style={styles.rotatedChevron}>
                <Icon color="#db2777" name="chevron" size={17} />
              </View>
            </Pressable>
          </View>

          <View style={styles.splitCard}>
            <View style={styles.splitIcon}>
              <Icon color="#fff" name="people" size={20} />
            </View>
            <View>
              <Text style={styles.splitCaption}>EACH PERSON PAYS</Text>
              <Text style={styles.splitAmount}>
                ฿{perPerson.toLocaleString()}
              </Text>
            </View>
            <Text style={styles.splitBadge}>Even split</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canCreateDeal}
            onPress={() => setShowCreateConfirmation(true)}
            style={({ pressed }) => [
              styles.createButton,
              (!canCreateDeal || pressed) && styles.createButtonDimmed,
              pressed && styles.createButtonPressed,
            ]}
          >
            <Text style={styles.createButtonText}>Create Deal</Text>
            <Icon color="#fff" name="arrow" size={18} />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowCreateConfirmation(false)}
        transparent
        visible={showCreateConfirmation}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close create deal confirmation"
            accessibilityRole="button"
            onPress={() => setShowCreateConfirmation(false)}
            style={styles.modalBackdrop}
          />
          <View accessibilityViewIsModal style={styles.confirmationCard}>
            <Text style={styles.confirmationTitle}>Confirm your deal</Text>
            <Text style={styles.confirmationSubtitle}>
              Check the details before creating this deal.
            </Text>
            <ScrollView
              contentContainerStyle={styles.confirmationSummary}
              showsVerticalScrollIndicator={false}
              style={styles.confirmationSummaryScroll}
            >
              <SummaryRow label="Deal name" value={name.trim() || '—'} />
              <SummaryRow label="Category" value={category} />
              <SummaryRow
                label="Pickup location"
                value={pickupLocation.trim() || 'Not specified'}
              />
              <SummaryRow
                label="Total price"
                value={`฿${numericPrice.toLocaleString()}`}
              />
              <SummaryRow label="Participants" value={`${people} people`} />
              <SummaryRow
                label="Each person pays"
                value={`฿${perPerson.toLocaleString()}`}
              />
              <SummaryRow label="Expires in" value={expiresIn} />
              {details.trim() ? (
                <SummaryRow label="Details" value={details.trim()} />
              ) : null}
            </ScrollView>
            <Pressable
              accessibilityRole="button"
              disabled={!canCreateDeal}
              onPress={confirmCreateDeal}
              style={[
                styles.confirmCreateButton,
                !canCreateDeal && styles.confirmCreateButtonDisabled,
              ]}
            >
              <Text style={styles.confirmCreateText}>Confirm & Create Deal</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowCreateConfirmation(false)}
              style={styles.editDetailsButton}
            >
              <Text style={styles.editDetailsText}>Back to edit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setShowExpirationOptions(false)}
        transparent
        visible={showExpirationOptions}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close expiration options"
            accessibilityRole="button"
            onPress={() => setShowExpirationOptions(false)}
            style={styles.modalBackdrop}
          />
          <View accessibilityViewIsModal style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>Deal expires in</Text>
            {expirationOptions.map((option) => {
              const selected = expiresIn === option;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={option}
                  onPress={() => {
                    setExpiresIn(option);
                    setShowExpirationOptions(false);
                  }}
                  style={[
                    styles.expirationOption,
                    selected && styles.expirationOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.expirationOptionText,
                      selected && styles.expirationOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selected ? <Text style={styles.selectedCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Icon({
  color,
  name,
  size,
}: {
  color: string;
  name:
    | 'arrow'
    | 'bag'
    | 'chevron'
    | 'close'
    | 'location'
    | 'minus'
    | 'people'
    | 'plus';
  size: number;
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
    >
      {name === 'arrow' ? <Path d="M5 12h14m-5-5 5 5-5 5" /> : null}
      {name === 'bag' ? (
        <>
          <Path d="M6 8h12l-1 12H7L6 8Z" />
          <Path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </>
      ) : null}
      {name === 'chevron' ? <Path d="m9 18 6-6-6-6" /> : null}
      {name === 'close' ? <Path d="M6 6l12 12M18 6 6 18" /> : null}
      {name === 'location' ? (
        <>
          <Path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <Circle cx="12" cy="10" r="2.5" />
        </>
      ) : null}
      {name === 'minus' ? <Path d="M5 12h14" /> : null}
      {name === 'people' ? (
        <>
          <Circle cx="9" cy="8" r="3" />
          <Path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1" />
        </>
      ) : null}
      {name === 'plus' ? <Path d="M12 5v14M5 12h14" /> : null}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  intro: {
    marginBottom: 28,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#020617',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },
  inputShell: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  inputShellFocused: {
    borderColor: '#f472b6',
  },
  textInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  categoryList: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#be185d',
    elevation: 3,
    shadowColor: '#fce7f3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  categoryChipUnselected: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  categoryText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  locationInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 0,
    paddingRight: 8,
    paddingVertical: 16,
  },
  locationAction: {
    alignItems: 'center',
    borderLeftColor: '#fce7f3',
    borderLeftWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingLeft: 10,
    paddingVertical: 8,
  },
  locationActionText: {
    color: '#db2777',
    fontSize: 10,
    fontWeight: '800',
  },
  locationError: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  detailsInput: {
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 96,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: '#f472b6',
  },
  currencySymbol: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 12,
  },
  priceInput: {
    color: '#0f172a',
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    paddingVertical: 16,
  },
  currencyCode: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  participantsCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  participantButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  removeParticipantButton: {
    backgroundColor: '#f1f5f9',
  },
  addParticipantButton: {
    backgroundColor: '#fce7f3',
  },
  disabledButton: {
    opacity: 0.4,
  },
  participantCount: {
    alignItems: 'center',
  },
  participantNumber: {
    color: '#020617',
    fontSize: 24,
    fontWeight: '800',
  },
  participantCaption: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  expirationButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  expirationText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
  rotatedChevron: {
    transform: [{ rotate: '90deg' }],
  },
  splitCard: {
    alignItems: 'center',
    backgroundColor: '#fdf2f8',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    padding: 16,
  },
  splitIcon: {
    alignItems: 'center',
    backgroundColor: '#db2777',
    borderRadius: 24,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  splitCaption: {
    color: '#ec4899',
    fontSize: 12,
    fontWeight: '700',
  },
  splitAmount: {
    color: '#500724',
    fontSize: 20,
    fontWeight: '800',
  },
  splitBadge: {
    backgroundColor: '#fff',
    borderRadius: 999,
    color: '#db2777',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 'auto',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#be185d',
    borderRadius: 16,
    elevation: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
    shadowColor: '#fbcfe8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  createButtonDimmed: {
    opacity: 0.55,
  },
  createButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(2, 6, 23, 0.3)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
  },
  optionsTitle: {
    color: '#020617',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  confirmationCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    elevation: 16,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    width: '100%',
  },
  confirmationTitle: {
    color: '#020617',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  confirmationSummary: {
    backgroundColor: '#fff7fb',
    borderRadius: 16,
    gap: 12,
    padding: 14,
  },
  confirmationSummaryScroll: {
    flexGrow: 0,
    marginTop: 18,
  },
  summaryRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: '#64748b',
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#0f172a',
    flex: 1.3,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },
  confirmCreateButton: {
    alignItems: 'center',
    backgroundColor: '#be185d',
    borderRadius: 16,
    marginTop: 18,
    paddingVertical: 15,
  },
  confirmCreateButtonDisabled: {
    opacity: 0.5,
  },
  confirmCreateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  editDetailsButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
  },
  editDetailsText: {
    color: '#be185d',
    fontSize: 12,
    fontWeight: '800',
  },
  expirationOption: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  expirationOptionSelected: {
    backgroundColor: '#fdf2f8',
  },
  expirationOptionText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  expirationOptionTextSelected: {
    color: '#be185d',
    fontWeight: '800',
  },
  selectedCheck: {
    color: '#be185d',
    fontSize: 16,
    fontWeight: '800',
  },
});

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
