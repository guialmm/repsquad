import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/auth/auth-context";
import {
  translateAuthError,
  validateEmail,
  validateName,
  validatePassword,
} from "@/auth/validation";
import { AuthField } from "@/components/auth-field";
import { useTheme } from "@/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors, spacing, fontSize, radius } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const nextNameError = validateName(name);
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setSubmitError(null);

    if (nextNameError || nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    try {
      await signUp(name, email, password);
    } catch (error) {
      setSubmitError(translateAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}
    >
      <View style={[styles.content, { gap: spacing.lg }]}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary, fontSize: fontSize.sm }]}>
            REPSQUAD
          </Text>
          <Text style={[styles.title, { color: colors.text, fontSize: fontSize.title }]}>
            Criar conta
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontSize: fontSize.sm }]}>
            Comece a registrar seus treinos hoje.
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <AuthField
            label="Nome"
            value={name}
            onChangeText={setName}
            error={nameError}
            placeholder="Como quer ser chamado"
            autoCapitalize="words"
          />
          <AuthField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            placeholder="voce@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AuthField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
          />
        </View>

        {submitError ? (
          <Text style={[styles.submitError, { color: colors.danger, fontSize: fontSize.sm }]}>
            {submitError}
          </Text>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.md,
              opacity: submitting ? 0.7 : 1,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryText, fontSize: fontSize.md }]}>
              Criar conta
            </Text>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.sm }}>Já tem uma conta?</Text>
          <Link href="/login" style={[styles.link, { color: colors.primary, fontSize: fontSize.sm }]}>
            Entrar
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    gap: 6,
  },
  brand: {
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    lineHeight: 20,
  },
  submitError: {
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  link: {
    fontWeight: "700",
  },
});
