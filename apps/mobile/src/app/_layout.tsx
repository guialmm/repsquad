import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ApiHealthProvider } from "@/api/health-context";
import { AuthProvider } from "@/auth/auth-context";
import { ExercisesProvider } from "@/exercises/exercises-context";
import { useTheme } from "@/theme";

export default function RootLayout() {
  const { colors } = useTheme();

  return (
    <AuthProvider>
      <ApiHealthProvider>
        <ExercisesProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="exercises/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="exercises/new" options={{ headerShown: true }} />
          </Stack>
        </ExercisesProvider>
      </ApiHealthProvider>
    </AuthProvider>
  );
}
