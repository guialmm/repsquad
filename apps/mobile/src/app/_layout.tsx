import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ApiHealthProvider } from "@/api/health-context";

export default function RootLayout() {
  return (
    <ApiHealthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </ApiHealthProvider>
  );
}
