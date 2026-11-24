import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/api/client";
import { useApiHealth, type ApiStatus } from "@/api/health-context";
import { useAuth } from "@/auth/auth-context";
import { useTheme } from "@/theme";

function statusColor(status: ApiStatus, colors: ReturnType<typeof useTheme>["colors"]) {
  if (status === "conectada") return colors.success;
  if (status === "verificando") return colors.warning;
  return colors.danger;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { status, refresh } = useApiHealth();
  const { colors, spacing, fontSize, radius } = useTheme();
  const dotColor = statusColor(status, colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: colors.surfaceAlt, borderRadius: radius.full, padding: spacing.md },
          ]}
        >
          <Ionicons name="person-outline" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xl }]}>
          {user?.name ?? "Perfil"}
        </Text>
        <Text style={[styles.description, { color: colors.textMuted, fontSize: fontSize.md }]}>
          {user?.email ?? "Em breve: seu perfil, metas e preferências."}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[styles.statusText, { color: colors.text, fontSize: fontSize.md }]}>
            API: {status}
          </Text>
        </View>
        <Text style={[styles.urlText, { color: colors.textMuted, fontSize: fontSize.xs }]}>
          {API_URL}
        </Text>
        {status !== "verificando" && (
          <Pressable
            onPress={refresh}
            style={[
              styles.retryButton,
              {
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.sm,
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
              },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.text, fontSize: fontSize.sm }]}>
              Verificar novamente
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={signOut}
        style={[
          styles.logoutButton,
          {
            borderColor: colors.danger,
            borderRadius: radius.md,
            paddingVertical: spacing.sm + 4,
          },
        ]}
      >
        <Text style={[styles.logoutText, { color: colors.danger, fontSize: fontSize.md }]}>
          Sair da conta
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    marginBottom: 4,
  },
  title: {
    fontWeight: "700",
  },
  description: {
    textAlign: "center",
    maxWidth: 280,
  },
  card: {
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontWeight: "600",
  },
  urlText: {
    fontFamily: "monospace",
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  retryText: {
    fontWeight: "600",
  },
  logoutButton: {
    borderWidth: 1,
    alignItems: "center",
  },
  logoutText: {
    fontWeight: "700",
  },
});
