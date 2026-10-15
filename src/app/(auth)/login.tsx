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
  surface: '#fff7fb',
};

export default function LoginScreen() {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const continueToHome = () => {
    if (!identity.trim() || !password) {
      setError('Enter your email or phone number and password to continue.');
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
        >
          <BrandMark />

          <View style={styles.intro}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Login to discover deals and split purchases with people nearby.
            </Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>EMAIL OR PHONE NUMBER</Text>
              <TextInput
                accessibilityLabel="Email or phone number"
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setIdentity}
                placeholder="you@example.com"
                placeholderTextColor="#b9b5c0"
                returnKeyType="next"
                style={styles.input}
                value={identity}
              />
            </View>

            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </View>
              <TextInput
                accessibilityLabel="Password"
                autoComplete="current-password"
                onChangeText={setPassword}
                onSubmitEditing={continueToHome}
                placeholder="Enter your password"
                placeholderTextColor="#b9b5c0"
                returnKeyType="go"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={continueToHome}
            style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.divider} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setError('Google sign-in is not connected yet.')}
            style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
          >
            <View style={styles.googleMark}>
              <Text style={styles.googleMarkText}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => router.push('/(auth)/signup')}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>
          <Text style={styles.demoNote}>Demo screen — sign-in is not connected to a server.</Text>
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
    paddingTop: 34,
    paddingBottom: 24,
  },
  intro: {
    marginTop: 48,
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
    gap: 20,
    marginTop: 30,
  },
  label: {
    color: '#484451',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 9,
  },
  passwordLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forgotPassword: {
    color: colors.pink,
    fontSize: 11,
    fontWeight: '800',
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
  error: {
    color: '#b42354',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: colors.pink,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 54,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 23,
  },
  divider: {
    backgroundColor: '#f0edf2',
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    color: '#aaa6b1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  googleButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 52,
  },
  googleMark: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  googleMarkText: {
    color: colors.pink,
    fontSize: 13,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#484451',
    fontSize: 13,
    fontWeight: '800',
  },
  demoNote: {
    color: '#aaa6b1',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: 26,
  },
  footerText: {
    color: '#716c79',
    fontSize: 12,
    fontWeight: '600',
  },
  signupLink: {
    color: colors.pink,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.82,
  },
});
