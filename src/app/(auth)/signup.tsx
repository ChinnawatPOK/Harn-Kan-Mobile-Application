import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';

const colors = {
  ink: '#171321',
  muted: '#898594',
  pink: '#d82f78',
  border: '#ece9ef',
};

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  const createAccount = () => {
    if (!fullName.trim() || !phone.trim() || !password) {
      setError('Please complete your name, phone number, and password.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms and Conditions to continue.');
      return;
    }

    setError('');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandMark compact />

          <View style={styles.intro}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start sharing deals and purchases with people nearby.
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                accessibilityLabel="Full name"
                autoComplete="name"
                autoCapitalize="words"
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor="#b9b5c0"
                returnKeyType="next"
                style={styles.input}
                value={fullName}
              />
            </View>

            <View>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                accessibilityLabel="Phone number"
                autoComplete="tel"
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="+66 81 234 5678"
                placeholderTextColor="#b9b5c0"
                returnKeyType="next"
                style={styles.input}
                value={phone}
              />
            </View>

            <View>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput
                accessibilityLabel="Password"
                autoComplete="new-password"
                onChangeText={setPassword}
                onSubmitEditing={createAccount}
                placeholder="Create a password"
                placeholderTextColor="#b9b5c0"
                returnKeyType="done"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            onPress={() => setAgreedToTerms((agreed) => !agreed)}
            style={styles.termsRow}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </Pressable>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={createAccount}
            style={({ pressed }) => [styles.signupButton, pressed && styles.pressed]}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace('/(auth)/login')}
              hitSlop={8}
            >
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
          <Text style={styles.demoNote}>Demo screen — account creation is not connected to a server.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  intro: {
    marginTop: 38,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    marginTop: 8,
  },
  form: {
    gap: 18,
    marginTop: 27,
  },
  label: {
    color: '#484451',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 9,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  termsRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    minHeight: 28,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#d8d3dc',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 19,
    justifyContent: 'center',
    width: 19,
  },
  checkboxChecked: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 16,
  },
  termsText: {
    color: '#716c79',
    fontSize: 12,
    fontWeight: '600',
  },
  termsLink: {
    color: colors.pink,
    fontWeight: '800',
    textDecorationLine: 'underline',
    textDecorationColor: '#f2a5c6',
  },
  error: {
    color: '#b42354',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  signupButton: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 54,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 25,
  },
  footerText: {
    color: '#716c79',
    fontSize: 12,
    fontWeight: '600',
  },
  loginLink: {
    color: colors.pink,
    fontSize: 12,
    fontWeight: '800',
  },
  demoNote: {
    color: '#aaa6b1',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
