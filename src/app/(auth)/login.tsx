import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '@/contexts/auth-context';
import { ApiError, loginAccount } from '@/services/auth-api';

const colors = {
  ink: '#171321',
  muted: '#898594',
  pink: '#d82f78',
  border: '#ece9ef',
};

export default function LoginScreen() {
  const { saveAccessToken } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const continueToHome = async () => {
    if (isSubmitting) {
      return;
    }

    if (!phoneNumber.trim() || !password) {
      setError('Enter your phone number and password to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await loginAccount({
        phoneNumber: phoneNumber.trim(),
        password,
      });
      await saveAccessToken(result.token);
      router.replace('/(tabs)');
    } catch (requestError: unknown) {
      if (
        requestError instanceof ApiError &&
        requestError.code === 'INVALID_CREDENTIALS'
      ) {
        setError('Phone number or password is incorrect.');
      } else if (requestError instanceof TypeError) {
        setError('Could not connect to the server. Check your network and Gateway URL.');
      } else if (requestError instanceof Error) {
        setError(requestError.message);
      } else {
        setError('Unable to log in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                accessibilityLabel="Phone number"
                autoCapitalize="none"
                autoComplete="tel"
                autoCorrect={false}
                keyboardType="phone-pad"
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#b9b5c0"
                returnKeyType="next"
                style={styles.input}
                value={phoneNumber}
              />
            </View>

            <View>
              <Text style={styles.label}>PASSWORD</Text>
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
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.loginButton,
              (pressed || isSubmitting) && styles.pressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
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
