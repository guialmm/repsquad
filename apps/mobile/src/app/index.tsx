import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { API_URL, getHealth } from "@/api/client";

type ApiStatus = "verificando" | "conectada" | "sem conexão";

export default function Index() {
  const [status, setStatus] = useState<ApiStatus>("verificando");

  useEffect(() => {
    // Também "acorda" a API quando ela está dormindo no plano grátis do Render.
    getHealth()
      .then((health) => setStatus(health.status === "ok" ? "conectada" : "sem conexão"))
      .catch(() => setStatus("sem conexão"));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App de Treinos</Text>
      <Text>
        API: {status}
        {status === "sem conexão" ? ` (${API_URL})` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
