import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

import { useTheme } from "@/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(focusedName: IoniconName, unfocusedName: IoniconName) {
  return function TabBarIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <Ionicons
        name={focused ? focusedName : unfocusedName}
        size={22}
        color={typeof color === "string" ? color : undefined}
      />
    );
  };
}

export default function TabsLayout() {
  const { colors, fontSize } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Treino",
          tabBarIcon: tabIcon("barbell", "barbell-outline"),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: tabIcon("time", "time-outline"),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercícios",
          tabBarIcon: tabIcon("list", "list-outline"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: tabIcon("person", "person-outline"),
        }}
      />
    </Tabs>
  );
}
