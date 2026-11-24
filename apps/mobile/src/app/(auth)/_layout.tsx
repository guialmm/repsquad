import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/auth/auth-context";

export default function AuthLayout() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;
  if (token) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
