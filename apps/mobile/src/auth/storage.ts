import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "repsquad_auth_token";
const USER_KEY = "repsquad_auth_user";

export type AuthUser = {
  name: string;
  email: string;
};

let webMemoryToken: string | null = null;
let webMemoryUser: string | null = null;

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (key === TOKEN_KEY) webMemoryToken = value;
    if (key === USER_KEY) webMemoryUser = value;
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (key === TOKEN_KEY) return webMemoryToken;
    if (key === USER_KEY) return webMemoryUser;
    return null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (key === TOKEN_KEY) webMemoryToken = null;
    if (key === USER_KEY) webMemoryUser = null;
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(token: string, user: AuthUser): Promise<void> {
  await Promise.all([setItem(TOKEN_KEY, token), setItem(USER_KEY, JSON.stringify(user))]);
}

export async function loadSession(): Promise<{ token: string; user: AuthUser | null } | null> {
  const token = await getItem(TOKEN_KEY);
  if (!token) return null;

  const rawUser = await getItem(USER_KEY);
  if (!rawUser) return { token, user: null };

  try {
    return { token, user: JSON.parse(rawUser) as AuthUser };
  } catch {
    return { token, user: null };
  }
}

export async function clearSession(): Promise<void> {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(USER_KEY)]);
}
