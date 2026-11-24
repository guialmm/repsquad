import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ApiHealthProvider } from "@/api/health-context";
import { AuthProvider } from "@/auth/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApiHealthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ApiHealthProvider>
    </AuthProvider>
  );
}
