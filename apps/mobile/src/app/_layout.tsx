import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ApiHealthProvider } from "@/api/health-context";
import { AuthProvider } from "@/auth/auth-context";
import { useTheme } from "@/theme";

export default function RootLayout() {
  const { colors } = useTheme();

  return (
    <AuthProvider>
      <ApiHealthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="history/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="history/exercise/[id]" options={{ headerShown: true }} />
        </Stack>
      </ApiHealthProvider>
    </AuthProvider>
  );
}
