import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, Mail, User } from 'lucide-react-native';
import { AppShell, PageContent } from '../src/slate/AppShell';
import { Text } from '../src/slate/Text';
import { AppButton } from '../src/slate/AppButton';
import { AppInput, Field } from '../src/slate/AppInput';
import { AppSurface } from '../src/slate/AppSurface';
import { Callout } from '../src/slate/atoms';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/tokens';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageContent style={{ flex: 1, justifyContent: 'center' }}>
            {/* Eyebrow + hero */}
            <View style={{ marginTop: 40, marginBottom: 40 }}>
              <Text variant="eyebrow" tone="primary" style={{ marginBottom: 12 }}>
                {isLogin ? 'WELCOME BACK' : 'JOIN THE COLLECTIVE'}
              </Text>
              <Text variant="display" weight="extrabold" style={{ marginBottom: 10 }}>
                Split Bills,{'\n'}
                <Text variant="display" weight="extrabold" style={{ color: colors.primary }}>
                  Not Friendships
                </Text>
              </Text>
              <Text variant="body" tone="muted">
                {isLogin
                  ? 'The seamless way to share experiences.'
                  : 'Sophisticated expense sharing for modern circles.'}
              </Text>
            </View>

            {/* Mode toggle */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.soft,
                borderRadius: 999,
                padding: 4,
                marginBottom: 28,
              }}
            >
              {(['Login', 'Sign Up'] as const).map((label) => {
                const active = isLogin === (label === 'Login');
                return (
                  <View
                    key={label}
                    style={{ flex: 1 }}
                  >
                    <AppButton
                      variant={active ? 'secondary' : 'ghost'}
                      size="sm"
                      onPress={() => {
                        setIsLogin(label === 'Login');
                        setError(null);
                      }}
                      style={{
                        backgroundColor: active ? colors.surfaceSolid : 'transparent',
                      }}
                    >
                      {label}
                    </AppButton>
                  </View>
                );
              })}
            </View>

            {/* Form */}
            <AppSurface variant="solid" style={{ marginBottom: 24 }}>
              {error && (
                <Callout tone="danger" style={{ marginBottom: 20 }}>
                  {error}
                </Callout>
              )}

              <View style={{ gap: 16 }}>
                {!isLogin && (
                  <Field label="Full Name">
                    <AppInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Arjun Sharma"
                      leftIcon={<User size={16} color={colors.mutedSubtle} strokeWidth={2} />}
                      autoCapitalize="words"
                    />
                  </Field>
                )}

                <Field label="Email Address">
                  <AppInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={16} color={colors.mutedSubtle} strokeWidth={2} />}
                  />
                </Field>

                <Field label="Password">
                  <AppInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    leftIcon={<Lock size={16} color={colors.mutedSubtle} strokeWidth={2} />}
                  />
                </Field>

                <AppButton
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  loading={loading}
                  haptic
                  style={{ marginTop: 8 }}
                >
                  {isLogin ? 'Log In' : 'Create Account'}
                </AppButton>
              </View>
            </AppSurface>

            {/* Footer toggle */}
            <View style={{ alignItems: 'center', paddingBottom: 48 }}>
              <AppButton
                variant="ghost"
                size="sm"
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
              >
                {isLogin ? 'New here? Create Account →' : 'Already a member? Log In →'}
              </AppButton>
            </View>
          </PageContent>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}
